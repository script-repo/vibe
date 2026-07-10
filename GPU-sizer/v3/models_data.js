window.NAI_SUPPORTED_GPUS = [
  { id: 'l40s_48g', label: 'NVIDIA L40S-48G', shortLabel: 'L40S-48G', vramGb: 48, sourcePage: 15 },
  { id: 'a100_80g', label: 'NVIDIA A100-80G', shortLabel: 'A100-80G', vramGb: 80, sourcePage: 15 },
  { id: 'h100_80g', label: 'NVIDIA H100-80G', shortLabel: 'H100-80G', vramGb: 80, sourcePage: 15 },
  { id: 'h100_nvl_94g', label: 'NVIDIA H100 NVL-94G', shortLabel: 'H100 NVL-94G', vramGb: 94, sourcePage: 15 },
  { id: 'h200_141g', label: 'NVIDIA H200-141G', shortLabel: 'H200-141G', vramGb: 141, sourcePage: 15 },
  { id: 'rtx_pro_6000_96g', label: 'NVIDIA RTX PRO 6000-96G', shortLabel: 'RTX PRO 6000-96G', vramGb: 96, sourcePage: 15 }
];

window.NAI_PLATFORM_BASELINE = {
  source: 'Nutanix-Enterprise-AI-v2_6.pdf',
  sourcePages: [16, 17, 18],
  controlPlane: { nodes: 3, vcpuPerNode: 4, memoryPerNodeGb: 16, storagePerNodeGb: 150 },
  worker: { nodes: 3, vcpuPerNode: 8, memoryPerNodeGb: 16, storagePerNodeGb: 150 },
  storage: {
    rwoBlockGiB: 55,
    rwxNfsTiB: 2,
    s3CompatibleTiB: 1
  },
  validatedCapacityNote: 'Validated baseline supports 50 inference endpoints, 150 API keys per endpoint, and 5 concurrent MLAdmin users. Dedicated GPU node pool required.',
  infrastructure: {
    sourceDocuments: [
      { document: 'Nutanix-Enterprise-AI-v2_6.pdf', pages: [16, 17, 18] },
      { document: 'NX-G10 TDM.pdf', pages: [7, 10, 11, 12, 14, 19, 25, 31, 35, 36, 39, 52, 53, 57, 58, 63, 69, 70, 72, 73, 75, 76, 78, 80, 81] },
      { document: 'NAI Design Patterns - 2026-03-10-Core.pdf', pages: [3, 4, 7, 8, 10, 11, 12] },
      { document: 'Nutanix-Kubernetes-Platform-v2_16.pdf', pages: [55, 57, 58, 790] }
    ],
    foundation: {
      topology: 'Select a pattern-backed NAI deployment: AI Pod, AI Factory, Multi-Site Nutanix AI Factory, Hybrid Cloud AI Factory, or Hybrid Inference AI Factory',
      clusterMinNodes: 3,
      clusterMaxNodes: 32,
      clusterExpansionIncrement: 1,
      minCpuCoresPerNode: 16,
      cpuGuidance: 'Use Nutanix NX G10 nodes sized from the approved G10 platform catalog; prefer NX-8150G for on-prem GPU nodes and NX-8150/NX-8170 for management and storage tiers',
      networking: 'Use G10-supported 25/100/200 GbE fabrics; design-pattern output should target 100 GbE or higher for AI Pod and AI Factory topologies',
      storage: 'Prefer all-NVMe G10 configurations; use NX-8150/NX-8170 NVMe + NST only for dedicated NUS storage patterns',
      replicationFactor: 2,
      highAvailabilityReservation: 'Use the AI Pod / AI Factory pattern rather than GPT-in-a-Box split-node assumptions',
      gpuGuidance: 'In G10 on-prem Nutanix hardware, the NAI-compatible GPU overlap is L40S and RTX PRO 6000 on NX-8150G G10. RTX PRO 6000 is marked post-GA / technical-feasibility dependent in the TDM.',
      rack: {
        racks: 1,
        rackUnits: 42,
        torSwitches: 2,
        managementSwitches: 1
      }
    },
    managementPlanes: {
      ncp: 'NCP management plane',
      nkp: 'NKP management plane',
      nus: 'Nutanix Unified Storage for NFS and Object',
      nci: 'Nutanix Cloud Infrastructure foundation'
    },
    nkp: {
      productionMinimum: {
        licenseTier: 'Pro or Ultimate',
        controlPlane: { nodes: 3, vcpuPerNode: 4, memoryPerNodeGiB: 16, diskPerNodeGiB: 80 },
        worker: { nodes: 4, vcpuPerNode: 8, memoryPerNodeGiB: 32, diskPerNodeGiB: 80 },
        controlPlaneEndpoint: 'External load balancer recommended; built-in virtual IP is the fallback',
        hostRequirements: [
          'Root volume usage below 85%',
          'Required NKP ports open',
          'firewalld disabled',
          'Swap disabled',
          'Use a production CSI storage provider instead of localvolumeprovisioner'
        ]
      },
      naiPatternBaseline: {
        aiPodStartNodes: 3,
        aiPodScaleLimitNodes: 32,
        aiFactoryNotes: 'Use a dedicated management and storage cluster with separate GPU-enabled server tiers when the workload grows beyond a compact AI Pod.',
        networking: [
          'Cilium',
          'Kube-VIP',
          'MetalLB',
          'Traefik',
          'Istio Mesh',
          'Cert-Manager'
        ]
      }
    },
    designPatterns: [
      {
        id: 'ai-pod',
        name: 'AI Pod',
        sourcePages: [7],
        description: 'Integrated NAI + NKP + NUS + NCI full stack on a Nutanix AI Pod.',
        deploymentModes: ['on-prem'],
        summary: 'Start with a 3-node AI Pod and scale to 32 nodes in a pod.',
        defaultNodeModel: 'nx-8150g-g10',
        onPremRequired: true,
        layers: [
          'Generative AI app',
          'Nutanix Enterprise AI',
          'Nutanix Kubernetes Platform',
          'Nutanix Unified Storage',
          'Nutanix Cloud Infrastructure'
        ]
      },
      {
        id: 'ai-factory',
        name: 'AI Factory',
        sourcePages: [8],
        description: 'Dedicated management and storage cluster with separate GPU-enabled inference tiers.',
        deploymentModes: ['on-prem'],
        summary: 'Use a management/storage cluster plus one or more GPU-enabled server pools.',
        defaultNodeModel: 'nx-8150g-g10',
        onPremRequired: true,
        layers: [
          'Generative AI app',
          'NAI',
          'NKP or partner Kubernetes',
          'HCI management and storage cluster',
          'GPU-enabled server tier'
        ]
      },
      {
        id: 'multi-site-ai-factory',
        name: 'Multi-Site Nutanix AI Factory',
        sourcePages: [10],
        description: 'Two or more Nutanix sites expose local inference endpoints behind unified inferencing endpoints.',
        deploymentModes: ['multi-site'],
        summary: 'Use per-site inference endpoints with unified inferencing endpoints at each site.',
        defaultNodeModel: 'nx-8150g-g10',
        onPremRequired: true,
        layers: [
          'Site A AI Pod / AI Factory',
          'Site B AI Pod / AI Factory',
          'Unified inferencing endpoints'
        ]
      },
      {
        id: 'hybrid-cloud-ai-factory',
        name: 'Hybrid Cloud AI Factory',
        sourcePages: [11],
        description: 'On-prem Nutanix site paired with hyperscaler GPU Kubernetes environments.',
        deploymentModes: ['hybrid-cloud'],
        summary: 'Blend on-prem NAI with EKS, AKS, or GKE GPU capacity.',
        defaultNodeModel: 'nx-8150g-g10',
        onPremRequired: false,
        layers: [
          'On-prem Nutanix Enterprise AI',
          'Unified inferencing endpoint',
          'Hyperscaler GPU Kubernetes site'
        ]
      },
      {
        id: 'hybrid-inference-ai-factory',
        name: 'Hybrid Inference AI Factory',
        sourcePages: [12],
        description: 'On-prem NAI plus external OpenAI-compatible or Bedrock-style inference providers behind a unified endpoint.',
        deploymentModes: ['hybrid-inference'],
        summary: 'Use an AI gateway with token-based rate limiting, fallback, and HA across local and remote inference.',
        defaultNodeModel: 'nx-8150g-g10',
        onPremRequired: false,
        layers: [
          'On-prem inference endpoints',
          'Unified endpoint / AI gateway',
          'External inference providers'
        ]
      }
    ],
    g10Catalog: {
      managementProfiles: [
        {
          id: 'nx-8150-g10',
          label: 'NX-8150 G10',
          role: 'Management / storage / dense HCI',
          cpu: 'Dual Intel Xeon 6500P/6700P',
          cores: '32-128 cores per node',
          memory: '512 GB to 4 TB',
          storage: '20 x NVMe',
          networking: '0-3 NICs at 10/25/100/200 GbE',
          notes: 'Primary G10 choice for NUS-heavy or management/storage clusters'
        },
        {
          id: 'nx-8170-g10',
          label: 'NX-8170 G10',
          role: 'Dense 1U management / storage HCI',
          cpu: 'Dual Intel Xeon 6500P/6700P',
          cores: '16-72 cores per node',
          memory: '256 GB to 4 TB',
          storage: '12 x NVMe or SSD',
          networking: '0-2 NICs at 10/25/100/200 GbE',
          notes: 'Good fit when the management/storage cluster needs 1U density'
        },
        {
          id: 'nx-1175s-g10',
          label: 'NX-1175S G10',
          role: 'Edge / ROBO adjunct',
          cpu: 'Single Intel Xeon 6500P/6700P',
          cores: '8-36 cores per node',
          memory: '128 GB to 1 TB',
          storage: '4 x LFF with NVMe or NVMe + HDD',
          networking: '0-3 NICs at 10/25 GbE',
          notes: 'Useful for edge or storage-adjacent roles, but not for current NAI validated GPU rows'
        }
      ],
      gpuProfiles: [
        {
          id: 'nx-8150g-g10',
          label: 'NX-8150G G10',
          role: 'Primary G10 GPU node for on-prem NAI',
          cpu: 'Dual Intel Xeon 6500P/6700P',
          cores: '32-64 cores per node',
          memory: '512 GB to 4 TB',
          storage: '8 x NVMe',
          networking: '0-3 NICs at 10/25/100/200 GbE',
          supportedGpuCounts: {
            l40s_48g: { maxPerNode: 2, availability: 'GA' },
            rtx_pro_6000_96g: { maxPerNode: 2, availability: 'Post GA / technical-feasibility dependent' }
          }
        },
        {
          id: 'nx-8155as-g10',
          label: 'NX-8155AS G10',
          role: 'Single-socket AMD GPU-capable G10 node',
          cpu: 'Single AMD EPYC 9005',
          cores: '24-128 cores per node',
          memory: '256 GB to 3,072 GB',
          storage: '12 x NVMe',
          networking: 'Up to 200 GbE',
          supportedGpuCounts: {},
          notes: 'Supports L4 and A16 only in the TDM, so it does not intersect with the current NAI validated on-prem GPU list'
        }
      ]
    },
    hardwareReference: {
      profileId: 'g10-ai-pod-reference',
      label: 'G10 AI Pod reference',
      applicability: 'Reference topology aligned to the AI Pod design pattern and NX-G10 TDM',
      rack: {
        racks: 1,
        rackUnits: 42,
        torSwitches: 2,
        managementSwitches: 1
      },
      cluster: {
        podMinNodes: 3,
        podScaleMaxNodes: 32,
        primaryGpuNodeModel: 'NX-8150G G10',
        managementNodeModel: 'NX-8150 G10'
      },
      managementNode: {
        platform: 'NX-8150 G10',
        cpu: 'Dual Intel Xeon 6500P/6700P',
        memory: '512 GB to 4 TB',
        storage: '20 x NVMe',
        networking: '10/25/100/200 GbE'
      },
      gpuNode: {
        platform: 'NX-8150G G10',
        cpu: 'Dual Intel Xeon 6500P/6700P',
        memory: '512 GB to 4 TB',
        storage: '8 x NVMe',
        networking: '10/25/100/200 GbE',
        gpu: 'Up to 2 x L40S or 2 x RTX PRO 6000'
      },
      alternativeProfiles: [
        {
          platform: 'NX-8170 G10',
          role: 'Dense management / storage cluster',
          storage: '12 x NVMe or SSD',
          notes: 'Use when the management and storage tier needs denser 1U packaging'
        }
      ],
      bomRows: [
        { item: 'AI Pod cluster nodes', quantity: 3, spec: '3-node AI Pod starting footprint', source: 'Design Patterns p7' },
        { item: 'NX-8150G G10 GPU nodes', quantity: 3, spec: 'Dual Intel Xeon 6500P/6700P, 8 x NVMe, 0-3 NICs, 2 x L40S or 2 x RTX PRO 6000 per node', source: 'NX-G10 TDM p35-p36, p57-p58, p81' },
        { item: 'NX-8150 G10 management/storage nodes', quantity: 3, spec: 'Dual Intel Xeon 6500P/6700P, 20 x NVMe, 10/25/100/200 GbE', source: 'NX-G10 TDM p70, p72, p80' },
        { item: 'NX-8170 G10 alternative management/storage nodes', quantity: 3, spec: '1U dense management/storage option, 12 x NVMe/SSD, 10/25/100/200 GbE', source: 'NX-G10 TDM p25, p70, p72, p75-p76' },
        { item: '100 GbE top-of-rack switches', quantity: 2, spec: 'Fabric for AI Pod / AI Factory networking', source: 'G10 network guidance + pattern output' },
        { item: 'Management switch', quantity: 1, spec: 'Out-of-band management network', source: 'Pattern-aligned reference rack' }
      ]
    }
  }
};

window.NAI_COMPONENT_OVERHEAD = [
  { label: 'NAI API', cpu: '8 vCPU', memory: '4 GiB', purpose: 'API endpoint' },
  { label: 'NAI DB', cpu: '4 vCPU', memory: '4 GiB', purpose: 'Application data' },
  { label: 'ClickHouse Server', cpu: '4 vCPU', memory: '8 GiB', purpose: 'Observability data store' },
  { label: 'NAI UI', cpu: '2 vCPU', memory: '2 GiB', purpose: 'Frontend UI' },
  { label: 'Model Controller', cpu: '500m', memory: '0.49 GiB', purpose: 'LLM model controller' },
  { label: 'Gateway Control Plane', cpu: '300m', memory: '1 GiB', purpose: 'Envoy Gateway control plane' },
  { label: 'Gateway Data Plane', cpu: '1 vCPU', memory: '4 GiB', purpose: 'Ingress data plane proxy' }
];

window.NAI_VALIDATED_MODEL_CATALOG = [
  {
    id: 'hf-meta-llama-3.1-8b-instruct',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'Meta-Llama-3.1-8B-Instruct',
    modalities: ['text'],
    taskTags: ['chat', 'rag', 'assistant'],
    planningClass: 'small-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['internal-chatbot', 'customer-support-rag', 'knowledge-search', 'hr-policy-bot', 'it-helpdesk', 'onboarding-assistant', 'branch-assistant'],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'hf-meta-llama-3.1-70b-instruct',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'Meta-Llama-3.1-70B-Instruct',
    modalities: ['text'],
    taskTags: ['reasoning', 'agentic', 'rag'],
    planningClass: 'large-text',
    supportedGpuCounts: { l40s_48g: 4, a100_80g: 2, h100_80g: 2, h100_nvl_94g: 2, h200_141g: 2, rtx_pro_6000_96g: 2 },
    defaultUseCases: ['executive-copilot', 'security-triage', 'legal-discovery', 'operations-war-room'],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'hf-meta-llama-3.3-70b-instruct',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'Meta-Llama-3.3-70B-Instruct',
    modalities: ['text'],
    taskTags: ['reasoning', 'agentic', 'premium'],
    planningClass: 'large-text',
    supportedGpuCounts: { l40s_48g: 4, a100_80g: 2, h100_80g: 2, h100_nvl_94g: 2, h200_141g: 2, rtx_pro_6000_96g: 2 },
    defaultUseCases: ['fraud-investigation', 'graph-rag-investigation', 'agentic-orchestration'],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-codellama-7b-instruct',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'CodeLlama-7B-Instruct-hf',
    modalities: ['text', 'code'],
    taskTags: ['code', 'assistant'],
    planningClass: 'small-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'hf-codellama-34b-instruct',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'CodeLlama-34B-Instruct-hf',
    modalities: ['text', 'code'],
    taskTags: ['code', 'assistant'],
    planningClass: 'medium-text',
    supportedGpuCounts: { l40s_48g: 2, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'hf-meta-llama-3.2-11b-vision-instruct',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Llama-3.2-11B-Vision-Instruct',
    modalities: ['vision', 'text'],
    taskTags: ['vision', 'document-ai', 'multimodal'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['invoice-processing', 'claims-processing', 'image-captioning', 'edge-ocr', 'multimodal-search'],
    sourceTable: 'Table 8',
    sourcePages: [19, 20]
  },
  {
    id: 'hf-meta-llama-3.2-90b-vision-instruct',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Llama-3.2-90B-Vision-Instruct',
    modalities: ['vision', 'text'],
    taskTags: ['vision', 'document-ai', 'premium'],
    planningClass: 'large-text',
    supportedGpuCounts: { l40s_48g: 4, a100_80g: 4, h100_80g: 4, h100_nvl_94g: 4, h200_141g: 2, rtx_pro_6000_96g: 2 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-meta-llama-4-scout-17b-16e',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Llama-4-Scout-17B-16E',
    modalities: ['text', 'multimodal'],
    taskTags: ['reasoning', 'moe', 'premium'],
    planningClass: 'medium-text',
    supportedGpuCounts: { h100_80g: 4, h100_nvl_94g: 4, h200_141g: 2, rtx_pro_6000_96g: 4 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-meta-llama-guard-3-8b',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'Llama-Guard-3-8B',
    modalities: ['text', 'guardrail'],
    taskTags: ['guardrail', 'safety'],
    planningClass: 'guardrail',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['compliance-monitor', 'security-triage'],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-mistral-7b-instruct-v0.3',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'Mistral-7B-Instruct-v0.3',
    modalities: ['text'],
    taskTags: ['chat', 'assistant', 'generation'],
    planningClass: 'small-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['marketing-content', 'translation-service', 'etl-enrichment'],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-mixtral-8x7b-instruct-v0.1',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Mixtral-8x7B-Instruct-v0.1',
    modalities: ['text'],
    taskTags: ['reasoning', 'moe'],
    planningClass: 'medium-text',
    supportedGpuCounts: { l40s_48g: 4, a100_80g: 2, h100_80g: 2, h100_nvl_94g: 2, h200_141g: 1, rtx_pro_6000_96g: 2 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-mixtral-8x22b-instruct-v0.1',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Mixtral-8x22B-Instruct-v0.1',
    modalities: ['text'],
    taskTags: ['reasoning', 'moe'],
    planningClass: 'large-text',
    supportedGpuCounts: { a100_80g: 4, h100_80g: 4, h100_nvl_94g: 4, h200_141g: 4, rtx_pro_6000_96g: 4 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-mistral-nemo-instruct-2407',
    provider: 'hf',
    runtime: 'tgi',
    modelName: 'Mistral-Nemo-Instruct-2407',
    modalities: ['text'],
    taskTags: ['chat', 'assistant', 'rag'],
    planningClass: 'small-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['sales-account-research', 'research-assistant', 'education-tutor', 'proposal-generator', 'procurement-bot'],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-magistral-small-2506',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Magistral-Small-2506',
    modalities: ['text'],
    taskTags: ['reasoning', 'assistant'],
    planningClass: 'medium-text',
    supportedGpuCounts: { a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-devstral-small-2507',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Devstral-Small-2507',
    modalities: ['text', 'code'],
    taskTags: ['code', 'sql', 'reasoning'],
    planningClass: 'medium-text',
    supportedGpuCounts: { a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['code-assistant', 'sql-analyst'],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-ministral-3-14b-instruct-2512',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Ministral-3-14B-Instruct-2512',
    modalities: ['text'],
    taskTags: ['assistant', 'reasoning'],
    planningClass: 'medium-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 4 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'hf-ministral-3-14b-reasoning-2512',
    provider: 'hf',
    runtime: 'vllm',
    modelName: 'Ministral-3-14B-Reasoning-2512',
    modalities: ['text'],
    taskTags: ['reasoning'],
    planningClass: 'medium-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [20]
  },
  {
    id: 'other-google-vit-base-patch16-224',
    provider: 'other-validated',
    runtime: 'vllm',
    modelName: 'google/vit-base-patch16-224',
    modalities: ['vision'],
    taskTags: ['classification', 'vision'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: ['document-classification'],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'other-google-gemma-2-9b-it',
    provider: 'other-validated',
    runtime: 'tgi',
    modelName: 'gemma-2-9b-it',
    modalities: ['text'],
    taskTags: ['assistant', 'chat'],
    planningClass: 'small-text',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'other-ai2-olmo-3-32b-think',
    provider: 'other-validated',
    runtime: 'vllm',
    modelName: 'Olmo-3-32B-Think',
    modalities: ['text'],
    taskTags: ['reasoning'],
    planningClass: 'medium-text',
    supportedGpuCounts: { l40s_48g: 2, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1, rtx_pro_6000_96g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [19]
  },
  {
    id: 'nvidia-llama-3.2-nv-embedqa-1b-v2',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'llama-3.2-nv-embedqa-1b-v2',
    modalities: ['embedding', 'retrieval'],
    taskTags: ['retrieval', 'embedding'],
    planningClass: 'retrieval',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['internal-chatbot', 'knowledge-search', 'multimodal-search'],
    sourceTable: 'Table 8',
    sourcePages: [21]
  },
  {
    id: 'nvidia-llama-3.2-nv-rerankqa-1b-v2',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'llama-3.2-nv-rerankqa-1b-v2',
    modalities: ['reranker', 'retrieval'],
    taskTags: ['retrieval', 'reranking'],
    planningClass: 'retrieval',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['internal-chatbot', 'knowledge-search', 'multimodal-search'],
    sourceTable: 'Table 8',
    sourcePages: [21]
  },
  {
    id: 'nvidia-llama-3.1-nemoguard-8b-content-safety',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'llama-3.1-nemoguard-8b-content-safety',
    modalities: ['text', 'guardrail'],
    taskTags: ['guardrail', 'content-safety'],
    planningClass: 'guardrail',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['security-triage', 'phishing-analysis'],
    sourceTable: 'Table 8',
    sourcePages: [20, 21]
  },
  {
    id: 'nvidia-llama-3.1-nemoguard-8b-topic-control',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'llama-3.1-nemoguard-8b-topic-control',
    modalities: ['text', 'guardrail'],
    taskTags: ['guardrail', 'topic-control'],
    planningClass: 'guardrail',
    supportedGpuCounts: { l40s_48g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['compliance-monitor'],
    sourceTable: 'Table 8',
    sourcePages: [21]
  },
  {
    id: 'nvidia-llama-3.3-70b-instruct',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'llama-3.3-70b-instruct',
    modalities: ['text'],
    taskTags: ['reasoning', 'assistant'],
    planningClass: 'large-text',
    supportedGpuCounts: { l40s_48g: 4, h100_80g: 4, h100_nvl_94g: 4, h200_141g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [21]
  },
  {
    id: 'nvidia-gpt-oss-20b',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'gpt-oss-20b',
    modalities: ['text'],
    taskTags: ['reasoning', 'assistant'],
    planningClass: 'medium-text',
    supportedGpuCounts: { h100_80g: 1, h100_nvl_94g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [22]
  },
  {
    id: 'nvidia-gpt-oss-120b',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'gpt-oss-120b',
    modalities: ['text'],
    taskTags: ['reasoning', 'assistant'],
    planningClass: 'large-text',
    supportedGpuCounts: { h100_80g: 2, h100_nvl_94g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [22]
  },
  {
    id: 'nvidia-nemoretriever-parse',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'nemoretriever-parse',
    modalities: ['document-ai', 'retrieval'],
    taskTags: ['document-ai', 'parse'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { l40s_48g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['contract-review', 'loan-origination', 'legal-discovery'],
    sourceTable: 'Table 8',
    sourcePages: [22]
  },
  {
    id: 'nvidia-nemoretriever-ocr-v1',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'nemoretriever-ocr-v1',
    modalities: ['document-ai', 'ocr'],
    taskTags: ['document-ai', 'ocr'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { l40s_48g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['invoice-processing', 'edge-ocr', 'claims-processing'],
    sourceTable: 'Table 8',
    sourcePages: [22]
  },
  {
    id: 'nvidia-nemoretriever-table-structure-v1',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'nemoretriever-table-structure-v1',
    modalities: ['document-ai', 'ocr'],
    taskTags: ['document-ai', 'table-structure'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { l40s_48g: 1, h100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['invoice-processing', 'claims-processing'],
    sourceTable: 'Table 8',
    sourcePages: [22]
  },
  {
    id: 'nvidia-nemoretriever-graphic-elements-v1',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'nemoretriever-graphic-elements-v1',
    modalities: ['document-ai', 'vision'],
    taskTags: ['document-ai', 'graphics'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { l40s_48g: 1, a100_80g: 1, h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: ['multimodal-search'],
    sourceTable: 'Table 8',
    sourcePages: [22]
  },
  {
    id: 'nvidia-flux-1-dev',
    provider: 'nvidia',
    runtime: 'nvidia-runtime',
    modelName: 'black-forest-labs/flux.1-dev',
    modalities: ['image-generation'],
    taskTags: ['creative', 'image-generation'],
    planningClass: 'vision-doc',
    supportedGpuCounts: { h100_nvl_94g: 1, h200_141g: 1 },
    defaultUseCases: [],
    sourceTable: 'Table 8',
    sourcePages: [21]
  }
];
