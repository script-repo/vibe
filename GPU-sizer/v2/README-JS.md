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

🤖 **Comprehensive Model Support**
- **All Nutanix Enterprise AI 2.7 pre-validated models** (Table 37, ~78 catalog rows across Hugging Face and NVIDIA NGC), including MoE models (Mixtral, gpt-oss, Llama 4 Scout, Nemotron-3-Nano, Gemma 4)
- MoE-aware performance math (uses *active* parameters/token for compute, *total* for memory)
- Provider-organized model selection with bulk controls
- Models with not-yet-public configs are flagged `(est.)`
- CSV export functionality

⚡ **GPU Performance Analysis**
- NAI 2.7 supported GPUs: L40S, A100, H100, H100 NVL, H200, RTX PRO 6000 Blackwell, B300 (Blackwell Ultra) — plus L4 and MI300X
- Memory footprint calculations with KV cache + activation/runtime overhead
- Performance metrics: TTFT, TPOT, E2E latency, per-request and system throughput
- Precision-aware (FP32/TF32, FP16/BF16/INT16, FP8/INT8, INT4/NF4) and concurrency capacity planning

🛠️ **Custom specs & guided help**
- **Add a Custom GPU** — define your own name, memory, bandwidth and TFLOPS (only name + memory required for memory sizing)
- **Add a Custom Model** — define params, layers, hidden size, heads, KV heads, context, and optional MoE active params
- **Right-side help pane** — hover any configuration option for a detailed explanation of what it does and its effect on sizing
- Precision options are grouped by byte width (formats with the same width, e.g. FP16/BF16/INT16, share one entry since sizing depends only on bytes/parameter)

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

### 1. Configure Your Deployment
- **Number of GPUs**: Specify how many GPUs you plan to use
- **Prompt Tokens**: Average input size you expect to process
- **Response Tokens**: Average output size you expect to generate
- **Concurrent Requests**: Number of simultaneous requests to handle
- **Precision Settings**: Weight and KV cache precision

### 2. Select AI Models
- Browse models organized by provider (Meta, Google, NVIDIA, Mistral AI, OpenAI, etc.)
- Use **"All"/"None"** buttons for quick provider-wide selection
- Choose from the full NAI 2.7 pre-validated catalog; each entry shows its capability and an `(est.)` marker when its architecture is estimated

### 3. Choose Target GPUs
- Select from enterprise GPU options with memory specifications
- Compare performance across different hardware configurations

### 4. Calculate & Analyze
- Click **"Calculate Performance"** to run the analysis
- View memory footprint estimates and performance metrics
- Export results to CSV for further analysis

## Technical Implementation

### Architecture
- **Modular JavaScript**: Clean separation of concerns
- **No Dependencies**: Pure vanilla JavaScript
- **Client-Side Only**: All calculations run in the browser
- **Memory Efficient**: Optimized for large model datasets

### Key Components

#### `specs.js`
- Model specifications (ModelSpec class, incl. `active_params_billion` for MoE and an `estimated` flag)
- GPU specifications (GPUSpec class)
- Precision configurations (PrecisionSpec class)
- NAI 2.7 datasets: full pre-validated model catalog and 9 GPU types

#### `calculator.js`
- Performance calculation engine (PerformanceCalculator class)
- Memory footprint calculations
- Performance metrics computation
- Multi-GPU scaling logic

#### `index.html`
- Complete web application UI
- Modern glass morphism design
- Real-time form handling
- CSV export functionality

### Calculations

All memory math is done in GiB (2^30 bytes) for consistency.

- **Weights memory** = `total_params × weight_bytes` (INT8/INT4 quantization reduces this).
- **KV cache per token** = `2 × n_layers × n_kv_heads × (d_model / n_heads) × kv_bytes` (GQA/MQA aware).
- **Total footprint** = `weights × overhead_factor + kv_per_token × context × concurrency`, where the overhead factor (default 1.15) covers activations and CUDA/runtime memory.
- **Fit / max KV tokens**: available memory after reserving weights+overhead, divided by KV size per token.
- **Prefill (compute-bound)**: `2 × active_params` FLOPs/token divided by `peak_TFLOPS × MFU × num_gpu` (default MFU 0.30).
- **Decode / TPOT (bandwidth-bound)**: `active_params × weight_bytes` bytes/token divided by `bandwidth × MBU × num_gpu` (default MBU 0.70).
- **MoE handling**: compute and decode use **active** parameters per token; capacity uses **total** parameters.
- **Throughput**: per-request (single stream) and system (batched decode ≈ `concurrency / TPOT`).

MFU, MBU, and the memory overhead factor are exposed as inputs in the UI so you can tune to your inference engine and hardware.

## Browser Compatibility

Works in all modern browsers:
- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Deployment Options

### GitHub Pages
1. Push code to GitHub repository
2. Enable Pages in Settings → Pages
3. Select source branch (usually `main`)
4. Access at `https://username.github.io/repo-name/`

### Netlify
1. Connect GitHub repository
2. Build command: (none needed)
3. Publish directory: `/` or `/v2`
4. Deploy automatically on push

### Vercel
1. Import GitHub repository
2. Framework preset: Other
3. Build command: (none needed)
4. Output directory: (none needed)

### Custom Hosting
Simply upload the files to any web server. The application is entirely static.

## Migrating from Python Version

The JavaScript version maintains full feature parity with the Python version and extends it:

- ✅ Full NAI 2.7 pre-validated model catalog
- ✅ NAI 2.7 supported GPUs (+ L4, MI300X)
- ✅ Improved, MoE-aware calculation engine
- ✅ Precision handling (FP32, FP16, INT8, INT4)
- ✅ CSV export functionality
- ✅ Responsive design maintained
- ✅ Provider-based model organization

### Key Differences
- **No server required** - runs entirely in browser
- **Instant deployment** - no Python environment needed
- **GitHub Pages ready** - perfect for static hosting
- **Same user experience** - maintained all original features

## Contributing

To add or update models/GPUs when a new NAI release ships:

1. Edit `js/specs.js` (models: architecture fields + `nai_gpu_counts` from the new release's Table; GPUs: dense FP16 TFLOPS, memory, bandwidth).
2. Run `node tests/validate.js` — the Table-8 cross-check will catch mismatched parameters (update the expected model/GPU counts in the test's schema section).
3. Test in the browser.

## License

Same license as the original Python version.

---

*JavaScript version — optimized for static deployment and GitHub Pages*
