// Performance calculator for LLM sizing

const BYTES_IN_GiB = 1_073_741_824;
const DEFAULT_GPU_MEMORY_UTILIZATION = 0.90;
const DEFAULT_RUNTIME_OVERHEAD_GB = 4.0;

class PerformanceMetrics {
    constructor(kv_cache_tokens, max_concurrency, prefill_time_per_token_ms, tpot_ms,
                ttft_s, e2e_latency_s, throughput_tokens_per_s, aggregate_throughput_tokens_per_s) {
        this.kv_cache_tokens = kv_cache_tokens;
        this.max_concurrency = max_concurrency;
        this.prefill_time_per_token_ms = prefill_time_per_token_ms;
        this.tpot_ms = tpot_ms;
        this.ttft_s = ttft_s;
        this.e2e_latency_s = e2e_latency_s;
        this.throughput_tokens_per_s = throughput_tokens_per_s;
        this.aggregate_throughput_tokens_per_s = aggregate_throughput_tokens_per_s;
    }
}

class PerformanceCalculator {
    constructor(num_gpu, precision, memoryUtilization = DEFAULT_GPU_MEMORY_UTILIZATION, runtimeOverheadGb = DEFAULT_RUNTIME_OVERHEAD_GB) {
        this.num_gpu = Math.max(1, Number(num_gpu) || 1);
        this.precision = precision;
        this.memoryUtilization = Math.min(1, Math.max(0.1, Number(memoryUtilization) || DEFAULT_GPU_MEMORY_UTILIZATION));
        this.runtimeOverheadGb = Math.max(0, Number(runtimeOverheadGb) || DEFAULT_RUNTIME_OVERHEAD_GB);
    }

    // ---------- Memory / capacity (all GiB) ----------
    kvCacheSizePerTokenGib(model) {
        const d_head = model.d_head || (model.d_model / model.n_heads);
        // 2x for K and V
        return (2 * model.n_layers * model.n_kv_heads * d_head * this.precision.kv_bytes) / BYTES_IN_GIB;
    }

    weightsMemoryGib(model) {
        return (model.params_billion * 1e9 * this.weightBytes(model)) / BYTES_IN_GIB;
    }

    weightsMemoryGb(model) {
        // params_billion * 1e9 params * bytes -> GiB approximated as GB for simplicity
        // original repo used: params_billion * 2 (GB) for FP16. Keep same unit basis (GB)
        const bytes_per_billion_params_gb = this.precision.weight_bytes;
        const estimatedWeightGb = model.params_billion * bytes_per_billion_params_gb;
        // Quantized and MoE models can have published NAI storage footprints that are
        // larger than a raw parameter-count estimate. Use the larger value so the
        // capacity check remains conservative for import/deploy planning.
        return Math.max(estimatedWeightGb, model.size_gb || 0);
    }

    totalMemoryFootprintGb(model, n_concurrent, context_window) {
        const kv_per_token_gib = this.kvCacheSizePerTokenGib(model);
        const kv_total_gib = kv_per_token_gib * context_window * n_concurrent;
        // Convert GiB to GB roughly 1:1 for this estimator like original (keeps consistency)
        return kv_total_gib + this.weightsMemoryGb(model) + this.runtimeOverheadGb;
    }

    // Max KV-cache tokens that fit after loading weights (across all GPUs).
    maxKvTokens(gpu, model) {
        const kv_per_token_gib = this.kvCacheSizePerTokenGib(model);
        if (kv_per_token_gib <= 0) {
            return 0;
        }
        const total_mem_gb = this.usableGpuMemoryGb(gpu);
        // Convert GB to GiB roughly 1:1 to maintain simplicity
        const usable_gb = Math.max(0.0, total_mem_gb - this.weightsMemoryGb(model) - this.runtimeOverheadGb);
        return Math.floor(Math.max(0.0, usable_gb / kv_per_token_gib));
    }

    fitsMemory(gpu, model, n_concurrent, context_window) {
        return this.totalMemoryFootprintGb(model, n_concurrent, context_window) <= this.usableGpuMemoryGb(gpu);
    }

    usableGpuMemoryGb(gpu) {
        return this.num_gpu * gpu.memory_gb * this.memoryUtilization;
    }

    minGpuCount(gpu, model, n_concurrent, context_window) {
        const requiredGb = this.totalMemoryFootprintGb(model, n_concurrent, context_window);
        const usablePerGpu = gpu.memory_gb * this.memoryUtilization;
        return usablePerGpu > 0 ? Math.ceil(requiredGb / usablePerGpu) : Infinity;
    }

    validateRequest(model, prompt_tokens, response_tokens) {
        const contextTokens = prompt_tokens + response_tokens;
        if (!Number.isFinite(contextTokens) || contextTokens <= 0) {
            return "Invalid token counts";
        }
        if (contextTokens > model.max_context_window) {
            return `Context ${contextTokens.toLocaleString()} exceeds model window ${model.max_context_window.toLocaleString()}`;
        }
        return "";
    }

    // ---------- Time / performance ----------
    // Compute-bound: 2 FLOPs per active param per token.
    // (active_params_billion * 1e9 * 2) / (num_gpu * tflops * 1e12) s = 2*P_act/(N*T) ms
    prefillTimePerTokenMs(model, gpu) {
        return (2 * model.active_params_billion / this.num_gpu) / gpu.fp16_tflops;
    }

    // Bandwidth-bound: stream active params once per generated token.
    // (active_params_billion * 1e9 * bytes) / (num_gpu * BW * 1e9) s -> ms
    tpotMs(model, gpu) {
        const bytes_per_token_gb = model.active_params_billion * this.weightBytes(model);
        return (bytes_per_token_gb / this.num_gpu) / Math.max(1e-9, gpu.memory_bandwidth_gbps) * 1000;
    }

    ttftS(prefill_ms, tpot_ms, prompt_tokens) {
        // Prefill the entire prompt, then generate the first token.
        return (prompt_tokens * prefill_ms + tpot_ms) / 1000.0;
    }

    e2eLatencyS(prefill_ms, tpot_ms, prompt_tokens, response_tokens) {
        return (prompt_tokens * prefill_ms + response_tokens * tpot_ms) / 1000.0;
    }

    computeMetrics(model, gpu, prompt_tokens, response_tokens, concurrency = 1) {
        const context = prompt_tokens + response_tokens;
        const kv_tokens = this.maxKvTokens(gpu, model);
        const max_conc = this.maxConcurrency(gpu, model, context);
        const prefill_ms = this.prefillTimePerTokenMs(model, gpu);
        const tpot_ms = this.tpotMs(model, gpu);
        const ttft_s = this.ttftS(prefill_ms, tpot_ms, prompt_tokens);
        const e2e_s = this.e2eLatencyS(prefill_ms, tpot_ms, prompt_tokens, response_tokens);
        const per_request = e2e_s > 0 ? response_tokens / e2e_s : 0;
        const aggregate = per_request * Math.max(1, concurrency);

        return new PerformanceMetrics(kv_tokens, max_conc, prefill_ms, tpot_ms,
                                      ttft_s, e2e_s, per_request, aggregate);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceCalculator, PerformanceMetrics, BYTES_IN_GIB };
}
