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

function advisorContext() {
  return {
    useCases,
    models,
    gpuCatalog: gpus,
    platformBaseline: baseline,
    componentOverhead: window.NAI_COMPONENT_OVERHEAD
  };
}

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

test('platform baseline includes G10-only hardware and pattern guidance', () => {
  assert.equal(baseline.infrastructure.foundation.clusterMinNodes, 3);
  assert.equal(baseline.infrastructure.foundation.clusterMaxNodes, 32);
  assert.equal(baseline.infrastructure.foundation.minCpuCoresPerNode, 16);
  assert.equal(baseline.infrastructure.foundation.rack.torSwitches, 2);
  assert.equal(baseline.infrastructure.nkp.productionMinimum.controlPlane.nodes, 3);
  assert.equal(baseline.infrastructure.nkp.productionMinimum.worker.nodes, 4);
  assert.equal(baseline.infrastructure.nkp.naiPatternBaseline.aiPodStartNodes, 3);
  assert.equal(baseline.infrastructure.nkp.naiPatternBaseline.aiPodScaleLimitNodes, 32);
  assert.deepEqual(
    baseline.infrastructure.designPatterns.map(item => item.id),
    ['ai-pod', 'ai-factory', 'multi-site-ai-factory', 'hybrid-cloud-ai-factory', 'hybrid-inference-ai-factory']
  );
  assert.equal(baseline.infrastructure.g10Catalog.gpuProfiles[0].id, 'nx-8150g-g10');
  assert.equal(baseline.infrastructure.g10Catalog.gpuProfiles[0].supportedGpuCounts.l40s_48g.maxPerNode, 2);
  assert.equal(baseline.infrastructure.g10Catalog.gpuProfiles[0].supportedGpuCounts.rtx_pro_6000_96g.maxPerNode, 2);
  assert.ok(baseline.infrastructure.hardwareReference.bomRows.length >= 6);
});

test('on-prem deployment exposes only NX G10-mapped GPU rows', () => {
  assert.deepEqual(
    core.getEligibleGpusForDeployment(model('hf-meta-llama-3.1-70b-instruct'), gpus, 'private', baseline).map(item => item.id),
    ['l40s_48g', 'rtx_pro_6000_96g']
  );
  assert.deepEqual(
    core.getEligibleGpusForDeployment(model('hf-devstral-small-2507'), gpus, 'private', baseline).map(item => item.id),
    ['rtx_pro_6000_96g']
  );
});

test('cloud deployment preserves the broader validated GPU matrix', () => {
  assert.deepEqual(
    core.getEligibleGpusForDeployment(model('hf-meta-llama-3.1-70b-instruct'), gpus, 'cloud', baseline).map(item => item.id),
    ['l40s_48g', 'a100_80g', 'h100_80g', 'h100_nvl_94g', 'h200_141g', 'rtx_pro_6000_96g']
  );
});

test('explicit unsupported on-prem GPU requests are blocked', () => {
  const recommendation = core.buildRecommendation({
    useCase: useCase('code-assistant'),
    model: model('hf-devstral-small-2507'),
    gpuId: 'a100_80g',
    gpuCatalog: gpus,
    platformBaseline: baseline,
    componentOverhead: window.NAI_COMPONENT_OVERHEAD,
    catalog: models,
    inputs: {
      users: 500,
      activePct: 10,
      promptsPerHour: 5,
      outputTokens: 520,
      interaction: 'interactive',
      deployment: 'private',
      concurrency: 0
    }
  });

  assert.equal(recommendation.validationStatus, 'Unsupported in NAI v2.6');
  assert.equal(recommendation.statusTone, 'blocked');
});

test('stack aggregation sums endpoint GPUs and companion families', () => {
  const stackResult = core.buildStackRecommendation({
    stackItems: [
      {
        itemId: 'a',
        configId: 'cfg-a',
        selected: true,
        config: {
          useCaseId: 'internal-chatbot',
          users: 2000,
          activePct: 10,
          promptsPerHour: 6,
          outputTokens: 360,
          interaction: 'interactive',
          deployment: 'private',
          modelSelect: 'hf-meta-llama-3.1-8b-instruct',
          gpuSelect: 'l40s_48g',
          concurrency: 0
        }
      },
      {
        itemId: 'b',
        configId: 'cfg-b',
        selected: true,
        config: {
          useCaseId: 'code-assistant',
          users: 500,
          activePct: 10,
          promptsPerHour: 5,
          outputTokens: 520,
          interaction: 'interactive',
          deployment: 'cloud',
          modelSelect: 'hf-devstral-small-2507',
          gpuSelect: 'a100_80g',
          concurrency: 0
        }
      }
    ]
  }, advisorContext());

  assert.equal(stackResult.validationStatus, 'Validated');
  assert.equal(stackResult.activeCount, 2);
  assert.equal(stackResult.deploymentMode, 'hybrid');
  assert.equal(stackResult.topologyPattern.id, 'hybrid-cloud-ai-factory');
  assert.equal(stackResult.gpuTotals.find(item => item.gpu.id === 'l40s_48g').validatedTotal, 2);
  assert.equal(stackResult.gpuTotals.find(item => item.gpu.id === 'a100_80g').validatedTotal, 1);
  assert.equal(stackResult.platformCapacityCheck.estimatedEndpointFamilies, 4);
});

test('small private stacks map to the AI Pod pattern', () => {
  const stackResult = core.buildStackRecommendation({
    stackItems: [
      {
        itemId: 'a',
        configId: 'cfg-a',
        selected: true,
        config: {
          useCaseId: 'internal-chatbot',
          users: 200,
          activePct: 10,
          promptsPerHour: 6,
          outputTokens: 360,
          interaction: 'interactive',
          deployment: 'private',
          modelSelect: 'hf-meta-llama-3.1-8b-instruct',
          gpuSelect: 'l40s_48g',
          concurrency: 0
        }
      }
    ]
  }, advisorContext());

  assert.equal(stackResult.topologyPattern.id, 'ai-pod');
  assert.equal(stackResult.hardwarePlan.totalPodNodes, 3);
  assert.equal(stackResult.hardwarePlan.nodeBoms.length, 1);
  assert.equal(stackResult.hardwarePlan.nodeBoms[0].model, 'NX-8150G G10');
});

test('mixed private and edge stacks map to the multi-site AI Factory pattern', () => {
  const stackResult = core.buildStackRecommendation({
    stackItems: [
      {
        itemId: 'a',
        configId: 'cfg-a',
        selected: true,
        config: {
          useCaseId: 'internal-chatbot',
          users: 200,
          activePct: 10,
          promptsPerHour: 6,
          outputTokens: 360,
          interaction: 'interactive',
          deployment: 'private',
          modelSelect: 'hf-meta-llama-3.1-8b-instruct',
          gpuSelect: 'l40s_48g',
          concurrency: 0
        }
      },
      {
        itemId: 'b',
        configId: 'cfg-b',
        selected: true,
        config: {
          useCaseId: 'edge-ocr',
          users: 150,
          activePct: 12,
          promptsPerHour: 8,
          outputTokens: 220,
          interaction: 'near-real-time',
          deployment: 'edge',
          modelSelect: 'hf-meta-llama-3.2-11b-vision-instruct',
          gpuSelect: 'l40s_48g',
          concurrency: 0
        }
      }
    ]
  }, advisorContext());

  assert.equal(stackResult.topologyPattern.id, 'multi-site-ai-factory');
  assert.equal(stackResult.hardwarePlan.siteCount, 2);
});

test('hybrid deployment targets map to the hybrid inference AI Factory pattern', () => {
  const stackResult = core.buildStackRecommendation({
    stackItems: [
      {
        itemId: 'a',
        configId: 'cfg-a',
        selected: true,
        config: {
          useCaseId: 'internal-chatbot',
          users: 200,
          activePct: 10,
          promptsPerHour: 6,
          outputTokens: 360,
          interaction: 'interactive',
          deployment: 'hybrid',
          modelSelect: 'hf-meta-llama-3.1-8b-instruct',
          gpuSelect: 'l40s_48g',
          concurrency: 0
        }
      }
    ]
  }, advisorContext());

  assert.equal(stackResult.topologyPattern.id, 'hybrid-inference-ai-factory');
});

test('empty active stack returns a safe no-active-use-cases result', () => {
  const stackResult = core.buildStackRecommendation({
    stackItems: [
      {
        itemId: 'a',
        configId: 'cfg-a',
        selected: false,
        config: {
          useCaseId: 'internal-chatbot',
          users: 2000,
          activePct: 10,
          promptsPerHour: 6,
          outputTokens: 360,
          interaction: 'interactive',
          deployment: 'private',
          modelSelect: 'hf-meta-llama-3.1-8b-instruct',
          gpuSelect: 'l40s_48g',
          concurrency: 0
        }
      }
    ]
  }, advisorContext());

  assert.equal(stackResult.validationStatus, 'No active use cases');
  assert.equal(stackResult.activeCount, 0);
  assert.deepEqual(stackResult.gpuTotals, []);
  assert.equal(stackResult.questions[0], 'Select at least one saved stack item or clear the stack to fall back to the current draft.');
});

test('saved record helpers preserve use-case and stack payloads', () => {
  const useCaseRecord = core.buildUseCaseConfigRecord('cfg-1', {
    useCaseId: 'internal-chatbot',
    users: 200
  });
  const stackRecord = core.buildStackConfigRecord('stack-1', [
    {
      itemId: 'item-1',
      configId: 'cfg-1',
      selected: true,
      config: { useCaseId: 'internal-chatbot', users: 200 }
    }
  ]);

  assert.equal(core.parseStoredRecord(JSON.stringify(useCaseRecord)).kind, 'use-case-config');
  assert.equal(core.parseStoredRecord(JSON.stringify(stackRecord)).kind, 'stack-config');
  assert.equal(core.parseStoredRecord(JSON.stringify(stackRecord)).items[0].configId, 'cfg-1');
});

console.log(`\n${passes} passed, ${failures} failed`);
if (failures > 0) {
  process.exit(1);
}
