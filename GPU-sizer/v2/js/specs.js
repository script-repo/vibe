// Model and GPU specifications for Nutanix Enterprise AI v2.7 sizing calculator

class ModelSpec {
    constructor(name, params_billion, d_model, n_heads, n_kv_heads, n_layers, max_context_window, hub = "", provider = "", model_type = "", size_gb = 0.0) {
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
    }
}

class GPUSpec {
    constructor(name, fp16_tflops, memory_gb, memory_bandwidth_gbps) {
        this.name = name;
        this.fp16_tflops = fp16_tflops;
        this.memory_gb = memory_gb;
        this.memory_bandwidth_gbps = memory_bandwidth_gbps;
    }
}

class PrecisionSpec {
    constructor(weight_bytes = 2.0, kv_bytes = 2.0) {
        this.weight_bytes = weight_bytes;
        this.kv_bytes = kv_bytes;
    }
}

// Nutanix Enterprise AI v2.7 pre-validated models.
// Model sizes are the NAI import/storage sizes in GB where published.
const DEFAULT_MODELS = [
    new ModelSpec("ai21labs/AI21-Jamba-1.5-Mini", 52, 8192, 64, 8, 32, 262144, "Hugging Face", "AI21 Labs", "Text Generation", 110),

    new ModelSpec("google/gemma-2-2b-it", 2.61, 2304, 8, 4, 26, 8192, "Hugging Face", "Google", "Text Generation", 10),
    new ModelSpec("google/gemma-2-9b-it", 9.24, 3584, 16, 8, 42, 8192, "Hugging Face", "Google", "Text Generation", 20),

    new ModelSpec("meta-llama/Llama-2-13b-chat-hf", 13, 5120, 40, 40, 40, 4096, "Hugging Face", "Meta", "Text Generation", 60),
    new ModelSpec("meta-llama/Llama-3.2-1B-Instruct", 1.24, 2048, 32, 8, 16, 131072, "Hugging Face", "Meta", "Text Generation", 10),
    new ModelSpec("meta-llama/Llama-3.2-3b-Instruct", 3.21, 3072, 24, 8, 28, 131072, "Hugging Face", "Meta", "Text Generation", 20),
    new ModelSpec("meta-llama/Meta-Llama-3.1-8B-Instruct", 8, 4096, 32, 8, 32, 131072, "Hugging Face", "Meta", "Text Generation", 40),
    new ModelSpec("meta-llama/Meta-Llama-3.1-70B-Instruct", 70, 8192, 64, 8, 80, 131072, "Hugging Face", "Meta", "Text Generation", 290),
    new ModelSpec("meta-llama/Llama-3.3-70B-Instruct", 70, 8192, 64, 8, 80, 131072, "Hugging Face", "Meta", "Text Generation", 290),
    new ModelSpec("meta-llama/CodeLlama-7b-Instruct-hf", 7, 4096, 32, 32, 32, 16384, "Hugging Face", "Meta", "Text Generation", 30),
    new ModelSpec("meta-llama/CodeLlama-13b-Instruct-hf", 13, 5120, 40, 40, 40, 16384, "Hugging Face", "Meta", "Text Generation", 60),
    new ModelSpec("meta-llama/CodeLlama-34b-Instruct-hf", 34, 8192, 64, 64, 48, 16384, "Hugging Face", "Meta", "Text Generation", 140),
    new ModelSpec("meta-llama/CodeLlama-70b-Instruct-hf", 70, 8192, 64, 8, 80, 16384, "Hugging Face", "Meta", "Text Generation", 280),
    new ModelSpec("meta-llama/Llama-3.2-11B-Vision-Instruct", 11, 4096, 32, 8, 32, 131072, "Hugging Face", "Meta", "Vision", 55),
    new ModelSpec("meta-llama/Llama-3.2-90B-Vision-Instruct", 90, 8192, 64, 8, 80, 131072, "Hugging Face", "Meta", "Vision", 320),
    new ModelSpec("meta-llama/Llama-4-Scout-17B-16E-Instruct", 17, 4608, 36, 6, 40, 131072, "Hugging Face", "Meta", "Text Generation", 250),
    new ModelSpec("meta-llama/Llama-Guard-3-8B", 8, 4096, 32, 8, 32, 8192, "Hugging Face", "Meta", "Safety", 17),

    new ModelSpec("mistralai/Mistral-7B-Instruct-v0.3", 7, 4096, 32, 8, 32, 32768, "Hugging Face", "Mistral AI", "Text Generation", 30),
    new ModelSpec("mistralai/Mixtral-8x7B-Instruct-v0.1", 47, 4096, 32, 8, 32, 32768, "Hugging Face", "Mistral AI", "Text Generation", 200),
    new ModelSpec("mistralai/Mixtral-8x22B-Instruct-v0.1", 141, 6144, 48, 8, 56, 65536, "Hugging Face", "Mistral AI", "Text Generation", 290),
    new ModelSpec("mistralai/Mistral-Nemo-Instruct-2407", 12, 5120, 32, 8, 40, 1048576, "Hugging Face", "Mistral AI", "Text Generation", 50),

    new ModelSpec("ibm-granite/granite-embedding-107m-multilingual", 0.107, 768, 12, 12, 12, 512, "Hugging Face", "IBM", "Embedding", 2),
    new ModelSpec("cross-encoder/ms-marco-MiniLM-L6-v2", 0.022, 384, 12, 12, 6, 512, "Hugging Face", "Cross-Encoder", "Reranker", 4),
    new ModelSpec("facebook/deit-base-distilled-patch16-224", 0.072, 768, 12, 12, 12, 224, "Hugging Face", "Facebook", "Image Classification", 4),
    new ModelSpec("google/vit-base-patch16-224", 0.086, 768, 12, 12, 12, 224, "Hugging Face", "Google", "Image Classification", 4),
    new ModelSpec("stable-diffusion-v1-5/stable-diffusion-v1-5", 0.86, 512, 8, 8, 16, 77, "Hugging Face", "Stability AI", "Image Generation", 40),
    new ModelSpec("black-forest-labs/flux.1-dev", 12, 3072, 24, 24, 19, 256, "Hugging Face", "Black Forest Labs", "Image Generation", 40),
    new ModelSpec("unsloth/Llama-3.3-70B-Instruct-bnb-4bit", 70, 8192, 64, 8, 80, 131072, "Hugging Face", "Unsloth", "Text Generation", 50),
    new ModelSpec("openai/gpt-oss-20b", 20, 2880, 64, 8, 24, 131072, "Hugging Face", "OpenAI", "Text Generation", 60),
    new ModelSpec("openai/gpt-oss-120b", 120, 2880, 64, 8, 36, 131072, "Hugging Face", "OpenAI", "Text Generation", 200),
    new ModelSpec("openai/gpt-oss-safeguard-20b", 20, 2880, 64, 8, 24, 131072, "Hugging Face", "OpenAI", "Content Safety", 20),

    new ModelSpec("llama-3.1-8b-instruct", 8, 4096, 32, 8, 32, 131072, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50),
    new ModelSpec("llama-3.1-70b-instruct", 70, 8192, 64, 8, 80, 131072, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 160),
    new ModelSpec("llama-3.1-nemoguard-8b-content-safety", 8, 4096, 32, 8, 32, 8192, "NVIDIA NGC Catalog", "NVIDIA", "Safety", 50),
    new ModelSpec("llama-3.2-nv-embedqa-1b-v2", 1, 2048, 16, 16, 24, 2048, "NVIDIA NGC Catalog", "NVIDIA", "Embedding", 5),
    new ModelSpec("llama-3.2-nv-rerankqa-1b-v2", 1, 2048, 16, 16, 24, 2048, "NVIDIA NGC Catalog", "NVIDIA", "Reranker", 5),
    new ModelSpec("llama-3.3-70b-instruct", 70, 8192, 64, 8, 80, 131072, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 160),
    new ModelSpec("llama-3.3-nemotron-super-49b-v1", 49, 8192, 64, 8, 80, 131072, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 120),
    new ModelSpec("llama-3.1-swallow-8b-instruct-v0", 8, 4096, 32, 8, 32, 131072, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50),
    new ModelSpec("llama-3.1-nemoguard-8b-topic-control", 8, 4096, 32, 8, 32, 8192, "NVIDIA NGC Catalog", "NVIDIA", "Safety", 50),
    new ModelSpec("mixtral-8x7b-instruct-v01", 47, 4096, 32, 8, 32, 32768, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 110),
    new ModelSpec("mistral-7b-instruct-v0", 7, 4096, 32, 8, 32, 32768, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 50),
    new ModelSpec("phi-3-mini-4k-instruct", 3.8, 3072, 32, 32, 32, 4096, "NVIDIA NGC Catalog", "NVIDIA", "Text Generation", 10),
];

const DEFAULT_GPUS = [
    new GPUSpec("NVIDIA L40S-48G", 362, 48, 864),
    new GPUSpec("NVIDIA A100-80G", 312, 80, 2039),
    new GPUSpec("NVIDIA H100-80G", 989, 80, 3350),
    new GPUSpec("NVIDIA H100 NVL-94G", 835.5, 94, 3900),
    new GPUSpec("NVIDIA H200-141G", 989, 141, 4800),
    new GPUSpec("NVIDIA RTX PRO 6000-96G", 1671, 96, 1792),
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelSpec, GPUSpec, PrecisionSpec, DEFAULT_MODELS, DEFAULT_GPUS };
}
