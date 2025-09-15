#!/usr/bin/env python3
import sys
import os
from wsgiref.simple_server import make_server
from urllib.parse import parse_qs
from html import escape
import io
import csv

# Ensure parent directory is importable (so we can import better_llm_sizer)
THIS_DIR = os.path.dirname(__file__)
PARENT = os.path.dirname(THIS_DIR)
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)

from better_llm_sizer.specs import DEFAULT_MODELS, DEFAULT_GPUS, PrecisionSpec
from better_llm_sizer.calculator import PerformanceCalculator


def parse_params(environ):
    qs = environ.get("QUERY_STRING", "")
    params = parse_qs(qs)

    def get_int(name, default):
        try:
            return int(params.get(name, [default])[0])
        except Exception:
            return default

    def get_float(name, default):
        try:
            return float(params.get(name, [default])[0])
        except Exception:
            return default

    # Handle weight precision conversion from bits to bytes
    weight_bits = get_int("weight_bits", 16)
    weight_bytes = weight_bits / 8.0
    
    # Default model and GPU selections
    default_models = ["gpt-oss-20b", "meta-llama/Llama-3.3-70B-Instruct", "google/gemma-2-9b-it"]
    default_gpus = ["L40s", "RTX Pro 6000 (Blackwell)"]
    
    model_names = params.get("model", [])
    gpu_names = params.get("gpu", [])
    
    # Use defaults if no selections made
    if not model_names:
        model_names = default_models
    if not gpu_names:
        gpu_names = default_gpus
    
    v = {
        "num_gpu": get_int("g", 1),
        "prompt": get_int("p", 4096),
        "response": get_int("r", 256),
        "concurrency": get_int("c", 10),
        "weight_bits": str(weight_bits),
        "weight_bytes": weight_bytes,
        "kv_bytes": get_float("kv", 2.0),
        "include_oom": params.get("oom", ["0"])[0] == "1",
        "model_names": model_names,
        "gpu_names": gpu_names,
        "format": params.get("format", ["html"])[0],
        "type": params.get("type", ["all"])[0],
        "run": params.get("run", ["0"])[0] == "1",
    }
    return v


def filter_specs(model_names, gpu_names):
    if model_names:
        models = [m for m in DEFAULT_MODELS if m.name in set(model_names)]
    else:
        models = list(DEFAULT_MODELS)
    if gpu_names:
        gpus = [g for g in DEFAULT_GPUS if g.name in set(gpu_names)]
    else:
        gpus = list(DEFAULT_GPUS)
    return models, gpus


def compute(mem_args):
    models, gpus = filter_specs(mem_args["model_names"], mem_args["gpu_names"])
    precision = PrecisionSpec(weight_bytes=mem_args["weight_bytes"], kv_bytes=mem_args["kv_bytes"])
    calc = PerformanceCalculator(num_gpu=mem_args["num_gpu"], precision=precision)
    prompt = mem_args["prompt"]
    response = mem_args["response"]
    concurrency = mem_args["concurrency"]
    context_window = prompt + response

    # Memory rows
    mem_rows = []
    for m in models:
        kv_per_tok_gib = calc.kv_cache_size_per_token_gib(m)
        total_mem_gb = calc.total_memory_footprint_gb(m, concurrency, context_window)
        mem_rows.append(
            {
                "Model": m.name,
                "Input Size (tokens)": prompt,
                "Output Size (tokens)": response,
                "Concurrent Requests": concurrency,
                "KV Cache Size per Token": f"{kv_per_tok_gib:.6f} GiB/token",
                "Memory Footprint": f"{total_mem_gb:.2f} GB",
            }
        )

    # Perf rows
    perf_rows = []
    for m in models:
        for g in gpus:
            fits = calc.fits_memory(g, m, concurrency, context_window)
            if not fits and not mem_args["include_oom"]:
                continue
            metrics = calc.compute_metrics(m, g, prompt, response)
            if isinstance(metrics.prefill_time_per_token_ms, str) or isinstance(metrics.tpot_ms, str):
                perf_rows.append(
                    {
                        "Model": m.name,
                        "GPU": g.name,
                        "Input Size (tokens)": prompt,
                        "Output Size (tokens)": response,
                        "Concurrent Requests": concurrency,
                        "Max # KV Cache Tokens": str(metrics.kv_cache_tokens),
                        "Prefill Time": "OOM",
                        "TPOT (ms)": "OOM",
                        "TTFT": "OOM",
                        "E2E Latency": "OOM",
                        "Output Tokens Throughput": "OOM",
                    }
                )
                continue
            perf_rows.append(
                {
                    "Model": m.name,
                    "GPU": g.name,
                    "Input Size (tokens)": prompt,
                    "Output Size (tokens)": response,
                    "Concurrent Requests": concurrency,
                    "Max # KV Cache Tokens": str(metrics.kv_cache_tokens),
                    "Prefill Time": f"{float(metrics.prefill_time_per_token_ms):.3f} ms",
                    "TPOT (ms)": f"{float(metrics.tpot_ms):.3f} ms",
                    "TTFT": f"{float(metrics.ttft_s):.3f} s",
                    "E2E Latency": f"{float(metrics.e2e_latency_s):.1f} s",
                    "Output Tokens Throughput": (
                        f"{float(metrics.throughput_tokens_per_s):.2f} tokens/sec"
                    ),
                }
            )

    return models, gpus, mem_rows, perf_rows


def html_page(params, models, gpus, mem_rows, perf_rows):
    def opt(val, label, selected):
        sel = " selected" if selected else ""
        return f"<option value='{escape(val)}'{sel}>{escape(label)}</option>"

    def cb(name, value, checked):
        c = " checked" if checked else ""
        return f"<input type='checkbox' name='{escape(name)}' value='{escape(value)}'{c} />"

    # Group models by provider
    models_by_provider = {}
    for m in DEFAULT_MODELS:
        provider = m.provider if m.provider else "OpenAI"
        if provider not in models_by_provider:
            models_by_provider[provider] = []
        models_by_provider[provider].append(m)
    
    # Sort providers alphabetically
    sorted_providers = sorted(models_by_provider.keys())
    
    model_checks = ""
    for provider in sorted_providers:
        provider_id = escape(provider.replace(" ", "_").replace("-", "_"))
        model_checks += f'<div class="provider-group">'
        model_checks += f'<div class="provider-header-row">'
        model_checks += f'<h4 class="provider-header">{escape(provider)}</h4>'
        model_checks += f'<div class="provider-controls">'
        model_checks += f'<button type="button" class="provider-btn" onclick="toggleProvider(\'{provider_id}\', true)">All</button>'
        model_checks += f'<button type="button" class="provider-btn" onclick="toggleProvider(\'{provider_id}\', false)">None</button>'
        model_checks += f'</div>'
        model_checks += f'</div>'
        for m in sorted(models_by_provider[provider], key=lambda x: x.name):
            checked = m.name in params['model_names']
            model_checks += f'<div class="model-checkbox"><input type="checkbox" name="model" value="{escape(m.name)}" {"checked" if checked else ""} id="model_{escape(m.name.replace("/", "_"))}" class="provider-{provider_id}" /><label for="model_{escape(m.name.replace("/", "_"))}">{escape(m.name)}</label></div>'
        model_checks += '</div>'
    # Ensure GPUs are displayed sorted by ascending memory_gb regardless of definition order
    _sorted_gpus = sorted(DEFAULT_GPUS, key=lambda gg: gg.memory_gb)
    gpu_checks = ""
    for g in _sorted_gpus:
        checked = g.name in params['gpu_names']
        gpu_checks += f'<div class="model-checkbox"><input type="checkbox" name="gpu" value="{escape(g.name)}" {"checked" if checked else ""} id="gpu_{escape(g.name.replace(" ", "_"))}" /><label for="gpu_{escape(g.name.replace(" ", "_"))}">{escape(g.name)} ({g.memory_gb}GB)</label></div>'

    def table(rows):
        if not rows:
            return '<div style="text-align: center; color: var(--color-text-secondary); padding: 2rem;">No data to display</div>'
        headers = list(rows[0].keys())
        th = "".join(f"<th>{escape(h)}</th>" for h in headers)
        body = "".join(
            "<tr>" + "".join(f"<td>{escape(str(r.get(h,'')))}</td>" for h in headers) + "</tr>"
            for r in rows
        )
        return f'<table class="results-table"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>'

    # Build CSV links preserving query
    base_query = (
        f"g={params['num_gpu']}&p={params['prompt']}&r={params['response']}&c={params['concurrency']}"
        f"&weight_bits={params['weight_bits']}&kv={params['kv_bytes']}&oom={'1' if params['include_oom'] else '0'}"
        + "".join(f"&model={escape(m.name)}" for m in models)
        + "".join(f"&gpu={escape(g.name)}" for g in gpus)
    )


    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NAI LLM Performance Calculator - GPU Memory Requirements</title>
    <style>
        :root {{
            /* Primitive Color Tokens */
            --color-white: rgba(255, 255, 255, 1);
            --color-black: rgba(0, 0, 0, 1);
            --color-cream-50: rgba(252, 252, 249, 1);
            --color-cream-100: rgba(255, 255, 253, 1);
            --color-gray-200: rgba(245, 245, 245, 1);
            --color-gray-300: rgba(167, 169, 169, 1);
            --color-gray-400: rgba(119, 124, 124, 1);
            --color-slate-500: rgba(98, 108, 113, 1);
            --color-brown-600: rgba(94, 82, 64, 1);
            --color-charcoal-700: rgba(31, 33, 33, 1);
            --color-charcoal-800: rgba(38, 40, 40, 1);
            --color-slate-900: rgba(19, 52, 59, 1);
            --color-teal-300: rgba(50, 184, 198, 1);
            --color-teal-400: rgba(45, 166, 178, 1);
            --color-teal-500: rgba(33, 128, 141, 1);
            --color-teal-600: rgba(29, 116, 128, 1);
            --color-teal-700: rgba(26, 104, 115, 1);
            --color-teal-800: rgba(41, 150, 161, 1);

            /* RGB versions for opacity control */
            --color-brown-600-rgb: 94, 82, 64;
            --color-teal-500-rgb: 33, 128, 141;
            --color-slate-900-rgb: 19, 52, 59;
            --color-slate-500-rgb: 98, 108, 113;
            --color-gray-200-rgb: 245, 245, 245;

            /* Background color tokens */
            --color-bg-1: rgba(59, 130, 246, 0.08);
            --color-bg-2: rgba(245, 158, 11, 0.08);
            --color-bg-3: rgba(34, 197, 94, 0.08);
            --color-bg-4: rgba(239, 68, 68, 0.08);

            /* Semantic Color Tokens */
            --color-background: var(--color-cream-50);
            --color-surface: var(--color-cream-100);
            --color-text: var(--color-slate-900);
            --color-text-secondary: var(--color-slate-500);
            --color-primary: var(--color-teal-500);
            --color-primary-hover: var(--color-teal-600);
            --color-primary-active: var(--color-teal-700);
            --color-border: rgba(var(--color-brown-600-rgb), 0.2);
            --color-card-border: rgba(var(--color-brown-600-rgb), 0.12);
            --color-card-border-inner: rgba(var(--color-brown-600-rgb), 0.12);
            --color-btn-primary-text: var(--color-cream-50);
            --color-focus-ring: rgba(var(--color-teal-500-rgb), 0.4);

            /* Typography */
            --font-family-base: "FKGroteskNeue", "Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            --font-size-xs: 11px;
            --font-size-sm: 12px;
            --font-size-base: 14px;
            --font-size-lg: 16px;
            --font-size-xl: 18px;
            --font-size-2xl: 20px;
            --font-size-3xl: 24px;
            --font-size-4xl: 30px;
            --font-weight-normal: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 550;
            --font-weight-bold: 600;
            --line-height-tight: 1.2;
            --line-height-normal: 1.5;
            --letter-spacing-tight: -0.01em;

            /* Spacing */
            --space-4: 4px;
            --space-6: 6px;
            --space-8: 8px;
            --space-12: 12px;
            --space-16: 16px;
            --space-20: 20px;
            --space-24: 24px;
            --space-32: 32px;

            /* Border Radius */
            --radius-base: 8px;
            --radius-lg: 12px;

            /* Shadows */
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
            --shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.03);

            /* Animation */
            --duration-fast: 150ms;
            --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);

            /* Common patterns */
            --focus-ring: 0 0 0 3px var(--color-focus-ring);
            --focus-outline: 2px solid var(--color-primary);
        }}

        @media (prefers-color-scheme: dark) {{
            :root {{
                --color-background: var(--color-charcoal-700);
                --color-surface: var(--color-charcoal-800);
                --color-text: var(--color-gray-200);
                --color-text-secondary: rgba(var(--color-gray-300-rgb), 0.7);
                --color-primary: var(--color-teal-300);
                --color-primary-hover: var(--color-teal-400);
                --color-primary-active: var(--color-teal-800);
                --color-border: rgba(var(--color-gray-400-rgb), 0.3);
                --color-card-border: rgba(var(--color-gray-400-rgb), 0.2);
                --color-card-border-inner: rgba(var(--color-gray-400-rgb), 0.15);
                --color-btn-primary-text: var(--color-slate-900);
                --color-focus-ring: rgba(var(--color-teal-300-rgb), 0.4);
                --shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.15);
            }}
        }}
        
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        
        body {{
            font-family: var(--font-family-base);
            background: #000000;
            color: #ffffff;
            line-height: 1.6;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 3rem;
        }}
        
        .title {{
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: var(--font-weight-bold);
            background: linear-gradient(135deg, #9333ea, #ec4899, #a855f7);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--space-16);
            letter-spacing: -0.02em;
            line-height: var(--line-height-tight);
        }}
        
        .subtitle {{
            font-size: var(--font-size-lg);
            color: rgba(255, 255, 255, 0.7);
            font-weight: var(--font-weight-normal);
        }}
        
        .glass-card {{
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: var(--space-32);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
        }}
        
        .glass-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5), transparent);
        }}
        
        .form-title {{
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-semibold);
            color: #ffffff;
            margin-bottom: 1.5rem;
        }}
        
        .form-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }}
        
        .form-group {{
            display: flex;
            flex-direction: column;
        }}
        
        .form-label {{
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            color: #ffffff;
            margin-bottom: 0.5rem;
        }}
        
        .form-input {{
            padding: var(--space-16);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            color: #ffffff;
            font-size: var(--font-size-base);
            transition: all 0.3s ease;
            width: 100%;
        }}
        
        .form-input:focus {{
            outline: none;
            border-color: rgba(147, 51, 234, 0.6);
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.2);
            background: rgba(255, 255, 255, 0.12);
        }}
        
        .form-input::placeholder {{
            color: rgba(255, 255, 255, 0.5);
        }}
        
        .form-input option {{
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 8px 12px;
        }}
        
        .form-input option:checked {{
            background-color: rgba(147, 51, 234, 0.8);
            color: #ffffff;
        }}
        
        .btn-primary {{
            padding: var(--space-16) var(--space-32);
            background: linear-gradient(135deg, #9333ea, #ec4899);
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}
        
        .btn-primary::before {{
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
        }}
        
        .btn-primary:hover {{
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(147, 51, 234, 0.4);
        }}
        
        .btn-primary:hover::before {{
            left: 100%;
        }}
        
        .model-section {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }}
        
        .provider-group {{
            margin-bottom: 1.5rem;
        }}
        
        .model-checkbox {{
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            padding-left: 1rem;
        }}
        
        .model-checkbox input {{
            margin-right: 0.5rem;
            accent-color: #9333ea;
        }}
        
        .model-checkbox label {{
            font-size: var(--font-size-sm);
            color: rgba(255, 255, 255, 0.9);
            cursor: pointer;
            margin-bottom: 0;
        }}
        
        .gpu-section {{
            margin-top: 1rem;
        }}
        
        .results-section {{
            margin-top: 2rem;
        }}
        
        .results-title {{
            font-size: var(--font-size-xl);
            font-weight: var(--font-weight-semibold);
            color: #ffffff;
            margin-bottom: 1rem;
        }}
        
        .results-table {{
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        .results-table th {{
            background: rgba(147, 51, 234, 0.2);
            backdrop-filter: blur(10px);
            padding: var(--space-16);
            text-align: left;
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-semibold);
            color: #ffffff;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }}
        
        .results-table td {{
            padding: var(--space-16);
            font-size: var(--font-size-sm);
            color: rgba(255, 255, 255, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }}
        
        .results-table tr:hover {{
            background: rgba(255, 255, 255, 0.05);
        }}
        
        .provider-header-row {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        .provider-header {{
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-semibold);
            color: #ffffff;
            margin: 0;
        }}
        
        .provider-controls {{
            display: flex;
            gap: 0.5rem;
        }}
        
        .provider-btn {{
            padding: 4px 8px;
            background: rgba(147, 51, 234, 0.2);
            border: 1px solid rgba(147, 51, 234, 0.4);
            border-radius: 6px;
            color: rgba(255, 255, 255, 0.9);
            font-size: var(--font-size-xs);
            cursor: pointer;
            transition: all 0.2s ease;
        }}
        
        .provider-btn:hover {{
            background: rgba(147, 51, 234, 0.3);
            border-color: rgba(147, 51, 234, 0.6);
        }}
        
        .calculate-section {{
            text-align: center;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }}
        
        .results-animated {{
            animation: fadeInUp 0.6s ease-out;
        }}
        
        @keyframes fadeInUp {{
            from {{
                opacity: 0;
                transform: translateY(30px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        /* Smooth transitions for all interactive elements */
        * {{
            transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
        }}
        
        @media (max-width: 768px) {{
            .form-grid {{
                grid-template-columns: 1fr;
            }}
            .model-section {{
                grid-template-columns: 1fr;
            }}
            .container {{
                padding: 1rem;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">NAI LLM Performance Calculator</h1>
            <p class="subtitle">Calculate GPU memory requirements and performance for large language models</p>
        </header>
        
        <div class="calculate-section">
            <button type="submit" form="calculator-form" class="btn-primary">Calculate Performance</button>
        </div>
        
        <section class="glass-card">
            <h2 class="form-title">Configuration</h2>
            <form method="get" action="/" id="calculator-form">
                <input type="hidden" name="run" value="1" />
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label" for="num_gpu">Number of GPUs</label>
                        <input type="number" id="num_gpu" name="g" class="form-input" min="1" value="{params['num_gpu']}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="prompt_tokens">Prompt Tokens</label>
                        <input type="number" id="prompt_tokens" name="p" class="form-input" min="1" value="{params['prompt']}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="response_tokens">Response Tokens</label>
                        <input type="number" id="response_tokens" name="r" class="form-input" min="1" value="{params['response']}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="concurrency">Concurrent Requests</label>
                        <input type="number" id="concurrency" name="c" class="form-input" min="1" value="{params['concurrency']}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="weight_precision">Weight Precision (bits)</label>
                        <select id="weight_precision" name="weight_bits" class="form-input" required>
                            <option value="32" {'selected' if params.get('weight_bits', '16') == '32' else ''}>FP32 - 32 bit</option>
                            <option value="16" {'selected' if params.get('weight_bits', '16') == '16' else ''}>FP16 - 16 bit</option>
                            <option value="8" {'selected' if params.get('weight_bits', '16') == '8' else ''}>INT8 - 8 bit</option>
                            <option value="4" {'selected' if params.get('weight_bits', '16') == '4' else ''}>INT4 - 4 bit</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="kv_bytes">KV Cache Precision (bytes)</label>
                        <input type="number" id="kv_bytes" name="kv" class="form-input" min="0" step="0.1" value="{params['kv_bytes']}" />
                    </div>
                </div>
                
                <div class="model-section">
                    <div class="glass-card">
                        <h3 class="form-title">Select Models</h3>
                        <div class="models-container">
                            {model_checks}
                        </div>
                    </div>
                    <div class="glass-card gpu-section">
                        <h3 class="form-title">Select GPUs</h3>
                        <div class="gpu-container">
                            {gpu_checks}
                        </div>
                    </div>
                </div>
            </form>
        </section>

        {('<div class="results-section results-animated"><div class="glass-card"><h2 class="results-title">LLM Memory Footprint</h2>' + table(mem_rows) + '<div style="margin-top: 1rem; text-align: center;"><a href="/?format=csv&type=mem&' + base_query + '" class="btn-primary" style="text-decoration: none;">Download CSV</a></div></div></div>') if mem_rows else ''}
        {('<div class="results-section results-animated" id="performance-section"><div class="glass-card"><h2 class="results-title">LLM Performance & Capacity</h2>' + table(perf_rows) + '<div style="margin-top: 1rem; text-align: center;"><a href="/?format=csv&type=perf&' + base_query + '" class="btn-primary" style="text-decoration: none;">Download CSV</a></div></div></div>') if perf_rows else ''}

        <footer style="text-align: center; margin-top: 3rem; padding: 2rem; color: rgba(255, 255, 255, 0.5); font-size: var(--font-size-sm);">
            <p>Powered by Nutanix Enterprise AI LLM Performance Calculator</p>
        </footer>
    </div>
    
    <script>
        function toggleProvider(providerId, checkState) {{
            const checkboxes = document.querySelectorAll(`.provider-${{providerId}}`);
            checkboxes.forEach(checkbox => {{
                checkbox.checked = checkState;
            }});
        }}
        
        // Auto-scroll to performance section when results are shown
        document.addEventListener('DOMContentLoaded', function() {{
            const performanceSection = document.getElementById('performance-section');
            if (performanceSection) {{
                setTimeout(() => {{
                    performanceSection.scrollIntoView({{
                        behavior: 'smooth',
                        block: 'start'
                    }});
                }}, 300);
            }}
        }});
        
        // Add form submission handler for smooth scrolling
        document.getElementById('calculator-form').addEventListener('submit', function(e) {{
            // Let the form submit normally, but prepare for the scroll
            setTimeout(() => {{
                const performanceSection = document.getElementById('performance-section');
                if (performanceSection) {{
                    performanceSection.scrollIntoView({{
                        behavior: 'smooth',
                        block: 'start'
                    }});
                }}
            }}, 100);
        }});
    </script>
</body>
</html>
"""


def csv_response(rows):
    out = io.StringIO()
    if rows:
        writer = csv.DictWriter(out, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    data = out.getvalue().encode("utf-8")
    headers = [
        ("Content-Type", "text/csv; charset=utf-8"),
        ("Content-Length", str(len(data))),
        ("Content-Disposition", "attachment; filename=llm_sizing.csv"),
    ]
    return headers, [data]


def app(environ, start_response):
    params = parse_params(environ)
    models, gpus, mem_rows, perf_rows = ([], [], [], [])
    if params["run"] or params["format"] == "csv":
        models, gpus, mem_rows, perf_rows = compute(params)

    if params["format"] == "csv":
        rows = mem_rows if params["type"] == "mem" else perf_rows
        headers, body = csv_response(rows)
        start_response("200 OK", headers)
        return body

    page = html_page(params, models, gpus, mem_rows, perf_rows)
    data = page.encode("utf-8")
    start_response("200 OK", [("Content-Type", "text/html; charset=utf-8"), ("Content-Length", str(len(data)))])
    return [data]


from typing import Optional


def main(port: Optional[int] = None):
    if port is None:
        # Allow override via argv or PORT env
        try:
            port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", "8000"))
        except Exception:
            port = 8000
    with make_server("127.0.0.1", int(port), app) as httpd:
        print(f"Serving on http://127.0.0.1:{port} ...", file=sys.stderr)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
