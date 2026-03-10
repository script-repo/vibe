const el = id => document.getElementById(id);
const core = window.NAI_ADVISOR_CORE;

const context = {
  useCases: window.AI_USE_CASES,
  models: window.NAI_VALIDATED_MODEL_CATALOG,
  gpuCatalog: window.NAI_SUPPORTED_GPUS,
  platformBaseline: window.NAI_PLATFORM_BASELINE,
  componentOverhead: window.NAI_COMPONENT_OVERHEAD
};

const state = {
  filtered: core.getVisibleUseCases(context.useCases),
  selectedUseCase: null,
  currentPreview: null,
  stackItems: [],
  stackResult: null,
  currentConfigId: null,
  stackConfigId: null,
  editingStackItemId: null
};

function uuid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function formatPages(pages) {
  return (pages || []).join(', ');
}

function statusPill(result) {
  return `<span class="status-pill ${result.statusTone}">${result.validationStatus}</span>`;
}

function modelOptionLabel(model) {
  return `${model.modelName} — ${core.providerLabel(model.provider)}`;
}

function getCurrentDeployment() {
  return core.normalizeDeployment(el('deployment')?.value || state.selectedUseCase?.defaults?.deployment);
}

function humanize(text) {
  return String(text || '').replace(/-/g, ' ');
}

function useCasePersona(useCase) {
  const profiles = {
    Assistant: {
      audience: 'business users, knowledge workers, or frontline staff who need help quickly',
      job: 'get a clear answer or next step without digging through multiple systems'
    },
    RAG: {
      audience: 'people who already have trusted company content but cannot search it fast enough',
      job: 'find grounded answers from manuals, policies, and knowledge bases'
    },
    Documents: {
      audience: 'reviewers, legal teams, and operations staff working through long documents',
      job: 'extract the important clauses, facts, or follow-up actions from complex files'
    },
    Vision: {
      audience: 'operations teams handling forms, scans, photos, or image-heavy workflows',
      job: 'turn visual content into structured data that can move through a business process'
    },
    Software: {
      audience: 'developers, platform engineers, and technical teams',
      job: 'understand repositories, code patterns, and implementation details faster'
    },
    Security: {
      audience: 'SOC analysts, responders, and security engineers',
      job: 'reduce alert noise and understand risk quickly enough to take action'
    }
  };
  return profiles[useCase?.category] || {
    audience: 'teams that need a validated AI workflow for a specific business process',
    job: 'complete that task with less manual effort and less context switching'
  };
}

function describeUseCaseFlow(useCase) {
  const capabilities = new Set(useCase.requiredCapabilities || []);
  const steps = ['The user starts with a question, request, or document inside a business workflow.'];
  if (capabilities.has('document-ai') || capabilities.has('ocr') || capabilities.has('vision')) {
    steps.push('The system first reads the document or image, extracts usable text and structure, and cleans it up so the main model can reason over it.');
  }
  if (capabilities.has('retrieval') || capabilities.has('reranking')) {
    steps.push('It then looks up the most relevant company content so the answer is grounded in real enterprise data instead of model memory alone.');
  }
  if (capabilities.has('guardrail')) {
    steps.push('A safety or policy model can review prompts or answers so the workflow stays within the client’s control boundaries.');
  }
  if (capabilities.has('code')) {
    steps.push('For code-heavy scenarios, the system searches repositories and technical context before drafting a response.');
  }
  steps.push(`The final response is produced through a validated path: ${useCase.infra.architecture}.`);
  return steps.join(' ');
}

function renderEditorMeta() {
  const editingItem = state.stackItems.find(item => item.itemId === state.editingStackItemId) || null;
  const editingLabel = editingItem
    ? `${core.getUseCaseById(context.useCases, editingItem.config.useCaseId).name} (${editingItem.configId || 'unsaved'})`
    : 'Current draft';

  el('currentConfigId').textContent = state.currentConfigId || 'Not saved yet';
  el('editingItemLabel').textContent = editingLabel;
  el('addToStackBtn').textContent = editingItem ? 'Update stack item' : 'Add current use case to stack';
}

function populateUseCases(list) {
  const sel = el('useCaseSelect');
  const current = state.selectedUseCase?.id;
  sel.innerHTML = '';
  list.forEach(useCase => {
    const option = document.createElement('option');
    option.value = useCase.id;
    option.textContent = `${useCase.name} — ${useCase.category}`;
    sel.appendChild(option);
  });

  if (!list.length) {
    state.selectedUseCase = null;
    return;
  }

  const nextId = list.some(useCase => useCase.id === current) ? current : list[0].id;
  sel.value = nextId;
  setSelected(nextId, { preserveValues: false });
}

function renderUseCaseMeta(useCase) {
  const persona = useCasePersona(useCase);
  const defaults = useCase.defaults || {};
  const capabilityPills = (useCase.requiredCapabilities || []).map(capability => `<span class="pill">${humanize(capability)}</span>`).join('');
  el('useCaseMeta').innerHTML = `
    <div><span class="pill">${useCase.category}</span><span class="pill">${useCase.pattern}</span></div>
    <div class="kv"><strong>What this use case is</strong><span>${useCase.desc}</span></div>
    <div class="kv"><strong>Who this is built for</strong><span>This use case is meant for ${persona.audience}. In plain terms, the person using it is trying to ${persona.job}.</span></div>
    <div class="kv"><strong>What success looks like for that person</strong><span>The experience should feel simple: the user asks for help in normal language, the system brings back the right business context, and the answer is specific enough that the person can move forward without opening several other tools first.</span></div>
    <div class="kv"><strong>How the workflow works in simple terms</strong><span>${describeUseCaseFlow(useCase)}</span></div>
    <div class="kv"><strong>Why an architect would size this separately</strong><span>${useCase.name} has to be sized around its own interaction style, content shape, and response expectations. In this case the validated pattern is ${useCase.pattern.toLowerCase()}, and the main infrastructure path is ${useCase.infra.architecture.toLowerCase()}.</span></div>
    <div>${capabilityPills}</div>
    <div class="kv"><strong>Validated model families</strong><span>${useCase.models.join(', ')}</span></div>
    <div class="kv"><strong>Default starting point</strong><span>${defaults.users} named users, ${humanize(defaults.deployment)} deployment preference, and ${humanize(defaults.latency)} interaction expectations.</span></div>
  `;
}

function applyDefaultInputs(useCase) {
  const profile = core.defaultDemandProfile(useCase);
  const defaults = useCase.defaults || {};
  el('users').value = defaults.users || 200;
  el('activePct').value = profile.activePct;
  el('promptsPerHour').value = profile.promptsPerHour;
  el('outputTokens').value = profile.outputTokens;
  el('interaction').value = core.normalizeInteraction(defaults.latency);
  el('deployment').value = core.normalizeDeployment(defaults.deployment);
  el('concurrency').value = defaults.concurrency || 0;
}

function populateModelsForUseCase(useCase) {
  const models = core.getAllowedModelsForUseCase(useCase, context.models);
  const sel = el('modelSelect');
  sel.innerHTML = '';
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = modelOptionLabel(model);
    sel.appendChild(option);
  });
  if (!models.length) return;
  sel.value = useCase.defaultValidatedModelId || models[0].id;
  syncRuntimeAndGpu();
}

function renderSupportNote(model) {
  const deployment = getCurrentDeployment();
  const supportedGpus = core.getEligibleGpusForDeployment(model, context.gpuCatalog, deployment, context.platformBaseline);
  const matrixSupportedGpuLabels = core.getSupportedGpus(model, context.gpuCatalog).map(gpu => gpu.shortLabel).join(', ');
  const deploymentGpuLabels = supportedGpus.length ? supportedGpus.map(gpu => gpu.shortLabel).join(', ') : 'No approved path';
  const g10Support = core.getG10OnPremGpuSupport(context.platformBaseline);
  const hardwarePath = deployment === 'cloud'
    ? 'Cloud/provider-backed deployment can use any GPU row validated in the Nutanix Enterprise AI matrix.'
    : supportedGpus.length
      ? supportedGpus.map(gpu => {
          const mapping = g10Support[gpu.id];
          const availability = mapping?.availability ? `, ${mapping.availability}` : '';
          return `${mapping?.profileLabel || 'Approved G10 node'} (${gpu.shortLabel}, up to ${mapping?.maxPerNode || '?'} per node${availability})`;
        }).join('; ')
      : 'This model/runtime row does not map to the approved NX G10 on-prem hardware path.';

  el('supportNote').innerHTML = `
    <div class="kv"><strong>Validated provider/runtime</strong><span>${core.providerLabel(model.provider)} / ${core.runtimeLabel(model.runtime)}</span></div>
    <div class="kv"><strong>Matrix GPUs</strong><span>${matrixSupportedGpuLabels}</span></div>
    <div class="kv"><strong>Current deployment GPUs</strong><span>${deploymentGpuLabels}</span></div>
    <div class="kv"><strong>G10 hardware path</strong><span>${hardwarePath}</span></div>
    <div class="kv"><strong>PDF reference</strong><span>${model.sourceTable}, pages ${formatPages(model.sourcePages)}</span></div>
  `;
}

function syncRuntimeAndGpu() {
  const model = getSelectedModel();
  if (!model) return;

  const runtimeSelect = el('runtimeSelect');
  runtimeSelect.innerHTML = '';
  const runtimeOption = document.createElement('option');
  runtimeOption.value = model.runtime;
  runtimeOption.textContent = core.runtimeLabel(model.runtime);
  runtimeSelect.appendChild(runtimeOption);

  const gpuSelect = el('gpuSelect');
  const current = gpuSelect.value;
  const supportedGpus = core.getEligibleGpusForDeployment(model, context.gpuCatalog, getCurrentDeployment(), context.platformBaseline);
  gpuSelect.innerHTML = '';
  supportedGpus.forEach(gpu => {
    const option = document.createElement('option');
    option.value = gpu.id;
    option.textContent = gpu.label;
    gpuSelect.appendChild(option);
  });
  if (supportedGpus.length) {
    const nextGpuId = supportedGpus.some(gpu => gpu.id === current) ? current : supportedGpus[0].id;
    gpuSelect.value = nextGpuId;
  } else {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No approved GPU path';
    gpuSelect.appendChild(option);
  }

  renderSupportNote(model);
}

function setSelected(id, options = {}) {
  const useCase = core.getUseCaseById(state.filtered.length ? state.filtered : core.getVisibleUseCases(context.useCases), id);
  if (!useCase) return;
  state.selectedUseCase = useCase;
  renderUseCaseMeta(useCase);
  if (!options.preserveValues) {
    applyDefaultInputs(useCase);
    state.currentConfigId = null;
    if (!options.keepEditingState) {
      state.editingStackItemId = null;
    }
  }
  populateModelsForUseCase(useCase);
  renderEditorMeta();
}

function getSelectedModel() {
  return core.getModelById(context.models, el('modelSelect').value);
}

function currentEditorConfigRaw() {
  return {
    useCaseId: state.selectedUseCase?.id,
    users: Number(el('users').value || 200),
    activePct: Number(el('activePct').value || 10),
    promptsPerHour: Number(el('promptsPerHour').value || 6),
    outputTokens: Number(el('outputTokens').value || 400),
    interaction: el('interaction').value,
    deployment: el('deployment').value,
    modelSelect: el('modelSelect').value,
    gpuSelect: el('gpuSelect').value,
    concurrency: Number(el('concurrency').value || 0)
  };
}

function currentEditorConfig() {
  return core.sanitizeConfig(currentEditorConfigRaw(), context);
}

function ensureVisibleUseCase(id) {
  if (state.filtered.some(useCase => useCase.id === id)) return;
  state.filtered = core.getVisibleUseCases(context.useCases);
  el('useCaseSearch').value = '';
  const sel = el('useCaseSelect');
  sel.innerHTML = '';
  state.filtered.forEach(useCase => {
    const option = document.createElement('option');
    option.value = useCase.id;
    option.textContent = `${useCase.name} — ${useCase.category}`;
    sel.appendChild(option);
  });
}

function applyConfig(config, options = {}) {
  const normalized = core.sanitizeConfig(config, context);
  if (!normalized.useCaseId) return;

  ensureVisibleUseCase(normalized.useCaseId);
  el('useCaseSelect').value = normalized.useCaseId;
  setSelected(normalized.useCaseId, { preserveValues: true, keepEditingState: true });

  el('users').value = normalized.users;
  el('activePct').value = normalized.activePct;
  el('promptsPerHour').value = normalized.promptsPerHour;
  el('outputTokens').value = normalized.outputTokens;
  el('interaction').value = normalized.interaction;
  el('deployment').value = normalized.deployment;
  el('concurrency').value = normalized.concurrency;
  el('modelSelect').value = normalized.modelSelect;
  syncRuntimeAndGpu();
  el('gpuSelect').value = normalized.gpuSelect || el('gpuSelect').value;

  state.currentConfigId = options.configId || null;
  state.editingStackItemId = options.editingStackItemId || null;
  renderEditorMeta();
  refreshRecommendations();
}

function persistUseCaseConfig(config, existingId) {
  const id = existingId || uuid('cfg');
  const record = core.buildUseCaseConfigRecord(id, config);
  localStorage.setItem(id, JSON.stringify(record));
  return id;
}

function persistStackConfig(items, existingId) {
  const id = existingId || uuid('stack');
  const record = core.buildStackConfigRecord(id, items);
  localStorage.setItem(id, JSON.stringify(record));
  return id;
}

function saveCurrentUseCaseConfig(options = {}) {
  const config = currentEditorConfig();
  const id = persistUseCaseConfig(config, state.currentConfigId);
  state.currentConfigId = id;
  renderEditorMeta();
  if (!options.silent) {
    alert(`Saved use-case config as ${id}`);
  }
  return { id, config };
}

function refreshRecommendations() {
  if (!state.selectedUseCase) return;
  state.currentPreview = core.buildUseCaseRecommendationFromConfig(currentEditorConfigRaw(), context);
  state.stackResult = core.buildStackRecommendation({
    stackItems: state.stackItems,
    draftConfig: state.stackItems.length ? null : currentEditorConfigRaw()
  }, context);
  renderResults();
}

function renderValidationStatus(result) {
  const modeText = result.stackItems.length
    ? `${result.activeCount} active use case${result.activeCount === 1 ? '' : 's'} in the stack`
    : 'Current draft only';
  const pattern = result.topologyPattern || result.layerDiagram?.topologyPattern;
  el('validationStatus').innerHTML = `
    <div>${statusPill(result)}</div>
    <p>${result.validationStatus === 'Validated'
      ? 'Every active stack member stays within the strict validated planning band.'
      : result.validationStatus === 'No active use cases'
        ? 'All saved stack members are currently deselected. Re-enable at least one item, or clear the stack to fall back to the current draft.'
      : result.validationStatus === 'Custom validation required'
        ? 'At least one active stack member exceeds the strict validated planning band. Keep the validated endpoint rows, but custom-validate the larger scale.'
        : 'One or more active items use a path that is unsupported in strict mode.'}</p>
    <div class="kv"><strong>Stack mode</strong><span>${modeText}</span></div>
    <div class="kv"><strong>Deployment posture</strong><span>${result.deploymentMode}</span></div>
    <div class="kv"><strong>Pattern</strong><span>${pattern ? pattern.name : 'Not selected'}</span></div>
  `;
}

function renderStackSummary(result) {
  const gpuMix = result.gpuTotals.length
    ? result.gpuTotals.map(item => item.hasCustomValidation ? `${item.gpu.shortLabel} (custom)` : `${item.validatedTotal} x ${item.gpu.shortLabel}`).join(', ')
    : 'No active GPU demand';
  const totalPrimaryGpus = result.totalPrimaryGpus === null ? 'Custom validation required' : `${result.totalPrimaryGpus} total validated endpoint GPUs`;
  const totalReplicas = result.totalPrimaryReplicas === null ? 'Custom validation required' : `${result.totalPrimaryReplicas} total validated primary endpoint replicas`;
  const capacity = result.platformCapacityCheck;
  const pattern = result.topologyPattern || result.layerDiagram?.topologyPattern || { name: 'Topology pattern unavailable', summary: '', sourcePages: [] };
  const hardware = result.hardwarePlan;
  const onPremFootprint = hardware.onPremRelevant
    ? `${hardware.totalPodNodes} x NX-8150G G10 AI Pod nodes${hardware.managementNodeCount ? ` + ${hardware.managementNodeCount} x NX-8150 G10 management/storage nodes` : ''}`
    : 'Optional on-prem G10 footprint only';

  el('stackSummary').innerHTML = `
    <div class="kv"><strong>Active stack members</strong><span>${result.activeCount}</span></div>
    <div class="kv"><strong>Topology pattern</strong><span>${pattern.name}</span></div>
    <div class="kv"><strong>Pattern reference</strong><span>${pattern.summary} (pages ${formatPages(pattern.sourcePages)})</span></div>
    <div class="kv"><strong>GPU mix</strong><span>${gpuMix}</span></div>
    <div class="kv"><strong>Primary endpoint footprint</strong><span>${totalPrimaryGpus}</span></div>
    <div class="kv"><strong>Replica footprint</strong><span>${totalReplicas}</span></div>
    <div class="kv"><strong>On-prem G10 footprint</strong><span>${onPremFootprint}</span></div>
    <div class="kv"><strong>Endpoint family count</strong><span>${capacity.estimatedEndpointFamilies} of ${capacity.validatedLimit} validated baseline capacity</span></div>
    <div class="kv"><strong>Capacity assessment</strong><span>${capacity.withinValidatedBaseline ? 'Within the baseline NAI platform envelope' : 'Exceeds the baseline NAI platform envelope'}</span></div>
  `;
}

function renderCurrentPreview() {
  const preview = state.currentPreview?.recommendation;
  if (!preview) return;

  if (preview.statusTone === 'blocked') {
    el('endpointSizing').innerHTML = `<div>${statusPill(preview)}</div><p>${preview.message}</p>`;
    el('scalePlan').innerHTML = '';
    return;
  }

  el('endpointSizing').innerHTML = `
    <div class="kv"><strong>Primary validated model</strong><span>${preview.model.modelName}</span></div>
    <div class="kv"><strong>Provider / runtime</strong><span>${preview.provider} / ${preview.runtime}</span></div>
    <div class="kv"><strong>Primary deployment target</strong><span>${core.normalizeDeployment(state.currentPreview.config.deployment)}</span></div>
    <div class="kv"><strong>Selected GPU</strong><span>${preview.gpu.label}</span></div>
    <div class="kv"><strong>Minimum per endpoint</strong><span>${preview.baselineTopology}</span></div>
    <div class="kv"><strong>G10 hardware mapping</strong><span>${preview.hardwareSupport
      ? `${preview.hardwareSupport.profileLabel}, up to ${preview.hardwareSupport.maxPerNode} x ${preview.gpu.shortLabel} per node${preview.hardwareSupport.availability ? ` (${preview.hardwareSupport.availability})` : ''}`
      : 'Cloud/provider-backed path or no on-prem G10 mapping required'}</span></div>
    <div class="kv"><strong>Planning profile</strong><span>${preview.scalePlan.profile.summary}</span></div>
    <div class="kv"><strong>PDF reference</strong><span>${preview.sourceTable}, pages ${formatPages(preview.sourcePages)}</span></div>
  `;

  const demand = preview.scalePlan.demand;
  el('scalePlan').innerHTML = `
    <div class="kv"><strong>Peak active users</strong><span>${demand.activeUsers.toFixed(1)}</span></div>
    <div class="kv"><strong>Estimated peak concurrency</strong><span>${preview.scalePlan.targetConcurrency}</span></div>
    <div class="kv"><strong>Estimated output throughput</strong><span>${demand.outputTokensPerSecond.toFixed(1)} tokens/sec</span></div>
    <div class="kv"><strong>Replica multiplier</strong><span>${preview.scalePlan.validatedMultiplier ? `${preview.scalePlan.validatedMultiplier} x validated baseline` : `Exceeded strict band (>${preview.scalePlan.profile.maxReplicas}x)`}</span></div>
    <div class="kv"><strong>Total endpoint GPUs</strong><span>${preview.totalEndpointGpus ? `${preview.totalEndpointGpus} x ${preview.gpu.label}` : 'Custom validation required'}</span></div>
  `;
}

function renderLayerDiagram(result) {
  if (!result.layerDiagram.layers.length) {
    el('layerDiagram').innerHTML = '<div class="empty-state compact-state">Select at least one active stack item to render the shared layered architecture.</div>';
    return;
  }
  el('layerDiagram').innerHTML = `
    <div class="layer-diagram">
      ${result.layerDiagram.layers.map((layer, index) => `
        <div class="layer-card ${layer.accent}">
          <div class="layer-heading">${index + 1}. ${layer.title}</div>
          <div class="layer-items">${layer.items.map(item => `<span class="layer-pill">${item}</span>`).join('')}</div>
        </div>
        ${index < result.layerDiagram.layers.length - 1 ? '<div class="layer-connector"></div>' : ''}
      `).join('')}
    </div>
  `;
}

function renderHardwareDiagram(result) {
  const hardware = result.hardwarePlan;
  const pattern = result.topologyPattern || hardware.topologyPattern || { id: 'ai-pod', name: 'AI Pod', summary: '', sourcePages: [] };
  const nodeBoms = hardware.nodeBoms || [];
  const activeNotes = hardware.notes.filter(Boolean).slice(0, 2);
  const endpointSummary = hardware.endpointDemand.length
    ? hardware.endpointDemand.map(item => item.hasCustomValidation
      ? `${item.shortLabel}: custom validation required`
      : `${item.validatedTotal || 0} x ${item.shortLabel}`).join(', ')
    : 'No active endpoint GPU demand';

  el('hardwareDiagram').innerHTML = `
    ${activeNotes.length ? `<div class="note-list">${activeNotes.map(note => `<div class="note-chip">${note}</div>`).join('')}</div>` : ''}
    <div class="meta-card compact diagram-banner">
      <div class="kv"><strong>${pattern.name}</strong><span>${pattern.summary}</span></div>
      <div class="kv"><strong>Reference pages</strong><span>${formatPages(pattern.sourcePages)}</span></div>
    </div>
    <div class="rack-shell">
      <div class="rack-row">
        ${nodeBoms.length ? nodeBoms.map(node => `
          <div class="rack-column">
            <div class="rack-title">${node.role}</div>
            <div class="rack-box"><strong>${node.quantity} x ${node.model}</strong><span>${hardware.siteCount > 1 ? `Distributed across ${hardware.siteCount} sites.` : 'Single-site node family for the current pattern.'}</span></div>
            ${node.parts.map(part => {
              const [label, ...rest] = part.split(':');
              return `<div class="rack-box"><strong>${label}</strong><span>${rest.join(':').trim()}</span></div>`;
            }).join('')}
          </div>
        `).join('') : `
          <div class="rack-column">
            <div class="rack-title">On-prem node footprint</div>
            <div class="rack-box"><strong>No dedicated on-prem node pool</strong><span>The current stack is using a cloud/provider extension path, so no G10 node BoM is committed here.</span></div>
          </div>
        `}
        <div class="rack-column">
          <div class="rack-title">Workload mapping</div>
          <div class="rack-box"><strong>Selected pattern</strong><span>${pattern.name}</span></div>
          <div class="rack-box"><strong>Endpoint GPU demand</strong><span>${endpointSummary}</span></div>
          <div class="rack-box"><strong>Site footprint</strong><span>${hardware.siteCount} site(s), ${hardware.totalPodNodes} AI Pod GPU node(s), ${hardware.managementNodeCount} dedicated management/storage node(s).</span></div>
        </div>
      </div>
    </div>
  `;
}

function renderHardwareBom(result) {
  el('hardwareBom').innerHTML = result.hardwarePlan.bomRows.length
    ? result.hardwarePlan.bomRows.map(row => `
      <tr>
        <td>${row.item}</td>
        <td>${row.quantity}</td>
        <td>${row.spec}</td>
        <td>${row.source}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="4">No on-prem G10 node BoM is required for the current stack.</td></tr>';
}

function renderStackTable(result) {
  if (!result.itemResults.length) {
    el('stackTable').innerHTML = '<tr><td colspan="5">No active stack items selected.</td></tr>';
    return;
  }
  el('stackTable').innerHTML = result.itemResults.map(item => {
    const rec = item.recommendation;
    const modelGpu = rec.statusTone === 'blocked'
      ? 'Unsupported'
      : `${rec.model.modelName} / ${rec.gpu.shortLabel}`;
    const totalGpus = rec.totalEndpointGpus === null ? 'Custom validation required' : `${rec.totalEndpointGpus} x ${rec.gpu.shortLabel}`;
    return `
      <tr>
        <td>${item.useCase.name}</td>
        <td><span class="mono">${item.configId || 'draft'}</span></td>
        <td>${modelGpu}</td>
        <td>${rec.validationStatus}</td>
        <td>${totalGpus}</td>
      </tr>
    `;
  }).join('');
}

function renderGpuTotals(result) {
  if (!result.gpuTotals.length) {
    el('gpuTable').innerHTML = '<tr><td colspan="4">No active stack GPU demand.</td></tr>';
    return;
  }
  el('gpuTable').innerHTML = result.gpuTotals.map(item => `
    <tr>
      <td>${item.gpu.label}</td>
      <td>${item.hasCustomValidation ? `${item.validatedTotal || 0} validated + custom validation` : item.validatedTotal}</td>
      <td>${item.useCases.join(', ')}</td>
      <td>${item.hasCustomValidation ? 'Mixed validated/custom' : 'Validated'}</td>
    </tr>
  `).join('');
}

function renderCompanions(result) {
  el('companions').innerHTML = result.sharedCompanions.length
    ? result.sharedCompanions.map(item => {
        const supported = core.getSupportedGpus(item.model, context.gpuCatalog).map(gpu => gpu.shortLabel).join(', ');
        return `<li><span class="mono">${item.model.modelName}</span> — ${item.count} use case(s), ${core.runtimeLabel(item.model.runtime)} (${supported})</li>`;
      }).join('')
    : '<li>No shared companion endpoints are required for the active stack.</li>';
}

function renderComponentOverhead(result) {
  el('componentOverhead').innerHTML = result.componentOverhead.map(item => `
    <div class="kv">
      <strong>${item.label}</strong>
      <span>${item.cpu}, ${item.memory} — ${item.purpose}</span>
    </div>
  `).join('');
}

function renderQuestions(result) {
  el('questions').innerHTML = result.questions.map(question => `<li>${question}</li>`).join('');
}

function renderSourceDocuments(result) {
  el('sourceDocuments').innerHTML = result.sourceDocuments.map(item => `
    <li><span class="mono">${item.document}</span> — pages ${formatPages(item.pages)}</li>
  `).join('');
}

function renderStackPanel() {
  const empty = !state.stackItems.length;
  el('stackEmpty').classList.toggle('hidden', !empty);
  el('stackList').innerHTML = state.stackItems.map(item => {
    const useCase = core.getUseCaseById(context.useCases, item.config.useCaseId);
    const model = core.getModelById(context.models, item.config.modelSelect);
    const gpu = model
      ? core.getEligibleGpusForDeployment(model, context.gpuCatalog, item.config.deployment, context.platformBaseline).find(entry => entry.id === item.config.gpuSelect)
        || core.getDefaultGpuForDeployment(model, context.gpuCatalog, item.config.deployment, context.platformBaseline)
      : null;
    return `
      <div class="stack-item ${item.selected ? 'active' : ''} ${state.editingStackItemId === item.itemId ? 'editing' : ''}">
        <label class="stack-toggle">
          <input type="checkbox" data-action="toggle" data-id="${item.itemId}" ${item.selected ? 'checked' : ''} />
          <span>${useCase?.name || 'Unknown use case'}</span>
        </label>
        <div class="stack-meta">
          <span class="pill">${useCase?.category || 'Unknown'}</span>
          <span class="pill">${item.config.deployment}</span>
          <span class="mono">${item.configId}</span>
        </div>
        <div class="stack-detail">${model?.modelName || 'Unknown model'} / ${gpu ? gpu.shortLabel : 'No approved GPU path'}</div>
        <div class="stack-item-actions">
          <button type="button" class="tiny-btn" data-action="edit" data-id="${item.itemId}">Edit</button>
          <button type="button" class="tiny-btn" data-action="remove" data-id="${item.itemId}">Remove</button>
        </div>
      </div>
    `;
  }).join('');
  el('stackConfigId').textContent = state.stackConfigId || 'Not saved yet';
}

function renderResults() {
  const preview = state.currentPreview?.recommendation;
  const stackResult = state.stackResult;
  if (!preview || !stackResult) return;

  el('emptyState').classList.add('hidden');
  el('results').classList.remove('hidden');

  renderValidationStatus(stackResult);
  renderStackSummary(stackResult);
  renderCurrentPreview();
  renderLayerDiagram(stackResult);
  renderHardwareDiagram(stackResult);
  renderHardwareBom(stackResult);
  renderStackTable(stackResult);
  renderGpuTotals(stackResult);
  renderCompanions(stackResult);
  renderComponentOverhead(stackResult);
  renderQuestions(stackResult);
  renderSourceDocuments(stackResult);
}

function addCurrentToStack() {
  const wasEditing = Boolean(state.editingStackItemId);
  const saved = saveCurrentUseCaseConfig({ silent: true });
  const newItem = {
    itemId: state.editingStackItemId || uuid('item'),
    configId: saved.id,
    selected: true,
    config: saved.config
  };

  if (state.editingStackItemId) {
    state.stackItems = state.stackItems.map(item => item.itemId === state.editingStackItemId ? newItem : item);
  } else {
    state.stackItems = [...state.stackItems, newItem];
  }

  state.editingStackItemId = null;
  renderEditorMeta();
  renderStackPanel();
  refreshRecommendations();
  alert(wasEditing ? `Updated stack item ${saved.id}` : `Added stack item ${saved.id}`);
}

function loadUseCaseById() {
  const id = prompt('Enter a saved use-case config ID');
  if (!id) return;
  const raw = localStorage.getItem(id.trim());
  if (!raw) {
    alert('Use-case config not found in this browser.');
    return;
  }
  const record = core.parseStoredRecord(raw);
  if (record.kind !== 'use-case-config') {
    alert('That ID is not a use-case config.');
    return;
  }
  applyConfig(record.config, { configId: id.trim(), editingStackItemId: null });
}

function saveStack() {
  if (!state.stackItems.length) {
    const saved = saveCurrentUseCaseConfig({ silent: true });
    state.stackItems = [{
      itemId: uuid('item'),
      configId: saved.id,
      selected: true,
      config: saved.config
    }];
    renderStackPanel();
  }
  const id = persistStackConfig(state.stackItems, state.stackConfigId);
  state.stackConfigId = id;
  renderStackPanel();
  alert(`Saved stack config as ${id}`);
}

function loadStackById() {
  const id = prompt('Enter a saved stack config ID');
  if (!id) return;
  const raw = localStorage.getItem(id.trim());
  if (!raw) {
    alert('Stack config not found in this browser.');
    return;
  }
  const record = core.parseStoredRecord(raw);
  if (record.kind !== 'stack-config') {
    alert('That ID is not a stack config.');
    return;
  }
  state.stackItems = (record.items || []).map(item => ({
    itemId: item.itemId || uuid('item'),
    configId: item.configId || null,
    selected: item.selected !== false,
    config: core.sanitizeConfig(item.config, context)
  }));
  state.stackConfigId = id.trim();
  renderStackPanel();
  if (state.stackItems.length) {
    const first = state.stackItems[0];
    applyConfig(first.config, { configId: first.configId, editingStackItemId: first.itemId });
  } else {
    refreshRecommendations();
  }
}

function clearStack() {
  state.stackItems = [];
  state.stackConfigId = null;
  state.editingStackItemId = null;
  renderEditorMeta();
  renderStackPanel();
  refreshRecommendations();
}

function editStackItem(itemId) {
  const item = state.stackItems.find(entry => entry.itemId === itemId);
  if (!item) return;
  applyConfig(item.config, { configId: item.configId, editingStackItemId: item.itemId });
}

function removeStackItem(itemId) {
  state.stackItems = state.stackItems.filter(item => item.itemId !== itemId);
  if (state.editingStackItemId === itemId) {
    state.editingStackItemId = null;
    renderEditorMeta();
  }
  renderStackPanel();
  refreshRecommendations();
}

function toggleStackItem(itemId) {
  state.stackItems = state.stackItems.map(item => item.itemId === itemId ? { ...item, selected: !item.selected } : item);
  renderStackPanel();
  refreshRecommendations();
}

el('useCaseSearch').addEventListener('input', event => {
  const query = event.target.value.toLowerCase();
  state.filtered = core.getVisibleUseCases(context.useCases).filter(useCase =>
    [useCase.name, useCase.category, useCase.pattern, useCase.desc].join(' ').toLowerCase().includes(query)
  );
  populateUseCases(state.filtered);
  refreshRecommendations();
});

el('useCaseSelect').addEventListener('change', event => {
  state.currentConfigId = null;
  state.editingStackItemId = null;
  setSelected(event.target.value, { preserveValues: false });
  refreshRecommendations();
});

el('modelSelect').addEventListener('change', () => {
  syncRuntimeAndGpu();
  refreshRecommendations();
});

['users', 'activePct', 'promptsPerHour', 'outputTokens', 'concurrency'].forEach(id => {
  el(id).addEventListener('input', refreshRecommendations);
});

el('interaction').addEventListener('change', refreshRecommendations);
el('deployment').addEventListener('change', () => {
  syncRuntimeAndGpu();
  refreshRecommendations();
});
el('gpuSelect').addEventListener('change', refreshRecommendations);

el('previewBtn').addEventListener('click', refreshRecommendations);
el('addToStackBtn').addEventListener('click', addCurrentToStack);
el('saveUseCaseBtn').addEventListener('click', () => saveCurrentUseCaseConfig());
el('loadUseCaseBtn').addEventListener('click', loadUseCaseById);
el('saveStackBtn').addEventListener('click', saveStack);
el('loadStackBtn').addEventListener('click', loadStackById);
el('clearStackBtn').addEventListener('click', clearStack);

el('stackList').addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const itemId = target.dataset.id;
  const action = target.dataset.action;
  if (action === 'edit') editStackItem(itemId);
  if (action === 'remove') removeStackItem(itemId);
});

el('stackList').addEventListener('change', event => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.dataset.action === 'toggle') {
    toggleStackItem(target.dataset.id);
  }
});

populateUseCases(state.filtered);
renderEditorMeta();
renderStackPanel();
refreshRecommendations();
