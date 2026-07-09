// Model and GPU specifications for the NAI LLM sizing calculator
//
// Catalog source: Nutanix Enterprise AI (NAI) 2.6 documentation
//   - Pre-validated models: Admin Guide "Pre-validated Models" (Table 8, pp. 19-22)
//   - Supported GPUs:       Admin Guide "Requirements" (p. 15)
//
// Each model records the NAI-validated GPU counts per supported GPU
// (nai_gpu_counts) exactly as published in Table 8. Architecture fields
// (d_model, heads, layers, ...) come from the models' published configs and
// drive the KV-cache and roofline math; fields marked "estimated" are best
// public estimates where the vendor has not published the architecture.

class ModelSpec {
    constructor(opts) {
        // Defaults first, then opts override.
        Object.assign(this, {
            active_params_billion: opts.params_billion, // dense models: active == total
            d_head: null,               // per-head dim; null -> d_model / n_heads
            native_weight_bytes: 2.0,   // bytes/param as shipped (2 = FP16/BF16)
            nai_gpu_counts: {},         // { gpu_key: validated GPU count } from Table 8
        }, opts);
    }

    headDim() {
        return this.d_head || this.d_model / this.n_heads;
    }
}

class GPUSpec {
    constructor(key, name, fp16_tflops, memory_gb, memory_bandwidth_gbps) {
        this.key = key;                 // matches nai_gpu_counts keys
        this.name = name;               // label as it appears in the NAI docs
        this.fp16_tflops = fp16_tflops; // dense FP16 tensor TFLOPS (no sparsity)
        this.memory_gb = memory_gb;     // HBM/GDDR capacity, treated as GiB
        this.memory_bandwidth_gbps = memory_bandwidth_gbps; // GB/s
    }
}

class PrecisionSpec {
    // weight_bytes = null means "model native" (per-model native_weight_bytes)
    constructor(weight_bytes = null, kv_bytes = 2.0) {
        this.weight_bytes = weight_bytes;
        this.kv_bytes = kv_bytes;
    }
}

// Model types that behave like autoregressive LLMs (KV cache + token latency
// math applies). Other types (embedding, reranker, OCR, image generation...)
// get memory-footprint estimates only.
const LLM_MODEL_TYPES = new Set(["Text Generation", "Code Generation", "Vision", "Safety"]);

function isLlmModel(model) {
    return LLM_MODEL_TYPES.has(model.model_type);
}

// NAI 2.6 supported GPUs (Admin Guide p. 15), ascending by memory.
// fp16_tflops = dense FP16 tensor throughput; bandwidth in GB/s.
const DEFAULT_GPUS = [
    new GPUSpec("l40s_48g",         "L40S-48G",          362,   48,  864),  // L40S PCIe
    new GPUSpec("a100_80g",         "A100-80G",          312,   80,  2039), // A100 80GB SXM
    new GPUSpec("h100_80g",         "H100-80G",          989,   80,  3350), // H100 80GB SXM
    new GPUSpec("h100_nvl_94g",     "H100 NVL-94G",      835.5, 94,  3938), // H100 NVL
    new GPUSpec("rtx_pro_6000_96g", "RTX PRO 6000-96G",  469,   96,  1597), // Blackwell Server Edition
    new GPUSpec("h200_141g",        "H200-141G",         989,   141, 4800), // H200
];

// NAI 2.6 pre-validated models (Table 8).
const DEFAULT_MODELS = [
    // ---------------- Hugging Face - Meta ----------------
    new ModelSpec({
        name: "Meta-Llama-3.1-8B-Instruct", params_billion: 8.03,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 32, max_context_window: 131072,
        hub: "Hugging Face", provider: "Meta", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        name: "Meta-Llama-3.1-70B-Instruct", params_billion: 70.6,
        d_model: 8192, n_heads: 64, n_kv_heads: 8, n_layers: 80, max_context_window: 131072,
        hub: "Hugging Face", provider: "Meta", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 4, a100_80g: 2, h100_80g: 2, h100_nvl_94g: 2, h200_141g: 2, rtx_pro_6000_96g: 2 },
    }),
    new ModelSpec({
        name: "Meta-Llama-3.3-70B-Instruct", params_billion: 70.6,
        d_model: 8192, n_heads: 64, n_kv_heads: 8, n_layers: 80, max_context_window: 131072,
        hub: "Hugging Face", provider: "Meta", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 4, a100_80g: 2, h100_80g: 2, h100_nvl_94g: 2, h200_141g: 2, rtx_pro_6000_96g: 2 },
    }),
    new ModelSpec({
        name: "CodeLlama-7B-Instruct-hf", params_billion: 6.74,
        d_model: 4096, n_heads: 32, n_kv_heads: 32, n_layers: 32, max_context_window: 16384,
        hub: "Hugging Face", provider: "Meta", model_type: "Code Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        name: "CodeLlama-34B-Instruct-hf", params_billion: 33.7,
        d_model: 8192, n_heads: 64, n_kv_heads: 8, n_layers: 48, max_context_window: 16384,
        hub: "Hugging Face", provider: "Meta", model_type: "Code Generation",
        nai_gpu_counts: { l40s_48g: 2, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        // 32 text layers + 8 cross-attention layers
        name: "Llama-3.2-11B-Vision-Instruct", params_billion: 10.7,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 40, max_context_window: 131072,
        hub: "Hugging Face", provider: "Meta", model_type: "Vision",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        // 80 text layers + 20 cross-attention layers
        name: "Llama-3.2-90B-Vision-Instruct", params_billion: 88.6,
        d_model: 8192, n_heads: 64, n_kv_heads: 8, n_layers: 100, max_context_window: 131072,
        hub: "Hugging Face", provider: "Meta", model_type: "Vision",
        nai_gpu_counts: { l40s_48g: 4, a100_80g: 4, h100_80g: 4, h100_nvl_94g: 4, h200_141g: 2, rtx_pro_6000_96g: 2 },
    }),
    new ModelSpec({
        // MoE: 109B total, 17B active (16 experts)
        name: "Llama-4-Scout-17B-16E-Instruct", params_billion: 109, active_params_billion: 17,
        d_model: 5120, n_heads: 40, n_kv_heads: 8, d_head: 128, n_layers: 48, max_context_window: 10485760,
        hub: "Hugging Face", provider: "Meta", model_type: "Text Generation",
        nai_gpu_counts: { h100_80g: 4, h100_nvl_94g: 4, h200_141g: 2, rtx_pro_6000_96g: 4 },
    }),
    new ModelSpec({
        name: "Llama-Guard-3-8B", params_billion: 8.03,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 32, max_context_window: 131072,
        hub: "Hugging Face", provider: "Meta", model_type: "Safety",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),

    // ---------------- Hugging Face - Mistral AI ----------------
    new ModelSpec({
        name: "Mistral-7B-Instruct-v0.3", params_billion: 7.25,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 32, max_context_window: 32768,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        // MoE: 46.7B total, 12.9B active
        name: "Mixtral-8x7B-Instruct-v0.1", params_billion: 46.7, active_params_billion: 12.9,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 32, max_context_window: 32768,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 4, a100_80g: 2, h100_80g: 2, h100_nvl_94g: 2, h200_141g: 1, rtx_pro_6000_96g: 2 },
    }),
    new ModelSpec({
        // MoE: 140.6B total, 39.1B active
        name: "Mixtral-8x22B-Instruct-v0.1", params_billion: 140.6, active_params_billion: 39.1,
        d_model: 6144, n_heads: 48, n_kv_heads: 8, n_layers: 56, max_context_window: 65536,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { a100_80g: 4, h100_80g: 4, h100_nvl_94g: 4, h200_141g: 4, rtx_pro_6000_96g: 4 },
    }),
    new ModelSpec({
        name: "Mistral-Nemo-Instruct-2407", params_billion: 12.2,
        d_model: 5120, n_heads: 32, n_kv_heads: 8, d_head: 128, n_layers: 40, max_context_window: 131072,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        name: "Magistral-Small-2506", params_billion: 23.6,
        d_model: 5120, n_heads: 32, n_kv_heads: 8, d_head: 128, n_layers: 40, max_context_window: 131072,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        name: "Devstral-Small-2507", params_billion: 23.6,
        d_model: 5120, n_heads: 32, n_kv_heads: 8, d_head: 128, n_layers: 40, max_context_window: 131072,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Code Generation",
        nai_gpu_counts: { a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        name: "Ministral-3-14B-Instruct-2512", params_billion: 14, // architecture estimated
        d_model: 5120, n_heads: 32, n_kv_heads: 8, d_head: 128, n_layers: 40, max_context_window: 131072,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 4 },
    }),
    new ModelSpec({
        name: "Ministral-3-14B-Reasoning-2512", params_billion: 14, // architecture estimated
        d_model: 5120, n_heads: 32, n_kv_heads: 8, d_head: 128, n_layers: 40, max_context_window: 131072,
        hub: "Hugging Face", provider: "Mistral AI", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),

    // ---------------- Hugging Face - Google ----------------
    new ModelSpec({
        name: "gemma-2-9b-it", params_billion: 9.24,
        d_model: 3584, n_heads: 16, n_kv_heads: 8, d_head: 256, n_layers: 42, max_context_window: 8192,
        hub: "Hugging Face", provider: "Google", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),
    new ModelSpec({
        name: "google/vit-base-patch16-224", params_billion: 0.0866,
        d_model: 768, n_heads: 12, n_kv_heads: 12, n_layers: 12, max_context_window: 224,
        hub: "Hugging Face", provider: "Google", model_type: "Image Classification",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),

    // ---------------- Hugging Face - Ai2 ----------------
    new ModelSpec({
        name: "Olmo-3-32B-Think", params_billion: 32, // architecture estimated
        d_model: 5120, n_heads: 40, n_kv_heads: 8, n_layers: 64, max_context_window: 65536,
        hub: "Hugging Face", provider: "Ai2", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 2, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    }),

    // ---------------- NVIDIA NGC (NIM) ----------------
    new ModelSpec({
        name: "llama-3.2-nv-embedqa-1b-v2", params_billion: 1.24,
        d_model: 2048, n_heads: 32, n_kv_heads: 8, d_head: 64, n_layers: 16, max_context_window: 8192,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Embedding",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "llama-3.2-nv-rerankqa-1b-v2", params_billion: 1.24,
        d_model: 2048, n_heads: 32, n_kv_heads: 8, d_head: 64, n_layers: 16, max_context_window: 8192,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Reranker",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "llama-3.1-nemoguard-8b-content-safety", params_billion: 8.03,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 32, max_context_window: 131072,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Safety",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "llama-3.1-nemoguard-8b-topic-control", params_billion: 8.03,
        d_model: 4096, n_heads: 32, n_kv_heads: 8, n_layers: 32, max_context_window: 131072,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Safety",
        nai_gpu_counts: { l40s_48g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        // NIM optimized engine ships FP8 profiles (fits 1x H200-141G)
        name: "llama-3.3-70b-instruct", params_billion: 70.6, native_weight_bytes: 1.0,
        d_model: 8192, n_heads: 64, n_kv_heads: 8, n_layers: 80, max_context_window: 131072,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Text Generation",
        nai_gpu_counts: { l40s_48g: 4, h100_80g: 4, h100_nvl_94g: 4, h200_141g: 1 },
    }),
    new ModelSpec({
        // MoE: 20.9B total, 3.6B active; ships MXFP4 MoE weights (~0.6 B/param overall)
        name: "gpt-oss-20b", params_billion: 20.9, active_params_billion: 3.6, native_weight_bytes: 0.6,
        d_model: 2880, n_heads: 64, n_kv_heads: 8, d_head: 64, n_layers: 24, max_context_window: 131072,
        hub: "NVIDIA NGC", provider: "OpenAI (NIM)", model_type: "Text Generation",
        nai_gpu_counts: { h100_80g: 1, h100_nvl_94g: 1 },
    }),
    new ModelSpec({
        // MoE: 116.8B total, 5.1B active; ships MXFP4 MoE weights (~0.6 B/param overall)
        name: "gpt-oss-120b", params_billion: 116.8, active_params_billion: 5.1, native_weight_bytes: 0.6,
        d_model: 2880, n_heads: 64, n_kv_heads: 8, d_head: 64, n_layers: 36, max_context_window: 131072,
        hub: "NVIDIA NGC", provider: "OpenAI (NIM)", model_type: "Text Generation",
        nai_gpu_counts: { h100_80g: 2, h100_nvl_94g: 1 },
    }),
    new ModelSpec({
        name: "nemoretriever-parse", params_billion: 0.9, // architecture estimated
        d_model: 1024, n_heads: 16, n_kv_heads: 16, n_layers: 24, max_context_window: 4096,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Document AI",
        nai_gpu_counts: { l40s_48g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "nemoretriever-ocr-v1", params_billion: 0.1, // architecture estimated
        d_model: 768, n_heads: 12, n_kv_heads: 12, n_layers: 12, max_context_window: 1024,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Document AI",
        nai_gpu_counts: { l40s_48g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "nemoretriever-table-structure-v1", params_billion: 0.1, // architecture estimated
        d_model: 768, n_heads: 12, n_kv_heads: 12, n_layers: 12, max_context_window: 1024,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Document AI",
        nai_gpu_counts: { l40s_48g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "nemoretriever-graphic-elements-v1", params_billion: 0.1, // architecture estimated
        d_model: 768, n_heads: 12, n_kv_heads: 12, n_layers: 12, max_context_window: 1024,
        hub: "NVIDIA NGC", provider: "NVIDIA NIM", model_type: "Document AI",
        nai_gpu_counts: { l40s_48g: 1, a100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    }),
    new ModelSpec({
        name: "black-forest-labs/flux.1-dev", params_billion: 12,
        d_model: 3072, n_heads: 24, n_kv_heads: 24, n_layers: 19, max_context_window: 512,
        hub: "NVIDIA NGC", provider: "Black Forest Labs (NIM)", model_type: "Image Generation",
        nai_gpu_counts: { h100_nvl_94g: 1, h200_141g: 1 },
    }),
];

// Export for use in other modules (browser: globals; node: module.exports)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelSpec, GPUSpec, PrecisionSpec, DEFAULT_MODELS, DEFAULT_GPUS, isLlmModel, LLM_MODEL_TYPES };
}
