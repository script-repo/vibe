# NAI LLM Sizing Calculator

A modern web-based calculator for estimating GPU memory requirements and performance metrics for Large Language Model (LLM) inference deployments. This tool helps you plan infrastructure requirements and optimize performance for various AI workloads.

## Features

🌐 **Modern Web Interface**
- Glass morphism design with gradient styling
- Responsive layout that works on desktop and mobile
- Real-time calculations with smooth animations
- Provider-organized model selection with bulk controls

🤖 **Comprehensive Model Support**
- **48 pre-validated enterprise AI models** across multiple providers:
  - **Hugging Face**: Meta Llama, Google Gemma, Mistral AI, IBM Granite, and more
  - **NVIDIA NGC**: Optimized models with safety and embedding variants
  - **Model Types**: Text Generation, Vision, Image Generation, Safety, Embedding, Reranking

⚡ **GPU Performance Analysis**
- Support for enterprise GPUs: L4, L40s, H100 NVL, H200 NVL, RTX Pro 6000, MI300X
- Memory footprint calculations with KV cache optimization
- Performance metrics: TTFT, TPOT, E2E latency, throughput
- Concurrent request capacity planning

📊 **Advanced Calculations**
- Precision-aware memory estimates (FP16, INT8, INT4)
- KV cache size optimization
- Multi-GPU deployment planning
- Memory overflow detection and recommendations

## Quick Start

### Prerequisites
- Python 3.7+ (no external dependencies required)

### Launch the Web Interface
```bash
# Clone or download the repository
cd LLM_Sizing_Guide

# Start the web server
python webui/server.py

# Open your browser and navigate to:
# http://127.0.0.1:8000
```

## How to Use

### 1. Configure Your Deployment
- **Number of GPUs**: Specify how many GPUs you plan to use
- **Prompt Tokens**: Average input size you expect to process
- **Response Tokens**: Average output size you expect to generate
- **Concurrent Requests**: Number of simultaneous requests to handle
- **Precision Settings**: Weight and KV cache precision (bytes per parameter)

### 2. Select AI Models
- Browse models organized by provider (Meta, Google, NVIDIA, etc.)
- Use **"All"/"None"** buttons for quick provider-wide selection
- Choose from 48+ enterprise-validated models including:
  - Llama 3.1/3.2/3.3 variants (1B to 405B parameters)
  - Mistral and Mixtral models
  - Google Gemma series
  - Specialized vision, embedding, and safety models

### 3. Choose Target GPUs
- Select from enterprise GPU options with memory specifications
- Compare performance across different hardware configurations
- Get memory capacity information for each GPU type

### 4. Calculate & Analyze
- Click **"Calculate Performance"** to run the analysis
- View automated **memory footprint** estimates
- Analyze **performance metrics** including:
  - **TTFT** (Time to First Token)
  - **TPOT** (Time per Output Token)
  - **E2E Latency** (End-to-End response time)
  - **Throughput** (Tokens per second)
- Export results to CSV for further analysis

## Understanding the Results

### Memory Footprint Table
- **KV Cache Size per Token**: Memory overhead for attention mechanisms
- **Memory Footprint**: Total GPU memory required including model weights and KV cache
- **OOM Warnings**: Automatic detection when configurations exceed GPU capacity

### Performance & Capacity Table
- **Max KV Cache Tokens**: Maximum sequence length supported
- **Prefill Time**: Time to process input tokens
- **TPOT**: Generation speed per output token
- **TTFT**: Latency before first response token
- **E2E Latency**: Total request processing time
- **Throughput**: Sustained generation rate

## Architecture

```
LLM_Sizing_Guide/
├── webui/
│   ├── server.py           # Modern web interface with glass morphism UI
│   └── server.log          # Server access logs
├── better_llm_sizer/
│   ├── calculator.py       # Core performance calculation engine
│   ├── specs.py           # Model and GPU specifications database
│   ├── reporting.py       # Data export and formatting utilities
│   └── cli.py            # Command-line interface (optional)
└── README.md              # This documentation
```

## Technical Details

### Calculation Methodology
- **Memory Estimation**: Based on parameter count, precision, and KV cache requirements
- **Performance Modeling**: Uses GPU specifications and attention mechanism complexity
- **Throughput Analysis**: Considers memory bandwidth, compute capacity, and parallelization
- **Capacity Planning**: Accounts for concurrent request batching and memory sharing

### Supported Configurations
- **Precision**: FP32, FP16, INT8, INT4 quantization
- **Multi-GPU**: Scale across multiple accelerators
- **Batch Processing**: Concurrent request handling optimization
- **Context Windows**: Support for long sequences up to 4M tokens

## Use Cases

- **Infrastructure Planning**: Size GPU clusters for AI deployments
- **Cost Optimization**: Compare hardware options for specific workloads
- **Performance Tuning**: Optimize batch sizes and concurrency levels
- **Capacity Planning**: Determine maximum throughput for given hardware
- **Model Selection**: Choose optimal models for performance requirements

## Browser Compatibility

The web interface works in all modern browsers:
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

*Powered by Nutanix Enterprise AI LLM Sizing Calculator*