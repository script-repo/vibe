// Performance calculator for LLM sizing on Nutanix Enterprise AI.
//
// All memory math is done consistently in GiB (2^30 bytes). Compute/latency
// math accounts for:
//   - MoE models: compute & decode bandwidth use ACTIVE params/token, while
//     capacity (weights in memory) uses TOTAL params.
//   - Precision: decode (memory-bound) scales with the weight byte width, so
//     INT8/INT4 quantization speeds up token generation.
//   - Real-world efficiency: theoretical peak FLOPS/bandwidth are derated by
//     tunable utilization factors (MFU / MBU).

const BYTES_IN_GiB = 1_073_741_824;

// Default real-world utilization factors (override via the calculator options).
const DEFAULT_COMPUTE_EFFICIENCY = 0.30;   // MFU: fraction of peak FLOPS reached during prefill.
const DEFAULT_BANDWIDTH_EFFICIENCY = 0.70; // MBU: fraction of peak mem bandwidth reached during decode.
const DEFAULT_MEMORY_OVERHEAD = 1.15;      // Activations + CUDA/runtime overhead on top of weights.

class PerformanceMetrics {
    constructor(kv_cache_tokens, prefill_time_per_token_ms, tpot_ms, ttft_s,
                e2e_latency_s, throughput_tokens_per_s, system_throughput_tokens_per_s = "N/A") {
        this.kv_cache_tokens = kv_cache_tokens;
        this.prefill_time_per_token_ms = prefill_time_per_token_ms;
        this.tpot_ms = tpot_ms;
        this.ttft_s = ttft_s;
        this.e2e_latency_s = e2e_latency_s;
        this.throughput_tokens_per_s = throughput_tokens_per_s;
        this.system_throughput_tokens_per_s = system_throughput_tokens_per_s;
    }
}

class PerformanceCalculator {
    /**
     * @param {number} num_gpu
     * @param {PrecisionSpec} precision
     * @param {object} [options] { computeEfficiency, bandwidthEfficiency, memoryOverhead }
     */
    constructor(num_gpu, precision, options = {}) {
        this.num_gpu = Math.max(1, num_gpu | 0);
        this.precision = precision;
        this.computeEfficiency = options.computeEfficiency ?? DEFAULT_COMPUTE_EFFICIENCY;
        this.bandwidthEfficiency = options.bandwidthEfficiency ?? DEFAULT_BANDWIDTH_EFFICIENCY;
        this.memoryOverhead = options.memoryOverhead ?? DEFAULT_MEMORY_OVERHEAD;
    }

    // ---------- Helpers ----------
    activeParams(model) {
        // Fall back to total params for dense models / older specs.
        return (model.active_params_billion && model.active_params_billion > 0)
            ? model.active_params_billion
            : model.params_billion;
    }

    // ---------- Memory / capacity (all GiB) ----------
    kvCacheSizePerTokenGib(model) {
        if (!model.n_heads || !model.n_layers) return 0;
        const d_head = model.d_model / model.n_heads;
        // 2x for K and V; GQA/MQA uses n_kv_heads (< n_heads).
        return (2 * model.n_layers * model.n_kv_heads * d_head * this.precision.kv_bytes) / BYTES_IN_GiB;
    }

    weightsMemoryGib(model) {
        // Total (not active) params live in memory.
        return (model.params_billion * 1e9 * this.precision.weight_bytes) / BYTES_IN_GiB;
    }

    // Weights + framework/activation overhead reserved before any KV cache.
    reservedMemoryGib(model) {
        return this.weightsMemoryGib(model) * this.memoryOverhead;
    }

    totalMemoryFootprintGib(model, n_concurrent, context_window) {
        const kv_total = this.kvCacheSizePerTokenGib(model) * context_window * n_concurrent;
        return this.reservedMemoryGib(model) + kv_total;
    }

    totalGpuMemoryGib(gpu) {
        // GPU memory is quoted in GB (10^9); convert to GiB for consistent math.
        return (this.num_gpu * gpu.memory_gb * 1e9) / BYTES_IN_GiB;
    }

    maxKvTokens(gpu, model) {
        const kv_per_token = this.kvCacheSizePerTokenGib(model);
        if (kv_per_token <= 0) return 0;
        const usable = this.totalGpuMemoryGib(gpu) - this.reservedMemoryGib(model);
        return Math.floor(Math.max(0.0, usable / kv_per_token));
    }

    fitsMemory(gpu, model, n_concurrent, context_window) {
        return this.totalMemoryFootprintGib(model, n_concurrent, context_window)
            <= this.totalGpuMemoryGib(gpu);
    }

    // ---------- Time / performance ----------
    // Prefill is compute-bound: ~2 FLOPs per active parameter per token.
    prefillTimePerTokenMs(model, gpu) {
        const flops_per_token = 2 * this.activeParams(model) * 1e9;
        const peak_flops = gpu.fp16_tflops * 1e12 * this.computeEfficiency * this.num_gpu;
        if (peak_flops <= 0) return Infinity;
        return (flops_per_token / peak_flops) * 1000; // seconds -> ms
    }

    // Decode is memory-bandwidth-bound: read active weights (at weight precision) per token.
    tpotMs(model, gpu) {
        const bytes_per_token = this.activeParams(model) * 1e9 * this.precision.weight_bytes;
        const peak_bw = gpu.memory_bandwidth_gbps * 1e9 * this.bandwidthEfficiency * this.num_gpu;
        if (peak_bw <= 0) return Infinity;
        return (bytes_per_token / peak_bw) * 1000; // seconds -> ms
    }

    ttftS(prefill_ms, tpot_ms, prompt_tokens) {
        // Prefill the whole prompt, then emit the first token.
        return (prompt_tokens * prefill_ms + tpot_ms) / 1000.0;
    }

    e2eLatencyS(prefill_ms, tpot_ms, prompt_tokens, response_tokens) {
        return (prompt_tokens * prefill_ms + response_tokens * tpot_ms) / 1000.0;
    }

    computeMetrics(model, gpu, prompt_tokens, response_tokens, n_concurrent = 1) {
        const kv_tokens = this.maxKvTokens(gpu, model);
        const prefill_ms = this.prefillTimePerTokenMs(model, gpu);
        const tpot_ms = this.tpotMs(model, gpu);

        if (!isFinite(prefill_ms) || !isFinite(tpot_ms) || prefill_ms < 0 || tpot_ms < 0) {
            return new PerformanceMetrics(kv_tokens, "OOM", "OOM", "OOM", "OOM", "OOM", "OOM");
        }

        const ttft_s = this.ttftS(prefill_ms, tpot_ms, prompt_tokens);
        const e2e_s = this.e2eLatencyS(prefill_ms, tpot_ms, prompt_tokens, response_tokens);

        // Per-request output throughput (single stream).
        const per_request = e2e_s > 0 ? response_tokens / e2e_s : "OOM";
        // System throughput: batched decode amortizes weight reads across
        // concurrent requests, so aggregate decode rate ~ concurrency / tpot.
        const per_user_decode = tpot_ms > 0 ? 1000 / tpot_ms : 0;
        const system = per_user_decode > 0 ? per_user_decode * Math.max(1, n_concurrent) : "OOM";

        return new PerformanceMetrics(
            kv_tokens, prefill_ms, tpot_ms, ttft_s, e2e_s, per_request, system
        );
    }
}

// Export for use in other modules (Node/testing).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceCalculator,
        PerformanceMetrics,
        BYTES_IN_GiB,
        DEFAULT_COMPUTE_EFFICIENCY,
        DEFAULT_BANDWIDTH_EFFICIENCY,
        DEFAULT_MEMORY_OVERHEAD,
    };
}
