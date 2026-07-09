// Roofline performance calculator for LLM sizing
//
// Model:
//  - Weights memory = total params x weight bytes (MoE models load ALL experts).
//  - KV cache/token = 2 (K+V) x layers x kv_heads x head_dim x kv_bytes (GQA-aware).
//  - Prefill is compute-bound:  2 FLOPs/param/token over ACTIVE params,
//    split ideally across GPUs (tensor parallel).
//  - Decode (TPOT) is memory-bandwidth-bound: active params x weight bytes
//    streamed per token, split ideally across GPUs.
//  - Aggregate throughput assumes the batch shares each weight pass
//    (continuous batching), i.e. concurrency x per-request throughput.
// These are first-order estimates; real engines (vLLM, TGI, NIM/TRT-LLM)
// typically achieve 50-80% of the roofline numbers.

const BYTES_IN_GIB = 1_073_741_824;

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
    // mem_utilization mirrors vLLM's gpu_memory_utilization: fraction of GPU
    // memory usable for weights + KV cache (rest is activations/fragmentation).
    constructor(num_gpu, precision, mem_utilization = 0.9) {
        this.num_gpu = Math.max(1, num_gpu);
        this.precision = precision;
        this.mem_utilization = mem_utilization;
    }

    // Effective bytes/param: explicit precision override, else model native.
    weightBytes(model) {
        const b = this.precision.weight_bytes;
        return (b === null || b === undefined) ? (model.native_weight_bytes || 2.0) : b;
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

    usableMemoryGib(gpu) {
        return this.num_gpu * gpu.memory_gb * this.mem_utilization;
    }

    totalMemoryFootprintGib(model, n_concurrent, context_window) {
        const kv_total = this.kvCacheSizePerTokenGib(model) * context_window * n_concurrent;
        return kv_total + this.weightsMemoryGib(model);
    }

    // Max KV-cache tokens that fit after loading weights (across all GPUs).
    maxKvTokens(gpu, model) {
        const kv_per_token = this.kvCacheSizePerTokenGib(model);
        if (kv_per_token <= 0) return 0;
        const usable = Math.max(0, this.usableMemoryGib(gpu) - this.weightsMemoryGib(model));
        return Math.floor(usable / kv_per_token);
    }

    // Max simultaneous requests at a given per-request context length.
    maxConcurrency(gpu, model, context_window) {
        if (context_window <= 0) return 0;
        return Math.floor(this.maxKvTokens(gpu, model) / context_window);
    }

    fitsMemory(gpu, model, n_concurrent, context_window) {
        return this.totalMemoryFootprintGib(model, n_concurrent, context_window) <= this.usableMemoryGib(gpu);
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
