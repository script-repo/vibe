# AI Workload Sizing Validation Review

Date: March 10, 2026
Scope: review of `index.html`, `script.js`, `use_cases_data.js`, and `models_data.js`

## Bottom line

The use-case catalog is directionally good, but the current advisor is not yet reliable as a sizing tool.

The biggest problem is not one bad number. It is that the app applies one text-LLM sizing path to many workload types that are not text-only LLM inference:

- speech and live assist
- OCR and document AI
- VLM and multimodal search
- CV / video analytics
- API-first / shared endpoint scenarios

That causes several recommendations to become structurally wrong, not just slightly off.

## What is already strong

- The catalog covers the right enterprise patterns: chat/RAG, agentic workflows, code, SQL, document AI, speech, multimodal, CV, and edge use cases.
- Many of the architecture strings in `use_cases_data.js` are directionally correct about pipeline stages.
- Several text-centric use cases already point to sensible starter tiers such as 24 GB, 48 GB, 80 GB, and 160 GB classes.

## System-level findings

### 1. The app says it sizes from demand, but by default it does not

Evidence:

- `script.js:83` always loads `defaults.concurrency` into the UI.
- `script.js:237` always uses that override when it is nonzero.
- All 50 use cases in `use_cases_data.js` define a nonzero `defaults.concurrency`.

Effect:

- The calculator claims to size from active users and prompt rates, but the default path is actually fixed-concurrency sizing.
- The user-count math only changes the narrative and throughput estimate, not the concurrency baseline that drives GPU count.

What it should be:

- Keep curated concurrency as a hint, not a forced override.
- Default to demand-based concurrency unless the SE explicitly turns on an override.
- Use different demand dimensions by workload type:
  - chat/RAG: active users and prompts
  - batch: records or documents per hour
  - speech: concurrent audio streams
  - vision: camera streams, FPS, and resolution

### 2. The model catalog cannot represent most of the use cases

Evidence:

- `models_data.js` contains six selectable models, all text models:
  - Llama 3.1 8B
  - Llama 3.1 70B
  - Llama 3.3 70B
  - Mixtral 8x22B
  - Mistral Nemo 12B
  - CodeLlama 7B
- 40 of the 50 use cases name model types that are not representable by that list at all.

Effect:

- Speech, OCR, VLM, CV, translation, frontier/API, and several code/SQL use cases are forced through the wrong model family.
- The use-case metadata says one thing, while the sizing engine computes for something else.

What it should be:

- Split the catalog into model families:
  - text generation
  - code generation
  - ASR
  - OCR / document VLM
  - VLM / multimodal
  - CV / video
  - embeddings
  - rerankers
  - guardrails
- Let a use case bind to one or more tiers instead of exactly one selected LLM.

### 3. Auto-selection is too coarse and often wrong

Evidence:

- `script.js:90-98` picks models mostly from pattern keywords and complexity.
- `script.js:94` maps any code or SQL pattern to `codellama-7b`.
- `script.js:96` maps any high-complexity workload that is not code/SQL/agentic/graph to `llama-3.1-70b`.

Effect:

- `call-center-live-assist` becomes a 70B text model problem even though the use case says `Small ASR` + `Llama 3.1 8B`.
- `surveillance-analytics` and `quality-inspection` become 70B text-model problems even though they are pure CV workloads.
- `meeting-summarization`, `invoice-processing`, and `edge-ocr` become Mistral Nemo text-only workloads even though they require ASR or OCR/VLM.
- `code-assistant` and `sql-analyst` are hard-wired to CodeLlama 7B rather than the use-case-listed model families.

What it should be:

- Use the use-case model families first.
- Only auto-pick within the right family.
- Never map CV, ASR, OCR, or VLM workloads to a generic text-only LLM.

### 4. The engine sizes one GPU pool, but many use cases need multiple service tiers

Evidence:

- `buildRecommendation()` in `script.js:216-304` sizes one selected model and one GPU recommendation table.
- The architecture text often includes multiple stages such as OCR, ASR, embeddings, reranking, and workflow services, but those are not sized separately.

Effect:

- The app under-models workloads that need both online inference and offline ingest.
- It cannot distinguish:
  - ASR GPUs from summarization GPUs
  - OCR/VLM GPUs from answer-generation GPUs
  - CV edge inferencing from optional LLM explanation
  - embedding/reranker sidecars from main generation endpoints

What it should be:

- Use multi-tier sizing outputs:
  - online inference tier
  - ingest/index tier
  - embeddings/reranker tier
  - OCR/VLM or ASR tier where needed
  - gateway/shared endpoint tier for API and hybrid routing

### 5. Deployment mode and model posture do not materially change sizing

Evidence:

- `script.js:225-226` reads `deployment` and `modelPosture`.
- `script.js:277` only uses `modelPosture` in a trade-off sentence.
- GPU sizing still runs even for `frontier` posture or `frontier-api` deployment.

Effect:

- A frontier/API-first use case still receives a local GPU recommendation.
- The app does not reflect the Nutanix Enterprise AI premise of shared endpoints across on-prem, edge, and public-cloud providers.

What it should be:

- `frontier` / shared-endpoint posture should default to zero local inference GPUs.
- In that mode, size:
  - gateway / policy / routing
  - caching
  - observability
  - optional local fallback endpoint

### 6. Several default enum values do not match the UI

Evidence:

- `index.html:48-61` defines the valid interaction and deployment values.
- 19 use cases use deployment defaults that are not valid options, for example:
  - `cloud or hybrid`
  - `private or hybrid`
  - `edge or cloud`
  - `any`
  - `cloud or frontier API`
- 2 use cases use latency defaults that are not valid options:
  - `batch or near-real-time`
  - `batch + interactive`

Effect:

- Those defaults cannot map cleanly into the UI control values.
- The engine then sizes with a blank or unintended mode instead of the intended one.

What it should be:

- Normalize every use case to one primary default value.
- Express mixed patterns as secondary notes or alternate scenarios.

### 7. Curated infrastructure baselines are mostly ignored by the math

Evidence:

- `script.js:163` adds only `20%` of the `infra.gpuMemoryGb` value above 24 GB into the memory estimate.

Effect:

- A curated baseline of `320 GB` does not actually mean the engine will size at 320 GB.
- The infrastructure field becomes a weak hint instead of the intended baseline.

What it should be:

- Treat curated tiers as first-class scenario templates.
- Use them directly as baseline replicas or target classes, then adjust from there.

### 8. GPU recommendation bias is too strong

Evidence:

- `script.js:174-175` strongly favors `RTX 6000 Pro (Blackwell)` whenever possible.

Effect:

- The advisor tends to drift toward that GPU even when the use-case metadata points to L4, L40S, A100, or H100 classes.

What it should be:

- Keep a preferred default, but do not overpower workload class, deployment mode, or curated use-case baseline.

### 9. The model catalog has at least one materially wrong memory assumption

Evidence:

- `models_data.js:27-32` encodes `Mixtral-8x22B` as `47B`.
- Mistral's official weights page describes Mixtral 8x22B as `141B total / 39B active`, with minimum GPU RAM figures far above a normal 47B dense model.

Effect:

- If the user selects Mixtral manually, the calculator materially understates memory.

What it should be:

- Model catalog entries need both:
  - total parameter footprint / deployment memory
  - active parameters for throughput behavior

## Example failures reproduced from the current defaults

I simulated the current logic with the use-case defaults. These outcomes show why the current engine should not be trusted yet for multimodal, streaming, or CV cases.

| Use case | Current app result | Why it is wrong |
| --- | --- | --- |
| `call-center-live-assist` | Auto-selects `Meta-Llama-3.1-70B-Instruct`, computes `80` required concurrency, and lands on `40 x NVIDIA B200` | Real-time agent assist should be sized as ASR + retrieval + small/medium assist model, not as 80-way 70B text generation |
| `surveillance-analytics` | Auto-selects `Meta-Llama-3.1-70B-Instruct` and lands on `50 x NVIDIA B200` | This is a CV workload and should be sized by camera streams, not LLM concurrency |
| `quality-inspection` | Auto-selects `Meta-Llama-3.1-70B-Instruct` and lands on `30 x NVIDIA B200` | Same issue as surveillance; wrong workload class |
| `knowledge-search` | Auto-selects `Mistral-Nemo-Instruct-2407` and lands on `13 x RTX 6000 Pro` | The fixed concurrency override and one-tier LLM sizing inflate the GPU count and ignore the actual RAG topology |
| `meeting-summarization` | Auto-selects `Mistral-Nemo-Instruct-2407` and recommends `2 x RTX 6000 Pro` | A speech pipeline should split ASR from summarization and should not be forced into a text-only default |

## Recommended baseline classes

Use these classes as the corrected starting point for the catalog.

### T1: Small text assistant / small RAG

- Typical models: 7B-8B instruct
- Correct baseline: `1 x 24-48 GB GPU per inference replica`
- Typical uses: HR bot, onboarding assistant, internal chatbot, small helpdesk, recommendation explainer

### T2: Mid text reasoning / agentic / code / SQL

- Typical models: 14B-32B class
- Correct baseline: `1 x 48-96 GB GPU` or `2 x 48 GB GPUs per replica`
- Typical uses: executive copilot default tier, code assistant, SQL analyst, graph RAG, security triage

### T3: Large 70B reasoning

- Typical models: 70B class
- Correct baseline: `2 x 96-141 GB GPUs` or managed endpoint
- Use only when quality clearly justifies it
- Do not make this the default for real-time or edge workloads

### M1: OCR / document VLM / multimodal document AI

- Typical models: OCR engines, document VLMs, small extractor/validator
- Correct baseline: `1 x 24-48 GB GPU` for OCR/VLM tier
- Add a separate `T1` or `T2` summarizer only if the workflow needs natural-language synthesis

### M2: Speech / live assist

- Typical models: ASR + summarizer or assist model
- Correct baseline: separate ASR tier plus separate `T1` or `T2` text tier
- Size by concurrent audio streams and latency SLA, not by named users

### V1: CV / video / edge vision

- Typical models: YOLO, detection, classification, segmentation
- Correct baseline: `L4 / A10 / L40S` style edge tiers sized by streams, FPS, and resolution
- Only add an LLM tier if the use case also needs narrative explanation

### API: Frontier / shared endpoint / hybrid routing

- Correct baseline: `0 local inference GPUs by default`
- Local infrastructure should be gateway, guardrails, policy, observability, cache, and fallback routing

## Per-use-case review

Status legend:

- `Close`: the use case is directionally right; fix the global engine and keep the baseline class
- `Revise`: the use case is valid, but the default model or size should change
- `Remodel`: the workload must be represented as a different class or as multiple tiers

### Text assistants, RAG, and batch

| Use case | Status | Should be sized as | Notes |
| --- | --- | --- | --- |
| Internal knowledge chatbot | Close | `T1` | Current 48 GB class is reasonable; keep as small RAG with separate embedding/vector tier |
| Customer support document Q&A | Revise | `T1`, plus `M1` if OCR is required | Current 80 GB is high for plain 8B/7B RAG; also not really "naive RAG" if reranking and OCR stay in scope |
| HR policy bot | Close | `T1` or `API` | 24 GB or API-first is fine; do not auto-switch to a 12B default |
| IT helpdesk assistant | Close | `T1` to `T2` | 8B/14B with actions is reasonable; keep retrieval and workflow tier separate |
| Field service copilot | Close | `T1` edge + central sync | 48 GB class is fine, but deployment should be normalized to one default mode |
| Enterprise knowledge search | Revise | `T1` with multiple replicas | 160 GB fixed baseline is too rigid; express as replicated small-model RAG plus vector tier |
| Predictive maintenance assistant | Close | analytics tier + `T1` explainer | The 24 GB class is reasonable if the forecasting model is separate from the LLM explainer |
| ETL data enrichment | Revise | batch `T1` | Size by records/hour, not named users; 48 GB can stay as a batch worker class |
| Loan origination assistant | Revise | `M1` + `T1` or `T2` | OCR/extraction and summarization should be split; 48 GB is a reasonable starting tier |
| Marketing content generation | Remodel | `API` or `T1/T2` self-hosted | The current app cannot represent API-first mode correctly; cloud/frontier should not force local GPUs |
| Enterprise translation service | Remodel | specialized translation tier or `API` | This should prefer NLLB or a dedicated translation model; not a generic 12B text assistant |
| Research assistant | Revise | `T2` | 14B web+RAG is reasonable, but 80 GB is a heavy default unless long context or high throughput is required |
| Education tutor | Revise | `T1` to `T2` with replicas | 160 GB is too coarse for a 7B/14B tutor; express as multiple interactive replicas |
| Proposal / RFP response assistant | Close | `T1` to `T2` | 48 GB class is reasonable; retrieval and content governance still need separate consideration |
| Procurement assistant | Close | `T1` to `T2` | 48 GB class is reasonable |
| Employee onboarding assistant | Close | `T1` | 24 GB class is reasonable |
| E-commerce shopping assistant | Revise | `T1` to `T2` with replicas + ranking tier | `320 GB` as a single baseline is too blunt for a 7B/14B cloud workload |
| Recommendation explainer | Close | `T1` or `API` | 24 GB or API-first is fine |
| Batch summarization pipeline | Revise | batch `T1` | Keep 48 GB class if needed, but size by documents/hour and batch window |
| Customer 360 assistant | Close | `T1` to `T2` | 80 GB class is reasonable if this stays a 14B-style synthesis use case |
| Supply chain risk analyst | Close | `T2` | 48 GB to 96 GB is the right shape; 48 GB is acceptable if context stays moderate |
| Scientific literature copilot | Revise | `T2` | 80 GB is acceptable for a 14B starter, but should not be hard-coded as the only path |
| Case management summarizer | Close | `T1` to `T2` | 48 GB is reasonable |
| Branch or retail associate assistant | Revise | `T1` distributed or central | 80 GB is high for a naive 7B assistant; likely multiple smaller replicas or central routing is better |

### Agentic, code, SQL, graph, and high-reasoning

| Use case | Status | Should be sized as | Notes |
| --- | --- | --- | --- |
| Executive copilot | Revise | `T2` default, `T3` premium | 160 GB is reasonable only for the premium 70B path; default should start with a smaller agentic model |
| Sales account research assistant | Close | `T2` | 80 GB is a fair 14B-style starter if tools and retrieval are separate tiers |
| Developer code assistant | Revise | `T2` default, `T3` optional | Use a current code model family; CodeLlama 7B should not be the default path |
| SOC alert triage assistant | Close | `T2` | 80 GB is reasonable for a 14B-style analyst copilot |
| Natural language SQL analyst | Revise | `T2` | Use a text-to-SQL family rather than hard-wiring CodeLlama 7B |
| Fraud investigation assistant | Close | `T2` graph RAG | 80 GB is a reasonable starter for a 14B graph investigation tier |
| Legal discovery review | Revise | `M1` + `T2`, `T3` optional | 160 GB only makes sense for a premium 70B review tier; standard review should start smaller |
| Compliance monitoring assistant | Close | `T2` | 80 GB is reasonable |
| Graph RAG investigation workspace | Close | `T2` graph RAG | 80 GB is reasonable |
| Agentic workflow orchestration | Revise | `T2` default, `T3` premium | Do not default agentic workflows to 70B unless the quality requirement is explicit |
| Operations war-room assistant | Close | `T2` | 80 GB is reasonable |

### Documents, speech, and multimodal

| Use case | Status | Should be sized as | Notes |
| --- | --- | --- | --- |
| Meeting summarization | Remodel | `M2` | Split ASR from summarization; a single text-LLM recommendation is not valid |
| Call center live assist | Remodel | `M2` with an `8B/14B` assist model | Keep the idea of a larger total system, but express it as ASR + retrieval + assist tiers, not 70B concurrency |
| Contract review assistant | Revise | `M1` + `T1/T2` | 48 GB can still be a valid starter if OCR/extraction is separated from final reasoning |
| Invoice processing | Remodel | `M1` | The current 24 GB edge/doc-AI intent is good; the app just needs to stop treating it as text-only LLM inference |
| Insurance claims intake | Remodel | `M1` + `T1/T2` | This is a document+image workflow, not a single 70B text workload |
| Clinical scribe | Remodel | `M2` | Keep the private deployment emphasis, but size as streaming ASR plus note-generation tiers |
| Video search and summarization | Remodel | offline ingest + online `T1/T2` | Separate video/audio embedding and index build from online search/summarization |
| Edge OCR and document intake | Remodel | `M1` | 24 GB edge OCR is directionally right; the representation is wrong |
| Multimodal enterprise search | Remodel | multimodal retrieval + `T1/T2` answer tier | Keep the 160 GB class as an upper band only if VLM and answer tiers both run locally |

### CV, classification, and edge vision

| Use case | Status | Should be sized as | Notes |
| --- | --- | --- | --- |
| Phishing email analysis | Revise | classifier + optional `T1` explainer | 24 GB is fine if an LLM explainer exists; pure classification may not need a GPU at all |
| Document classification | Remodel | CPU / small transformer / entry GPU | This should not be routed to Llama 8B; the existing 16 GB or CPU baseline is the right shape |
| Image captioning | Remodel | `M1` VLM | 24 GB is a good class, but this should be a VLM starter, not a text-only assistant |
| Surveillance analytics | Remodel | `V1` | Keep edge GPU classes such as L4/A10/L40S; size by stream density, not users |
| Manufacturing quality inspection | Remodel | `V1` | Same as surveillance; size by cameras, FPS, and defect model complexity |
| Resume screening assistant | Revise | extraction/ranking + optional `T1` explainer | 24 GB is acceptable, but this is not a plain 12B text model use case |

## Specific content corrections to make later

Do not implement these yet. Use them as the change list after review.

1. Remove default forced concurrency from all use cases.
2. Normalize all deployment and latency defaults to valid enum values.
3. Replace the single-model catalog with model families and tiered services.
4. Add API/shared-endpoint mode where local GPU count can be zero.
5. Add workload classes for speech, OCR/VLM, and CV.
6. Split online inference from ingest/index tiers in the output.
7. Update stale model entries:
   - correct Mixtral 8x22B memory semantics
   - replace CodeLlama 7B as the default code path
8. Keep curated infrastructure tiers as real baselines rather than weak hints.
9. Express large user populations as replica counts, not as one monolithic GPU pool.

## Source-backed validation notes

These external sources were used to validate the catalog and the project premise. The conclusions above are partly inference from those sources plus the local code.

- Nutanix Enterprise AI is positioned for shared model endpoints and deployment across on-prem, edge, and public clouds:
  - [Nutanix press release, April 10 2025](https://www.nutanix.com/press-releases/nutanix-expands-enterprise-ai-capabilities-with-new-model-endpoint-service-for-agentic-applications)
  - [Nutanix.dev model endpoints overview, May 28 2024](https://www.nutanix.dev/2024/05/28/nutanix-enterprise-ai-model-endpoints/)
- NVIDIA official memory references used to validate the GPU catalog:
  - [RTX PRO 6000 Blackwell Server Edition](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/)
  - [L40S GPU](https://www.nvidia.com/en-us/data-center/l40s/)
  - [L4 Tensor Core GPU](https://www.nvidia.com/en-us/data-center/l4/)
  - [H100 NVL](https://www.nvidia.com/en-us/data-center/h100/)
  - [H200 NVL](https://www.nvidia.com/en-us/data-center/h200/)
  - [NVIDIA Blackwell reference architecture table](https://docs.nvidia.com/ai-enterprise/reference-architectures/latest/hgx-b200-sizing-guide.html)
- Model references used to validate catalog fit and memory assumptions:
  - [Meta Llama 3.1 8B Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
  - [Meta Llama 3.1 70B Instruct](https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct)
  - [Meta Llama 3.3 70B Instruct](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
  - [Mistral models overview](https://docs.mistral.ai/getting-started/models/models_overview/)
  - [Mixtral 8x22B weights and memory](https://docs.mistral.ai/getting-started/models/weights/)

## Final assessment

Keep the use-case catalog. Do not trust the current sizing output yet.

The next step should be to convert the app from "one selected LLM equals one GPU pool" into "one use case maps to one or more service tiers." Once that is done, most of the text-centric catalog can be retained with moderate corrections, while the multimodal, speech, CV, and API-first cases can finally be represented accurately.
