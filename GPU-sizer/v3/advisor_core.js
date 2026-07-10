(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.NAI_ADVISOR_CORE = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function() {
  const INTERACTION_VALUES = new Set(['interactive', 'near-real-time', 'real-time', 'batch']);
  const DEPLOYMENT_VALUES = new Set(['private', 'hybrid', 'cloud', 'edge', 'edge + central']);
  const ON_PREM_DEPLOYMENTS = new Set(['private', 'edge', 'edge + central']);

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
    return (items || []).find(item => item.id === id) || null;
  }

  function uniqueStrings(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeInteraction(value) {
    return INTERACTION_VALUES.has(value) ? value : 'interactive';
  }

  function normalizeDeployment(value) {
    return DEPLOYMENT_VALUES.has(value) ? value : 'private';
  }

  function providerLabel(provider) {
    return PROVIDER_LABELS[provider] || provider;
  }

  function runtimeLabel(runtime) {
    return RUNTIME_LABELS[runtime] || runtime;
  }

  function getVisibleUseCases(useCases) {
    return (useCases || []).filter(useCase => useCase.strictVisible);
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
    return (catalog || []).filter(model => ids.has(model.id));
  }

  function getCompanionModels(useCase, catalog) {
    const ids = useCase?.companionEndpointIds || [];
    return ids.map(id => byId(catalog, id)).filter(Boolean);
  }

  function getDefaultModelForUseCase(useCase, catalog) {
    const allowed = getAllowedModelsForUseCase(useCase, catalog);
    return byId(allowed, useCase?.defaultValidatedModelId) || allowed[0] || null;
  }

  function getSupportedGpus(model, gpuCatalog) {
    return (gpuCatalog || []).filter(gpu => model?.supportedGpuCounts?.[gpu.id]);
  }

  function getDefaultGpuForModel(model, gpuCatalog) {
    return getSupportedGpus(model, gpuCatalog)[0] || null;
  }

  function getG10OnPremGpuSupport(platformBaseline) {
    const profiles = platformBaseline?.infrastructure?.g10Catalog?.gpuProfiles || [];
    const support = {};
    profiles.forEach(profile => {
      Object.entries(profile.supportedGpuCounts || {}).forEach(([gpuId, details]) => {
        support[gpuId] = {
          profileId: profile.id,
          profileLabel: profile.label,
          maxPerNode: details.maxPerNode,
          availability: details.availability
        };
      });
    });
    return support;
  }

  function getEligibleGpusForDeployment(model, gpuCatalog, deployment, platformBaseline) {
    const supported = getSupportedGpus(model, gpuCatalog);
    if (normalizeDeployment(deployment) === 'cloud') {
      return supported;
    }
    const g10Support = getG10OnPremGpuSupport(platformBaseline);
    return supported.filter(gpu => g10Support[gpu.id]);
  }

  function getDefaultGpuForDeployment(model, gpuCatalog, deployment, platformBaseline) {
    return getEligibleGpusForDeployment(model, gpuCatalog, deployment, platformBaseline)[0] || null;
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

    const deployment = normalizeDeployment(inputs?.deployment || useCase?.defaults?.deployment);
    const eligibleGpus = getEligibleGpusForDeployment(model, gpuCatalog, deployment, platformBaseline);
    const requestedGpuId = gpuId || null;
    const gpu = requestedGpuId
      ? byId(eligibleGpus, requestedGpuId)
      : getDefaultGpuForDeployment(model, gpuCatalog, deployment, platformBaseline);
    const baselineCount = model?.supportedGpuCounts?.[gpu?.id];
    if (!model || (requestedGpuId && !gpu) || !gpu || !baselineCount) {
      return {
        validationStatus: 'Unsupported in NAI v2.6',
        statusTone: 'blocked',
        message: deployment === 'cloud'
          ? 'The selected model and GPU combination is not present in the v2.6 validated matrix.'
          : requestedGpuId
            ? 'The requested model and GPU combination is not available on the approved Nutanix NX G10 on-prem hardware path.'
            : 'The selected model and GPU combination is not available on the approved Nutanix NX G10 on-prem hardware path.'
      };
    }

    const scalePlan = computeScalePlan(useCase, model, inputs);
    const gpuRows = buildGpuRows(model, eligibleGpus, scalePlan);
    const companionModels = getCompanionModels(useCase, catalog);
    const provider = providerLabel(model.provider);
    const runtime = runtimeLabel(model.runtime);
    const baselineTopology = `${baselineCount} x ${gpu.label} per validated endpoint`;
    const totalEndpointGpus = scalePlan.validatedMultiplier ? baselineCount * scalePlan.validatedMultiplier : null;
    const hardwareSupport = getG10OnPremGpuSupport(platformBaseline)[gpu.id] || null;

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
      hardwareSupport,
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

  function sanitizeConfig(config, context) {
    const useCase = getUseCaseById(context.useCases, config?.useCaseId);
    const defaults = defaultDemandProfile(useCase);
    const deployment = normalizeDeployment(config?.deployment || useCase?.defaults?.deployment);
    const allowedModels = getAllowedModelsForUseCase(useCase, context.models);
    const model = byId(allowedModels, config?.modelSelect) || getDefaultModelForUseCase(useCase, context.models);
    const gpu = byId(getEligibleGpusForDeployment(model, context.gpuCatalog, deployment, context.platformBaseline), config?.gpuSelect)
      || getDefaultGpuForDeployment(model, context.gpuCatalog, deployment, context.platformBaseline);

    return {
      useCaseId: useCase?.id || '',
      users: Math.max(1, Number(config?.users || useCase?.defaults?.users || 200)),
      activePct: clamp(Number(config?.activePct || defaults.activePct), 1, 100),
      promptsPerHour: Math.max(1, Number(config?.promptsPerHour || defaults.promptsPerHour)),
      outputTokens: Math.max(50, Number(config?.outputTokens || defaults.outputTokens)),
      interaction: normalizeInteraction(config?.interaction || useCase?.defaults?.latency),
      deployment,
      concurrency: Math.max(0, Number(config?.concurrency || 0)),
      modelSelect: model?.id || '',
      gpuSelect: gpu?.id || ''
    };
  }

  function buildUseCaseRecommendationFromConfig(config, context) {
    const normalized = sanitizeConfig(config, context);
    const useCase = getUseCaseById(context.useCases, normalized.useCaseId);
    const model = getModelById(context.models, normalized.modelSelect);
    const recommendation = buildRecommendation({
      useCase,
      model,
      gpuId: normalized.gpuSelect,
      gpuCatalog: context.gpuCatalog,
      platformBaseline: context.platformBaseline,
      componentOverhead: context.componentOverhead,
      inputs: normalized,
      catalog: context.models
    });

    return {
      config: normalized,
      useCase,
      model,
      recommendation
    };
  }

  function getDeploymentMode(values) {
    const deployments = uniqueStrings(values);
    if (!deployments.length) return 'on-prem';
    if (deployments.length === 1 && deployments[0] === 'cloud') return 'cloud-only';
    if (deployments.length === 1 && ON_PREM_DEPLOYMENTS.has(deployments[0])) return 'on-prem';
    return 'hybrid';
  }

  function selectDesignPattern(itemResults, deploymentMode, platformBaseline) {
    const patterns = platformBaseline?.infrastructure?.designPatterns || [];
    const deployments = itemResults.map(item => item.config.deployment);
    const byPatternId = patternId => byId(patterns, patternId) || patterns[0] || null;
    const totalValidatedGpus = itemResults.reduce((sum, item) => sum + (item.recommendation.totalEndpointGpus || 0), 0);

    if (deployments.includes('hybrid') && !deployments.includes('cloud')) {
      return byPatternId('hybrid-inference-ai-factory');
    }
    if (deployments.includes('cloud')) {
      return byPatternId('hybrid-cloud-ai-factory');
    }
    if (deployments.includes('edge + central') || (deployments.includes('private') && deployments.includes('edge'))) {
      return byPatternId('multi-site-ai-factory');
    }
    if (deploymentMode === 'on-prem' && itemResults.length <= 2 && totalValidatedGpus <= 6) {
      return byPatternId('ai-pod');
    }
    return byPatternId('ai-factory');
  }

  function buildLayerDiagram(itemResults, sharedCompanions, platformBaseline, deploymentMode, topologyPattern, hardwarePlan) {
    const useCaseLabels = itemResults.map(item => `${item.useCase.name} for ${item.useCase.category.toLowerCase()} users`);
    const primaryModels = itemResults.map(item => `${item.recommendation.model.modelName} for ${item.useCase.name}`);
    const companionModels = sharedCompanions.length
      ? [`Shared companion endpoints: ${sharedCompanions.map(item => item.model.modelName).join(', ')}`]
      : [];
    const pattern = topologyPattern || { name: 'Topology pattern', layers: [] };
    const managementPlanes = platformBaseline.infrastructure.managementPlanes;
    const nodeFootprint = hardwarePlan?.nodeBoms?.length
      ? hardwarePlan.nodeBoms.map(node => `${node.quantity} x ${node.model} (${node.role})`)
      : ['No on-prem G10 node footprint is required for the current stack selection'];

    return {
      deploymentMode,
      topologyPattern: pattern,
      layers: [
        {
          title: `${pattern.name} pattern`,
          accent: 'patterns',
          items: pattern.layers && pattern.layers.length ? pattern.layers : ['Pattern metadata unavailable']
        },
        {
          title: 'Business use cases',
          accent: 'use-cases',
          items: useCaseLabels
        },
        {
          title: 'Inference and safety services',
          accent: 'services',
          items: uniqueStrings(['Unified inferencing endpoint', ...primaryModels, ...companionModels])
        },
        {
          title: 'NAI and NKP platform',
          accent: 'platform',
          items: [
            `${platformBaseline.controlPlane.nodes} x NAI control-plane nodes`,
            `${platformBaseline.worker.nodes} x NAI worker nodes`,
            managementPlanes.ncp,
            managementPlanes.nkp,
            managementPlanes.nus
          ]
        },
        {
          title: 'Nutanix node footprint',
          accent: 'foundation',
          items: [
            ...nodeFootprint,
            managementPlanes.nci
          ]
        }
      ]
    };
  }

  function buildHardwarePlan(gpuTotals, platformBaseline, deploymentMode, topologyPattern) {
    const reference = platformBaseline.infrastructure.hardwareReference;
    const foundation = platformBaseline.infrastructure.foundation;
    const g10Support = getG10OnPremGpuSupport(platformBaseline);
    const onPremRelevant = topologyPattern?.onPremRequired !== false || deploymentMode !== 'cloud-only';
    const allOnPremG10Mappable = gpuTotals.every(item => g10Support[item.gpu.id]);
    const totalValidatedGpus = gpuTotals.reduce((sum, item) => sum + (item.validatedTotal || 0), 0);
    const siteCount = topologyPattern?.id === 'multi-site-ai-factory' ? 2 : 1;
    const perNodeGpuCapacity = 2;
    const podNodesPerSite = onPremRelevant ? Math.max(reference.cluster.podMinNodes, Math.ceil((totalValidatedGpus || perNodeGpuCapacity) / (perNodeGpuCapacity * siteCount))) : 0;
    const totalPodNodes = onPremRelevant ? podNodesPerSite * siteCount : 0;
    const managementNodeCount = topologyPattern?.id === 'ai-factory'
      ? 3
      : topologyPattern?.id === 'multi-site-ai-factory'
        ? 6
        : 0;

    const endpointDemand = gpuTotals.map(item => ({
      label: item.gpu.label,
      shortLabel: item.gpu.shortLabel,
      validatedTotal: item.validatedTotal,
      hasCustomValidation: item.hasCustomValidation,
      g10Profile: g10Support[item.gpu.id]?.profileLabel || null,
      availability: g10Support[item.gpu.id]?.availability || null
    }));

    const notes = [];
    if (!onPremRelevant) {
      notes.push('This pattern can extend into cloud or provider-hosted inference. Only the Nutanix on-prem side is rendered as G10 hardware.');
    } else if (!allOnPremG10Mappable) {
      notes.push('One or more selected GPUs do not map to the approved Nutanix NX G10 hardware catalog for on-prem deployment.');
    } else {
      notes.push('All on-prem GPU demand maps to approved NX G10 hardware.');
    }
    if (endpointDemand.some(item => item.shortLabel === 'RTX PRO 6000-96G')) {
      notes.push('RTX PRO 6000 support is marked post GA / technical-feasibility dependent in the NX-G10 TDM.');
    }
    notes.push(`Pattern baseline uses ${reference.cluster.podMinNodes}-${reference.cluster.podScaleMaxNodes} AI Pod nodes, with NX-8150G G10 as the primary GPU node model.`);

    const nodeBoms = [];
    if (onPremRelevant && totalPodNodes > 0) {
      nodeBoms.push({
        role: 'AI Pod GPU node',
        model: reference.gpuNode.platform,
        quantity: totalPodNodes,
        source: 'Design Patterns p7, NX-G10 TDM p35-p36, p57-p58, p81',
        parts: [
          `CPU: ${reference.gpuNode.cpu}`,
          `Memory: ${reference.gpuNode.memory}`,
          `Storage: ${reference.gpuNode.storage}`,
          `Networking: ${reference.gpuNode.networking}`,
          `GPU envelope: ${reference.gpuNode.gpu}`
        ]
      });
    }
    if (managementNodeCount > 0) {
      nodeBoms.push({
        role: 'Management / storage node',
        model: reference.managementNode.platform,
        quantity: managementNodeCount,
        source: 'NX-G10 TDM p70, p72, p80',
        parts: [
          `CPU: ${reference.managementNode.cpu}`,
          `Memory: ${reference.managementNode.memory}`,
          `Storage: ${reference.managementNode.storage}`,
          `Networking: ${reference.managementNode.networking}`
        ]
      });
    }

    const bomRows = nodeBoms.map(node => ({
      item: `${node.model} (${node.role})`,
      quantity: node.quantity,
      spec: node.parts.join(' | '),
      source: node.source
    }));

    return {
      onPremRelevant,
      allOnPremG10Mappable,
      notes,
      reference,
      endpointDemand,
      nodeBoms,
      topologyPattern,
      siteCount,
      totalPodNodes,
      managementNodeCount,
      bomRows
    };
  }

  function buildStackQuestions(itemResults, stackStatus, deploymentMode, hardwarePlan, platformCapacityCheck) {
    const questions = itemResults.flatMap(item => item.recommendation.questions);

    if (deploymentMode === 'hybrid') {
      questions.push('Does the client want one shared Nutanix control plane across on-prem and cloud inference, or separate operational domains by deployment target?');
    }
    if (!hardwarePlan.allOnPremG10Mappable && hardwarePlan.onPremRelevant) {
      questions.push('Which use cases need a cloud or provider-backed deployment because their selected GPU row is not available on approved NX G10 hardware?');
    }
    if (itemResults.length > 1) {
      questions.push('Can retrieval, reranking, and guardrail services be shared across multiple use cases to reduce endpoint sprawl?');
    }
    if (!platformCapacityCheck.withinValidatedBaseline) {
      questions.push('The estimated stack endpoint families exceed the validated NAI baseline. Should the client target a larger shared platform footprint?');
    }
    if (stackStatus !== 'Validated') {
      questions.push('Which stack members need custom validation first: model scale, GPU choice, or underlying worker-pool design?');
    }

    return uniqueStrings(questions);
  }

  function buildStackRecommendation(params, context) {
    const stackItems = (params.stackItems || []).map(item => ({
      itemId: item.itemId || item.configId || `item-${Math.random().toString(36).slice(2, 8)}`,
      configId: item.configId || null,
      selected: item.selected !== false,
      config: sanitizeConfig(item.config, context)
    }));
    const activeStackItems = stackItems.filter(item => item.selected);
    const draftConfig = params.draftConfig ? sanitizeConfig(params.draftConfig, context) : null;

    const previewItems = activeStackItems.length
      ? activeStackItems
      : draftConfig
        ? [{ itemId: 'draft', configId: null, selected: true, config: draftConfig, draft: true }]
        : [];

    if (!previewItems.length) {
      const topologyPattern = selectDesignPattern([], 'on-prem', context.platformBaseline);
      return {
        empty: true,
        validationStatus: 'No active use cases',
        statusTone: 'warning',
        stackItems,
        activeCount: 0,
        totalCount: stackItems.length,
        itemResults: [],
        gpuTotals: [],
        sharedCompanions: [],
        deploymentMode: 'on-prem',
        totalPrimaryGpus: 0,
        totalPrimaryReplicas: 0,
        platformCapacityCheck: {
          estimatedEndpointFamilies: 0,
          validatedLimit: 50,
          withinValidatedBaseline: true
        },
        platformBaseline: context.platformBaseline,
        componentOverhead: context.componentOverhead,
        topologyPattern,
        layerDiagram: {
          deploymentMode: 'on-prem',
          topologyPattern,
          layers: []
        },
        hardwarePlan: buildHardwarePlan([], context.platformBaseline, 'on-prem', topologyPattern),
        questions: ['Select at least one saved stack item or clear the stack to fall back to the current draft.'],
        sourceDocuments: context.platformBaseline.infrastructure.sourceDocuments
      };
    }

    const itemResults = previewItems.map(item => {
      const built = buildUseCaseRecommendationFromConfig(item.config, context);
      return {
        itemId: item.itemId,
        configId: item.configId,
        selected: item.selected,
        draft: item.draft || false,
        config: built.config,
        useCase: built.useCase,
        model: built.model,
        recommendation: built.recommendation
      };
    });

    const blocked = itemResults.some(item => item.recommendation.statusTone === 'blocked');
    const customValidation = itemResults.some(item => item.recommendation.validationStatus === 'Custom validation required');
    const validationStatus = blocked
      ? 'Unsupported in NAI v2.6'
      : customValidation
        ? 'Custom validation required'
        : 'Validated';
    const statusTone = blocked ? 'blocked' : customValidation ? 'warning' : 'validated';

    const gpuTotalMap = new Map();
    itemResults.forEach(item => {
      const rec = item.recommendation;
      const key = rec.gpu?.id || 'unknown';
      if (!gpuTotalMap.has(key)) {
        gpuTotalMap.set(key, {
          gpu: rec.gpu,
          validatedTotal: 0,
          useCases: [],
          hasCustomValidation: false
        });
      }
      const current = gpuTotalMap.get(key);
      current.useCases.push(item.useCase.name);
      current.hasCustomValidation = current.hasCustomValidation || rec.validationStatus === 'Custom validation required';
      if (typeof rec.totalEndpointGpus === 'number') {
        current.validatedTotal += rec.totalEndpointGpus;
      }
    });

    const companionMap = new Map();
    itemResults.forEach(item => {
      item.recommendation.companionModels.forEach(model => {
        if (!companionMap.has(model.id)) {
          companionMap.set(model.id, { model, useCases: [] });
        }
        companionMap.get(model.id).useCases.push(item.useCase.name);
      });
    });

    const sharedCompanions = [...companionMap.values()].map(entry => ({
      model: entry.model,
      useCases: uniqueStrings(entry.useCases),
      count: uniqueStrings(entry.useCases).length
    }));

    const gpuTotals = [...gpuTotalMap.values()].sort((a, b) => a.gpu.label.localeCompare(b.gpu.label));
    const deployments = itemResults.map(item => item.config.deployment);
    const deploymentMode = getDeploymentMode(deployments);
    const totalPrimaryGpus = gpuTotals.every(item => !item.hasCustomValidation)
      ? gpuTotals.reduce((sum, item) => sum + item.validatedTotal, 0)
      : null;
    const totalPrimaryReplicas = itemResults.every(item => item.recommendation.scalePlan.validatedMultiplier !== null)
      ? itemResults.reduce((sum, item) => sum + item.recommendation.scalePlan.validatedMultiplier, 0)
      : null;
    const estimatedEndpointFamilies = itemResults.length + sharedCompanions.length;
    const platformCapacityCheck = {
      estimatedEndpointFamilies,
      validatedLimit: 50,
      withinValidatedBaseline: estimatedEndpointFamilies <= 50
    };

    const topologyPattern = selectDesignPattern(itemResults, deploymentMode, context.platformBaseline);
    const hardwarePlan = buildHardwarePlan(gpuTotals, context.platformBaseline, deploymentMode, topologyPattern);
    const layerDiagram = buildLayerDiagram(itemResults, sharedCompanions, context.platformBaseline, deploymentMode, topologyPattern, hardwarePlan);
    const questions = buildStackQuestions(itemResults, validationStatus, deploymentMode, hardwarePlan, platformCapacityCheck);

    return {
      empty: false,
      validationStatus,
      statusTone,
      itemResults,
      stackItems,
      activeCount: itemResults.length,
      totalCount: stackItems.length,
      gpuTotals,
      sharedCompanions,
      deploymentMode,
      totalPrimaryGpus,
      totalPrimaryReplicas,
      platformCapacityCheck,
      platformBaseline: context.platformBaseline,
      componentOverhead: context.componentOverhead,
      topologyPattern,
      layerDiagram,
      hardwarePlan,
      questions,
      sourceDocuments: context.platformBaseline.infrastructure.sourceDocuments
    };
  }

  function buildUseCaseConfigRecord(id, config) {
    return {
      kind: 'use-case-config',
      version: 2,
      id,
      savedAt: new Date().toISOString(),
      config
    };
  }

  function buildStackConfigRecord(id, items) {
    return {
      kind: 'stack-config',
      version: 2,
      id,
      savedAt: new Date().toISOString(),
      items: (items || []).map(item => ({
        itemId: item.itemId,
        configId: item.configId || null,
        selected: item.selected !== false,
        config: item.config
      }))
    };
  }

  function parseStoredRecord(rawValue) {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (!parsed) return null;
    if (!parsed.kind) {
      return {
        kind: 'use-case-config',
        version: 1,
        id: null,
        savedAt: null,
        config: parsed
      };
    }
    return parsed;
  }

  return {
    providerLabel,
    runtimeLabel,
    normalizeInteraction,
    normalizeDeployment,
    getVisibleUseCases,
    getUseCaseById,
    getModelById,
    getAllowedModelsForUseCase,
    getCompanionModels,
    getDefaultModelForUseCase,
    getSupportedGpus,
    getDefaultGpuForModel,
    getEligibleGpusForDeployment,
    getDefaultGpuForDeployment,
    getG10OnPremGpuSupport,
    defaultDemandProfile,
    estimateDemand,
    getPlanningProfile,
    computeScalePlan,
    buildGpuRows,
    buildRecommendation,
    sanitizeConfig,
    buildUseCaseRecommendationFromConfig,
    getDeploymentMode,
    selectDesignPattern,
    buildLayerDiagram,
    buildHardwarePlan,
    buildStackRecommendation,
    buildUseCaseConfigRecord,
    buildStackConfigRecord,
    parseStoredRecord
  };
});
