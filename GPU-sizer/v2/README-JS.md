# NAI LLM Performance Calculator - JavaScript Version

A static web application for estimating GPU memory requirements and performance metrics for Large Language Model (LLM) inference deployments. This JavaScript version can be deployed to GitHub Pages or any static hosting service.

## Features

🌐 **Static Web Application**
- Pure JavaScript/HTML/CSS implementation
- No server required - runs entirely in the browser
- Responsive design with glass morphism styling

🤖 **Comprehensive Model Support**
- **48 pre-validated enterprise AI models** across multiple providers
- Real-time performance calculations
- Provider-organized model selection with bulk controls
- CSV export functionality

⚡ **GPU Performance Analysis**
- Support for enterprise GPUs: L4, L40s, H100 NVL, H200 NVL, RTX Pro 6000, MI300X
- Memory footprint calculations with KV cache optimization
- Performance metrics: TTFT, TPOT, E2E latency, throughput
- Concurrent request capacity planning

## Quick Start

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd GPU-sizer/v2

# Serve locally using Python
python -m http.server 8080

# Or using Node.js
npx serve .

# Open browser to http://localhost:8080
```

### GitHub Pages Deployment

1. **Fork/Clone** this repository
2. **Enable GitHub Pages** in repository settings
3. **Set source** to main branch / root folder
4. **Access** your site at `https://yourusername.github.io/repository-name/`

## File Structure

```
v2/
├── index.html              # Main web application
├── js/
│   ├── specs.js           # Model and GPU specifications
│   └── calculator.js      # Performance calculation engine
├── README-JS.md           # This documentation
└── README.md              # Original Python version docs
```

## How to Use

### 1. Configure Your Deployment
- **Number of GPUs**: Specify how many GPUs you plan to use
- **Prompt Tokens**: Average input size you expect to process
- **Response Tokens**: Average output size you expect to generate
- **Concurrent Requests**: Number of simultaneous requests to handle
- **Precision Settings**: Weight and KV cache precision

### 2. Select AI Models
- Browse models organized by provider (Meta, Google, NVIDIA, etc.)
- Use **"All"/"None"** buttons for quick provider-wide selection
- Choose from 48+ enterprise-validated models

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
- Model specifications (ModelSpec class)
- GPU specifications (GPUSpec class)
- Precision configurations (PrecisionSpec class)
- Default datasets for 48 models and 6 GPU types

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

The calculator implements the same algorithms as the Python version:

- **Memory Estimation**: Based on parameter count, precision, and KV cache requirements
- **Performance Modeling**: Uses GPU specifications and attention mechanism complexity
- **Throughput Analysis**: Considers memory bandwidth, compute capacity, and parallelization
- **Capacity Planning**: Accounts for concurrent request batching and memory sharing

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

The JavaScript version maintains full feature parity with the Python version:

- ✅ All 48 model specifications preserved
- ✅ All 6 GPU specifications maintained
- ✅ Identical calculation algorithms
- ✅ Same precision handling (FP32, FP16, INT8, INT4)
- ✅ CSV export functionality
- ✅ Responsive design maintained
- ✅ Provider-based model organization

### Key Differences
- **No server required** - runs entirely in browser
- **Instant deployment** - no Python environment needed
- **GitHub Pages ready** - perfect for static hosting
- **Same user experience** - maintained all original features

## Contributing

To add new models or GPUs:

1. Edit `js/specs.js`
2. Add new `ModelSpec` or `GPUSpec` entries to the respective arrays
3. Follow the existing naming and parameter conventions
4. Test calculations with the new specifications

## License

Same license as the original Python version.

---

*JavaScript version - Optimized for static deployment and GitHub Pages*