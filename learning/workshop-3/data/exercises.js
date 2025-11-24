// ========================================
// AI Integration Workshop Exercises Data
// ========================================

const exercises = [
  {
    title: "API Basics with Fetch",
    preamble: `<div class="preamble"><h3>Making API Requests</h3><p>Learn to make HTTP requests to AI APIs using the Fetch API and async/await.</p>
      <div class="key-concepts"><h4>Key Concepts:</h4><ul>
        <li><strong>async/await</strong>: Modern JavaScript for asynchronous code</li>
        <li><strong>fetch()</strong>: Making HTTP requests</li>
        <li><strong>JSON</strong>: Parsing and stringifying data</li>
        <li><strong>Error Handling</strong>: Try/catch blocks</li>
      </ul></div></div>`,
    description: "Make your first API request to an AI service using fetch and async/await.",
    objectives: ["Use async/await syntax", "Make POST requests with fetch", "Handle JSON responses", "Implement error handling"],
    starterCode: `<!DOCTYPE html>
<html><head><title>API Basics</title><style>body{font-family:sans-serif;padding:2rem;background:#1e293b;color:#fff}</style></head>
<body>
  <h1>AI API Tester</h1>
  <button onclick="testAPI()">Test API</button>
  <div id="result"></div>
  <script>
    async function testAPI() {
      // TODO: Make a fetch request to a mock API
      // Hint: const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      // TODO: Parse JSON
      // TODO: Display result
    }
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><head><title>API Basics</title><style>body{font-family:sans-serif;padding:2rem;background:#1e293b;color:#fff}#result{margin-top:1rem;padding:1rem;background:rgba(255,255,255,0.1);border-radius:8px}</style></head>
<body>
  <h1>AI API Tester</h1>
  <button onclick="testAPI()">Test API</button>
  <div id="result"></div>
  <script>
    async function testAPI() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        document.getElementById('result').textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body></html>`,
    hint: "Use async/await with fetch, then call .json() on the response. Wrap in try/catch for error handling.",
    validation: (code) => code.includes('async') && code.includes('await') && code.includes('fetch')
  },

  {
    title: "Chat Interface",
    preamble: `<div class="preamble"><h3>Building a Chat UI</h3><p>Create a user-friendly chat interface for AI conversations.</p></div>`,
    description: "Build a chat interface with message bubbles, input field, and send button.",
    objectives: ["Create message bubbles", "Handle user input", "Display messages", "Scroll to latest message"],
    starterCode: `<!DOCTYPE html>
<html><head><title>Chat</title><style>
body{margin:0;font-family:sans-serif;background:#1e293b;color:#fff}
#chat{height:80vh;display:flex;flex-direction:column}
#messages{flex:1;overflow-y:auto;padding:1rem}
/* TODO: Style message bubbles */
#input-area{padding:1rem;display:flex;gap:0.5rem}
</style></head>
<body>
  <div id="chat">
    <div id="messages"></div>
    <div id="input-area">
      <input id="userInput" type="text" placeholder="Type a message...">
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>
  <script>
    function sendMessage() {
      // TODO: Get user input, add to messages, clear input
    }
    function addMessage(text, isUser) {
      // TODO: Create and append message bubble
    }
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><head><title>Chat</title><style>
body{margin:0;font-family:sans-serif;background:#1e293b;color:#fff}
#chat{height:100vh;display:flex;flex-direction:column}
#messages{flex:1;overflow-y:auto;padding:1rem}
.message{margin-bottom:1rem;display:flex}
.message.user{justify-content:flex-end}
.bubble{padding:0.75rem 1rem;border-radius:12px;max-width:70%}
.user .bubble{background:#8b5cf6;color:#fff}
.assistant .bubble{background:rgba(255,255,255,0.1);color:#fff}
#input-area{padding:1rem;display:flex;gap:0.5rem;background:rgba(0,0,0,0.3)}
#userInput{flex:1;padding:0.75rem;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#fff}
button{padding:0.75rem 1.5rem;border:none;border-radius:8px;background:#8b5cf6;color:#fff;cursor:pointer}
</style></head>
<body>
  <div id="chat">
    <div id="messages"></div>
    <div id="input-area">
      <input id="userInput" type="text" placeholder="Type a message..." onkeypress="if(event.key==='Enter')sendMessage()">
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>
  <script>
    function sendMessage() {
      const input = document.getElementById('userInput');
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, true);
      input.value = '';
      setTimeout(() => addMessage("This is a mock response.", false), 500);
    }
    function addMessage(text, isUser) {
      const messagesDiv = document.getElementById('messages');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'message ' + (isUser ? 'user' : 'assistant');
      msgDiv.innerHTML = '<div class="bubble">' + text + '</div>';
      messagesDiv.appendChild(msgDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  </script>
</body></html>`,
    hint: "Create message divs with different classes for user/assistant, style them as bubbles, and scroll to bottom after adding.",
    validation: (code) => code.includes('message') && code.includes('bubble') && code.includes('scrollTop')
  },

  {
    title: "Streaming Responses",
    preamble: `<div class="preamble"><h3>Real-time AI Streaming</h3><p>Implement streaming to show AI responses in real-time as they're generated.</p></div>`,
    description: "Stream AI responses character by character for better UX.",
    objectives: ["Use ReadableStream", "Process chunks", "Display real-time updates"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff">
  <button onclick="streamText()">Stream Text</button>
  <div id="output"></div>
  <script>
    async function streamText() {
      // TODO: Simulate streaming by revealing text character by character
      const text = "This is a simulated streaming response from an AI.";
      // TODO: Display character by character with delay
    }
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="streamText()">Stream Text</button>
  <div id="output" style="margin-top:1rem;font-size:1.1rem;line-height:1.6"></div>
  <script>
    async function streamText() {
      const text = "This is a simulated streaming response from an AI. It appears character by character!";
      const output = document.getElementById('output');
      output.textContent = '';
      for (let i = 0; i < text.length; i++) {
        output.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }
  </script>
</body></html>`,
    hint: "Loop through each character of the text and add it to the output div with a small delay using setTimeout wrapped in a Promise.",
    validation: (code) => code.includes('setTimeout') && code.includes('Promise') && code.includes('textContent')
  },

  {
    title: "Typewriter Effect",
    preamble: `<div class="preamble"><h3>Enhanced Streaming UX</h3><p>Create a polished typewriter effect with cursor animation.</p></div>`,
    description: "Add a blinking cursor and smooth typewriter animation.",
    objectives: ["Animated cursor", "Character-by-character display", "Smooth transitions"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff">
  <div id="text"></div>
  <script>
    // TODO: Add typewriter effect with blinking cursor
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><head><style>
body{padding:2rem;background:#1e293b;color:#fff;font-family:monospace;font-size:1.2rem}
#text{position:relative;display:inline-block}
#text::after{content:'|';animation:blink 1s infinite;margin-left:2px}
@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
</style></head>
<body>
  <div id="text"></div>
  <script>
    async function typeWriter(text, element) {
      for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    typeWriter("Hello! I'm an AI assistant. How can I help you today?", document.getElementById('text'));
  </script>
</body></html>`,
    hint: "Use CSS ::after pseudo-element with a pipe character and blink animation. Add characters one by one with setTimeout.",
    validation: (code) => code.includes('::after') && code.includes('animation') && code.includes('blink')
  },

  {
    title: "Function Calling",
    preamble: `<div class="preamble"><h3>AI Function Calling</h3><p>Teach AI to call JavaScript functions based on user requests.</p></div>`,
    description: "Implement function calling pattern where AI can execute predefined functions.",
    objectives: ["Define callable functions", "Parse AI responses", "Execute functions", "Return results"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff">
  <script>
    const functions = {
      getWeather: (city) => "The weather in " + city + " is sunny.",
      getTime: () => new Date().toLocaleTimeString()
    };
    // TODO: Simulate AI choosing and calling a function
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="simulateAI()">Ask AI</button>
  <div id="result" style="margin-top:1rem"></div>
  <script>
    const functions = {
      getWeather: (city) => "The weather in " + city + " is sunny and 72°F.",
      getTime: () => "Current time: " + new Date().toLocaleTimeString(),
      calculate: (a, b, op) => "Result: " + (op === '+' ? a + b : a * b)
    };
    
    function simulateAI() {
      const funcName = 'getTime';
      const args = [];
      const result = functions[funcName](...args);
      document.getElementById('result').innerHTML = '<strong>AI called:</strong> ' + funcName + '<br><strong>Result:</strong> ' + result;
    }
  </script>
</body></html>`,
    hint: "Store functions in an object, then call them dynamically using bracket notation: functions[functionName](...args)",
    validation: (code) => code.includes('functions') && code.includes('[') && code.includes('...')
  },

  {
    title: "Structured Outputs",
    preamble: `<div class="preamble"><h3>Parsing AI JSON</h3><p>Get structured data from AI in JSON format.</p></div>`,
    description: "Parse and validate JSON responses from AI.",
    objectives: ["Parse JSON safely", "Validate structure", "Display formatted data"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff">
  <script>
    // TODO: Parse and validate JSON from AI
    const aiResponse = '{"name":"John","age":30,"skills":["JavaScript","Python"]}';
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <div id="output"></div>
  <script>
    const aiResponse = '{"name":"John","age":30,"skills":["JavaScript","Python","AI"]}';
    try {
      const data = JSON.parse(aiResponse);
      let html = '<h2>Parsed Data:</h2>';
      html += '<p><strong>Name:</strong> ' + data.name + '</p>';
      html += '<p><strong>Age:</strong> ' + data.age + '</p>';
      html += '<p><strong>Skills:</strong> ' + data.skills.join(', ') + '</p>';
      document.getElementById('output').innerHTML = html;
    } catch (error) {
      document.getElementById('output').textContent = 'Error parsing JSON: ' + error.message;
    }
  </script>
</body></html>`,
    hint: "Use JSON.parse() wrapped in try/catch. Access properties with dot notation and format nicely.",
    validation: (code) => code.includes('JSON.parse') && code.includes('try') && code.includes('catch')
  },

  {
    title: "RAG System Basics",
    preamble: `<div class="preamble"><h3>Retrieval Augmented Generation (RAG)</h3>
      <p>Build a RAG system that retrieves relevant documents using vector similarity, then provides context to an AI.</p>
      <div class="key-concepts"><h4>Key Concepts:</h4><ul>
        <li><strong>Embeddings</strong>: Converting text to numerical vectors</li>
        <li><strong>Similarity</strong>: Finding documents similar to the query</li>
        <li><strong>Context</strong>: Providing retrieved docs to the AI</li>
      </ul></div>
    </div>`,
    description: "Implement document retrieval using vector similarity and provide relevant context to AI.",
    objectives: ["Create document embeddings (simulated)", "Calculate similarity scores", "Retrieve top-k relevant documents", "Show how context is provided to AI"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <h2>🔍 RAG Document Search</h2>
  <input id="query" placeholder="Ask about AI or programming..." style="width:70%;padding:0.75rem;border-radius:8px;border:1px solid #444;background:#2d3748;color:#fff">
  <button onclick="search()" style="padding:0.75rem 1.5rem;background:#8b5cf6;color:#fff;border:none;border-radius:8px;cursor:pointer">Search</button>
  <div id="result" style="margin-top:1.5rem"></div>
  <script>
    // Document database with simulated embeddings (normally from an embedding model)
    const documents = [
      {id: 1, content: "JavaScript is a versatile programming language used for web development.", embedding: [0.8, 0.2, 0.1, 0.3, 0.7]},
      {id: 2, content: "Python is excellent for data science, machine learning, and AI applications.", embedding: [0.1, 0.9, 0.8, 0.6, 0.4]},
      {id: 3, content: "Machine learning models learn patterns from data to make predictions.", embedding: [0.2, 0.8, 0.9, 0.7, 0.3]},
      {id: 4, content: "Three.js is a powerful 3D graphics library for creating interactive web experiences.", embedding: [0.7, 0.3, 0.1, 0.2, 0.8]},
      {id: 5, content: "Neural networks are the foundation of deep learning and modern AI systems.", embedding: [0.1, 0.9, 0.9, 0.8, 0.5]}
    ];

    // TODO: Implement a function to simulate query embedding
    // Hint: For simplicity, generate a random vector or base it on keywords
    function embedQuery(query) {
      // Simple simulation: create vector based on keywords
      const lower = query.toLowerCase();
      return [
        lower.includes('javascript') || lower.includes('web') ? 0.8 : 0.2,
        lower.includes('python') || lower.includes('ai') || lower.includes('machine') ? 0.9 : 0.2,
        lower.includes('learning') || lower.includes('neural') ? 0.9 : 0.1,
        lower.includes('data') ? 0.7 : 0.3,
        lower.includes('3d') || lower.includes('graphics') ? 0.8 : 0.3
      ];
    }

    // TODO: Implement cosine similarity function
    // Hint: dot product divided by magnitudes
    function cosineSimilarity(vecA, vecB) {
      // Calculate dot product and magnitudes
      let dotProduct = 0, magA = 0, magB = 0;
      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
      }
      return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    // TODO: Implement search function that finds top-k similar documents
    function search() {
      const query = document.getElementById('query').value;
      if (!query) return;

      // Step 1: Convert query to embedding
      const queryEmbedding = embedQuery(query);

      // Step 2: Calculate similarity scores for all documents
      // TODO: Add your code here

      // Step 3: Sort by similarity and get top 3
      // TODO: Add your code here

      // Step 4: Display results with similarity scores
      // TODO: Add your code here

      // Step 5: Show how this context would be sent to AI
      // TODO: Add your code here
    }
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <h2>🔍 RAG Document Search</h2>
  <input id="query" placeholder="Ask about AI or programming..." style="width:70%;padding:0.75rem;border-radius:8px;border:1px solid #444;background:#2d3748;color:#fff">
  <button onclick="search()" style="padding:0.75rem 1.5rem;background:#8b5cf6;color:#fff;border:none;border-radius:8px;cursor:pointer">Search</button>
  <div id="result" style="margin-top:1.5rem"></div>
  <script>
    const documents = [
      {id: 1, content: "JavaScript is a versatile programming language used for web development.", embedding: [0.8, 0.2, 0.1, 0.3, 0.7]},
      {id: 2, content: "Python is excellent for data science, machine learning, and AI applications.", embedding: [0.1, 0.9, 0.8, 0.6, 0.4]},
      {id: 3, content: "Machine learning models learn patterns from data to make predictions.", embedding: [0.2, 0.8, 0.9, 0.7, 0.3]},
      {id: 4, content: "Three.js is a powerful 3D graphics library for creating interactive web experiences.", embedding: [0.7, 0.3, 0.1, 0.2, 0.8]},
      {id: 5, content: "Neural networks are the foundation of deep learning and modern AI systems.", embedding: [0.1, 0.9, 0.9, 0.8, 0.5]}
    ];

    function embedQuery(query) {
      const lower = query.toLowerCase();
      return [
        lower.includes('javascript') || lower.includes('web') ? 0.8 : 0.2,
        lower.includes('python') || lower.includes('ai') || lower.includes('machine') ? 0.9 : 0.2,
        lower.includes('learning') || lower.includes('neural') ? 0.9 : 0.1,
        lower.includes('data') ? 0.7 : 0.3,
        lower.includes('3d') || lower.includes('graphics') ? 0.8 : 0.3
      ];
    }

    function cosineSimilarity(vecA, vecB) {
      let dotProduct = 0, magA = 0, magB = 0;
      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
      }
      return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    function search() {
      const query = document.getElementById('query').value;
      if (!query) return;

      const queryEmbedding = embedQuery(query);

      const results = documents.map(doc => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
      })).sort((a, b) => b.similarity - a.similarity).slice(0, 3);

      let html = '<h3>📊 Top Matching Documents:</h3>';
      results.forEach((doc, i) => {
        const percentage = (doc.similarity * 100).toFixed(1);
        html += \`<div style="background:rgba(139,92,246,0.1);padding:1rem;border-radius:8px;margin-bottom:0.75rem;border-left:4px solid #8b5cf6">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
            <strong>Match #\${i+1}</strong>
            <span style="background:#8b5cf6;padding:0.25rem 0.75rem;border-radius:12px;font-size:0.85rem">\${percentage}% similar</span>
          </div>
          <div>\${doc.content}</div>
        </div>\`;
      });

      const context = results.map(r => r.content).join('\\n\\n');
      html += \`<div style="background:rgba(34,197,94,0.1);padding:1rem;border-radius:8px;margin-top:1rem;border-left:4px solid #22c55e">
        <h4>🤖 Context for AI:</h4>
        <p style="font-size:0.9rem;opacity:0.9">This context would be added to the AI prompt:</p>
        <pre style="background:rgba(0,0,0,0.3);padding:1rem;border-radius:6px;overflow-x:auto;font-size:0.85rem">\${context}</pre>
      </div>\`;

      document.getElementById('result').innerHTML = html;
    }
  </script>
</body></html>`,
    hint: "Use cosine similarity to find documents most similar to the query embedding. Sort by similarity score and take top 3.",
    validation: (code) => code.includes('cosineSimilarity') && code.includes('embedding') && code.includes('similarity')
  },

  {
    title: "Complete AI Chatbot",
    preamble: `<div class="preamble"><h3>Full-Featured Chatbot</h3><p>Combine everything into a production-ready chatbot.</p></div>`,
    description: "Build a complete chatbot with history, typing indicators, and error handling.",
    objectives: ["Maintain conversation history", "Show typing indicator", "Handle errors gracefully", "Clear conversations"],
    starterCode: `<!DOCTYPE html>
<html><body>
  <!-- TODO: Build complete chatbot -->
</body></html>`,
    solution: `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:sans-serif;background:#1e293b;color:#fff;height:100vh;display:flex;flex-direction:column}
#header{padding:1rem;background:#8b5cf6;display:flex;justify-content:space-between;align-items:center}
#messages{flex:1;overflow-y:auto;padding:1rem}
.message{margin-bottom:1rem;display:flex}
.message.user{justify-content:flex-end}
.bubble{padding:0.75rem 1rem;border-radius:12px;max-width:70%}
.user .bubble{background:#8b5cf6}
.assistant .bubble{background:rgba(255,255,255,0.1)}
.typing{color:#888}
#input-area{padding:1rem;background:rgba(0,0,0,0.3);display:flex;gap:0.5rem}
input{flex:1;padding:0.75rem;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#fff}
button{padding:0.75rem 1.5rem;border:none;border-radius:8px;background:#8b5cf6;color:#fff;cursor:pointer}
</style></head>
<body>
  <div id="header">
    <h2>AI Chatbot</h2>
    <button onclick="clearChat()">Clear</button>
  </div>
  <div id="messages"></div>
  <div id="input-area">
    <input id="userInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter')sendMessage()">
    <button onclick="sendMessage()">Send</button>
  </div>
  <script>
    const history = [];
    function sendMessage() {
      const input = document.getElementById('userInput');
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, true);
      history.push({role: 'user', content: text});
      input.value = '';
      showTyping();
      setTimeout(() => {
        hideTyping();
        const response = "I understand you said: " + text;
        addMessage(response, false);
        history.push({role: 'assistant', content: response});
      }, 1500);
    }
    function addMessage(text, isUser) {
      const div = document.createElement('div');
      div.className = 'message ' + (isUser ? 'user' : 'assistant');
      div.innerHTML = '<div class="bubble">' + text + '</div>';
      document.getElementById('messages').appendChild(div);
      div.scrollIntoView({behavior: 'smooth'});
    }
    function showTyping() {
      const div = document.createElement('div');
      div.id = 'typing';
      div.className = 'message assistant';
      div.innerHTML = '<div class="bubble typing">Typing...</div>';
      document.getElementById('messages').appendChild(div);
    }
    function hideTyping() {
      const typing = document.getElementById('typing');
      if (typing) typing.remove();
    }
    function clearChat() {
      document.getElementById('messages').innerHTML = '';
      history.length = 0;
    }
  </script>
</body></html>`,
    hint: "Maintain a history array with {role, content} objects. Add typing indicator, then remove it when response arrives.",
    validation: (code) => code.includes('history') && code.includes('typing') && code.includes('clear')
  }
];

const workshopSummary = {
  message: "Congratulations! You've mastered AI integration!",
  skillsLearned: ["API Integration", "Async/Await", "Streaming", "Function Calling", "RAG Systems", "Chat Interfaces", "Error Handling", "Production Patterns"],
  achievements: [
    {icon: "🤖", title: "AI Master", description: "Built production-ready AI features"},
    {icon: "⚡", title: "Streaming Pro", description: "Implemented real-time AI responses"},
    {icon: "🎯", title: "Function Caller", description: "Mastered function calling patterns"},
    {icon: "💬", title: "Chat Builder", description: "Created a complete chatbot"}
  ],
  nextSteps: [
    "Integrate with real AI APIs (OpenAI, Anthropic)",
    "Build RAG systems with vector databases",
    "Implement advanced prompt engineering",
    "Add authentication and rate limiting",
    "Explore client-side LLMs with WebLLM"
  ],
  resources: [
    {name: "OpenAI API Docs", url: "https://platform.openai.com/docs/"},
    {name: "Anthropic Claude Docs", url: "https://docs.anthropic.com/"},
    {name: "LangChain.js", url: "https://js.langchain.com/"},
    {name: "Vercel AI SDK", url: "https://sdk.vercel.ai/"}
  ]
};
