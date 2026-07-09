# NAI LLM Performance Calculator - JavaScript Version

A static web application for estimating GPU memory requirements and performance metrics for Large Language Model (LLM) inference deployments on **Nutanix Enterprise AI (NAI)**. Runs entirely in the browser and can be deployed to GitHub Pages or any static hosting service.

## Data Sources

- **Models**: the 32 pre-validated models from the NAI 2.6 Admin Guide ("Pre-validated Models", Table 8), including the NAI-validated GPU count for every supported model + GPU combination.
- **GPUs**: the 6 NAI 2.6 supported GPUs (Admin Guide "Requirements"): L40S-48G, A100-80G, H100-80G, H100 NVL-94G, RTX PRO 6000-96G (Blackwell Server Edition), H200-141G.

## Features

🤖 **NAI 2.6 Pre-validated Catalog**
- All 32 pre-validated models across Meta, Mistral AI, Google, Ai2, NVIDIA NIM, OpenAI (gpt-oss), and Black Forest Labs
- Per-model **NAI-validated GPU configurations** (e.g. Llama-3.3-70B ⇒ 4× L40S / 2× H100-80G / 2× H200-141G) surfaced directly in the results
- Provider-organized model selection with bulk All/None controls
- CSV export of both result tables

⚡ **Roofline Performance Analysis**
- Memory footprint: weights + GQA-aware KV cache (per token, total at your concurrency)
- Performance: prefill time, TPOT, TTFT, E2E latency, per-request and aggregate throughput
- Capacity: max KV-cache tokens and max concurrent requests at your context length
- OOM detection with the validated GPU count shown as guidance

## Calculation Model (assumptions)

- **Weights memory** = *total* parameters × bytes/param. MoE models (Mixtral, Llama-4-Scout, gpt-oss) load **all** experts.
- **Weight precision** defaults to *model native*: FP16/BF16 for most models, FP8 for the NIM-optimized llama-3.3-70b-instruct, MXFP4 (~0.6 B/param) for gpt-oss. You can override to FP32/FP16/FP8/INT4.
- **KV cache per token** = 2 (K+V) × layers × KV heads × head dim × KV bytes — GQA-aware, with explicit head dims where they differ from d_model/n_heads (Mistral family, Gemma 2, gpt-oss).
- **Prefill** is compute-bound: 2 FLOPs per *active* param per token over dense FP16 TFLOPS, ideal tensor parallel across GPUs.
- **Decode (TPOT)** is memory-bandwidth-bound: active params × bytes streamed per token.
- **Aggregate throughput** assumes continuous batching (concurrency × per-request throughput).
- **GPU memory utilization** (default 0.9, like vLLM's `gpu_memory_utilization`) reserves headroom for activations/fragmentation.
- Non-autoregressive models (embedding, reranker, image classification/generation, document AI) get memory estimates only; latency columns show **N/A**.

These are first-order roofline estimates. Real engines (vLLM, TGI, NIM/TRT-LLM) typically achieve 50–80% of these numbers.

## Quick Start

```bash
cd GPU-sizer/v2

# Serve locally using Python
python -m http.server 8080

# Or using Node.js
npx serve .

# Open browser to http://localhost:8080
```

### Validate the data and math

```bash
cd GPU-sizer/v2
node tests/validate.js
```

The suite checks schema integrity, exact KV-cache/weight values for known models, metric properties (GPU scaling, MoE active-vs-total params, aggregate throughput), OOM detection, and — most importantly — that **every NAI-validated (model, GPU, count) combination from Table 8 actually fits** at native precision according to the calculator.

## File Structure

```
v2/
├── index.html              # Main web application (UI + presentation logic)
├── js/
│   ├── specs.js            # NAI 2.6 model & GPU specifications
│   └── calculator.js       # Roofline calculation engine
├── tests/
│   └── validate.js         # Node validation suite (node tests/validate.js)
└── README-JS.md            # This documentation
```

## How to Use

1. **Configure**: GPUs per endpoint, prompt/response tokens, concurrency, weight/KV precision, memory utilization.
2. **Select models**: browse by provider; hover a model for hub/type/size.
3. **Select GPUs**: labels show memory and bandwidth.
4. **Calculate**: review the memory footprint and performance tables. The *NAI Validated* column shows Nutanix's tested GPU count for that model+GPU; *Fits* reflects **your** chosen GPU count. Rows whose requested context exceeds the model maximum are flagged with ⚠.
5. **Export**: download either table as CSV.

## Deployment

Entirely static — host the `v2/` folder anywhere (GitHub Pages, Netlify, Vercel, any web server). No build step, no dependencies.

## Contributing

To add or update models/GPUs when a new NAI release ships:

1. Edit `js/specs.js` (models: architecture fields + `nai_gpu_counts` from the new release's Table; GPUs: dense FP16 TFLOPS, memory, bandwidth).
2. Run `node tests/validate.js` — the Table-8 cross-check will catch mismatched parameters (update the expected model/GPU counts in the test's schema section).
3. Test in the browser.

## License

Same license as the original Python version.

---

*JavaScript version — optimized for static deployment and GitHub Pages*
