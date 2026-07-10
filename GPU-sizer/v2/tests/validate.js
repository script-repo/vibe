// Validation suite for the NAI LLM sizing calculator.
// Run with: node tests/validate.js
//
// The key cross-check: for every NAI-validated (model, GPU, count) combo from
// the NAI 2.6 Admin Guide (Table 8), the calculator at native precision must
// agree that the model's weights (plus a modest KV allowance for LLMs) fit.

const { DEFAULT_MODELS, DEFAULT_GPUS, PrecisionSpec, isLlmModel } = require('../js/specs.js');
const { PerformanceCalculator } = require('../js/calculator.js');

let passed = 0, failed = 0;
function check(cond, msg) {
    if (cond) { passed++; }
    else { failed++; console.error(`  FAIL: ${msg}`); }
}
function approx(a, b, tolPct, msg) {
    const ok = Math.abs(a - b) <= Math.abs(b) * tolPct;
    check(ok, `${msg} (got ${a}, expected ~${b})`);
}

const GPU_BY_KEY = Object.fromEntries(DEFAULT_GPUS.map(g => [g.key, g]));
const nativePrecision = new PrecisionSpec(null, 2.0);

// ---------- 1. Schema sanity ----------
console.log('1. Model/GPU schema sanity');
check(DEFAULT_MODELS.length === 32, `expected 32 NAI 2.6 pre-validated models, got ${DEFAULT_MODELS.length}`);
check(DEFAULT_GPUS.length === 6, `expected 6 NAI 2.6 supported GPUs, got ${DEFAULT_GPUS.length}`);

const names = new Set();
DEFAULT_MODELS.forEach(m => {
    check(!names.has(m.name), `duplicate model name ${m.name}`);
    names.add(m.name);
    check(m.params_billion > 0, `${m.name}: params_billion must be > 0`);
    check(m.active_params_billion > 0 && m.active_params_billion <= m.params_billion,
          `${m.name}: active params (${m.active_params_billion}) must be in (0, total]`);
    check(m.n_kv_heads <= m.n_heads, `${m.name}: kv heads > heads`);
    check(m.n_layers > 0 && m.d_model > 0 && m.max_context_window > 0, `${m.name}: bad architecture fields`);
    check(m.native_weight_bytes > 0 && m.native_weight_bytes <= 4, `${m.name}: bad native_weight_bytes`);
    check(m.hub && m.provider && m.model_type, `${m.name}: missing hub/provider/type`);
    Object.keys(m.nai_gpu_counts).forEach(key => {
        check(GPU_BY_KEY[key], `${m.name}: nai_gpu_counts references unknown GPU key '${key}'`);
    });
    check(Object.keys(m.nai_gpu_counts).length > 0, `${m.name}: no validated GPU configs`);
});
DEFAULT_GPUS.forEach(g => {
    check(g.fp16_tflops > 0 && g.memory_gb > 0 && g.memory_bandwidth_gbps > 0, `${g.name}: bad GPU spec`);
});

// ---------- 2. Known-value spot checks ----------
console.log('2. Known-value spot checks');
const byName = Object.fromEntries(DEFAULT_MODELS.map(m => [m.name, m]));
const calc1 = new PerformanceCalculator(1, nativePrecision, 0.9);

// Llama-3.1-8B: KV/token = 2 * 32 layers * 8 kv * 128 dim * 2 B = 131072 B
approx(calc1.kvCacheSizePerTokenGib(byName['Meta-Llama-3.1-8B-Instruct']) * 2 ** 30, 131072, 0.001,
       'Llama-3.1-8B KV bytes/token');
// gpt-oss-20b: 2 * 24 * 8 * 64 * 2 = 49152 B (head_dim 64 != d_model/n_heads)
approx(calc1.kvCacheSizePerTokenGib(byName['gpt-oss-20b']) * 2 ** 30, 49152, 0.001,
       'gpt-oss-20b KV bytes/token');
// Mistral-Nemo: 2 * 40 * 8 * 128 * 2 = 163840 B (explicit d_head=128)
approx(calc1.kvCacheSizePerTokenGib(byName['Mistral-Nemo-Instruct-2407']) * 2 ** 30, 163840, 0.001,
       'Mistral-Nemo KV bytes/token');
// 70B FP16 weights = 70.6e9 * 2 / 2^30 = 131.5 GiB
approx(calc1.weightsMemoryGib(byName['Meta-Llama-3.3-70B-Instruct']), 131.5, 0.01, '70B FP16 weights GiB');
// gpt-oss-120b native (MXFP4) ~ 65 GiB
approx(calc1.weightsMemoryGib(byName['gpt-oss-120b']), 65.3, 0.05, 'gpt-oss-120b native weights GiB');

// ---------- 3. NAI Table 8 cross-validation ----------
// Every validated (model, GPU, count) must fit weights at native precision,
// plus 1 request x 2048-token KV for LLM types.
console.log('3. NAI validated configs fit at native precision');
DEFAULT_MODELS.forEach(m => {
    Object.entries(m.nai_gpu_counts).forEach(([key, count]) => {
        const gpu = GPU_BY_KEY[key];
        const calc = new PerformanceCalculator(count, nativePrecision, 0.9);
        const fits = isLlmModel(m)
            ? calc.fitsMemory(gpu, m, 1, 2048)
            : calc.weightsMemoryGib(m) <= calc.usableMemoryGib(gpu);
        check(fits, `${m.name} should fit on validated config ${count}x ${gpu.name}`);
    });
});

// ---------- 4. OOM detection ----------
console.log('4. OOM detection');
const fp16 = new PrecisionSpec(2.0, 2.0);
const oomCalc = new PerformanceCalculator(1, fp16, 0.9);
const l40s = GPU_BY_KEY['l40s_48g'];
check(!oomCalc.fitsMemory(l40s, byName['Meta-Llama-3.3-70B-Instruct'], 1, 2048),
      '70B FP16 must NOT fit on 1x L40S-48G');
check(oomCalc.maxKvTokens(l40s, byName['Meta-Llama-3.3-70B-Instruct']) === 0,
      '70B FP16 on 1x L40S leaves no KV space');
check(oomCalc.fitsMemory(l40s, byName['Meta-Llama-3.1-8B-Instruct'], 10, 4352),
      '8B FP16 + 10x4352-token KV must fit on 1x L40S-48G');

// ---------- 5. Metric properties ----------
console.log('5. Metric properties');
const h100 = GPU_BY_KEY['h100_80g'];
const m70 = byName['Meta-Llama-3.1-70B-Instruct'];
const c2 = new PerformanceCalculator(2, fp16, 0.9);
const c4 = new PerformanceCalculator(4, fp16, 0.9);
const m2 = c2.computeMetrics(m70, h100, 4096, 256, 10);
const m4 = c4.computeMetrics(m70, h100, 4096, 256, 10);
check(m4.tpot_ms < m2.tpot_ms, 'TPOT should drop with more GPUs');
check(m4.prefill_time_per_token_ms < m2.prefill_time_per_token_ms, 'prefill should drop with more GPUs');
check(m4.kv_cache_tokens > m2.kv_cache_tokens, 'KV capacity should grow with more GPUs');
check(m2.ttft_s > 0 && m2.e2e_latency_s > m2.ttft_s - 1e-9, 'E2E >= TTFT');
approx(m2.aggregate_throughput_tokens_per_s, m2.throughput_tokens_per_s * 10, 0.001,
       'aggregate = concurrency x per-request');
// TPOT sanity: 70B FP16 on 2x H100 = 70.6*2/2/3350 s/token = 21.07 ms
approx(m2.tpot_ms, (70.6 * 2 / 2 / 3350) * 1000, 0.01, '70B FP16 TPOT on 2x H100');
// Max concurrency consistent with KV tokens
check(m2.max_concurrency === Math.floor(m2.kv_cache_tokens / 4352), 'max concurrency = kv tokens / context');

// MoE decode uses ACTIVE params: Mixtral-8x7B TPOT << dense-47B TPOT
const mixtral = byName['Mixtral-8x7B-Instruct-v0.1'];
const cMoe = new PerformanceCalculator(2, fp16, 0.9);
approx(cMoe.tpotMs(mixtral, h100), (12.9 * 2 / 2 / 3350) * 1000, 0.01, 'Mixtral TPOT uses active params');
// ...but weights use TOTAL params
approx(cMoe.weightsMemoryGib(mixtral), 46.7e9 * 2 / 2 ** 30, 0.001, 'Mixtral weights use total params');

// Precision override beats native: gpt-oss-120b forced to FP16 is ~3.3x bigger than native
const cFp16 = new PerformanceCalculator(1, fp16, 0.9);
check(cFp16.weightsMemoryGib(byName['gpt-oss-120b']) > 3 * calc1.weightsMemoryGib(byName['gpt-oss-120b']),
      'FP16 override should be much larger than native MXFP4 for gpt-oss-120b');

// ---------- Summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
