// Model and GPU specifications for the NAI LLM sizing calculator.
//
// Data source: Nutanix Enterprise AI 2.7 Guide (June 18, 2026)
//   - Pre-validated Models: Table 37 (pages 142-148)
//   - Supported GPUs: "Nutanix Enterprise AI Requirements" (page 11)
//
// Architecture fields (d_model, n_heads, n_kv_heads, n_layers, max_context_window)
// come from each model's public Hugging Face config.json / model card. Entries
// flagged `estimated: true` are models whose configs are not yet public (e.g.
// Gemma 4, Ministral-3 -2512, Nemotron-3-Nano); their architecture is estimated
// from the closest known sibling and the published parameter/size figures.

class ModelSpec {
    /**
     * @param {string}  name                 Model repo id / name as listed by NAI.
     * @param {number}  params_billion       Total parameter count in billions (memory basis).
     * @param {number}  d_model              Hidden size.
     * @param {number}  n_heads              Number of attention (query) heads.
     * @param {number}  n_kv_heads           Number of key/value heads (GQA/MQA).
     * @param {number}  n_layers             Number of transformer layers.
     * @param {number}  max_context_window   Max context window in tokens.
     * @param {string}  hub                  Source hub (Hugging Face / NVIDIA NGC Catalog).
     * @param {string}  provider             Developer / provider.
     * @param {string}  model_type           Capability / model type.
     * @param {number}  size_gb              NAI recommended total GPU memory (GiB) from Table 37.
     * @param {number}  [active_params_billion] Active params per token for MoE models
     *                                          (defaults to params_billion for dense models).
     * @param {boolean} [estimated]          True when architecture is estimated (config not public).
     */
    constructor(name, params_billion, d_model, n_heads, n_kv_heads, n_layers, max_context_window,
                hub = "", provider = "", model_type = "", size_gb = 0.0,
                active_params_billion = null, estimated = false) {
        this.name = name;
        this.params_billion = params_billion;
        this.d_model = d_model;
        this.n_heads = n_heads;
        this.n_kv_heads = n_kv_heads;
        this.n_layers = n_layers;
        this.max_context_window = max_context_window;
        this.hub = hub;
        this.provider = provider;
        this.model_type = model_type;
        this.size_gb = size_gb;
        // For dense models active == total. For MoE models this is the number of
        // parameters actually used per token (routed experts + shared weights).
        this.active_params_billion = (active_params_billion == null)
            ? params_billion
            : active_params_billion;
        this.estimated = estimated;
    }
}

class GPUSpec {
    /**
     * @param {string} name                   GPU name.
     * @param {number} fp16_tflops            Dense FP16/BF16 tensor-core throughput (TFLOPS).
     * @param {number} memory_gb              On-board memory (GB).
     * @param {number} memory_bandwidth_gbps  Memory bandwidth (GB/s).
     */
    constructor(name, fp16_tflops, memory_gb, memory_bandwidth_gbps) {
        this.name = name;
        this.fp16_tflops = fp16_tflops;
        this.memory_gb = memory_gb;
        this.memory_bandwidth_gbps = memory_bandwidth_gbps;
    }
}

class PrecisionSpec {
    // weight_bytes = null means "model native" (per-model native_weight_bytes)
    constructor(weight_bytes = null, kv_bytes = 2.0) {
        this.weight_bytes = weight_bytes;
        this.kv_bytes = kv_bytes;
    }
}

// ---------------------------------------------------------------------------
// Nutanix Enterprise AI 2.7 - Pre-validated Models (Table 37)
// ---------------------------------------------------------------------------
const DEFAULT_MODELS = [
    // ----- Hugging Face : AI21 Labs -----
    new ModelSpec("ai21labs/AI21-Jamba-1.5-Mini", 52, 4096, 32, 8, 32, 262144,
                  "Hugging Face", "AI21 Labs", "Text Generation", 110.0, 12),

    // ----- Hugging Face : AllenAI (Olmo 3) -----
    new ModelSpec("allenai/Olmo-3-7B-Instruct", 7, 4096, 32, 32, 32, 65536,
                  "Hugging Face", "AllenAI", "Text Generation", 20.0),
    new ModelSpec("allenai/Olmo-3-7B-Think", 7, 4096, 32, 32, 32, 65536,
                  "Hugging Face", "AllenAI", "Reasoning", 20.0),
    new ModelSpec("allenai/Olmo-3-32B-Think", 32, 5120, 40, 40, 64, 65536,
                  "Hugging Face", "AllenAI", "Reasoning", 70.0),

    // ----- Hugging Face : Cross-Encoder -----
    new ModelSpec("cross-encoder/ms-marco-MiniLM-L6-v2", 0.022, 384, 12, 12, 6, 512,
                  "Hugging Face", "Cross-Encoder", "Reranker", 4.0),

    // ----- Hugging Face : Facebook -----
    new ModelSpec("facebook/deit-base-distilled-patch16-224", 0.072, 768, 12, 12, 12, 224,
                  "Hugging Face", "Facebook", "Image Classification", 4.0),

    // ----- Hugging Face : Google -----
    new ModelSpec("google/gemma-2-2b-it", 2.61, 2304, 8, 4, 26, 8192,
                  "Hugging Face", "Google", "Text Generation", 10.0),
    new ModelSpec("google/gemma-2-9b-it", 9.24, 3584, 16, 8, 42, 8192,
                  "Hugging Face", "Google", "Text Generation", 20.0),
    new ModelSpec("google/vit-base-patch16-224", 0.086, 768, 12, 12, 12, 224,
                  "Hugging Face", "Google", "Image Classification", 4.0),
    new ModelSpec("google/gemma-3-270m-it", 0.27, 640, 4, 1, 18, 32768,
                  "Hugging Face", "Google", "Text Generation", 10.0),
    // Gemma 4 configs are not public yet - architecture estimated from Gemma 3.
    new ModelSpec("google/gemma-4-E2B-it", 9, 2048, 8, 4, 30, 131072,
                  "Hugging Face", "Google", "Multimodal / Reasoning", 20.0, 2, true),
    new ModelSpec("google/gemma-4-26B-A4B-it", 26, 3584, 16, 8, 48, 131072,
                  "Hugging Face", "Google", "Multimodal / Reasoning", 60.0, 4, true),
    new ModelSpec("google/gemma-4-31B-it", 31, 5376, 32, 16, 62, 131072,
                  "Hugging Face", "Google", "Multimodal / Reasoning", 70.0, 31, true),

    // ----- Hugging Face : IBM -----
    new ModelSpec("ibm-granite/granite-embedding-107m-multilingual", 0.107, 768, 12, 12, 12, 512,
                  "Hugging Face", "IBM", "Embedding", 2.0),

    // ----- Hugging Face : Meta -----
    new ModelSpec("meta-llama/Llama-2-13b-chat-hf", 13, 5120, 40, 40, 40, 4096,
                  "Hugging Face", "Meta", "Text Generation", 60.0),
    new ModelSpec("meta-llama/Llama-3.2-3b-Instruct", 3.21, 3072, 24, 8, 28, 131072,
                  "Hugging Face", "Meta", "Text Generation", 20.0),
    new ModelSpec("meta-llama/Llama-3.2-1B-Instruct", 1.24, 2048, 32, 8, 16, 131072,
                  "Hugging Face", "Meta", "Text Generation", 10.0),
    new ModelSpec("meta-llama/Llama-3.3-70B-Instruct", 70, 8192, 64, 8, 80, 131072,
                  "Hugging Face", "Meta", "Text Generation", 290.0),
    new ModelSpec("meta-llama/Meta-Llama-3.1-8B-Instruct", 8, 4096, 32, 8, 32, 131072,
                  "Hugging Face", "Meta", "Text Generation", 40.0),
    new ModelSpec("meta-llama/Meta-Llama-3.1-70B-Instruct", 70, 8192, 64, 8, 80, 131072,
                  "Hugging Face", "Meta", "Text Generation", 290.0),
    new ModelSpec("meta-llama/CodeLlama-7b-Instruct-hf", 7, 4096, 32, 32, 32, 16384,
                  "Hugging Face", "Meta", "Text Generation", 30.0),
    new ModelSpec("meta-llama/CodeLlama-13b-Instruct-hf", 13, 5120, 40, 40, 40, 16384,
                  "Hugging Face", "Meta", "Text Generation", 60.0),
    new ModelSpec("meta-llama/CodeLlama-34b-Instruct-hf", 34, 8192, 64, 8, 48, 16384,
                  "Hugging Face", "Meta", "Text Generation", 140.0),
    new ModelSpec("meta-llama/CodeLlama-70b-Instruct-hf", 70, 8192, 64, 8, 80, 16384,
                  "Hugging Face", "Meta", "Text Generation", 280.0),
    new ModelSpec("meta-llama/Llama-3.2-11B-Vision-Instruct", 11, 4096, 32, 8, 32, 131072,
                  "Hugging Face", "Meta", "Vision", 55.0),
    new ModelSpec("meta-llama/Llama-3.2-90B-Vision-Instruct", 90, 8192, 64, 8, 80, 131072,
                  "Hugging Face", "Meta", "Vision", 320.0),
    // Llama 4 Scout: 109B total MoE, ~17B active per token (16 experts).
    new ModelSpec("meta-llama/Llama-4-Scout-17B-16E-Instruct", 109, 5120, 40, 8, 48, 131072,
                  "Hugging Face", "Meta", "Text Generation", 250.0, 17),
    new ModelSpec("meta-llama/Llama-Guard-3-8B", 8, 4096, 32, 8, 32, 8192,
                  "Hugging Face", "Meta", "Safety", 17.0),

    // ----- Hugging Face : Mistral AI -----
    new ModelSpec("mistralai/Mistral-7B-Instruct-v0.3", 7, 4096, 32, 8, 32, 32768,
                  "Hugging Face", "Mistral AI", "Text Generation", 30.0),
    new ModelSpec("mistralai/Mixtral-8x7B-Instruct-v0.1", 47, 4096, 32, 8, 32, 32768,
                  "Hugging Face", "Mistral AI", "Text Generation", 200.0, 13),
    new ModelSpec("mistralai/Mixtral-8x22B-Instruct-v0.1", 141, 6144, 48, 8, 56, 65536,
                  "Hugging Face", "Mistral AI", "Text Generation", 290.0, 39),
    new ModelSpec("mistralai/Mistral-Nemo-Instruct-2407", 12, 5120, 32, 8, 40, 1048576,
                  "Hugging Face", "Mistral AI", "Text Generation", 50.0),
    new ModelSpec("mistralai/Magistral-Small-2506", 24, 5120, 32, 8, 40, 131072,
                  "Hugging Face", "Mistral AI", "Reasoning", 100.0),
    new ModelSpec("mistralai/Devstral-Small-2507", 24, 5120, 32, 8, 40, 131072,
                  "Hugging Face", "Mistral AI", "Text Generation", 100.0),
    // Ministral-3 -2512 family configs are not public yet - estimated.
    new ModelSpec("mistralai/ministral-3-14B-Reasoning-2512", 14, 5120, 32, 8, 40, 131072,
                  "Hugging Face", "Mistral AI", "Reasoning / Multimodal", 60.0, 14, true),
    new ModelSpec("mistralai/Ministral-3-14B-Instruct-2512", 14, 5120, 32, 8, 40, 131072,
                  "Hugging Face", "Mistral AI", "Multimodal", 40.0, 14, true),
    new ModelSpec("mistralai/Ministral-3-8B-Instruct-2512", 8, 4096, 32, 8, 36, 131072,
                  "Hugging Face", "Mistral AI", "Multimodal", 30.0, 8, true),
    new ModelSpec("mistralai/Ministral-3-8B-Reasoning-2512", 8, 4096, 32, 8, 36, 131072,
                  "Hugging Face", "Mistral AI", "Reasoning / Multimodal", 40.0, 8, true),
    new ModelSpec("mistralai/Ministral-3-3B-Instruct-2512", 3, 3072, 24, 8, 28, 131072,
                  "Hugging Face", "Mistral AI", "Multimodal", 10.0, 3, true),
    new ModelSpec("mistralai/Ministral-3-3B-Reasoning-2512", 3, 3072, 24, 8, 28, 131072,
                  "Hugging Face", "Mistral AI", "Reasoning / Multimodal", 20.0, 3, true),

    // ----- Hugging Face : NVIDIA (Nemotron 3 Nano MoE, ~30B total / ~3B active) -----
    new ModelSpec("nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8", 30, 4096, 32, 8, 32, 131072,
                  "Hugging Face", "NVIDIA", "Reasoning", 40.0, 3, true),
    new ModelSpec("nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16", 30, 4096, 32, 8, 32, 131072,
                  "Hugging Face", "NVIDIA", "Reasoning", 70.0, 3, true),

    // ----- Hugging Face : OpenAI (gpt-oss - MoE) -----
    new ModelSpec("openai/gpt-oss-20b", 21, 2880, 64, 8, 24, 131072,
                  "Hugging Face", "OpenAI", "Text Generation", 50.0, 3.6),
    new ModelSpec("openai/gpt-oss-120b", 117, 2880, 64, 8, 36, 131072,
                  "Hugging Face", "OpenAI", "Text Generation", 200.0, 5.1),
    new ModelSpec("openai/gpt-oss-safeguard-20b", 21, 2880, 64, 8, 24, 131072,
                  "Hugging Face", "OpenAI", "Content Safety", 20.0, 3.6),
    new ModelSpec("openai/gpt-oss-safeguard-120b", 117, 2880, 64, 8, 36, 131072,
                  "Hugging Face", "OpenAI", "Content Safety", 70.0, 5.1),

    // ----- Hugging Face : Stability AI -----
    new ModelSpec("stable-diffusion-v1-5/stable-diffusion-v1-5", 0.86, 768, 8, 8, 16, 77,
                  "Hugging Face", "Stability AI", "Image Generation", 40.0),

    // ----- Hugging Face : Unsloth -----
    new ModelSpec("unsloth/Llama-3.3-70B-Instruct-bnb-4bit", 70, 8192, 64, 8, 80, 131072,
                  "Hugging Face", "Unsloth", "Text Generation", 50.0),

    // ----- Hugging Face : Black Forest Labs -----
    new ModelSpec("black-forest-labs/flux.1-dev", 12, 3072, 24, 24, 19, 512,
                  "Hugging Face", "Black Forest Labs", "Image Generation", 40.0),

    // ----- NVIDIA NGC Catalog : NVIDIA -----
    new ModelSpec("llama-3.1-8b-instruct", 8, 4096, 32, 8, 32, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50.0),
    new ModelSpec("llama-3.1-70b-instruct", 70, 8192, 64, 8, 80, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 160.0),
    new ModelSpec("llama-3.1-nemoguard-8b-content-safety", 8, 4096, 32, 8, 32, 8192,
                  "NVIDIA NGC Catalog", "NVIDIA", "Safety", 50.0),
    new ModelSpec("llama-3.2-nv-embedqa-1b-v2", 1, 2048, 16, 16, 24, 8192,
                  "NVIDIA NGC Catalog", "NVIDIA", "Embedding", 5.0),
    new ModelSpec("llama-3.2-nv-rerankqa-1b-v2", 1, 2048, 16, 16, 24, 8192,
                  "NVIDIA NGC Catalog", "NVIDIA", "Reranker", 5.0),
    new ModelSpec("llama-3.3-70b-instruct", 70, 8192, 64, 8, 80, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 160.0),
    new ModelSpec("llama-3.3-nemotron-super-49b-v1", 49, 8192, 64, 8, 80, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 120.0),
    new ModelSpec("llama-3.1-swallow-8b-instruct-v0", 8, 4096, 32, 8, 32, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50.0),
    new ModelSpec("llama-3.1-nemoguard-8b-topic-control", 8, 4096, 32, 8, 32, 8192,
                  "NVIDIA NGC Catalog", "NVIDIA", "Safety", 50.0),
    new ModelSpec("mixtral-8x7b-instruct-v01", 47, 4096, 32, 8, 32, 32768,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 110.0, 13),
    new ModelSpec("mistral-7b-instruct-v0", 7, 4096, 32, 8, 32, 32768,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50.0),
    new ModelSpec("phi-3-mini-4k-instruct", 3.8, 3072, 32, 32, 32, 4096,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 10.0),
    new ModelSpec("Mistral-nemo-12b-instruct", 12, 5120, 32, 8, 40, 1048576,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 80.0),
    new ModelSpec("llama-nemotron-embed-vl-1b-v2", 1, 2048, 16, 16, 24, 8192,
                  "NVIDIA NGC Catalog", "NVIDIA", "Embedding", 40.0),
    new ModelSpec("Llama-3.2-90b-vision-instruct", 90, 8192, 64, 8, 80, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Vision", 200.0),
    new ModelSpec("Llama-3.1-70b-instruct-pb24h2", 70, 8192, 64, 8, 80, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 160.0),
    new ModelSpec("Llama-3.1-swallow-8b-instruct-v0.1", 8, 4096, 32, 8, 32, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50.0),
    new ModelSpec("Llama-3.1-nemotron-70b-instruct", 70, 8192, 64, 8, 80, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 160.0),
    new ModelSpec("Llama-3.1-8b-instruct-pb24h2", 8, 4096, 32, 8, 32, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50.0),
    new ModelSpec("Mistral-7b-instruct-v0.3", 7, 4096, 32, 8, 32, 32768,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50.0),
    new ModelSpec("Mixtral-8x7B-Instruct-v0.1", 47, 4096, 32, 8, 32, 32768,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 110.0, 13),
    new ModelSpec("gpt-oss-20b", 21, 2880, 64, 8, 24, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 60.0, 3.6),
    new ModelSpec("gpt-oss-120b", 117, 2880, 64, 8, 36, 131072,
                  "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 210.0, 5.1),
    // NeMo Retriever extraction suite (vision/object-detection helpers).
    new ModelSpec("nemoretriever-graphic-elements-v1", 0.1, 768, 12, 12, 12, 1024,
                  "NVIDIA NGC Catalog", "NVIDIA", "Object Detection", 2.0),
    new ModelSpec("nemoretriever-parse", 1, 1024, 16, 16, 24, 4096,
                  "NVIDIA NGC Catalog", "NVIDIA", "Object Detection", 16.0),
    new ModelSpec("nemoretriever-table-structure-v1", 0.1, 768, 12, 12, 12, 1024,
                  "NVIDIA NGC Catalog", "NVIDIA", "Object Detection", 2.0),
    new ModelSpec("nemoretriever-ocr-v1", 0.3, 768, 12, 12, 12, 2048,
                  "NVIDIA NGC Catalog", "NVIDIA", "Object Detection", 6.0),
    new ModelSpec("nemoretriever-page-elements-v2", 0.1, 768, 12, 12, 12, 1024,
                  "NVIDIA NGC Catalog", "NVIDIA", "Object Detection", 2.0),
    new ModelSpec("openai/whisper-large-v3", 1.55, 1280, 20, 20, 32, 448,
                  "NVIDIA NGC Catalog", "OpenAI", "Speech Recognition", 6.0),
];

// ---------------------------------------------------------------------------
// Nutanix Enterprise AI 2.7 - Supported GPUs (page 11) + L4 / MI300X per request
// fp16_tflops = dense FP16/BF16 tensor-core throughput (no sparsity).
// ---------------------------------------------------------------------------
const DEFAULT_GPUS = [
    new GPUSpec("L4", 121, 24, 300),
    new GPUSpec("L40S", 362, 48, 864),
    new GPUSpec("A100 (80GB)", 312, 80, 2039),
    new GPUSpec("H100 (80GB)", 989.5, 80, 3350),
    new GPUSpec("H100 NVL", 835.5, 94, 3900),
    new GPUSpec("RTX PRO 6000 Blackwell", 1671, 96, 1792),
    new GPUSpec("H200", 989.5, 141, 4800),
    new GPUSpec("MI300X", 1307, 192, 5300),
    new GPUSpec("B300 (Blackwell Ultra)", 2250, 288, 8000),
];

// Export for use in other modules (Node/testing).
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelSpec, GPUSpec, PrecisionSpec, DEFAULT_MODELS, DEFAULT_GPUS };
}
