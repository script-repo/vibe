const GPU_CATALOGUE = [
  { model: 'NVIDIA RTX 6000 Pro (Blackwell)', vram_gb: 96, price_min: 1.2, price_max: 3.2, perfClass: 'high', goTo: true, segment: 'default-datacenter' },
  { model: 'NVIDIA H100 SXM / NVL', vram_gb: 80, price_min: 2.4, price_max: 6.5, perfClass: 'very-high', goTo: false, segment: 'premium' },
  { model: 'NVIDIA H200 SXM / NVL', vram_gb: 141, price_min: 3.0, price_max: 8.0, perfClass: 'very-high', goTo: false, segment: 'premium-memory' },
  { model: 'NVIDIA L40S', vram_gb: 48, price_min: 1.0, price_max: 2.6, perfClass: 'high', goTo: false, segment: 'balanced' },
  { model: 'NVIDIA L4', vram_gb: 24, price_min: 0.35, price_max: 0.95, perfClass: 'entry', goTo: false, segment: 'edge-small' },
  { model: 'NVIDIA B200', vram_gb: 180, price_min: 4.5, price_max: 12.0, perfClass: 'ultra', goTo: false, segment: 'premium-blackwell' },
  { model: 'NVIDIA B300', vram_gb: 288, price_min: 6.0, price_max: 15.0, perfClass: 'ultra', goTo: false, segment: 'premium-blackwell-ultra' },
  { model: 'NVIDIA GB Series', vram_gb: 186, price_min: 7.0, price_max: 18.0, perfClass: 'ultra', goTo: false, segment: 'rack-scale' }
];

const el = id => document.getElementById(id);
const state = { selected: null, filtered: [...window.AI_USE_CASES], lastResult: null };

function populateUseCases(list) {
  const sel = el('useCaseSelect');
  sel.innerHTML = '';
  list.forEach(uc => {
    const opt = document.createElement('option');
    opt.value = uc.id;
    opt.textContent = `${uc.name} — ${uc.category}`;
    sel.appendChild(opt);
  });
  if (list.length) {
    sel.value = list[0].id;
    setSelected(list[0].id);
  }
}

function populateModels() {
  const sel = el('modelSelect');
  sel.innerHTML = '<option value="">Auto-select from Nutanix Enterprise AI list</option>';
  window.NAI_SUPPORTED_MODELS.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.name} — ${m.fit}`;
    sel.appendChild(opt);
  });
}

function defaultSizingProfile(uc) {
  const complexityMap = {
    low: { activePct: 8, promptsPerHour: 4, inputTokens: 800, outputTokens: 250 },
    medium: { activePct: 10, promptsPerHour: 6, inputTokens: 1200, outputTokens: 400 },
    high: { activePct: 12, promptsPerHour: 8, inputTokens: 1800, outputTokens: 650 }
  };
  const base = complexityMap[uc.complexity] || complexityMap.medium;
  const pattern = (uc.pattern || '').toLowerCase();
  const latency = (uc.defaults?.latency || 'interactive').toLowerCase();
  let profile = { ...base };

  if (pattern.includes('vision') || pattern.includes('ocr') || pattern.includes('vlm')) {
    profile = { ...profile, promptsPerHour: 10, inputTokens: 600, outputTokens: 150 };
  }
  if (pattern.includes('speech')) {
    profile = { ...profile, promptsPerHour: 3, inputTokens: 3000, outputTokens: 350 };
  }
  if (pattern.includes('agentic')) {
    profile = { ...profile, promptsPerHour: 4, inputTokens: 2500, outputTokens: 800 };
  }
  if (latency === 'real-time') {
    profile.activePct = Math.max(profile.activePct, 20);
    profile.promptsPerHour = Math.max(profile.promptsPerHour, 12);
    profile.outputTokens = Math.min(profile.outputTokens, 180);
  }
  if (latency === 'batch') {
    profile.activePct = 100;
    profile.promptsPerHour = Math.max(profile.promptsPerHour, 20);
  }
  return profile;
}

function setSelected(id) {
  const uc = window.AI_USE_CASES.find(x => x.id === id);
  state.selected = uc;
  const d = uc.defaults || {};
  const profile = defaultSizingProfile(uc);
  el('users').value = d.users || 200;
  el('activePct').value = profile.activePct;
  el('promptsPerHour').value = profile.promptsPerHour;
  el('inputTokens').value = profile.inputTokens;
  el('outputTokens').value = profile.outputTokens;
  el('concurrency').value = d.concurrency || 0;
  el('interaction').value = d.latency || 'interactive';
  el('deployment').value = d.deployment || 'hybrid';
  renderUseCaseMeta(uc);
  autoSelectModelForUseCase(uc);
}

function autoSelectModelForUseCase(uc) {
  const pattern = (uc.pattern || '').toLowerCase();
  const complexity = uc.complexity;
  let targetId = 'llama-3.1-8b';
  if (pattern.includes('code') || pattern.includes('sql')) targetId = 'codellama-7b';
  else if (complexity === 'high' && (pattern.includes('agentic') || pattern.includes('graph'))) targetId = 'llama-3.3-70b';
  else if (complexity === 'high') targetId = 'llama-3.1-70b';
  else if (pattern.includes('moe') || (uc.desc || '').toLowerCase().includes('mixed enterprise reasoning')) targetId = 'mixtral-8x22b';
  else if (complexity === 'medium') targetId = 'mistral-nemo';
  el('modelSelect').value = targetId;
}

function renderUseCaseMeta(uc) {
  el('useCaseMeta').innerHTML = `
    <div><span class="pill">${uc.category}</span><span class="pill">${uc.pattern}</span><span class="pill">${uc.complexity}</span></div>
    <p>${uc.desc}</p>
    <div class="kv"><strong>Typical models</strong><span>${uc.models.join(', ')}</span></div>
    <div class="kv"><strong>Reference architecture</strong><span>${uc.infra.architecture}</span></div>`;
}

function bytesPerPrecision(p) {
  return p === 'fp32' ? 4 : p === 'fp16' ? 2 : p === 'int8' ? 1 : 0.5;
}

function getSelectedModel() {
  const id = el('modelSelect').value;
  return window.NAI_SUPPORTED_MODELS.find(m => m.id === id) || window.NAI_SUPPORTED_MODELS[0];
}

function interactionLoadFactor(interaction) {
  return interaction === 'real-time' ? 1.35 : interaction === 'near-real-time' ? 1.15 : interaction === 'batch' ? 0.9 : 1;
}

function patternOverheadFactor(uc) {
  const p = (uc.pattern || '').toLowerCase();
  if (p.includes('agentic')) return 1.25;
  if (p.includes('graph')) return 1.15;
  if (p.includes('rerank') || p.includes('workflow')) return 1.1;
  if (p.includes('ocr') || p.includes('vlm') || p.includes('vision')) return 1.1;
  return 1;
}

function perGpuOutputTps(paramsB, interaction, perfClass, priority) {
  const baseBySize = paramsB >= 70 ? 12 : paramsB >= 47 ? 18 : paramsB >= 12 ? 48 : paramsB >= 8 ? 70 : 95;
  const perfMultiplier = perfClass === 'ultra' ? 2.2 : perfClass === 'very-high' ? 1.6 : perfClass === 'high' ? 1.2 : perfClass === 'entry' ? 0.7 : 1;
  const interactionMultiplier = interaction === 'real-time' ? 0.85 : interaction === 'near-real-time' ? 0.95 : interaction === 'batch' ? 1.25 : 1;
  const priorityMultiplier = priority === 'latency' ? 0.9 : priority === 'cost' ? 1.05 : 1;
  return baseBySize * perfMultiplier * interactionMultiplier * priorityMultiplier;
}

function concurrencyPerGpu(paramsB, interaction, perfClass) {
  const base = paramsB >= 70 ? 2 : paramsB >= 47 ? 3 : paramsB >= 12 ? 6 : 8;
  const perfBump = perfClass === 'ultra' ? 2 : perfClass === 'very-high' ? 1 : perfClass === 'entry' ? -1 : 0;
  let conc = Math.max(1, base + perfBump);
  if (interaction === 'real-time') conc = Math.max(1, Math.floor(conc * 0.6));
  if (interaction === 'near-real-time') conc = Math.max(1, Math.floor(conc * 0.8));
  if (interaction === 'batch') conc = conc * 2;
  return conc;
}

function estimateActiveConcurrency({ users, activePct, promptsPerHour, outputTokens, interaction, burstFactor }) {
  const activeUsers = Math.max(1, users * (activePct / 100));
  const requestsPerSecond = (activeUsers * promptsPerHour) / 3600;
  const secondsPerRequest = 8 + (outputTokens / (interaction === 'real-time' ? 45 : interaction === 'near-real-time' ? 55 : interaction === 'batch' ? 140 : 70));
  const concurrency = Math.max(1, Math.ceil(requestsPerSecond * secondsPerRequest * burstFactor));
  return { activeUsers, requestsPerSecond, secondsPerRequest, concurrency };
}

function estimateMemoryRequirement(uc, paramsB, precision, interaction, computedConcurrency, inputTokens, outputTokens) {
  const baseModelGb = paramsB * 1e9 * bytesPerPrecision(precision) / (1024 ** 3);
  const kvPerRequestGb = Math.max(0.25, ((inputTokens + outputTokens) / 4096) * (paramsB >= 47 ? 2.3 : paramsB >= 12 ? 1.0 : 0.6));
  const kvConcurrencyGb = kvPerRequestGb * Math.min(computedConcurrency, interaction === 'batch' ? 6 : 4);
  const serviceOverheadGb = paramsB >= 47 ? 10 : paramsB >= 12 ? 6 : 4;
  const patternGb = Math.max(0, (uc.infra?.gpuMemoryGb || 0) - 24) * 0.2;
  return {
    baseModelGb,
    kvPerRequestGb,
    totalGb: baseModelGb + kvConcurrencyGb + serviceOverheadGb + patternGb
  };
}

function gpuPreferenceScore(gpu, strategy) {
  const { deployment, interaction, paramsB } = strategy;
  let score = 0;
  if (gpu.goTo) score -= 2.5;
  if (gpu.model.includes('RTX 6000 Pro') && paramsB <= 70 && deployment !== 'edge') score -= 1.5;
  if (gpu.model.includes('L4') && deployment === 'edge' && paramsB <= 12) score -= 3;
  if (gpu.model.includes('L4') && paramsB > 12) score += 3;
  if ((gpu.model.includes('B200') || gpu.model.includes('B300') || gpu.model.includes('GB Series')) && paramsB < 40 && interaction !== 'real-time') score += 2.5;
  if (paramsB >= 70 && gpu.vram_gb < 96) score += 1.5;
  return score;
}

function recommendGpus(strategy) {
  const { memoryGb, requiredConcurrency, outputTokensPerSecondNeeded, paramsB, interaction, preferred, allowMulti, priority, targetUtilization, deployment } = strategy;
  let gpus = [...GPU_CATALOGUE];
  if (preferred.length) {
    gpus = gpus.filter(g => preferred.some(p => g.model.toLowerCase().includes(p.toLowerCase())));
  }
  if (!gpus.length) gpus = [...GPU_CATALOGUE];

  return gpus.map(g => {
    const memGpuCount = Math.max(1, Math.ceil(memoryGb / g.vram_gb));
    const perGpuTps = perGpuOutputTps(paramsB, interaction, g.perfClass, priority);
    const effectivePerGpuTps = perGpuTps * (targetUtilization / 100);
    const computeGpuCount = Math.max(1, Math.ceil(outputTokensPerSecondNeeded / Math.max(1, effectivePerGpuTps)));
    const concPerGpu = concurrencyPerGpu(paramsB, interaction, g.perfClass);
    const concGpuCount = Math.max(1, Math.ceil(requiredConcurrency / concPerGpu));
    const num = Math.max(memGpuCount, computeGpuCount, concGpuCount);
    return {
      ...g,
      memGpuCount,
      computeGpuCount,
      concGpuCount,
      num,
      total: num * g.vram_gb,
      cmin: num * g.price_min,
      cmax: num * g.price_max,
      perGpuTps,
      concPerGpu,
      prefScore: gpuPreferenceScore(g, { deployment, interaction, paramsB })
    };
  }).filter(g => allowMulti || g.num === 1)
    .sort((a, b) => (a.num + a.prefScore) - (b.num + b.prefScore) || a.cmin - b.cmin);
}

function buildRecommendation() {
  const uc = state.selected;
  const selectedModel = getSelectedModel();
  const users = parseInt(el('users').value || '200', 10);
  const activePct = parseFloat(el('activePct').value || '10');
  const promptsPerHour = parseFloat(el('promptsPerHour').value || '6');
  const inputTokens = parseFloat(el('inputTokens').value || '1200');
  const outputTokens = parseFloat(el('outputTokens').value || '400');
  const interaction = el('interaction').value;
  const deployment = el('deployment').value;
  const modelPosture = el('modelPosture').value;
  const priority = el('priority').value;
  const precision = el('precision').value;
  const allowMulti = el('allowMultiGpu').checked;
  const preferred = el('preferredGpus').value.split(',').map(s => s.trim()).filter(Boolean);
  const burstFactor = parseFloat(el('burstFactor').value || '1.3');
  const targetUtilization = parseFloat(el('targetUtilization').value || '65');
  const overrideConcurrency = parseInt(el('concurrency').value || '0', 10);

  const paramsB = selectedModel.paramsB;
  const activity = estimateActiveConcurrency({ users, activePct, promptsPerHour, outputTokens, interaction, burstFactor });
  const requiredConcurrency = overrideConcurrency > 0 ? overrideConcurrency : activity.concurrency;
  const outputTokensPerSecondNeeded = activity.requestsPerSecond * outputTokens * interactionLoadFactor(interaction) * patternOverheadFactor(uc);
  const memory = estimateMemoryRequirement(uc, paramsB, precision, interaction, requiredConcurrency, inputTokens, outputTokens);

  const gpuOptions = recommendGpus({
    memoryGb: memory.totalGb,
    requiredConcurrency,
    outputTokensPerSecondNeeded,
    paramsB,
    interaction,
    preferred,
    allowMulti,
    priority,
    targetUtilization,
    deployment
  }).slice(0, 5);
  const top = gpuOptions[0];

  let approach = `${uc.name} should be sized from peak active demand rather than named users. `;
  approach += `For ${users} named users, the advisor assumes ${activePct}% are active at peak and ${promptsPerHour} prompts per active user per hour. `;
  approach += `That yields about ${requiredConcurrency} concurrent requests and ${outputTokensPerSecondNeeded.toFixed(1)} output tokens/sec at peak. `;
  approach += `The selected Nutanix Enterprise AI model is ${selectedModel.name}. `;
  approach += `${top.model} is the default recommendation because it balances datacenter fit, memory headroom, and practical deployment size.`;

  const sizingHtml = `
    <div class="kv"><strong>Selected model</strong><span>${selectedModel.name}</span></div>
    <div class="kv"><strong>Estimated model size</strong><span>${paramsB}B parameters</span></div>
    <div class="kv"><strong>Peak active users</strong><span>${activity.activeUsers.toFixed(1)}</span></div>
    <div class="kv"><strong>Estimated peak concurrency</strong><span>${requiredConcurrency}</span></div>
    <div class="kv"><strong>Output throughput target</strong><span>${outputTokensPerSecondNeeded.toFixed(1)} tokens/sec</span></div>
    <div class="kv"><strong>Memory requirement</strong><span>${memory.totalGb.toFixed(1)} GB GPU memory</span></div>
    <div class="kv"><strong>Recommended baseline</strong><span>${top.num} × ${top.model}</span></div>
    <div class="kv"><strong>Why this count</strong><span>memory ${top.memGpuCount}, concurrency ${top.concGpuCount}, throughput ${top.computeGpuCount}</span></div>`;

  const architecture = `${uc.infra.architecture}. Deploy inference on ${deployment}, keep retrieval/data services close to the system of record, and scale the inference tier independently from ingest and vector services.`;

  const tradeoffs = [
    `${GPU_CATALOGUE[0].model} is the default go-to for most enterprise inference and RAG use cases because 96GB gives strong memory headroom without jumping straight to premium SXM-scale platforms.`,
    `H100/H200, B200/B300, and GB-series options are better fits when you need larger model memory, higher throughput density, or premium latency headroom.`,
    `L40S remains a balanced alternative, while L4 is intentionally kept for very small edge workloads.`,
    `${modelPosture === 'frontier' ? 'A frontier API posture may reduce local GPU count, but it changes control, cost, and data-residency trade-offs.' : 'A self-hosted posture increases infrastructure responsibility but gives more control and predictable steady-state economics.'}`
  ];

  const questions = [
    `What latency SLA matters most: first-token latency, full response time, or batch completion window?`,
    `Will this be a pilot, departmental rollout, or enterprise-wide production service?`,
    `Does the client need HA / N+1 capacity, or is this a single-cluster starting point?`,
    `Is there a separate embedding, reranking, OCR, or agent tool tier that should be sized independently?`,
    `Does the client want to standardize on ${GPU_CATALOGUE[0].model} unless the workload clearly forces H100/H200 or Blackwell-scale platforms?`
  ];

  state.lastResult = {
    uc,
    selectedModel,
    approach,
    sizingHtml,
    architecture,
    tradeoffs,
    questions,
    gpuOptions,
    activity,
    memory,
    outputTokensPerSecondNeeded,
    paramsB
  };
  renderResults();
}

function renderResults() {
  const r = state.lastResult;
  if (!r) return;
  el('emptyState').classList.add('hidden');
  el('results').classList.remove('hidden');
  el('approach').innerHTML = `<p>${r.approach}</p>
    <div class="kv"><strong>Selected Nutanix Enterprise AI model</strong><span>${r.selectedModel.name}</span></div>
    <div class="kv"><strong>Use-case pattern</strong><span>${r.uc.pattern}</span></div>
    <div class="kv"><strong>Sizing method</strong><span>Memory fit + active-user concurrency + throughput headroom</span></div>`;
  el('sizing').innerHTML = r.sizingHtml;
  el('architecture').innerHTML = `<p>${r.architecture}</p>`;
  el('tradeoffs').innerHTML = '<ul>' + r.tradeoffs.map(x => `<li>${x}</li>`).join('') + '</ul>';
  el('questions').innerHTML = r.questions.map(x => `<li>${x}</li>`).join('');
  el('gpuTable').innerHTML = r.gpuOptions.map(g => `
    <tr>
      <td>${g.model}${g.goTo ? ' <span class="pill">default</span>' : ''}</td>
      <td>${g.num}</td>
      <td>${g.total} GB</td>
      <td>mem ${g.memGpuCount} / conc ${g.concGpuCount} / tput ${g.computeGpuCount}</td>
      <td>$${g.cmin.toFixed(2)}–$${g.cmax.toFixed(2)}</td>
    </tr>`).join('');
}

function uuid() { return 'cfg-' + crypto.randomUUID(); }
function currentConfig() {
  return {
    useCaseId: state.selected.id,
    users: el('users').value,
    activePct: el('activePct').value,
    promptsPerHour: el('promptsPerHour').value,
    inputTokens: el('inputTokens').value,
    outputTokens: el('outputTokens').value,
    interaction: el('interaction').value,
    deployment: el('deployment').value,
    modelPosture: el('modelPosture').value,
    modelSelect: el('modelSelect').value,
    priority: el('priority').value,
    concurrency: el('concurrency').value,
    precision: el('precision').value,
    burstFactor: el('burstFactor').value,
    targetUtilization: el('targetUtilization').value,
    preferredGpus: el('preferredGpus').value,
    allowMultiGpu: el('allowMultiGpu').checked
  };
}
function applyConfig(cfg) {
  el('useCaseSelect').value = cfg.useCaseId;
  setSelected(cfg.useCaseId);
  el('users').value = cfg.users;
  el('activePct').value = cfg.activePct || el('activePct').value;
  el('promptsPerHour').value = cfg.promptsPerHour || el('promptsPerHour').value;
  el('inputTokens').value = cfg.inputTokens || el('inputTokens').value;
  el('outputTokens').value = cfg.outputTokens || el('outputTokens').value;
  el('interaction').value = cfg.interaction;
  el('deployment').value = cfg.deployment;
  el('modelPosture').value = cfg.modelPosture;
  el('modelSelect').value = cfg.modelSelect || el('modelSelect').value;
  el('priority').value = cfg.priority;
  el('concurrency').value = cfg.concurrency;
  el('precision').value = cfg.precision;
  el('burstFactor').value = cfg.burstFactor || el('burstFactor').value;
  el('targetUtilization').value = cfg.targetUtilization || el('targetUtilization').value;
  el('preferredGpus').value = cfg.preferredGpus;
  el('allowMultiGpu').checked = cfg.allowMultiGpu;
  buildRecommendation();
}

el('useCaseSearch').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  state.filtered = window.AI_USE_CASES.filter(uc => [uc.name, uc.category, uc.pattern, uc.desc].join(' ').toLowerCase().includes(q));
  populateUseCases(state.filtered);
});
el('useCaseSelect').addEventListener('change', e => setSelected(e.target.value));
el('recommendBtn').addEventListener('click', buildRecommendation);
el('saveBtn').addEventListener('click', () => {
  if (!state.selected) return;
  const id = uuid();
  localStorage.setItem(id, JSON.stringify(currentConfig()));
  el('configId').textContent = id;
  alert(`Saved configuration as ${id}`);
});
el('loadBtn').addEventListener('click', () => {
  const id = prompt('Enter configuration ID');
  if (!id) return;
  const raw = localStorage.getItem(id.trim());
  if (!raw) return alert('Configuration not found in this browser.');
  applyConfig(JSON.parse(raw));
  el('configId').textContent = id.trim();
});

populateModels();
populateUseCases(window.AI_USE_CASES);
