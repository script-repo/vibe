const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function loadBrowserData(filename) {
  const filePath = path.join(__dirname, filename);
  const source = fs.readFileSync(filePath, 'utf8');
  global.window = global.window || {};
  global.eval(source);
}

loadBrowserData('models_data.js');
loadBrowserData('use_cases_data.js');

const core = require('./advisor_core.js');

const models = window.NAI_VALIDATED_MODEL_CATALOG;
const useCases = window.AI_USE_CASES;
const gpus = window.NAI_SUPPORTED_GPUS;
const baseline = window.NAI_PLATFORM_BASELINE;

let failures = 0;
let passes = 0;

function test(name, fn) {
  try {
    fn();
    passes += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack);
  }
}

function model(id) {
  const entry = models.find(item => item.id === id);
  assert.ok(entry, `Missing model ${id}`);
  return entry;
}

function useCase(id) {
  const entry = useCases.find(item => item.id === id);
  assert.ok(entry, `Missing use case ${id}`);
  return entry;
}

test('strict mode exposes only the six PDF-backed GPU types', () => {
  assert.deepEqual(
    gpus.map(item => item.id),
    ['l40s_48g', 'a100_80g', 'h100_80g', 'h100_nvl_94g', 'h200_141g', 'rtx_pro_6000_96g']
  );
});

test('Mixtral 8x22B is blocked on L40S-48G', () => {
  assert.equal(model('hf-mixtral-8x22b-instruct-v0.1').supportedGpuCounts.l40s_48g, undefined);
});

test('Llama 3.1 70B resolves to the expected validated minima', () => {
  assert.deepEqual(
    model('hf-meta-llama-3.1-70b-instruct').supportedGpuCounts,
    {
      l40s_48g: 4,
      a100_80g: 2,
      h100_80g: 2,
      h100_nvl_94g: 2,
      h200_141g: 2,
      rtx_pro_6000_96g: 2
    }
  );
});

test('Devstral Small is not offered on L40S-48G', () => {
  assert.equal(model('hf-devstral-small-2507').supportedGpuCounts.l40s_48g, undefined);
});

test('retrieval components are present in the validated catalog', () => {
  assert.ok(model('nvidia-llama-3.2-nv-embedqa-1b-v2'));
  assert.ok(model('nvidia-llama-3.2-nv-rerankqa-1b-v2'));
});

test('hidden use cases are removed from strict mode', () => {
  const visibleIds = new Set(core.getVisibleUseCases(useCases).map(item => item.id));
  [
    'meeting-summarization',
    'call-center-live-assist',
    'medical-scribe',
    'video-search',
    'surveillance-analytics',
    'quality-inspection'
  ].forEach(id => assert.equal(visibleIds.has(id), false, `${id} should be hidden`));
});

test('internal-chatbot defaults to a validated small text endpoint', () => {
  assert.equal(useCase('internal-chatbot').defaultValidatedModelId, 'hf-meta-llama-3.1-8b-instruct');
});

test('code-assistant defaults to the validated code endpoint', () => {
  assert.equal(useCase('code-assistant').defaultValidatedModelId, 'hf-devstral-small-2507');
});

test('invoice-processing and edge-ocr map to validated document vision paths', () => {
  const invoice = useCase('invoice-processing');
  const edgeOcr = useCase('edge-ocr');

  assert.equal(invoice.defaultValidatedModelId, 'hf-meta-llama-3.2-11b-vision-instruct');
  assert.equal(edgeOcr.defaultValidatedModelId, 'hf-meta-llama-3.2-11b-vision-instruct');
  assert.ok(invoice.companionEndpointIds.includes('nvidia-nemoretriever-ocr-v1'));
  assert.ok(invoice.companionEndpointIds.includes('nvidia-nemoretriever-parse'));
  assert.ok(edgeOcr.companionEndpointIds.includes('nvidia-nemoretriever-ocr-v1'));
});

test('platform baseline matches Tables 4, 6, and 7', () => {
  assert.deepEqual(baseline.controlPlane, {
    nodes: 3,
    vcpuPerNode: 4,
    memoryPerNodeGb: 16,
    storagePerNodeGb: 150
  });
  assert.deepEqual(baseline.worker, {
    nodes: 3,
    vcpuPerNode: 8,
    memoryPerNodeGb: 16,
    storagePerNodeGb: 150
  });
  assert.deepEqual(baseline.storage, {
    rwoBlockGiB: 55,
    rwxNfsTiB: 2,
    s3CompatibleTiB: 1
  });
  assert.match(baseline.validatedCapacityNote, /50 inference endpoints/);
  assert.match(baseline.validatedCapacityNote, /150 API keys per endpoint/);
  assert.match(baseline.validatedCapacityNote, /5 concurrent MLAdmin users/);
});

test('scale multiplier increases replicas instead of changing endpoint minima', () => {
  const workload = useCase('internal-chatbot');
  const selectedModel = model(workload.defaultValidatedModelId);
  const recommendation = core.buildRecommendation({
    useCase: workload,
    model: selectedModel,
    gpuId: 'l40s_48g',
    gpuCatalog: gpus,
    platformBaseline: baseline,
    componentOverhead: window.NAI_COMPONENT_OVERHEAD,
    catalog: models,
    inputs: {
      users: 2000,
      activePct: 10,
      promptsPerHour: 6,
      outputTokens: 360,
      interaction: 'interactive',
      concurrency: 0
    }
  });

  assert.equal(recommendation.validationStatus, 'Validated');
  assert.equal(recommendation.baselineCount, 1);
  assert.equal(recommendation.scalePlan.validatedMultiplier, 2);
  assert.equal(recommendation.totalEndpointGpus, 2);
});

test('unsupported scale bands return custom validation required', () => {
  const workload = useCase('internal-chatbot');
  const selectedModel = model(workload.defaultValidatedModelId);
  const recommendation = core.buildRecommendation({
    useCase: workload,
    model: selectedModel,
    gpuId: 'l40s_48g',
    gpuCatalog: gpus,
    platformBaseline: baseline,
    componentOverhead: window.NAI_COMPONENT_OVERHEAD,
    catalog: models,
    inputs: {
      users: 500000,
      activePct: 60,
      promptsPerHour: 40,
      outputTokens: 1200,
      interaction: 'interactive',
      concurrency: 0
    }
  });

  assert.equal(recommendation.validationStatus, 'Custom validation required');
  assert.equal(recommendation.scalePlan.validatedMultiplier, null);
  assert.equal(recommendation.totalEndpointGpus, null);
});

test('strict defaults use only exposed deployment and latency enums', () => {
  const validDeployments = new Set(['private', 'hybrid', 'cloud', 'edge', 'edge + central']);
  const validLatencies = new Set(['interactive', 'near-real-time', 'batch']);

  useCases.forEach(item => {
    assert.ok(validDeployments.has(item.defaults.deployment), `${item.id} has invalid deployment ${item.defaults.deployment}`);
    assert.ok(validLatencies.has(item.defaults.latency), `${item.id} has invalid latency ${item.defaults.latency}`);
  });
});

console.log(`\n${passes} passed, ${failures} failed`);
if (failures > 0) {
  process.exit(1);
}
