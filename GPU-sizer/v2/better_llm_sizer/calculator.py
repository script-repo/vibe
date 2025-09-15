from dataclasses import dataclass
from typing import Union

from .specs import ModelSpec, GPUSpec, PrecisionSpec


BYTES_IN_GiB = 1_073_741_824


@dataclass
class PerformanceMetrics:
    kv_cache_tokens: int
    prefill_time_per_token_ms: Union[float, str]
    tpot_ms: Union[float, str]
    ttft_s: Union[float, str]
    e2e_latency_s: Union[float, str]
    throughput_tokens_per_s: Union[float, str]


class PerformanceCalculator:
    def __init__(self, num_gpu: int, precision: PrecisionSpec):
        self.num_gpu = num_gpu
        self.precision = precision

    # ---------- Memory / capacity ----------
    def kv_cache_size_per_token_gib(self, model: ModelSpec) -> float:
        # 2x for K and V
        d_head = model.d_model / model.n_heads
        return (
            2 * model.n_layers * model.n_kv_heads * d_head * self.precision.kv_bytes
        ) / BYTES_IN_GiB

    def weights_memory_gb(self, model: ModelSpec) -> float:
        # params_billion * 1e9 params * bytes -> GiB approximated as GB for simplicity
        # original repo used: params_billion * 2 (GB) for FP16. Keep same unit basis (GB)
        bytes_per_billion_params_gb = self.precision.weight_bytes
        return model.params_billion * bytes_per_billion_params_gb

    def total_memory_footprint_gb(
        self, model: ModelSpec, n_concurrent: int, context_window: int
    ) -> float:
        kv_per_token_gib = self.kv_cache_size_per_token_gib(model)
        kv_total_gib = kv_per_token_gib * context_window * n_concurrent
        # Convert GiB to GB roughly 1:1 for this estimator like original (keeps consistency)
        return kv_total_gib + self.weights_memory_gb(model)

    def max_kv_tokens(self, gpu: GPUSpec, model: ModelSpec) -> int:
        kv_per_token_gib = self.kv_cache_size_per_token_gib(model)
        if kv_per_token_gib <= 0:
            return 0
        total_mem_gb = self.num_gpu * gpu.memory_gb
        # Convert GB to GiB roughly 1:1 to maintain simplicity
        usable_gb = max(0.0, total_mem_gb - self.weights_memory_gb(model))
        return int(max(0.0, usable_gb / kv_per_token_gib))

    def fits_memory(
        self, gpu: GPUSpec, model: ModelSpec, n_concurrent: int, context_window: int
    ) -> bool:
        return self.total_memory_footprint_gb(model, n_concurrent, context_window) <= (
            self.num_gpu * gpu.memory_gb
        )

    # ---------- Time / performance ----------
    def prefill_time_per_token_ms(self, model: ModelSpec, gpu: GPUSpec) -> float:
        # Same scaling as original: 2 * params_billion / num_gpu / tflops (ms)
        return (2 * model.params_billion / max(1, self.num_gpu)) / gpu.fp16_tflops

    def tpot_ms(self, model: ModelSpec, gpu: GPUSpec) -> float:
        # Same form as original but clarified units
        return (
            (2 * model.params_billion / max(1, self.num_gpu))
            / max(1e-9, gpu.memory_bandwidth_gbps)
            * 1000
        )

    def e2e_latency_s(
        self, prefill_ms: float, tpot_ms: float, prompt_tokens: int, response_tokens: int
    ) -> float:
        return (prompt_tokens * prefill_ms + response_tokens * tpot_ms) / 1000.0

    def ttft_s(self, prefill_ms: float, tpot_ms: float, prompt_tokens: int) -> float:
        # Correct TTFT: prefill of entire prompt + one token generation
        return (prompt_tokens * prefill_ms + tpot_ms) / 1000.0

    def compute_metrics(
        self, model: ModelSpec, gpu: GPUSpec, prompt_tokens: int, response_tokens: int
    ) -> PerformanceMetrics:
        kv_tokens = self.max_kv_tokens(gpu, model)
        prefill_ms = self.prefill_time_per_token_ms(model, gpu)
        tpot_ms = self.tpot_ms(model, gpu)

        if prefill_ms < 0 or tpot_ms < 0:
            return PerformanceMetrics(
                kv_cache_tokens=kv_tokens,
                prefill_time_per_token_ms="OOM",
                tpot_ms="OOM",
                ttft_s="OOM",
                e2e_latency_s="OOM",
                throughput_tokens_per_s="OOM",
            )

        ttft_s = self.ttft_s(prefill_ms, tpot_ms, prompt_tokens)
        e2e_s = self.e2e_latency_s(prefill_ms, tpot_ms, prompt_tokens, response_tokens)
        thr = response_tokens / e2e_s if e2e_s > 0 else "OOM"

        return PerformanceMetrics(
            kv_cache_tokens=kv_tokens,
            prefill_time_per_token_ms=prefill_ms,
            tpot_ms=tpot_ms,
            ttft_s=ttft_s,
            e2e_latency_s=e2e_s,
            throughput_tokens_per_s=thr,
        )

