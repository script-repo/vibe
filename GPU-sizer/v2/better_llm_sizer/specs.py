from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ModelSpec:
    name: str
    params_billion: float
    d_model: int
    n_heads: int
    n_kv_heads: int
    n_layers: int
    max_context_window: int
    hub: str = ""
    provider: str = ""
    model_type: str = ""
    size_gb: float = 0.0  # Estimated model size in GB


@dataclass
class GPUSpec:
    name: str
    fp16_tflops: float
    memory_gb: int
    memory_bandwidth_gbps: int


@dataclass
class PrecisionSpec:
    # Bytes used for model weights (per parameter)
    weight_bytes: float = 2.0  # FP16 default
    # Bytes used for KV cache values (per element)
    kv_bytes: float = 2.0  # FP16 default


# Nutanix Enterprise AI v2.4 Pre-validated Models
DEFAULT_MODELS: List[ModelSpec] = [
    # Hugging Face - AI21 Labs
    ModelSpec("ai21labs/AI21-Jamba-1.5-Mini", 52, 8192, 64, 8, 32, 262144,
              "Hugging Face", "AI21 Labs", "Text Generation", 110.0),
    
    # Hugging Face - Google
    ModelSpec("google/gemma-2-2b-it", 2.61, 2304, 8, 4, 26, 8192,
              "Hugging Face", "Google", "Text Generation", 10.0),
    ModelSpec("google/gemma-2-9b-it", 9.24, 3584, 16, 8, 42, 8192,
              "Hugging Face", "Google", "Text Generation", 20.0),
    ModelSpec("google/vit-base-patch16-224", 0.086, 768, 12, 12, 12, 224,
              "Hugging Face", "Google", "Image Classification", 4.0),
    
    # Hugging Face - Meta
    ModelSpec("meta-llama/Llama-2-13b-chat-hf", 13, 5120, 40, 40, 40, 4096,
              "Hugging Face", "Meta", "Text Generation", 60.0),
    ModelSpec("meta-llama/Llama-3.2-3b-Instruct", 3.21, 3072, 24, 8, 28, 131072,
              "Hugging Face", "Meta", "Text Generation", 20.0),
    ModelSpec("meta-llama/Llama-3.2-1B-Instruct", 1.24, 2048, 32, 8, 16, 131072,
              "Hugging Face", "Meta", "Text Generation", 10.0),
    ModelSpec("meta-llama/Llama-3.3-70B-Instruct", 70, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Meta", "Text Generation", 290.0),
    ModelSpec("meta-llama/Meta-Llama-3.1-8B-Instruct", 8, 4096, 32, 8, 32, 131072,
              "Hugging Face", "Meta", "Text Generation", 40.0),
    ModelSpec("meta-llama/Meta-Llama-3.1-70B-Instruct", 70, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Meta", "Text Generation", 290.0),
    ModelSpec("meta-llama/CodeLlama-7b-Instruct-hf", 7, 4096, 32, 32, 32, 16384,
              "Hugging Face", "Meta", "Text Generation", 30.0),
    ModelSpec("meta-llama/CodeLlama-13b-Instruct-hf", 13, 5120, 40, 40, 40, 16384,
              "Hugging Face", "Meta", "Text Generation", 60.0),
    ModelSpec("meta-llama/CodeLlama-34b-Instruct-hf", 34, 8192, 64, 64, 48, 16384,
              "Hugging Face", "Meta", "Text Generation", 140.0),
    ModelSpec("meta-llama/CodeLlama-70b-Instruct-hf", 70, 8192, 64, 8, 80, 16384,
              "Hugging Face", "Meta", "Text Generation", 280.0),
    ModelSpec("meta-llama/Llama-3.2-11B-Vision-Instruct", 11, 4096, 32, 8, 32, 131072,
              "Hugging Face", "Meta", "Vision", 55.0),
    ModelSpec("meta-llama/Llama-3.2-90B-Vision-Instruct", 90, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Meta", "Vision", 320.0),
    ModelSpec("meta-llama/Llama-4-Scout-17B-16E-Instruct", 17, 4608, 36, 6, 40, 131072,
              "Hugging Face", "Meta", "Text Generation", 250.0),
    ModelSpec("meta-llama/Llama-Guard-3-8B", 8, 4096, 32, 8, 32, 8192,
              "Hugging Face", "Meta", "Safety", 17.0),
    
    # Hugging Face - Mistral AI
    ModelSpec("mistralai/Mistral-7B-Instruct-v0.3", 7, 4096, 32, 8, 32, 32768,
              "Hugging Face", "Mistral AI", "Text Generation", 30.0),
    ModelSpec("mistralai/Mixtral-8x7B-Instruct-v0.1", 47, 4096, 32, 8, 32, 32768,
              "Hugging Face", "Mistral AI", "Text Generation", 200.0),
    ModelSpec("mistralai/Mixtral-8x22B-Instruct-v0.1", 141, 6144, 48, 8, 56, 65536,
              "Hugging Face", "Mistral AI", "Text Generation", 290.0),
    ModelSpec("mistralai/Mistral-Nemo-Instruct-2407", 12, 5120, 32, 8, 40, 1048576,
              "Hugging Face", "Mistral AI", "Text Generation", 50.0),
    ModelSpec("Mistral-nemo-12b-instruct", 12, 5120, 32, 8, 40, 1048576,
              "Hugging Face", "Mistral AI", "Text Generation", 80.0),
    ModelSpec("Mistral-7b-instruct-v0.3", 7, 4096, 32, 8, 32, 32768,
              "Hugging Face", "Mistral AI", "Text Generation", 50.0),
    ModelSpec("Mixtral-8x7B-Instruct-v0.1", 47, 4096, 32, 8, 32, 32768,
              "Hugging Face", "Mistral AI", "Text Generation", 110.0),
    
    # Hugging Face - IBM
    ModelSpec("ibm-granite/granite-embedding-107m-multilingual", 0.107, 768, 12, 12, 12, 512,
              "Hugging Face", "IBM", "Embedding", 2.0),
    
    # Hugging Face - Cross-Encoder
    ModelSpec("cross-encoder/ms-marco-MiniLM-L6-v2", 0.022, 384, 12, 12, 6, 512,
              "Hugging Face", "Cross-Encoder", "Reranker", 4.0),
    
    # Hugging Face - Facebook
    ModelSpec("facebook/deit-base-distilled-patch16-224", 0.072, 768, 12, 12, 12, 224,
              "Hugging Face", "Facebook", "Image Classification", 4.0),
    
    # Hugging Face - Stability AI
    ModelSpec("stable-diffusion-v1-5/stable-diffusion-v1-5", 0.86, 512, 8, 8, 16, 77,
              "Hugging Face", "Stability AI", "Image Generation", 40.0),
    
    # Hugging Face - Unsloth
    ModelSpec("unsloth/Llama-3.3-70B-Instruct-bnb-4bit", 70, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Unsloth", "Text Generation", 50.0),
    
    # Hugging Face - Black Forest Labs
    ModelSpec("black-forest-labs/flux.1-dev", 12, 3072, 24, 24, 19, 256,
              "Hugging Face", "Black Forest Labs", "Image Generation", 40.0),
    
    # Hugging Face - OpenAI GPT OSS
    ModelSpec("gpt-oss-20b", 20, 6144, 48, 48, 44, 2048,
              "Hugging Face", "OpenAI", "Text Generation", 60.0),
    ModelSpec("gpt-oss-120b", 120, 12288, 96, 96, 70, 2048,
              "Hugging Face", "OpenAI", "Text Generation", 210.0),
    
    # NVIDIA NGC - NVIDIA
    ModelSpec("llama-3.1-8b-instruct", 8, 4096, 32, 8, 32, 131072,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 50.0),
    ModelSpec("llama-3.1-70b-instruct", 70, 8192, 64, 8, 80, 131072,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 160.0),
    ModelSpec("llama-3.1-nemoguard-8b-content-safety", 8, 4096, 32, 8, 32, 8192,
              "NVIDIA NGC", "NVIDIA", "Safety", 50.0),
    ModelSpec("llama-3.2-nv-embedqa-1b-v2", 1, 2048, 16, 16, 24, 2048,
              "NVIDIA NGC", "NVIDIA", "Embedding", 5.0),
    ModelSpec("llama-3.2-nv-rerankqa-1b-v2", 1, 2048, 16, 16, 24, 2048,
              "NVIDIA NGC", "NVIDIA", "Reranker", 5.0),
    ModelSpec("llama-3.3-70b-instruct", 70, 8192, 64, 8, 80, 131072,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 160.0),
    ModelSpec("llama-3.3-nemotron-super-49b-v1", 49, 8192, 64, 8, 80, 131072,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 120.0),
    ModelSpec("llama-3.1-swallow-8b-instruct-v0", 8, 4096, 32, 8, 32, 131072,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 50.0),
    ModelSpec("llama-3.1-nemoguard-8b-topic-control", 8, 4096, 32, 8, 32, 8192,
              "NVIDIA NGC", "NVIDIA", "Safety", 50.0),
    ModelSpec("mixtral-8x7b-instruct-v01", 47, 4096, 32, 8, 32, 32768,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 110.0),
    ModelSpec("mistral-7b-instruct-v0", 7, 4096, 32, 8, 32, 32768,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 50.0),
    ModelSpec("phi-3-mini-4k-instruct", 3.8, 3072, 32, 32, 32, 4096,
              "NVIDIA NGC", "NVIDIA", "Text Generation", 10.0),
    
    # Additional Meta models
    ModelSpec("Llama-3.2-90b-vision-instruct", 90, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Meta", "Vision", 200.0),
    ModelSpec("Llama-3.1-70b-instruct-pb24h2", 70, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Meta", "Text Generation", 160.0),
    ModelSpec("Llama-3.1-swallow-8b-instruct-v0.1", 8, 4096, 32, 8, 32, 131072,
              "Hugging Face", "Meta", "Text Generation", 50.0),
    ModelSpec("Llama-3.1-nemotron-70b-instruct", 70, 8192, 64, 8, 80, 131072,
              "Hugging Face", "Meta", "Text Generation", 160.0),
    ModelSpec("Llama-3.1-8b-instruct-pb24h2", 8, 4096, 32, 8, 32, 131072,
              "Hugging Face", "Meta", "Text Generation", 50.0),
]


DEFAULT_GPUS: List[GPUSpec] = [
    # Sorted by ascending memory_gb
    GPUSpec("L4", 121, 24, 300),
    GPUSpec("L40s", 362, 48, 864),
    GPUSpec("H100 NVL", 835.5, 94, 3900),
    GPUSpec("RTX Pro 6000 (Blackwell)", 1671, 96, 1792),
    GPUSpec("H200 NVL", 835.5, 141, 4800),
    GPUSpec("MI300X", 1307, 192, 5300),
]
