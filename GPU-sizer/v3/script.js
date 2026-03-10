const el = id => document.getElementById(id);
const core = window.NAI_ADVISOR_CORE;

const state = {
  filtered: core.getVisibleUseCases(window.AI_USE_CASES),
  selectedUseCase: null,
  lastResult: null
};

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
  setSelected(nextId);
}

function renderUseCaseMeta(useCase) {
  const capabilityPills = (useCase.requiredCapabilities || []).map(capability => `<span class="pill">${capability}</span>`).join('');
  el('useCaseMeta').innerHTML = `
    <div><span class="pill">${useCase.category}</span><span class="pill">${useCase.pattern}</span><span class="pill">${useCase.complexity}</span></div>
    <p>${useCase.desc}</p>
    <div>${capabilityPills}</div>
    <div class="kv"><strong>Validated model families</strong><span>${useCase.models.join(', ')}</span></div>
    <div class="kv"><strong>Validated architecture</strong><span>${useCase.infra.architecture}</span></div>
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
  el('deployment').value = defaults.deployment || 'private';
  el('concurrency').value = defaults.concurrency || 0;
}

function formatPages(pages) {
  return (pages || []).join(', ');
}

function modelOptionLabel(model) {
  return `${model.modelName} — ${core.providerLabel(model.provider)}`;
}

function populateModelsForUseCase(useCase) {
  const models = core.getAllowedModelsForUseCase(useCase, window.NAI_VALIDATED_MODEL_CATALOG);
  const sel = el('modelSelect');
  sel.innerHTML = '';
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = modelOptionLabel(model);
    sel.appendChild(option);
  });
  if (!models.length) {
    return;
  }
  sel.value = useCase.defaultValidatedModelId || models[0].id;
  syncRuntimeAndGpu();
}

function renderSupportNote(model) {
  const supportedGpuLabels = core.getSupportedGpus(model, window.NAI_SUPPORTED_GPUS).map(gpu => gpu.shortLabel).join(', ');
  el('supportNote').innerHTML = `
    <div class="kv"><strong>Validated provider/runtime</strong><span>${core.providerLabel(model.provider)} / ${core.runtimeLabel(model.runtime)}</span></div>
    <div class="kv"><strong>Supported GPUs</strong><span>${supportedGpuLabels}</span></div>
    <div class="kv"><strong>PDF reference</strong><span>${model.sourceTable}, pages ${formatPages(model.sourcePages)}</span></div>
  `;
}

function syncRuntimeAndGpu() {
  const model = getSelectedModel();
  if (!model) {
    return;
  }

  const runtimeSelect = el('runtimeSelect');
  runtimeSelect.innerHTML = '';
  const runtimeOption = document.createElement('option');
  runtimeOption.value = model.runtime;
  runtimeOption.textContent = core.runtimeLabel(model.runtime);
  runtimeSelect.appendChild(runtimeOption);

  const gpuSelect = el('gpuSelect');
  const current = gpuSelect.value;
  const supportedGpus = core.getSupportedGpus(model, window.NAI_SUPPORTED_GPUS);
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
  }

  renderSupportNote(model);
}

function setSelected(id) {
  const useCase = core.getUseCaseById(state.filtered, id);
  state.selectedUseCase = useCase;
  renderUseCaseMeta(useCase);
  applyDefaultInputs(useCase);
  populateModelsForUseCase(useCase);
}

function getSelectedModel() {
  return core.getModelById(window.NAI_VALIDATED_MODEL_CATALOG, el('modelSelect').value);
}

function getInputs() {
  return {
    users: Number(el('users').value || 200),
    activePct: Number(el('activePct').value || 10),
    promptsPerHour: Number(el('promptsPerHour').value || 6),
    outputTokens: Number(el('outputTokens').value || 400),
    interaction: el('interaction').value,
    deployment: el('deployment').value,
    concurrency: Number(el('concurrency').value || 0)
  };
}

function currentConfig() {
  return {
    useCaseId: state.selectedUseCase?.id,
    users: el('users').value,
    activePct: el('activePct').value,
    promptsPerHour: el('promptsPerHour').value,
    outputTokens: el('outputTokens').value,
    interaction: el('interaction').value,
    deployment: el('deployment').value,
    modelSelect: el('modelSelect').value,
    gpuSelect: el('gpuSelect').value,
    concurrency: el('concurrency').value
  };
}

function applyConfig(config) {
  if (!config?.useCaseId) return;
  el('useCaseSelect').value = config.useCaseId;
  setSelected(config.useCaseId);
  el('users').value = config.users;
  el('activePct').value = config.activePct;
  el('promptsPerHour').value = config.promptsPerHour;
  el('outputTokens').value = config.outputTokens;
  el('interaction').value = core.normalizeInteraction(config.interaction);
  el('deployment').value = config.deployment || 'private';
  el('modelSelect').value = config.modelSelect || el('modelSelect').value;
  syncRuntimeAndGpu();
  el('gpuSelect').value = config.gpuSelect || el('gpuSelect').value;
  el('concurrency').value = config.concurrency || 0;
  buildRecommendation();
}

function statusPill(result) {
  return `<span class="status-pill ${result.statusTone}">${result.validationStatus}</span>`;
}

function renderValidationStatus(result) {
  el('validationStatus').innerHTML = `
    <div>${statusPill(result)}</div>
    <p>${result.validationStatus === 'Validated'
      ? 'This recommendation is a direct Nutanix Enterprise AI v2.6 validated model/runtime/GPU path.'
      : 'The selected workload exceeds the strict validated planning band. Keep the validated endpoint row, but treat higher scale as a custom validation task.'}</p>
    <div class="kv"><strong>Provider / runtime</strong><span>${result.provider} / ${result.runtime}</span></div>
    <div class="kv"><strong>Source</strong><span>${result.sourceTable}, pages ${formatPages(result.sourcePages)}</span></div>
  `;
}

function renderEndpointSizing(result) {
  el('endpointSizing').innerHTML = `
    <div class="kv"><strong>Primary validated model</strong><span>${result.model.modelName}</span></div>
    <div class="kv"><strong>Selected GPU</strong><span>${result.gpu.label}</span></div>
    <div class="kv"><strong>Minimum per endpoint</strong><span>${result.baselineTopology}</span></div>
    <div class="kv"><strong>Planning profile</strong><span>${result.scalePlan.profile.summary}</span></div>
    <div class="kv"><strong>Deployment target</strong><span>${getInputs().deployment}</span></div>
  `;
}

function renderScalePlan(result) {
  const demand = result.scalePlan.demand;
  const multiplier = result.scalePlan.validatedMultiplier;
  const total = result.totalEndpointGpus;
  el('scalePlan').innerHTML = `
    <div class="kv"><strong>Peak active users</strong><span>${demand.activeUsers.toFixed(1)}</span></div>
    <div class="kv"><strong>Estimated peak concurrency</strong><span>${result.scalePlan.targetConcurrency}</span></div>
    <div class="kv"><strong>Estimated output throughput</strong><span>${demand.outputTokensPerSecond.toFixed(1)} tokens/sec</span></div>
    <div class="kv"><strong>Replica multiplier</strong><span>${multiplier ? `${multiplier} x validated baseline` : `Exceeded strict band (>${result.scalePlan.profile.maxReplicas}x)`}</span></div>
    <div class="kv"><strong>Total endpoint GPUs</strong><span>${total ? `${total} x ${result.gpu.label}` : 'Custom validation required'}</span></div>
  `;
}

function renderPlatformBaseline(result) {
  const baseline = result.platformBaseline;
  el('platformBaseline').innerHTML = `
    <div class="kv"><strong>Control plane</strong><span>${baseline.controlPlane.nodes} nodes, ${baseline.controlPlane.vcpuPerNode} vCPU / ${baseline.controlPlane.memoryPerNodeGb} GB / ${baseline.controlPlane.storagePerNodeGb} GB each</span></div>
    <div class="kv"><strong>Worker pool</strong><span>${baseline.worker.nodes} nodes, ${baseline.worker.vcpuPerNode} vCPU / ${baseline.worker.memoryPerNodeGb} GB / ${baseline.worker.storagePerNodeGb} GB each</span></div>
    <div class="kv"><strong>Storage baseline</strong><span>${baseline.storage.rwoBlockGiB} GiB RWO block, ${baseline.storage.rwxNfsTiB} TiB NFS RWX, or ${baseline.storage.s3CompatibleTiB} TiB S3-compatible storage</span></div>
    <div class="kv"><strong>Validated capacity note</strong><span>${baseline.validatedCapacityNote}</span></div>
  `;
}

function renderGpuRows(result) {
  el('gpuTable').innerHTML = result.gpuRows.map(row => `
    <tr>
      <td>${row.gpu.label}${row.gpu.id === result.gpu.id ? ' <span class="pill">selected</span>' : ''}</td>
      <td>${row.baselineCount}</td>
      <td>${row.totalCount ? row.totalCount : 'Custom validation required'}</td>
      <td>${row.totalCount ? 'Validated' : 'Supported baseline only'}</td>
    </tr>
  `).join('');
}

function renderCompanions(result) {
  el('companions').innerHTML = result.companionModels.length
    ? result.companionModels.map(model => {
        const supported = core.getSupportedGpus(model, window.NAI_SUPPORTED_GPUS).map(gpu => gpu.shortLabel).join(', ');
        return `<li><span class="mono">${model.modelName}</span> — ${core.runtimeLabel(model.runtime)} (${supported})</li>`;
      }).join('')
    : '<li>No additional validated companion services are required for the default strict path.</li>';
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

function renderResults() {
  const result = state.lastResult;
  if (!result) return;

  el('emptyState').classList.add('hidden');
  el('results').classList.remove('hidden');

  if (result.statusTone === 'blocked') {
    el('validationStatus').innerHTML = `<div>${statusPill(result)}</div><p>${result.message}</p>`;
    el('endpointSizing').innerHTML = '';
    el('scalePlan').innerHTML = '';
    el('platformBaseline').innerHTML = '';
    el('gpuTable').innerHTML = '';
    el('companions').innerHTML = '<li>No validated companion services available.</li>';
    el('componentOverhead').innerHTML = '';
    el('questions').innerHTML = '<li>Use a custom validation path outside strict NAI v2.6 mode.</li>';
    return;
  }

  renderValidationStatus(result);
  renderEndpointSizing(result);
  renderScalePlan(result);
  renderPlatformBaseline(result);
  renderGpuRows(result);
  renderCompanions(result);
  renderComponentOverhead(result);
  renderQuestions(result);
}

function buildRecommendation() {
  const useCase = state.selectedUseCase;
  const model = getSelectedModel();
  const result = core.buildRecommendation({
    useCase,
    model,
    gpuId: el('gpuSelect').value,
    gpuCatalog: window.NAI_SUPPORTED_GPUS,
    platformBaseline: window.NAI_PLATFORM_BASELINE,
    componentOverhead: window.NAI_COMPONENT_OVERHEAD,
    inputs: getInputs(),
    catalog: window.NAI_VALIDATED_MODEL_CATALOG
  });
  state.lastResult = result;
  renderResults();
}

function uuid() {
  return 'cfg-' + crypto.randomUUID();
}

el('useCaseSearch').addEventListener('input', event => {
  const query = event.target.value.toLowerCase();
  state.filtered = core.getVisibleUseCases(window.AI_USE_CASES).filter(useCase =>
    [useCase.name, useCase.category, useCase.pattern, useCase.desc].join(' ').toLowerCase().includes(query)
  );
  populateUseCases(state.filtered);
});

el('useCaseSelect').addEventListener('change', event => setSelected(event.target.value));
el('modelSelect').addEventListener('change', syncRuntimeAndGpu);
el('recommendBtn').addEventListener('click', buildRecommendation);

el('saveBtn').addEventListener('click', () => {
  if (!state.selectedUseCase) return;
  const id = uuid();
  localStorage.setItem(id, JSON.stringify(currentConfig()));
  el('configId').textContent = id;
  alert(`Saved configuration as ${id}`);
});

el('loadBtn').addEventListener('click', () => {
  const id = prompt('Enter configuration ID');
  if (!id) return;
  const raw = localStorage.getItem(id.trim());
  if (!raw) {
    alert('Configuration not found in this browser.');
    return;
  }
  applyConfig(JSON.parse(raw));
  el('configId').textContent = id.trim();
});

populateUseCases(state.filtered);
