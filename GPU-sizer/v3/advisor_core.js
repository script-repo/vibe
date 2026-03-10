(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.NAI_ADVISOR_CORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function() {
  const INTERACTION_VALUES = new Set(['interactive', 'near-real-time', 'real-time', 'batch']);
  const PROVIDER_LABELS = {
    hf: 'Hugging Face',
    nvidia: 'NVIDIA-backed',
    nutanix: 'Nutanix',
    'other-validated': 'Other validated'
  };
  const RUNTIME_LABELS = {
    tgi: 'Hugging Face / TGI',
    vllm: 'Hugging Face / vLLM',
    'kserve-hf': 'Hugging Face / KServe HF server',
    'kserve-custom': 'KServe custom model server',
    'nvidia-runtime': 'NVIDIA-backed row'
  };
  const PLANNING_PROFILES = {
    'small-text': {
      baselineConcurrency: 8,
      baselineOutputTps: 90,
      maxReplicas: 8,
      summary: 'Validated entry-level small text endpoint'
    },
    'medium-text': {
      baselineConcurrency: 5,
      baselineOutputTps: 55,
      maxReplicas: 6,
      summary: 'Validated entry-level medium reasoning endpoint'
    },
    'large-text': {
      baselineConcurrency: 2,
      baselineOutputTps: 24,
      maxReplicas: 4,
      summary: 'Validated entry-level premium reasoning endpoint'
    },
    'vision-doc': {
      baselineConcurrency: 3,
      baselineOutputTps: 18,
      maxReplicas: 6,
      summary: 'Validated entry-level vision/document endpoint'
    },
    retrieval: {
      baselineConcurrency: 12,
      baselineOutputTps: 150,
      maxReplicas: 8,
      summary: 'Validated retrieval companion endpoint'
    },
    guardrail: {
      baselineConcurrency: 16,
      baselineOutputTps: 160,
      maxReplicas: 8,
      summary: 'Validated guardrail endpoint'
    }
  };

  function byId(items, id) {
    return items.find(item => item.id === id) || null;
  }

  function normalizeInteraction(value) {
    return INTERACTION_VALUES.has(value) ? value : 'interactive';
  }

  function providerLabel(provider) {
    return PROVIDER_LABELS[provider] || provider;
  }

  function runtimeLabel(runtime) {
    return RUNTIME_LABELS[runtime] || runtime;
  }

  function getVisibleUseCases(useCases) {
    return useCases.filter(useCase => useCase.strictVisible);
  }

  function getUseCaseById(useCases, id) {
    return byId(useCases, id) || getVisibleUseCases(useCases)[0] || null;
  }

  function getModelById(catalog, id) {
    return byId(catalog, id) || catalog[0] || null;
  }

  function getAllowedModelsForUseCase(useCase, catalog) {
    if (!useCase) return [];
    const ids = new Set(useCase.allowedValidatedModelIds || []);
    return catalog.filter(model => ids.has(model.id));
  }

  function getCompanionModels(useCase, catalog) {
    const ids = useCase?.companionEndpointIds || [];
    return ids.map(id => byId(catalog, id)).filter(Boolean);
  }

  function getDefaultModelForUseCase(useCase, catalog) {
    const allowed = getAllowedModelsForUseCase(useCase, catalog);
    return byId(allowed, useCase.defaultValidatedModelId) || allowed[0] || null;
  }

  function getSupportedGpus(model, gpuCatalog) {
    return gpuCatalog.filter(gpu => model?.supportedGpuCounts?.[gpu.id]);
  }

  function getDefaultGpuForModel(model, gpuCatalog) {
    const supported = getSupportedGpus(model, gpuCatalog);
    return supported[0] || null;
  }

  function defaultDemandProfile(useCase) {
    const complexityProfiles = {
      low: { activePct: 8, promptsPerHour: 4, outputTokens: 220 },
      medium: { activePct: 10, promptsPerHour: 6, outputTokens: 360 },
      high: { activePct: 12, promptsPerHour: 5, outputTokens: 520 }
    };
    const profile = { ...(complexityProfiles[useCase?.complexity] || complexityProfiles.medium) };
    const capabilities = new Set(useCase?.requiredCapabilities || []);
    const interaction = normalizeInteraction(useCase?.defaults?.latency);

    if (capabilities.has('vision') || capabilities.has('document-ai') || capabilities.has('ocr')) {
      profile.promptsPerHour = 8;
      profile.outputTokens = 220;
    }
    if (capabilities.has('code') || capabilities.has('sql')) {
      profile.promptsPerHour = 5;
      profile.outputTokens = 520;
    }
    if (capabilities.has('guardrail') && !capabilities.has('retrieval')) {
      profile.promptsPerHour = 10;
      profile.outputTokens = 160;
    }
    if (interaction === 'batch') {
      profile.activePct = 100;
      profile.promptsPerHour = Math.max(profile.promptsPerHour, 20);
    }
    if (interaction === 'near-real-time') {
      profile.activePct = Math.max(profile.activePct, 12);
      profile.outputTokens = Math.min(profile.outputTokens, 240);
    }

    return profile;
  }

  function estimateDemand(inputs) {
    const users = Math.max(1, Number(inputs.users || 1));
    const activePct = Math.max(1, Number(inputs.activePct || 1));
    const promptsPerHour = Math.max(1, Number(inputs.promptsPerHour || 1));
    const outputTokens = Math.max(32, Number(inputs.outputTokens || 32));
    const interaction = normalizeInteraction(inputs.interaction);
    const activeUsers = Math.max(1, users * (activePct / 100));
    const requestsPerSecond = (activeUsers * promptsPerHour) / 3600;
    const responseRate = interaction === 'batch' ? 160 : interaction === 'near-real-time' ? 80 : interaction === 'real-time' ? 110 : 60;
    const baseLatency = interaction === 'batch' ? 10 : interaction === 'near-real-time' ? 6 : interaction === 'real-time' ? 4 : 8;
    const secondsPerRequest = baseLatency + (outputTokens / responseRate);
    const concurrency = Math.max(1, Math.ceil(requestsPerSecond * secondsPerRequest * 1.2));
    return {
      activeUsers,
      requestsPerSecond,
      outputTokensPerSecond: requestsPerSecond * outputTokens,
      secondsPerRequest,
      concurrency
    };
  }

  function getPlanningProfile(model) {
    return PLANNING_PROFILES[model?.planningClass] || PLANNING_PROFILES['small-text'];
  }

  function computeScalePlan(useCase, model, inputs) {
    const demand = estimateDemand(inputs);
    const profile = getPlanningProfile(model);
    const manualConcurrency = Math.max(0, Number(inputs.concurrency || 0));
    const targetConcurrency = manualConcurrency > 0 ? manualConcurrency : demand.concurrency;
    const concurrencyFactor = targetConcurrency / profile.baselineConcurrency;
    const throughputFactor = demand.outputTokensPerSecond / profile.baselineOutputTps;
    const rawMultiplier = Math.max(1, Math.ceil(Math.max(concurrencyFactor, throughputFactor)));
    const validated = rawMultiplier <= profile.maxReplicas;

    return {
      demand,
      profile,
      targetConcurrency,
      rawMultiplier,
      validatedMultiplier: validated ? rawMultiplier : null,
      status: validated ? 'validated' : 'custom-validation'
    };
  }

  function buildGpuRows(model, gpuCatalog, scalePlan) {
    return getSupportedGpus(model, gpuCatalog).map(gpu => {
      const baselineCount = model.supportedGpuCounts[gpu.id];
      return {
        gpu,
        baselineCount,
        totalCount: scalePlan.validatedMultiplier ? baselineCount * scalePlan.validatedMultiplier : null
      };
    });
  }

  function buildQuestions(useCase, model, scalePlan) {
    const questions = [
      'Does the client need only the validated entry-level topology or a scaled replica count for production launch?',
      'Will model storage be backed by NFS RWX or S3-compatible object storage?',
      'Does the client expect to exceed the validated baseline of 50 inference endpoints or 5 concurrent MLAdmin users?'
    ];

    if ((useCase?.requiredCapabilities || []).includes('document-ai')) {
      questions.push('Should the document path include OCR, parsing, and table-structure companions in the first phase?');
    }
    if ((useCase?.requiredCapabilities || []).includes('guardrail')) {
      questions.push('Does the client require content safety, topic control, or both guardrail endpoints?');
    }
    if (scalePlan.status === 'custom-validation') {
      questions.push('The demand estimate exceeds the strict planning band; what target scale should be custom-validated with Nutanix?');
    }

    return questions;
  }

  function buildRecommendation(params) {
    const {
      useCase,
      model,
      gpuId,
      gpuCatalog,
      platformBaseline,
      componentOverhead,
      inputs,
      catalog
    } = params;

    if (!useCase || !useCase.strictVisible) {
      return {
        validationStatus: 'Unsupported in NAI v2.6',
        statusTone: 'blocked',
        message: 'This use case is hidden in strict mode because the v2.6 PDF does not validate a clean model/runtime/GPU path for its primary workload.'
      };
    }

    const gpu = byId(gpuCatalog, gpuId) || getDefaultGpuForModel(model, gpuCatalog);
    const baselineCount = model?.supportedGpuCounts?.[gpu?.id];
    if (!model || !gpu || !baselineCount) {
      return {
        validationStatus: 'Unsupported in NAI v2.6',
        statusTone: 'blocked',
        message: 'The selected model and GPU combination is not present in the v2.6 validated matrix.'
      };
    }

    const scalePlan = computeScalePlan(useCase, model, inputs);
    const gpuRows = buildGpuRows(model, gpuCatalog, scalePlan);
    const companionModels = getCompanionModels(useCase, catalog);
    const provider = providerLabel(model.provider);
    const runtime = runtimeLabel(model.runtime);
    const baselineTopology = `${baselineCount} x ${gpu.label} per validated endpoint`;
    const totalEndpointGpus = scalePlan.validatedMultiplier ? baselineCount * scalePlan.validatedMultiplier : null;

    return {
      validationStatus: scalePlan.status === 'validated' ? 'Validated' : 'Custom validation required',
      statusTone: scalePlan.status === 'validated' ? 'validated' : 'warning',
      provider,
      runtime,
      useCase,
      model,
      gpu,
      scalePlan,
      gpuRows,
      companionModels,
      platformBaseline,
      componentOverhead,
      baselineCount,
      totalEndpointGpus,
      baselineTopology,
      sourceTable: model.sourceTable,
      sourcePages: model.sourcePages,
      questions: buildQuestions(useCase, model, scalePlan)
    };
  }

  return {
    providerLabel,
    runtimeLabel,
    normalizeInteraction,
    getVisibleUseCases,
    getUseCaseById,
    getModelById,
    getAllowedModelsForUseCase,
    getCompanionModels,
    getDefaultModelForUseCase,
    getSupportedGpus,
    getDefaultGpuForModel,
    defaultDemandProfile,
    estimateDemand,
    getPlanningProfile,
    computeScalePlan,
    buildGpuRows,
    buildRecommendation
  };
});
