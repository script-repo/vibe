// ========================================
// AI Integration Workshop 5 Exercises
// Streamlit-style agent lab with memory, tools, RAG, MCP, and observability.
// ========================================

const exercises = [
  {
    title: "Streamlit Chat Shell",
    preamble: `
      <div class="preamble">
        <h3>Streamlit-style chat surface</h3>
        <p>Build a Streamlit-inspired chat UI with a sidebar, header badges, and message bubbles. Keep the layout minimal so you
        can drop it straight into a Streamlit <code>st.chat_message</code> experience.</p>
        <div class="key-concepts">
          <h4>Key Concepts</h4>
          <ul>
            <li>Split-pane layouts with sidebar controls</li>
            <li>Chat transcript styling (role-colored bubbles)</li>
            <li>Keyboard-friendly input area</li>
          </ul>
        </div>
        <div class="common-pitfalls">
          <h4>Pitfalls</h4>
          <ul>
            <li>Forgetting to scroll to the newest message</li>
            <li>Making the sidebar too narrow for controls</li>
          </ul>
        </div>
      </div>
    `,
    description: "Create the base chat layout: sidebar controls plus a transcript with system/user/assistant styles.",
    objectives: [
      "Build a sidebar with model + temperature controls",
      "Create chat bubbles for system/user/assistant",
      "Auto-scroll to the latest message after send",
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streamlit Chat Shell</title>
  <style>
    :root {
      --panel: #0f172a;
      --accent: #a855f7;
      --muted: #cbd5e1;
    }
    body {
      margin: 0;
      font-family: 'Inter', system-ui, sans-serif;
      background: radial-gradient(circle at 10% 20%, rgba(168,85,247,0.12), transparent 25%), #0b1120;
      color: #e2e8f0;
      min-height: 100vh;
      display: grid;
      grid-template-columns: 280px 1fr;
    }
    aside {
      background: rgba(15, 23, 42, 0.8);
      padding: 1.5rem;
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .chip { background: rgba(168,85,247,0.15); color: #e9d5ff; padding: 0.35rem 0.65rem; border-radius: 999px; font-size: 0.85rem; }
    main { display: flex; flex-direction: column; height: 100vh; }
    .chat-history { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .bubble { padding: 1rem 1.25rem; border-radius: 14px; max-width: 720px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
    .system { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); }
    .user { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.35); margin-left: auto; }
    .assistant { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); }
    .composer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; }
    textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.75rem; border-radius: 12px; resize: vertical; min-height: 72px; }
    button { background: var(--accent); color: #0b1120; border: none; border-radius: 10px; padding: 0 1.2rem; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <aside>
    <div class="chip">Model</div>
    <!-- TODO: add model + temperature controls -->
  </aside>
  <main>
    <div class="chat-history" id="chat"></div>
    <div class="composer">
      <textarea id="input" placeholder="Ask anything about your data..."></textarea>
      <button id="send">Send</button>
    </div>
  </main>
  <script>
    // TODO: render starter transcript and wire send button
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Streamlit Chat Shell</title>
  <style>
    :root { --panel: #0f172a; --accent: #a855f7; --muted: #cbd5e1; }
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: radial-gradient(circle at 10% 20%, rgba(168,85,247,0.12), transparent 25%), #0b1120; color: #e2e8f0; min-height: 100vh; display: grid; grid-template-columns: 280px 1fr; }
    aside { background: rgba(15, 23, 42, 0.8); padding: 1.5rem; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 1rem; }
    .field { display: grid; gap: 0.35rem; }
    .field label { color: var(--muted); font-size: 0.9rem; }
    select, input[type="range"] { width: 100%; }
    .chip { background: rgba(168,85,247,0.15); color: #e9d5ff; padding: 0.35rem 0.65rem; border-radius: 999px; font-size: 0.85rem; display: inline-block; }
    main { display: flex; flex-direction: column; height: 100vh; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .badge-row { display: flex; gap: 0.5rem; }
    .badge { background: rgba(255,255,255,0.06); padding: 0.3rem 0.7rem; border-radius: 999px; font-size: 0.85rem; }
    .chat-history { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .bubble { padding: 1rem 1.25rem; border-radius: 14px; max-width: 720px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); line-height: 1.6; }
    .system { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); }
    .user { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.35); margin-left: auto; }
    .assistant { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); }
    .composer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; }
    textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.75rem; border-radius: 12px; resize: vertical; min-height: 72px; }
    button { background: var(--accent); color: #0b1120; border: none; border-radius: 10px; padding: 0 1.2rem; font-weight: 700; cursor: pointer; transition: transform 120ms ease; }
    button:hover { transform: translateY(-1px); }
  </style>
</head>
<body>
  <aside>
    <div class="chip">Chat Controls</div>
    <div class="field">
      <label for="model">Model</label>
      <select id="model">
        <option>gpt-4.1</option>
        <option>claude-3.5-sonnet</option>
        <option>local-phi3</option>
      </select>
    </div>
    <div class="field">
      <label for="temp">Temperature</label>
      <input id="temp" type="range" min="0" max="1" step="0.1" value="0.2" />
    </div>
    <div class="field">
      <label>Memory</label>
      <div class="badge-row">
        <span class="badge">Windowed</span>
        <span class="badge">Summary</span>
      </div>
    </div>
  </aside>
  <main>
    <header>
      <div class="badge-row">
        <span class="badge">Streamlit-ready</span>
        <span class="badge">Accessible</span>
      </div>
      <div class="badge-row">
        <span class="badge">⌘⏎ Send</span>
      </div>
    </header>
    <div class="chat-history" id="chat"></div>
    <div class="composer">
      <textarea id="input" placeholder="Ask anything about your data..."></textarea>
      <button id="send">Send</button>
    </div>
  </main>
  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const send = document.getElementById('send');

    const transcript = [
      { role: 'system', text: 'You are a helpful analyst that cites sources.' },
      { role: 'user', text: 'Summarize customer sentiment for Q1.' },
      { role: 'assistant', text: 'Overall sentiment is positive with recurring requests for faster exports.' }
    ];

    function render() {
      chat.innerHTML = transcript.map(m => `<div class="bubble ${m.role}"><strong>${m.role}</strong><br>${m.text}</div>`).join('');
      chat.scrollTop = chat.scrollHeight;
    }

    function sendMessage() {
      const value = input.value.trim();
      if (!value) return;
      transcript.push({ role: 'user', text: value });
      render();
      input.value = '';
    }

    send.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        sendMessage();
      }
    });

    render();
  </script>
</body>
</html>`,
    hint: "Use a scrollable chat history, three bubble styles, and make ⌘/Ctrl + Enter submit messages like Streamlit's chat input.",
    validation: (code) => code.includes('chat-history') && code.includes('system') && code.includes('textarea')
  },
  {
    title: "Memory + Prompt Library",
    preamble: `
      <div class="preamble">
        <h3>Conversation memory with reusable prompts</h3>
        <p>Capture conversation memory (window + summary) and offer a prompt library so operators can swap behaviors quickly.</p>
        <div class="key-concepts">
          <h4>Key Concepts</h4>
          <ul>
            <li>Memory slices: rolling window + summarized context</li>
            <li>Prompt templates with variables</li>
            <li>System prompt safety rails</li>
          </ul>
        </div>
      </div>
    `,
    description: "Model a memory object and prompt library controls that plug into the chat shell.",
    objectives: [
      "Track windowed history and a running summary",
      "Expose prompt presets (analyst, guardrail, researcher)",
      "Show how to compose system + user + memory into a request payload"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Inter, sans-serif; background: #0b1120; color: #e2e8f0; padding: 2rem; }
    .panel { border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem 1.25rem; background: rgba(255,255,255,0.04); }
    .row { display: flex; gap: 1rem; margin-bottom: 1rem; }
    select, textarea, button { width: 100%; }
  </style>
</head>
<body>
  <div class="row">
    <div class="panel" style="flex:1">
      <h3>Prompt Library</h3>
      <!-- TODO: prompt select + render -->
    </div>
    <div class="panel" style="flex:1">
      <h3>Memory</h3>
      <!-- TODO: show window + summary -->
    </div>
  </div>
  <div class="panel">
    <h3>Payload Preview</h3>
    <pre id="payload"></pre>
  </div>
  <script>
    // TODO: wire prompt presets + memory composition
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Inter, sans-serif; background: #0b1120; color: #e2e8f0; padding: 2rem; }
    .panel { border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1rem 1.25rem; background: rgba(255,255,255,0.04); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
    .row { display: flex; gap: 1rem; margin-bottom: 1rem; }
    select, textarea, button { width: 100%; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.05); color: #fff; padding: 0.5rem; }
    pre { background: rgba(0,0,0,0.35); padding: 1rem; border-radius: 10px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="row">
    <div class="panel" style="flex:1">
      <h3>Prompt Library</h3>
      <select id="prompt">
        <option value="analyst">Analyst (cite sources)</option>
        <option value="guard">Guardrail (refuse PI)</option>
        <option value="research">Researcher (break down questions)</option>
      </select>
      <textarea id="promptText" rows="6"></textarea>
    </div>
    <div class="panel" style="flex:1">
      <h3>Memory</h3>
      <div><strong>Window</strong></div>
      <ul id="window"></ul>
      <div><strong>Summary</strong></div>
      <textarea id="summary" rows="3">Customer asks about billing and exports</textarea>
    </div>
  </div>
  <div class="panel">
    <h3>Payload Preview</h3>
    <pre id="payload"></pre>
  </div>
  <script>
    const promptText = document.getElementById('promptText');
    const promptSelect = document.getElementById('prompt');
    const windowEl = document.getElementById('window');
    const payload = document.getElementById('payload');
    const summary = document.getElementById('summary');

    const prompts = {
      analyst: 'You are an analyst who always cites sources in bullet points.',
      guard: 'You must refuse PII, secrets, or unsafe actions. Be brief and cite the policy section.',
      research: 'Break down the question into steps, ask for missing details, and propose experiments.'
    };

    const memory = {
      window: [
        { role: 'user', text: 'Please review my billing anomalies.' },
        { role: 'assistant', text: 'Happy to help. Can you share an invoice ID?' }
      ],
      summary: summary.value
    };

    function renderPrompt() {
      promptText.value = prompts[promptSelect.value];
      renderPayload();
    }

    function renderWindow() {
      windowEl.innerHTML = memory.window.map(m => `<li><strong>${m.role}:</strong> ${m.text}</li>`).join('');
    }

    function renderPayload() {
      const payloadJson = {
        system: promptText.value,
        memory: {
          window: memory.window,
          summary: summary.value
        },
        message: { role: 'user', text: 'How many invoices failed last week?' }
      };
      payload.textContent = JSON.stringify(payloadJson, null, 2);
    }

    promptSelect.addEventListener('change', renderPrompt);
    summary.addEventListener('input', renderPayload);

    renderPrompt();
    renderWindow();
  </script>
</body>
</html>`,
    hint: "Expose prompt presets with a <select>, keep memory as window + summary objects, and serialize everything into a payload preview.",
    validation: (code) => code.includes('prompt') && code.includes('memory') && code.includes('summary')
  },
  {
    title: "Tool Calling Rig",
    preamble: `
      <div class="preamble">
        <h3>Structured tool calling</h3>
        <p>Define a tool registry with JSON schemas and run-safe execution. Simulate a tool call response like you would from a
        streaming LLM.</p>
        <div class="key-concepts">
          <ul>
            <li>Tool metadata: name, description, JSON schema</li>
            <li>Execution layer with guardrails</li>
            <li>Call/response wiring into the chat transcript</li>
          </ul>
        </div>
      </div>
    `,
    description: "Model function calling with a registry and a dispatcher that feeds chat messages.",
    objectives: [
      "Define tools with JSON schema-like contracts",
      "Simulate a tool_call message and append results",
      "Show how to guard and log tool invocations"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0b1120; color: #e2e8f0; font-family: Inter, sans-serif; padding: 2rem; }
    .log { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; min-height: 200px; }
  </style>
</head>
<body>
  <h3>Tool Calls</h3>
  <div class="log" id="log"></div>
  <script>
    // TODO: create registry + dispatcher + sample call
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background: #0b1120; color: #e2e8f0; font-family: Inter, sans-serif; padding: 2rem; }
    .log { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; min-height: 220px; white-space: pre-wrap; }
    code { background: rgba(255,255,255,0.08); padding: 0.2rem 0.4rem; border-radius: 6px; }
  </style>
</head>
<body>
  <h3>Tool Calls</h3>
  <div class="log" id="log"></div>
  <script>
    const log = document.getElementById('log');

    const registry = {
      weather_lookup: {
        description: 'Get weather by city',
        schema: { properties: { city: { type: 'string' } }, required: ['city'] },
        handler: ({ city }) => ({ city, summary: `${city} is 72°F and clear` })
      },
      sql_query: {
        description: 'Run a safe read-only query',
        schema: { properties: { query: { type: 'string' } }, required: ['query'] },
        handler: ({ query }) => ({ rows: 42, sample: query.slice(0, 40) })
      }
    };

    function dispatch(toolCall) {
      const tool = registry[toolCall.name];
      if (!tool) throw new Error('Unknown tool');
      logMessage('tool_call', toolCall);
      const result = tool.handler(toolCall.arguments);
      logMessage('tool_result', result);
      return result;
    }

    function logMessage(kind, payload) {
      log.innerHTML += `\n${kind.toUpperCase()}: ${JSON.stringify(payload, null, 2)}`;
    }

    const toolCall = { name: 'weather_lookup', arguments: { city: 'Lisbon' } };
    dispatch(toolCall);
  </script>
</body>
</html>`,
    hint: "Create a registry object keyed by tool name, include description/schema, and append tool_call + tool_result into a log or transcript.",
    validation: (code) => code.includes('registry') && code.includes('tool_call')
  },
  {
    title: "In-Memory RAG",
    preamble: `
      <div class="preamble">
        <h3>Retrieval without infrastructure</h3>
        <p>Implement lightweight retrieval that runs in-memory. Use embeddings or token overlap scoring to pull top-k context and
        return a context block you could inject into your prompt.</p>
        <div class="key-concepts">
          <ul>
            <li>Document chunking with metadata</li>
            <li>Vector-like scoring (cosine-ish via dot product)</li>
            <li>Context assembly for model calls</li>
          </ul>
        </div>
      </div>
    `,
    description: "Score local chunks against a query and render the selected context block.",
    objectives: [
      "Create an embedding or keyword scorer",
      "Return top-k chunks with metadata",
      "Render the context block for the chat UI"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background:#0b1120; color:#e2e8f0; font-family: Inter, sans-serif; padding: 2rem; }
    .card { border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h3>In-Memory RAG</h3>
  <input id="query" placeholder="Ask about onboarding" style="width:100%; padding:0.75rem; border-radius:10px;" />
  <div id="results"></div>
  <script>
    const docs = [
      { id: '1', text: 'Onboarding requires 2FA setup and workspace invite.', tags: ['onboarding','security'] },
      { id: '2', text: 'Exports are generated asynchronously and emailed.', tags: ['exports','email'] },
      { id: '3', text: 'Milvus collections should use cosine similarity for embeddings.', tags: ['milvus','rag'] }
    ];
    // TODO: implement a tiny scorer and render top docs
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background:#0b1120; color:#e2e8f0; font-family: Inter, sans-serif; padding: 2rem; }
    .card { border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; background: rgba(255,255,255,0.04); }
    code { background: rgba(255,255,255,0.08); padding: 0.2rem 0.4rem; border-radius: 6px; }
  </style>
</head>
<body>
  <h3>In-Memory RAG</h3>
  <input id="query" placeholder="Ask about onboarding" style="width:100%; padding:0.75rem; border-radius:10px;" />
  <div id="results"></div>
  <script>
    const docs = [
      { id: '1', text: 'Onboarding requires 2FA setup and workspace invite.', tags: ['onboarding','security'] },
      { id: '2', text: 'Exports are generated asynchronously and emailed.', tags: ['exports','email'] },
      { id: '3', text: 'Milvus collections should use cosine similarity for embeddings.', tags: ['milvus','rag'] }
    ];

    function embed(text) {
      // toy embed by summing char codes
      return text.toLowerCase().split(/\W+/).reduce((acc, word) => acc + word.charCodeAt(0), 0);
    }

    function score(query, doc) {
      return Math.abs(embed(query) - embed(doc.text)) * -1; // higher is better (less distance)
    }

    function search(query) {
      const results = docs
        .map(d => ({ ...d, score: score(query, d) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
      return results;
    }

    function render() {
      const q = document.getElementById('query').value;
      const hits = search(q);
      const block = hits.map(h => `- (${h.id}) ${h.text} [tags: ${h.tags.join(', ')}]`).join('\n');
      document.getElementById('results').innerHTML = `
        <div class="card"><strong>Context Block</strong><pre>${block}</pre></div>
      `;
    }

    document.getElementById('query').addEventListener('input', render);
    render();
  </script>
</body>
</html>`,
    hint: "Use a simple scoring function (keyword overlap or summed char codes) to rank docs; return top-k as a context block string.",
    validation: (code) => code.includes('score') && code.includes('tags')
  },
  {
    title: "Vector RAG with Milvus",
    preamble: `
      <div class="preamble">
        <h3>Milvus-backed search</h3>
        <p>Model how you'd call Milvus for vector search. Build a configuration block with collection name, dimension, and metric,
        and simulate a search response that the chat UI can render.</p>
        <div class="key-concepts">
          <ul>
            <li>Collection schema (id, vector, metadata)</li>
            <li>Search parameters: topK, metricType, consistency</li>
            <li>Result mapping into RAG context</li>
          </ul>
        </div>
      </div>
    `,
    description: "Show a Milvus config panel and simulate a search into a context payload.",
    objectives: [
      "Capture Milvus config (collection, metric, topK)",
      "Mock a search API response",
      "Render context rows with similarity scores"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Inter, sans-serif; background: #0b1120; color: #e2e8f0; padding: 2rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .panel { border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:1rem; background: rgba(255,255,255,0.04); }
  </style>
</head>
<body>
  <h3>Milvus Vector Search</h3>
  <div class="grid">
    <div class="panel" id="config"></div>
    <div class="panel" id="results"></div>
  </div>
  <script>
    // TODO: render config + mock search
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Inter, sans-serif; background: #0b1120; color: #e2e8f0; padding: 2rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .panel { border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:1rem; background: rgba(255,255,255,0.04); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
    input, select { width: 100%; padding: 0.6rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); color: #fff; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    td, th { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
  </style>
</head>
<body>
  <h3>Milvus Vector Search</h3>
  <div class="grid">
    <div class="panel" id="config"></div>
    <div class="panel" id="results"></div>
  </div>
  <script>
    const state = {
      collection: 'support_articles',
      dimension: 1536,
      metricType: 'COSINE',
      topK: 3,
    };

    function renderConfig() {
      document.getElementById('config').innerHTML = `
        <label>Collection</label>
        <input value="${state.collection}" id="collection" />
        <label>Metric</label>
        <select id="metric">
          <option value="COSINE">COSINE</option>
          <option value="L2">L2</option>
        </select>
        <label>Top K</label>
        <input type="number" value="${state.topK}" id="topk" min="1" max="10" />
      `;
      document.getElementById('metric').value = state.metricType;
      document.getElementById('collection').addEventListener('input', e => { state.collection = e.target.value; renderResults(); });
      document.getElementById('metric').addEventListener('change', e => { state.metricType = e.target.value; renderResults(); });
      document.getElementById('topk').addEventListener('input', e => { state.topK = Number(e.target.value); renderResults(); });
    }

    function mockSearch() {
      const hits = [
        { id: 'a1', text: 'Enable 2FA before inviting contractors.', score: 0.91 },
        { id: 'b2', text: 'Export jobs run asynchronously; retries after 5m.', score: 0.83 },
        { id: 'c3', text: 'Milvus collections should be sharded by team.', score: 0.78 }
      ];
      return hits.slice(0, state.topK);
    }

    function renderResults() {
      const hits = mockSearch();
      const rows = hits.map(h => `<tr><td>${h.id}</td><td>${h.text}</td><td>${h.score.toFixed(2)}</td></tr>`).join('');
      document.getElementById('results').innerHTML = `
        <strong>Context Returned</strong>
        <table>
          <tr><th>ID</th><th>Chunk</th><th>Score</th></tr>
          ${rows}
        </table>
      `;
    }

    renderConfig();
    renderResults();
  </script>
</body>
</html>`,
    hint: "Model the Milvus config (collection, metricType, topK) and simulate a search response so learners can see the context rows and scores.",
    validation: (code) => code.includes('collection') && code.includes('metric') && code.includes('topK')
  },
  {
    title: "MCP Servers",
    preamble: `
      <div class="preamble">
        <h3>Model Context Protocol (MCP) connectors</h3>
        <p>Plan and visualize MCP servers that give your agent file-system, database, web search, and other capabilities. Surface
        connection status and capabilities.</p>
        <div class="key-concepts">
          <ul>
            <li>Filesystem, database, and web-search servers</li>
            <li>Additional staples: Git, Slack, Calendar</li>
            <li>Status + capability-driven routing</li>
          </ul>
        </div>
      </div>
    `,
    description: "List MCP servers with status badges and map them into agent tools.",
    objectives: [
      "Show at least six MCP servers (filesystem, database, web search + three more)",
      "Display connection status and capabilities",
      "Map enabled servers into an agent tool registry"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background:#0b1120; color:#e2e8f0; font-family: Inter, sans-serif; padding: 2rem; }
    table { width:100%; border-collapse: collapse; }
    th, td { padding:0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .badge { padding:0.2rem 0.6rem; border-radius: 8px; background: rgba(255,255,255,0.08); }
  </style>
</head>
<body>
  <h3>MCP Server Map</h3>
  <div id="table"></div>
  <script>
    // TODO: render servers + tool registry preview
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background:#0b1120; color:#e2e8f0; font-family: Inter, sans-serif; padding: 2rem; }
    table { width:100%; border-collapse: collapse; }
    th, td { padding:0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .badge { padding:0.2rem 0.6rem; border-radius: 8px; background: rgba(255,255,255,0.08); }
  </style>
</head>
<body>
  <h3>MCP Server Map</h3>
  <div id="table"></div>
  <pre id="registry"></pre>
  <script>
    const servers = [
      { name: 'filesystem', capability: 'read/write project files', status: 'connected' },
      { name: 'database', capability: 'sql read-only', status: 'connected' },
      { name: 'web-search', capability: 'search + scrape', status: 'connected' },
      { name: 'git', capability: 'pull branches + diff', status: 'warming' },
      { name: 'slack', capability: 'post + search channels', status: 'connected' },
      { name: 'calendar', capability: 'read events + schedule', status: 'connected' },
    ];

    function renderTable() {
      const rows = servers.map(s => `<tr><td>${s.name}</td><td>${s.capability}</td><td><span class="badge">${s.status}</span></td></tr>`).join('');
      document.getElementById('table').innerHTML = `<table><tr><th>Server</th><th>Capability</th><th>Status</th></tr>${rows}</table>`;
    }

    function toToolRegistry() {
      return servers.filter(s => s.status === 'connected').map(s => ({ name: `${s.name}_tool`, server: s.name }));
    }

    renderTable();
    document.getElementById('registry').textContent = JSON.stringify(toToolRegistry(), null, 2);
  </script>
</body>
</html>`,
    hint: "List the MCP servers (filesystem, database, web search, git, slack, calendar), show status badges, and convert connected ones into tool entries.",
    validation: (code) => code.includes('filesystem') && code.includes('database') && code.includes('web-search')
  },
  {
    title: "Agents & Multi-Agent Handoffs",
    preamble: `
      <div class="preamble">
        <h3>Agent factory + orchestration</h3>
        <p>Create an agent blueprint with name, instructions, tools, and routing hints. Then orchestrate two agents (researcher +
        builder) handing off tasks.</p>
        <div class="key-concepts">
          <ul>
            <li>Agent config objects and factories</li>
            <li>Task router orchestrating multiple agents</li>
            <li>Deterministic handoffs with transcripts</li>
          </ul>
        </div>
      </div>
    `,
    description: "Model two agents and simulate a handoff with transcripts updated in the chat UI.",
    objectives: [
      "Define an Agent class/factory with tools",
      "Create researcher + builder agents",
      "Simulate a multi-agent orchestration step"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{background:#0b1120;color:#e2e8f0;font-family:Inter,sans-serif;padding:2rem;} .panel{background:rgba(255,255,255,0.05);padding:1rem;border-radius:12px;margin-bottom:1rem;}</style></head>
<body>
  <h3>Multi-Agent Orchestration</h3>
  <div class="panel" id="log"></div>
  <script>
    // TODO: define Agent + orchestrate handoff
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>body{background:#0b1120;color:#e2e8f0;font-family:Inter,sans-serif;padding:2rem;} .panel{background:rgba(255,255,255,0.05);padding:1rem;border-radius:12px;margin-bottom:1rem;white-space:pre-wrap;}</style></head>
<body>
  <h3>Multi-Agent Orchestration</h3>
  <div class="panel" id="log"></div>
  <script>
    class Agent {
      constructor(name, prompt, tools=[]) {
        this.name = name;
        this.prompt = prompt;
        this.tools = tools;
      }
      act(task) {
        return `[${this.name}] ${this.prompt} | tools: ${this.tools.join(', ')} | task: ${task}`;
      }
    }

    function orchestrate(task) {
      const researcher = new Agent('Researcher', 'Break down and propose plan', ['web-search', 'filesystem']);
      const builder = new Agent('Builder', 'Implement plan and report status', ['database', 'git']);

      const step1 = researcher.act(task);
      const step2 = builder.act('Implement: ' + task);
      const transcript = [step1, step2];
      document.getElementById('log').textContent = transcript.join('\n\n');
    }

    orchestrate('Ship a Milvus-backed RAG chatbot with MCP tools.');
  </script>
</body>
</html>`,
    hint: "Create two agents (researcher + builder) with prompts and tools. Simulate a router that collects their responses into a transcript.",
    validation: (code) => code.includes('Agent') && code.includes('researcher') && code.includes('builder')
  },
  {
    title: "RLHF + Latency Analytics",
    preamble: `
      <div class="preamble">
        <h3>Feedback + observability</h3>
        <p>Capture user feedback (thumbs, freeform notes) and measure latency: TTFT (time-to-first-token) and tokens-per-second to
        detect regressions.</p>
        <div class="key-concepts">
          <ul>
            <li>TTFT measurement from request start to first chunk</li>
            <li>Tokens-per-second from total tokens / duration</li>
            <li>RLHF buckets: positive, neutral, negative with comments</li>
          </ul>
        </div>
      </div>
    `,
    description: "Add feedback controls and compute TTFT + tokens/sec from mock streaming events.",
    objectives: [
      "Calculate TTFT and tokens/sec from timestamps",
      "Capture RLHF thumbs + freeform feedback",
      "Render a mini telemetry panel"
    ],
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background:#0b1120; color:#e2e8f0; font-family:Inter,sans-serif; padding:2rem; }
    .panel { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h3>RLHF & Latency</h3>
  <div class="panel" id="metrics"></div>
  <div class="panel">
    <button id="up">👍</button>
    <button id="down">👎</button>
    <input id="note" placeholder="Why?" />
  </div>
  <script>
    // TODO: compute TTFT + tokens/sec from mock events and capture feedback
  </script>
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { background:#0b1120; color:#e2e8f0; font-family:Inter,sans-serif; padding:2rem; }
    .panel { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
    .metric { display: flex; gap: 0.5rem; align-items: center; }
  </style>
</head>
<body>
  <h3>RLHF & Latency</h3>
  <div class="panel" id="metrics"></div>
  <div class="panel">
    <button id="up">👍</button>
    <button id="down">👎</button>
    <input id="note" placeholder="Why?" />
  </div>
  <pre id="feedback"></pre>
  <script>
    const metricsEl = document.getElementById('metrics');
    const feedbackEl = document.getElementById('feedback');
    const events = [
      { type: 'start', time: 0 },
      { type: 'first_token', time: 420 },
      { type: 'chunk', time: 820, tokens: 50 },
      { type: 'chunk', time: 1200, tokens: 90 },
      { type: 'end', time: 1500, tokens: 120 }
    ];

    function computeMetrics() {
      const start = events.find(e => e.type === 'start').time;
      const first = events.find(e => e.type === 'first_token').time;
      const end = events.find(e => e.type === 'end').time;
      const totalTokens = events.filter(e => e.tokens).reduce((acc, e) => acc + e.tokens, 0);
      const ttft = first - start;
      const tps = totalTokens / ((end - start) / 1000);
      metricsEl.innerHTML = `
        <div class="metric"><strong>TTFT:</strong> ${ttft} ms</div>
        <div class="metric"><strong>Tokens/sec:</strong> ${tps.toFixed(1)}</div>
      `;
    }

    const feedback = { score: null, note: '' };
    document.getElementById('up').onclick = () => { feedback.score = 1; renderFeedback(); };
    document.getElementById('down').onclick = () => { feedback.score = -1; renderFeedback(); };
    document.getElementById('note').oninput = (e) => { feedback.note = e.target.value; renderFeedback(); };

    function renderFeedback() {
      feedbackEl.textContent = JSON.stringify({ ...feedback, timestamp: Date.now() }, null, 2);
    }

    computeMetrics();
    renderFeedback();
  </script>
</body>
</html>`,
    hint: "Mock streaming timestamps, compute TTFT = first_token - start, tokens/sec = total_tokens / duration_s, and capture thumbs + notes in a feedback object.",
    validation: (code) => code.includes('TTFT') && code.includes('tokens') && code.includes('feedback')
  }
];

// Expose exercises to the browser environment
window.exercises = exercises;
