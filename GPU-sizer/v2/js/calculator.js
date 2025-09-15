// Performance calculator for LLM sizing

const BYTES_IN_GiB = 1_073_741_824;

class PerformanceMetrics {
    constructor(kv_cache_tokens, prefill_time_per_token_ms, tpot_ms, ttft_s, e2e_latency_s, throughput_tokens_per_s) {
        this.kv_cache_tokens = kv_cache_tokens;
        this.prefill_time_per_token_ms = prefill_time_per_token_ms;
        this.tpot_ms = tpot_ms;
        this.ttft_s = ttft_s;
        this.e2e_latency_s = e2e_latency_s;
        this.throughput_tokens_per_s = throughput_tokens_per_s;
    }
}

class PerformanceCalculator {
    constructor(num_gpu, precision) {
        this.num_gpu = num_gpu;
        this.precision = precision;
    }

    // ---------- Memory / capacity ----------
    kvCacheSizePerTokenGib(model) {
        // 2x for K and V
        const d_head = model.d_model / model.n_heads;
        return (2 * model.n_layers * model.n_kv_heads * d_head * this.precision.kv_bytes) / BYTES_IN_GiB;
    }

    weightsMemoryGb(model) {
        // params_billion * 1e9 params * bytes -> GiB approximated as GB for simplicity
        // original repo used: params_billion * 2 (GB) for FP16. Keep same unit basis (GB)
        const bytes_per_billion_params_gb = this.precision.weight_bytes;
        return model.params_billion * bytes_per_billion_params_gb;
    }

    totalMemoryFootprintGb(model, n_concurrent, context_window) {
        const kv_per_token_gib = this.kvCacheSizePerTokenGib(model);
        const kv_total_gib = kv_per_token_gib * context_window * n_concurrent;
        // Convert GiB to GB roughly 1:1 for this estimator like original (keeps consistency)
        return kv_total_gib + this.weightsMemoryGb(model);
    }

    maxKvTokens(gpu, model) {
        const kv_per_token_gib = this.kvCacheSizePerTokenGib(model);
        if (kv_per_token_gib <= 0) {
            return 0;
        }
        const total_mem_gb = this.num_gpu * gpu.memory_gb;
        // Convert GB to GiB roughly 1:1 to maintain simplicity
        const usable_gb = Math.max(0.0, total_mem_gb - this.weightsMemoryGb(model));
        return Math.floor(Math.max(0.0, usable_gb / kv_per_token_gib));
    }

    fitsMemory(gpu, model, n_concurrent, context_window) {
        return this.totalMemoryFootprintGb(model, n_concurrent, context_window) <= (this.num_gpu * gpu.memory_gb);
    }

    // ---------- Time / performance ----------
    prefillTimePerTokenMs(model, gpu) {
        // Same scaling as original: 2 * params_billion / num_gpu / tflops (ms)
        return (2 * model.params_billion / Math.max(1, this.num_gpu)) / gpu.fp16_tflops;
    }

    tpotMs(model, gpu) {
        // Same form as original but clarified units
        return ((2 * model.params_billion / Math.max(1, this.num_gpu)) / Math.max(1e-9, gpu.memory_bandwidth_gbps)) * 1000;
    }

    e2eLatencyS(prefill_ms, tpot_ms, prompt_tokens, response_tokens) {
        return (prompt_tokens * prefill_ms + response_tokens * tpot_ms) / 1000.0;
    }

    ttftS(prefill_ms, tpot_ms, prompt_tokens) {
        // Correct TTFT: prefill of entire prompt + one token generation
        return (prompt_tokens * prefill_ms + tpot_ms) / 1000.0;
    }

    computeMetrics(model, gpu, prompt_tokens, response_tokens) {
        const kv_tokens = this.maxKvTokens(gpu, model);
        const prefill_ms = this.prefillTimePerTokenMs(model, gpu);
        const tpot_ms = this.tpotMs(model, gpu);

        if (prefill_ms < 0 || tpot_ms < 0) {
            return new PerformanceMetrics(
                kv_tokens,
                "OOM",
                "OOM",
                "OOM",
                "OOM",
                "OOM"
            );
        }

        const ttft_s = this.ttftS(prefill_ms, tpot_ms, prompt_tokens);
        const e2e_s = this.e2eLatencyS(prefill_ms, tpot_ms, prompt_tokens, response_tokens);
        const thr = e2e_s > 0 ? response_tokens / e2e_s : "OOM";

        return new PerformanceMetrics(
            kv_tokens,
            prefill_ms,
            tpot_ms,
            ttft_s,
            e2e_s,
            thr
        );
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceCalculator, PerformanceMetrics };
}