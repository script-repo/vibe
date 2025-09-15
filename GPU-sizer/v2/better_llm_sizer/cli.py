#!/usr/bin/env python3
import argparse
import json
import os
from typing import List, Dict, Any

from .specs import (
    ModelSpec,
    GPUSpec,
    PrecisionSpec,
    DEFAULT_MODELS,
    DEFAULT_GPUS,
)
from .calculator import PerformanceCalculator
from .reporting import print_table, save_csv, timestamped_filename


def load_models(path: str) -> List[ModelSpec]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    models = []
    for m in data:
        models.append(
            ModelSpec(
                name=m["name"],
                params_billion=float(m["params_billion"]),
                d_model=int(m["d_model"]),
                n_heads=int(m["n_heads"]),
                n_kv_heads=int(m["n_kv_heads"]),
                n_layers=int(m["n_layers"]),
                max_context_window=int(m.get("max_context_window", 8192)),
            )
        )
    return models


def load_gpus(path: str) -> List[GPUSpec]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    gpus = []
    for g in data:
        gpus.append(
            GPUSpec(
                name=g["name"],
                fp16_tflops=float(g["fp16_tflops"]),
                memory_gb=int(g["memory_gb"]),
                memory_bandwidth_gbps=int(g["memory_bandwidth_gbps"]),
            )
        )
    return gpus


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Better LLM sizing CLI with corrected TTFT and precision options"
    )
    p.add_argument("-g", "--num-gpu", type=int, default=1, dest="num_gpu")
    p.add_argument("-p", "--prompt", type=int, default=4096, dest="prompt")
    p.add_argument("-r", "--response", type=int, default=256, dest="response")
    p.add_argument("-c", "--concurrency", type=int, default=10, dest="concurrency")
    p.add_argument("--models-json", type=str, default=None)
    p.add_argument("--gpus-json", type=str, default=None)
    p.add_argument(
        "--gpus",
        type=str,
        default=None,
        help="Comma-separated GPU names to include (matches by exact name)",
    )
    p.add_argument(
        "--weight-bytes",
        type=float,
        default=2.0,
        help="Bytes per model parameter (e.g., 2=FP16, 1=FP8, 0.5=INT4)",
    )
    p.add_argument(
        "--kv-bytes",
        type=float,
        default=2.0,
        help="Bytes per KV element (e.g., 2=FP16, 1=FP8)",
    )
    p.add_argument(
        "--include-oom",
        action="store_true",
        help="Include entries that exceed memory in performance table",
    )
    return p.parse_args()


def to_memory_row(
    model: ModelSpec,
    kv_per_tok_gib: float,
    prompt: int,
    response: int,
    concurrency: int,
    total_mem_gb: float,
) -> Dict[str, Any]:
    return {
        "Model": model.name,
        "Input Size (tokens)": prompt,
        "Output Size (tokens)": response,
        "Concurrent Requests": concurrency,
        "KV Cache Size per Token": f"{kv_per_tok_gib:.6f} GiB/token",
        "Memory Footprint": f"{total_mem_gb:.2f} GB",
    }


def to_perf_row(
    model_name: str,
    gpu_name: str,
    prompt: int,
    response: int,
    concurrency: int,
    kv_tokens: int,
    prefill_ms: float,
    tpot_ms: float,
    ttft_s: float,
    e2e_s: float,
    thr: float,
) -> Dict[str, Any]:
    return {
        "Model": model_name,
        "GPU": gpu_name,
        "Input Size (tokens)": prompt,
        "Output Size (tokens)": response,
        "Concurrent Requests": concurrency,
        "Max # KV Cache Tokens": str(kv_tokens),
        "Prefill Time": f"{prefill_ms:.3f} ms",
        "TPOT (ms)": f"{tpot_ms:.3f} ms",
        "TTFT": f"{ttft_s:.3f} s",
        "E2E Latency": f"{e2e_s:.1f} s",
        "Output Tokens Throughput": f"{thr:.2f} tokens/sec",
    }


def main() -> None:
    args = parse_args()

    models = load_models(args.models_json) if args.models_json else DEFAULT_MODELS
    gpus = load_gpus(args.gpus_json) if args.gpus_json else DEFAULT_GPUS
    if args.gpus:
        wanted = {x.strip() for x in args.gpus.split(',') if x.strip()}
        gpus = [g for g in gpus if g.name in wanted]
    precision = PrecisionSpec(weight_bytes=args.weight_bytes, kv_bytes=args.kv_bytes)

    calc = PerformanceCalculator(num_gpu=args.num_gpu, precision=precision)

    print(
        f" num_gpu = {args.num_gpu}, prompt_size = {args.prompt} tokens, response_size = {args.response} tokens"
    )
    print(f" n_concurrent_request = {args.concurrency}")
    context_window = args.prompt + args.response

    # Memory table per model
    mem_rows: List[Dict[str, Any]] = []
    for m in models:
        kv_per_tok_gib = calc.kv_cache_size_per_token_gib(m)
        total_mem_gb = calc.total_memory_footprint_gb(m, args.concurrency, context_window)
        mem_rows.append(
            to_memory_row(
                m, kv_per_tok_gib, args.prompt, args.response, args.concurrency, total_mem_gb
            )
        )

    print_table(mem_rows, "******************** Estimate LLM Memory Footprint (Better) ********************")

    # Performance table per model x gpu
    perf_rows: List[Dict[str, Any]] = []
    for m in models:
        for g in gpus:
            fits = calc.fits_memory(g, m, args.concurrency, context_window)
            if not fits and not args.include_oom:
                continue
            metrics = calc.compute_metrics(m, g, args.prompt, args.response)
            if isinstance(metrics.prefill_time_per_token_ms, str) or isinstance(metrics.tpot_ms, str):
                if args.include_oom:
                    perf_rows.append(
                        {
                            "Model": m.name,
                            "GPU": g.name,
                            "Input Size (tokens)": args.prompt,
                            "Output Size (tokens)": args.response,
                            "Concurrent Requests": args.concurrency,
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
                to_perf_row(
                    m.name,
                    g.name,
                    args.prompt,
                    args.response,
                    args.concurrency,
                    metrics.kv_cache_tokens,
                    float(metrics.prefill_time_per_token_ms),
                    float(metrics.tpot_ms),
                    float(metrics.ttft_s),
                    float(metrics.e2e_latency_s),
                    float(metrics.throughput_tokens_per_s)
                    if not isinstance(metrics.throughput_tokens_per_s, str)
                    else float("nan"),
                )
            )

    print_table(perf_rows, "******************** Estimate LLM Capacity and Latency (Better) ********************")

    # Save CSVs
    os.makedirs("out", exist_ok=True)
    mem_csv = os.path.join("out", timestamped_filename("better_llm_memory"))
    perf_csv = os.path.join("out", timestamped_filename("better_llm_performance"))
    save_csv(mem_rows, mem_csv)
    save_csv(perf_rows, perf_csv)
    print(f"\nResults saved to:\n - {mem_csv}\n - {perf_csv}")


if __name__ == "__main__":
    main()
