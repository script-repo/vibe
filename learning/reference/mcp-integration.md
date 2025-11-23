# MCP (Model Context Protocol) Integration for Web Applications

## Table of Contents
1. [What is MCP and How It Works](#what-is-mcp-and-how-it-works)
2. [MCP Client Implementation in Web Apps](#mcp-client-implementation-in-web-apps)
3. [MCP Server Connections from Browser](#mcp-server-connections-from-browser)
4. [Use Cases for MCP in Web Applications](#use-cases-for-mcp-in-web-applications)
5. [Authentication and Security](#authentication-and-security)
6. [Available MCP Tools and Resources](#available-mcp-tools-and-resources)
7. [Example Integrations and Patterns](#example-integrations-and-patterns)
8. [Browser Compatibility and Limitations](#browser-compatibility-and-limitations)
9. [Transport Protocols: stdio vs HTTP](#transport-protocols-stdio-vs-http)
10. [Practical Examples](#practical-examples)

---

## What is MCP and How It Works

### Overview

The **Model Context Protocol (MCP)** is an open standard introduced by Anthropic in November 2024 that standardizes how AI systems like Large Language Models (LLMs) integrate and share data with external tools, systems, and data sources.

MCP enables developers to build secure, two-way connections between their data sources and AI-powered tools, providing a universal framework for connecting AI applications with external data and tools.

### Architecture

MCP follows a **client-server architecture**:

- **MCP Servers**: Lightweight programs that expose specific capabilities (resources, tools, prompts) through the standardized protocol
- **MCP Clients**: AI applications (like IDEs, chat interfaces, or custom AI workflows) that connect to these servers
- **Transport Layer**: Communication mechanism (stdio, HTTP, WebSocket) that enables the connection

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│             │         │             │         │              │
│  MCP Client │ ←──────→│  Transport  │ ←──────→│  MCP Server  │
│  (Web App)  │         │   Layer     │         │  (Backend)   │
│             │         │             │         │              │
└─────────────┘         └─────────────┘         └──────────────┘
```

### Core Components

1. **Resources**: Data sources that can be exposed to LLMs (documents, database records, API responses)
2. **Tools**: Actions that can be invoked by the LLM (search, query, transform data)
3. **Prompts**: Templated messages or workflows that guide LLM behavior
4. **Transports**: Communication protocols (stdio, Streamable HTTP, SSE)

### Major Milestones

- **November 2024**: Anthropic introduces MCP as an open standard
- **March 2025**:
  - OpenAI officially adopts MCP across ChatGPT, Agents SDK, and Responses API
  - Anthropic releases updated spec with OAuth 2.1 and Streamable HTTP Transport
- **April 2025**: Google DeepMind confirms MCP support in Gemini models
- **November 2025**: Anthropic introduces "code execution with MCP" pattern (98.7% token reduction)

---

## MCP Client Implementation in Web Apps

### Browser-Compatible SDKs

#### Official TypeScript SDK

```bash
npm install @modelcontextprotocol/sdk
```

The official SDK provides full MCP specification support but requires Node.js APIs for some features.

#### Browser-Specific SDK: @moinfra/mcp-client-sdk

```bash
npm install @moinfra/mcp-client-sdk
```

This is a **browser-compatible fork** that removes server-specific components and Node.js dependencies:
- No stdio transport (requires Node.js process management)
- No server-side handlers
- Includes **PseudoTransport** for in-process client-server communication
- Optimized for browser and mobile app environments

### Basic Client Setup

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { HttpClientTransport } from "@modelcontextprotocol/sdk/client/http.js";

// Create MCP client
const client = new Client({
  name: "my-web-app",
  version: "1.0.0"
});

// Connect via HTTP transport
const transport = new HttpClientTransport({
  url: "https://api.example.com/mcp"
});

await client.connect(transport);

// Initialize connection
await client.initialize();
```

### Client Operations

#### List Available Resources

```javascript
const resources = await client.listResources();
console.log("Available resources:", resources);
```

#### Read a Resource

```javascript
const result = await client.readResource({
  uri: "config://app/settings"
});
console.log("Resource content:", result.contents);
```

#### List Available Tools

```javascript
const tools = await client.listTools();
console.log("Available tools:", tools);
```

#### Call a Tool

```javascript
const result = await client.callTool({
  name: "search",
  arguments: {
    query: "latest news",
    limit: 10
  }
});
console.log("Tool result:", result);
```

### Alternative Client Libraries

#### mcp-use-ts

```bash
npm install mcp-use
```

Complete TypeScript framework with React hooks and dev tools:

```javascript
import { useMCPClient } from 'mcp-use';

function MyComponent() {
  const { client, tools, resources } = useMCPClient({
    serverUrl: 'https://api.example.com/mcp'
  });

  // Use tools and resources in your component
}
```

#### @mastra/mcp

```bash
npm install @mastra/mcp
```

Wrapper around official SDK with additional Mastra-specific functionality.

---

## MCP Server Connections from Browser

### Transport Options for Browser

Browser-based MCP clients have limited transport options due to web security constraints:

#### 1. HTTP/Streamable HTTP (Recommended)

**Streamable HTTP** is the current standard (as of March 2025) that replaces HTTP+SSE:

```javascript
import { HttpClientTransport } from "@modelcontextprotocol/sdk/client/http.js";

const transport = new HttpClientTransport({
  url: "https://api.example.com/mcp",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN"
  }
});

await client.connect(transport);
```

**Features:**
- Uses HTTP POST/GET requests
- Optional SSE for multi-message streaming
- Session management via `Mcp-Session-Id` header
- Suitable for remote server connections

#### 2. Server-Sent Events (SSE) - Legacy

SSE was deprecated as standalone transport in protocol version 2024-11-05, but is incorporated into Streamable HTTP:

```javascript
// Legacy SSE implementation
const eventSource = new EventSource('https://api.example.com/mcp/sse');

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMCPMessage(message);
};

// Client sends messages via POST
fetch('https://api.example.com/mcp/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(message)
});
```

#### 3. WebSocket

WebSocket support is being actively developed for MCP:

```javascript
// WebSocket implementation (community implementations available)
const ws = new WebSocket('wss://api.example.com/mcp');

ws.onopen = () => {
  console.log('MCP WebSocket connected');
  // Initialize protocol
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMCPMessage(message);
};

ws.send(JSON.stringify({
  jsonrpc: "2.0",
  method: "initialize",
  params: { /* ... */ }
}));
```

**Advantages:**
- Bidirectional communication
- Better for server-initiated notifications
- Lower latency than HTTP polling
- Suitable for real-time applications

**Limitations:**
- Not in official SDK yet (community implementations exist)
- WebSocket headers not accessible in browser JavaScript API
- Requires careful CORS configuration

#### 4. PseudoTransport (In-Process)

For testing or edge cases where client and server run in same process:

```javascript
import { PseudoTransport } from "@moinfra/mcp-client-sdk";

// Create server and client in same process
const serverTransport = new PseudoTransport();
const clientTransport = serverTransport.getClientTransport();

// Connect server
server.connect(serverTransport);

// Connect client
client.connect(clientTransport);
```

### Proxy Architecture for Browser Clients

Most production web apps use a **proxy architecture** to overcome browser limitations:

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│  Browser    │  HTTP   │  Your API   │  stdio  │  MCP Server  │
│  (Client)   │ ←─────→ │  (Proxy)    │ ←─────→ │  (Process)   │
└─────────────┘         └─────────────┘         └──────────────┘
```

**Example proxy implementation:**

```javascript
// Backend API endpoint (Node.js/Express)
import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();

// Proxy endpoint
app.post('/api/mcp/:operation', async (req, res) => {
  // Create client connected to local MCP server via stdio
  const client = new Client({ name: "proxy", version: "1.0.0" });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./mcp-server.js']
  });

  await client.connect(transport);

  // Forward request to MCP server
  const operation = req.params.operation;
  const result = await client[operation](req.body);

  res.json(result);
});
```

---

## Use Cases for MCP in Web Applications

### 1. AI-Powered Coding Assistants

Enable access to codebases, documentation, and development tools:

```javascript
// Example: Code search tool
const codeResult = await client.callTool({
  name: "search_codebase",
  arguments: {
    query: "authentication middleware",
    fileTypes: ["js", "ts"]
  }
});
```

### 2. Enterprise Data Assistants

Securely access company data, documents, and internal services:

```javascript
// Example: Enterprise document search
const docs = await client.readResource({
  uri: "enterprise://documents/policies"
});

const searchResult = await client.callTool({
  name: "search_documents",
  arguments: {
    query: "vacation policy",
    departments: ["HR"]
  }
});
```

### 3. AI-Driven Data Querying

Connect AI models with databases for natural language interfaces:

```javascript
// Example: Database query tool
const result = await client.callTool({
  name: "query_database",
  arguments: {
    query: "Show me sales from last quarter",
    database: "analytics"
  }
});
```

### 4. Multi-Modal Content Generation

Access APIs for image generation, video processing, etc.:

```javascript
// Example: Image generation
const image = await client.callTool({
  name: "generate_image",
  arguments: {
    prompt: "A futuristic city at sunset",
    style: "cyberpunk"
  }
});
```

### 5. Real-Time Collaboration Tools

Enable AI assistants in collaborative environments:

```javascript
// Example: Document collaboration
const suggestions = await client.callTool({
  name: "suggest_edits",
  arguments: {
    documentId: "doc123",
    context: "improve clarity"
  }
});
```

### 6. Customer Support Automation

Access knowledge bases, ticketing systems, and user data:

```javascript
// Example: Support ticket tool
const ticket = await client.callTool({
  name: "create_ticket",
  arguments: {
    subject: "Login issue",
    priority: "high",
    userId: "user123"
  }
});
```

### 7. E-Commerce Personal Assistants

Connect to product catalogs, user preferences, and order systems:

```javascript
// Example: Product search
const products = await client.callTool({
  name: "search_products",
  arguments: {
    query: "wireless headphones",
    priceRange: { min: 50, max: 200 }
  }
});
```

---

## Authentication and Security

### OAuth 2.1 (Official Standard)

As of March 2025, MCP officially uses **OAuth 2.1** for authorization:

```javascript
// Client-side OAuth flow
const authUrl = `https://auth.example.com/oauth/authorize?
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=mcp:read mcp:write&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`; // PKCE required

// Redirect user to authUrl
window.location.href = authUrl;

// After redirect back with code
const tokenResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier // PKCE
  })
});

const { access_token } = await tokenResponse.json();

// Use token with MCP client
const transport = new HttpClientTransport({
  url: "https://api.example.com/mcp",
  headers: {
    "Authorization": `Bearer ${access_token}`
  }
});
```

### API Key Authentication

For simpler scenarios:

```javascript
const transport = new HttpClientTransport({
  url: "https://api.example.com/mcp",
  headers: {
    "X-API-Key": "your-api-key-here"
  }
});
```

### JWT Authentication

For token-based auth with user claims:

```javascript
const jwt = generateJWT({
  userId: "user123",
  permissions: ["read", "write"],
  exp: Date.now() + 3600000
});

const transport = new HttpClientTransport({
  url: "https://api.example.com/mcp",
  headers: {
    "Authorization": `Bearer ${jwt}`
  }
});
```

### Security Best Practices

1. **Use PKCE**: All OAuth flows MUST use PKCE (Proof Key for Code Exchange)
2. **Separate Secrets**: Don't reuse server client secrets for end-user flows
3. **Secret Management**: Store secrets in proper secret managers, not source control
4. **HTTPS Only**: All MCP communications must use HTTPS in production
5. **Token Rotation**: Implement refresh token rotation
6. **Origin Validation**: Validate Origin header on server connections
7. **CORS Policies**: Implement strict CORS policies
8. **Rate Limiting**: Implement rate limiting on MCP endpoints
9. **Session Management**: Use `Mcp-Session-Id` header for session tracking
10. **Input Validation**: Validate all tool arguments and resource URIs

### CORS Configuration for MCP Servers

```javascript
// Express.js CORS setup for MCP
import cors from 'cors';

app.use(cors({
  origin: ['https://your-web-app.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Mcp-Session-Id',
    'Last-Event-Id'
  ],
  exposedHeaders: [
    'Mcp-Session-Id'  // Critical for session management
  ],
  credentials: true
}));
```

---

## Available MCP Tools and Resources

### Official SDKs

#### 1. @modelcontextprotocol/sdk
```bash
npm install @modelcontextprotocol/sdk
```
- Official TypeScript SDK
- Full specification support
- 15,935+ dependent projects
- Version: 1.21.1 (as of research)

#### 2. Python SDK
```bash
pip install mcp
```
- Official Python implementation
- FastMCP framework for rapid development
- Type hints and docstrings integration

### Browser-Specific

#### 3. @moinfra/mcp-client-sdk
```bash
npm install @moinfra/mcp-client-sdk
```
- Browser-compatible fork
- No Node.js dependencies
- PseudoTransport for in-process communication

### Frameworks

#### 4. mcp-framework
```bash
npm install mcp-framework
```
- Elegant MCP server builder
- Directory-based discovery
- Auto-registration of tools, resources, prompts

#### 5. mcp-use
```bash
npm install mcp-use
```
- Complete TypeScript framework
- React hooks integration
- Built-in inspector and dev tools

#### 6. @mastra/mcp
```bash
npm install @mastra/mcp
```
- Wrapper around official SDK
- Mastra-specific functionality
- Enterprise features

### Community Tools

#### 7. punkpeye/mcp-client
- Abstracted API (no Zod schemas, pagination handling)
- Convenient higher-level interface

#### 8. AI SDK MCP Integration
```bash
npm install ai
```
- Lightweight MCP client
- Easy tool retrieval
- Integration with Vercel AI SDK

### Development Tools

#### 9. MCP Inspector
- Built-in debugging tool
- Connection testing
- Resource/tool exploration

#### 10. Claude Desktop
- Native MCP client
- Easy server configuration
- Development testing environment

### Example Servers (30+ available)

Popular MCP servers include:
- **GitHub MCP**: Access repositories, issues, PRs
- **Filesystem MCP**: File operations
- **Database MCP**: SQL queries
- **Playwright MCP**: Browser automation
- **Contentful MCP**: CMS integration
- **Weather MCP**: Weather data
- **Time MCP**: Time/date utilities
- **Memory MCP**: Persistent storage

### Resources and Documentation

- **Official Site**: https://modelcontextprotocol.io
- **GitHub**: https://github.com/modelcontextprotocol
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Python SDK**: https://github.com/modelcontextprotocol/python-sdk
- **Specification**: https://modelcontextprotocol.io/specification
- **Examples**: https://modelcontextprotocol.io/examples
- **Community**: Discord, GitHub Discussions

---

## Example Integrations and Patterns

### Pattern 1: Simple Resource Server

```javascript
// server.js - MCP Server with Resources
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: "resource-server", version: "1.0.0" },
  { capabilities: { resources: {} } }
);

// Register static resource
server.setRequestHandler('resources/list', async () => ({
  resources: [
    {
      uri: "config://app",
      name: "App Config",
      description: "Application configuration",
      mimeType: "application/json"
    }
  ]
}));

server.setRequestHandler('resources/read', async (request) => {
  if (request.params.uri === "config://app") {
    return {
      contents: [{
        uri: "config://app",
        mimeType: "application/json",
        text: JSON.stringify({
          appName: "My App",
          version: "1.0.0",
          features: ["auth", "api"]
        })
      }]
    };
  }
  throw new Error("Resource not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Pattern 2: Tool Server with Business Logic

```javascript
// tool-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server(
  { name: "tool-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: "calculate",
      description: "Perform mathematical calculations",
      inputSchema: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Math expression to evaluate"
          }
        },
        required: ["expression"]
      }
    },
    {
      name: "fetch_data",
      description: "Fetch data from external API",
      inputSchema: {
        type: "object",
        properties: {
          endpoint: { type: "string" },
          method: { type: "string", enum: ["GET", "POST"] }
        },
        required: ["endpoint"]
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "calculate") {
    // Safe eval alternative
    const result = evaluateExpression(args.expression);
    return {
      content: [{ type: "text", text: `Result: ${result}` }]
    };
  }

  if (name === "fetch_data") {
    const response = await fetch(args.endpoint, {
      method: args.method || "GET"
    });
    const data = await response.json();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

### Pattern 3: HTTP Server with Express

```javascript
// http-server.js
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { HttpServerTransport } from '@modelcontextprotocol/sdk/server/http.js';

const app = express();
app.use(express.json());

const server = new Server(
  { name: "http-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// Register tools and resources
setupServer(server);

// MCP endpoint
app.post('/mcp', async (req, res) => {
  const transport = new HttpServerTransport({
    request: req,
    response: res
  });

  await server.connect(transport);
});

app.listen(3000, () => {
  console.log('MCP server running on http://localhost:3000/mcp');
});
```

### Pattern 4: WebSocket Server (Community Implementation)

```javascript
// websocket-server.js
import { WebSocketServer } from 'ws';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', async (ws) => {
  const server = new Server(
    { name: "ws-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // Custom WebSocket transport
  const transport = {
    async start() {
      ws.on('message', async (data) => {
        const message = JSON.parse(data.toString());
        const response = await server.handleMessage(message);
        ws.send(JSON.stringify(response));
      });
    },
    async send(message) {
      ws.send(JSON.stringify(message));
    },
    async close() {
      ws.close();
    }
  };

  setupServer(server);
  await server.connect(transport);
});
```

### Pattern 5: Single-File Web App with MCP

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MCP Web App</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    .output {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
      white-space: pre-wrap;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover { background: #0056b3; }
    input {
      padding: 8px;
      width: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>MCP Web Application</h1>

  <div>
    <h2>Connection</h2>
    <input id="serverUrl" placeholder="Server URL" value="http://localhost:3000/mcp">
    <button onclick="connect()">Connect</button>
    <span id="status">Disconnected</span>
  </div>

  <div>
    <h2>Resources</h2>
    <button onclick="listResources()">List Resources</button>
    <button onclick="readResource()">Read Resource</button>
  </div>

  <div>
    <h2>Tools</h2>
    <button onclick="listTools()">List Tools</button>
    <input id="toolQuery" placeholder="Query">
    <button onclick="callTool()">Call Tool</button>
  </div>

  <div id="output" class="output">Output will appear here...</div>

  <script type="module">
    let mcpClient = null;
    let sessionId = null;

    window.connect = async function() {
      const serverUrl = document.getElementById('serverUrl').value;
      document.getElementById('status').textContent = 'Connecting...';

      try {
        // Initialize MCP connection
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: {
                name: "web-app",
                version: "1.0.0"
              }
            },
            id: 1
          })
        });

        const data = await response.json();
        sessionId = response.headers.get('Mcp-Session-Id');

        document.getElementById('status').textContent = 'Connected ✓';
        log('Connected to MCP server', data.result);
      } catch (error) {
        document.getElementById('status').textContent = 'Error';
        log('Connection error:', error.message);
      }
    };

    window.listResources = async function() {
      const result = await sendRequest('resources/list', {});
      log('Available resources:', result);
    };

    window.readResource = async function() {
      const result = await sendRequest('resources/read', {
        uri: 'config://app'
      });
      log('Resource content:', result);
    };

    window.listTools = async function() {
      const result = await sendRequest('tools/list', {});
      log('Available tools:', result);
    };

    window.callTool = async function() {
      const query = document.getElementById('toolQuery').value;
      const result = await sendRequest('tools/call', {
        name: 'search',
        arguments: { query }
      });
      log('Tool result:', result);
    };

    async function sendRequest(method, params) {
      const serverUrl = document.getElementById('serverUrl').value;

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Mcp-Session-Id': sessionId || ''
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: Date.now()
        })
      });

      const data = await response.json();
      return data.result;
    }

    function log(title, data) {
      const output = document.getElementById('output');
      output.textContent = `${title}\n${JSON.stringify(data, null, 2)}`;
    }
  </script>
</body>
</html>
```

### Pattern 6: React + MCP Integration

```javascript
// MCPProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const MCPContext = createContext(null);

export function MCPProvider({ children, serverUrl }) {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState([]);
  const [tools, setTools] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: { name: "react-app", version: "1.0.0" }
            },
            id: 1
          })
        });

        if (response.ok) {
          setConnected(true);
          setClient({ serverUrl, sessionId: response.headers.get('Mcp-Session-Id') });

          // Load resources and tools
          await loadResources();
          await loadTools();
        }
      } catch (error) {
        console.error('MCP connection failed:', error);
      }
    }

    init();
  }, [serverUrl]);

  async function sendRequest(method, params) {
    const response = await fetch(client.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': client.sessionId || ''
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: Date.now()
      })
    });

    const data = await response.json();
    return data.result;
  }

  async function loadResources() {
    const result = await sendRequest('resources/list', {});
    setResources(result.resources || []);
  }

  async function loadTools() {
    const result = await sendRequest('tools/list', {});
    setTools(result.tools || []);
  }

  async function readResource(uri) {
    return sendRequest('resources/read', { uri });
  }

  async function callTool(name, args) {
    return sendRequest('tools/call', { name, arguments: args });
  }

  const value = {
    connected,
    client,
    resources,
    tools,
    readResource,
    callTool
  };

  return (
    <MCPContext.Provider value={value}>
      {children}
    </MCPContext.Provider>
  );
}

export function useMCP() {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error('useMCP must be used within MCPProvider');
  }
  return context;
}

// Usage in component:
function App() {
  return (
    <MCPProvider serverUrl="http://localhost:3000/mcp">
      <Dashboard />
    </MCPProvider>
  );
}

function Dashboard() {
  const { connected, tools, callTool } = useMCP();
  const [result, setResult] = useState(null);

  async function handleSearch() {
    const result = await callTool('search', { query: 'test' });
    setResult(result);
  }

  return (
    <div>
      <h1>MCP Dashboard</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSearch}>Search</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

---

## Browser Compatibility and Limitations

### CORS Challenges

**Primary Issue**: MCP servers using HTTP transport require careful CORS configuration to accept requests from web browsers.

#### Required CORS Headers

```javascript
// Server-side CORS configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://your-app.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', [
    'Content-Type',
    'Authorization',
    'Accept',
    'Mcp-Session-Id',
    'Last-Event-Id'
  ].join(', '));
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});
```

#### Critical Headers

- `Mcp-Session-Id`: Must be in `exposedHeaders` for session management
- `Last-Event-Id`: Required for SSE reconnection
- Many proxies strip non-standard headers by default

### Browser-Specific Issues

#### Chrome
- Streamable HTTP may give CORS errors
- Strict enforcement of CORS policies
- WebSocket header access limited

#### Firefox
- SSE generally works better
- More lenient CORS handling
- Better WebSocket debugging tools

#### Safari
- Additional CORS restrictions
- Limited WebSocket debugging
- May require polyfills for older versions

### Architectural Limitations

#### 1. No Direct stdio Access

Browsers cannot spawn subprocesses, so stdio transport is unavailable:

```javascript
// ❌ Does NOT work in browser
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
// Error: process.spawn is not available
```

**Solution**: Use HTTP transport or proxy architecture

#### 2. Cross-Origin Restrictions

Browsers enforce same-origin policy:

```javascript
// ❌ May be blocked by CORS
fetch('http://different-domain.com/mcp', { /* ... */ });
```

**Solutions**:
- Run MCP server on same domain
- Use reverse proxy
- Configure CORS properly
- Use backend proxy

#### 3. WebSocket Header Limitations

JavaScript WebSocket API doesn't expose headers:

```javascript
// ❌ Cannot access headers in browser
const ws = new WebSocket('wss://example.com/mcp');
// No way to read Mcp-Session-Id from response headers
```

**Solution**: Use HTTP handshake first, then upgrade to WebSocket

#### 4. Limited Transport Options

Only HTTP-based transports work in browsers:
- ✅ HTTP/Streamable HTTP
- ✅ SSE (via EventSource)
- ⚠️  WebSocket (limited, community implementations)
- ❌ stdio (requires Node.js)
- ❌ Custom transports (limited by browser APIs)

### Performance Considerations

#### HTTP Overhead
- Each request requires full HTTP handshake
- Higher latency than stdio
- More network bandwidth

#### Connection Pooling
- Browsers limit concurrent connections (typically 6-8 per domain)
- May need connection pooling strategy

#### Memory Constraints
- Browser tabs have memory limits
- Large resource transfers may cause issues
- Consider pagination and streaming

### Security Limitations

#### 1. Secret Storage
```javascript
// ❌ Never store secrets in client-side code
const API_KEY = "secret123"; // Visible in source code

// ✅ Use backend proxy to handle secrets
fetch('/api/mcp', { /* Backend handles auth */ });
```

#### 2. CORS as Security
CORS doesn't prevent API access from MCP servers - it's only enforced by browsers, not by APIs themselves.

#### 3. XSS Vulnerabilities
User input must be sanitized:
```javascript
// ✅ Sanitize before display
function displayResult(result) {
  element.textContent = result; // Safe
  // element.innerHTML = result; // ❌ XSS risk
}
```

### Workarounds and Best Practices

#### 1. Use Proxy Architecture

```
Browser → Your Backend → MCP Server
(HTTP)    (stdio/HTTP)    (any transport)
```

#### 2. Implement Proper CORS

Test with multiple browsers and scenarios.

#### 3. Use Browser-Compatible SDK

```bash
npm install @moinfra/mcp-client-sdk
```

#### 4. Implement Retry Logic

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

#### 5. Handle Connection Failures

```javascript
class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    try {
      await this.initialize();
      this.connected = true;
      this.reconnectAttempts = 0;
    } catch (error) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => this.connect(), delay);
      }
    }
  }
}
```

---

## Transport Protocols: stdio vs HTTP

### Overview

MCP supports two primary transport mechanisms:
1. **stdio** (Standard Input/Output)
2. **Streamable HTTP** (HTTP POST/GET with optional SSE)

### stdio Transport

#### Characteristics

- Server runs as subprocess of client
- Communication via stdin/stdout
- Messages delimited by newlines
- Local execution only

#### Architecture

```
┌─────────────┐
│  Client     │
│  Process    │
│             │
│  ┌────────┐ │
│  │ Server │ │  stdio pipes
│  │ Child  │ │  ←──────→
│  └────────┘ │
└─────────────┘
```

#### Implementation

```javascript
// Node.js client with stdio transport
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./server.js'],
  env: process.env
});

const client = new Client({
  name: "my-client",
  version: "1.0.0"
});

await client.connect(transport);
```

#### Server Side

```javascript
// server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Setup handlers...

const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Advantages

✅ **Ultra-low latency**: Microsecond-level response times
✅ **No network overhead**: Direct process communication
✅ **Simple authentication**: Runs in trusted local environment
✅ **No CORS issues**: Not subject to browser security policies
✅ **Reliable**: Rarely timeout unless process hangs
✅ **Efficient**: No HTTP parsing or serialization overhead

#### Disadvantages

❌ **Local only**: Cannot access remote servers
❌ **Single client**: Each client spawns new server process
❌ **No browser support**: Requires Node.js or similar runtime
❌ **Process management**: Must handle subprocess lifecycle
❌ **Resource intensive**: Multiple servers for multiple clients

#### Use Cases

- Desktop applications (VS Code, Claude Desktop, Cursor)
- CLI tools
- Local development environments
- High-performance local integrations

### Streamable HTTP Transport

#### Characteristics

- Server runs independently
- Communication via HTTP POST/GET
- Optional SSE for server→client streaming
- Session management via headers
- Remote access capable

#### Architecture

```
┌─────────────┐      HTTP       ┌─────────────┐
│  Client     │                 │  Server     │
│  (any)      │  ←──────────→   │  (remote)   │
│             │  POST/GET       │             │
└─────────────┘                 └─────────────┘
       │                               │
       └─── SSE (optional) ────────────┘
```

#### Implementation

```javascript
// Client with HTTP transport
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { HttpClientTransport } from '@modelcontextprotocol/sdk/client/http.js';

const transport = new HttpClientTransport({
  url: 'https://api.example.com/mcp',
  headers: {
    'Authorization': 'Bearer token123'
  }
});

const client = new Client({
  name: "web-client",
  version: "1.0.0"
});

await client.connect(transport);
```

#### Server Side (Express)

```javascript
// server.js
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { HttpServerTransport } from '@modelcontextprotocol/sdk/server/http.js';

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const server = new Server(
    { name: "http-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // Setup handlers...

  const transport = new HttpServerTransport({
    request: req,
    response: res
  });

  await server.connect(transport);
});

app.listen(3000);
```

#### Session Management

```javascript
// Server includes session ID in response
res.setHeader('Mcp-Session-Id', generateSessionId());

// Client includes session ID in subsequent requests
fetch(url, {
  headers: {
    'Mcp-Session-Id': sessionId
  }
});
```

#### Advantages

✅ **Remote access**: Connect to servers anywhere
✅ **Multi-client**: One server, many clients
✅ **Browser compatible**: Works in web applications
✅ **Scalable**: Horizontal scaling possible
✅ **Centralized**: Single deployment, multiple users
✅ **Cloud-native**: Deploy to serverless, containers, etc.

#### Disadvantages

❌ **Higher latency**: Network and HTTP overhead
❌ **More complex**: Authentication, CORS, session management
❌ **Timeouts**: Network issues can cause failures
❌ **CORS challenges**: Must configure properly for browsers
❌ **Bandwidth**: More data transfer overhead

#### Use Cases

- Web applications
- Mobile apps
- Multi-user services
- Cloud-deployed integrations
- Public API endpoints
- Enterprise services

### SSE (Server-Sent Events)

#### Deprecated Status

SSE as standalone transport was deprecated in protocol version 2024-11-05. It's now incorporated into Streamable HTTP as optional streaming.

#### Implementation (Legacy/Streamable HTTP)

```javascript
// Client with SSE for server notifications
const eventSource = new EventSource('https://api.example.com/mcp/events');

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  handleNotification(notification);
};

// Send requests via POST
async function sendRequest(method, params) {
  const response = await fetch('https://api.example.com/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 })
  });
  return response.json();
}
```

#### Advantages

✅ **Server push**: Server can initiate notifications
✅ **Automatic reconnect**: EventSource handles reconnection
✅ **Simple**: Easier than WebSocket for one-way streaming
✅ **HTTP-based**: Works through proxies

#### Disadvantages

❌ **Unidirectional**: Server→Client only
❌ **Requires two connections**: SSE + HTTP POST
❌ **Deprecated**: Moving to Streamable HTTP
❌ **Limited control**: Less flexible than WebSocket

### WebSocket Transport (Community)

#### Status

Not officially supported yet, but community implementations exist.

#### Advantages

✅ **Bidirectional**: Full duplex communication
✅ **Real-time**: Low latency notifications
✅ **Efficient**: Less overhead than HTTP polling
✅ **Single connection**: One persistent connection

#### Disadvantages

❌ **Not official**: No official SDK support yet
❌ **Header limitations**: Cannot access headers in browser
❌ **Complex**: More complex to implement correctly
❌ **Proxy issues**: Some proxies block WebSocket

### Comparison Table

| Feature | stdio | Streamable HTTP | WebSocket |
|---------|-------|-----------------|-----------|
| **Latency** | ⚡ Microseconds | 🐌 Milliseconds | ⚡ Low |
| **Browser Support** | ❌ No | ✅ Yes | ✅ Yes |
| **Remote Access** | ❌ No | ✅ Yes | ✅ Yes |
| **Multi-Client** | ❌ No | ✅ Yes | ✅ Yes |
| **Bidirectional** | ✅ Yes | ⚠️ Via SSE | ✅ Native |
| **Official Support** | ✅ Full | ✅ Full | ❌ Community |
| **CORS Issues** | ✅ None | ⚠️ Must configure | ⚠️ Must configure |
| **Setup Complexity** | ✅ Simple | ⚠️ Moderate | ⚠️ Complex |
| **Scaling** | ❌ Per-process | ✅ Horizontal | ✅ Horizontal |
| **Use Case** | Desktop apps | Web apps | Real-time apps |

### Recommendations

#### Use stdio when:
- Building desktop applications
- Need maximum performance
- Local-only execution
- Simple authentication requirements

#### Use Streamable HTTP when:
- Building web applications
- Need remote access
- Supporting multiple clients
- Deploying to cloud
- **This is recommended for most web apps**

#### Use WebSocket when:
- Need real-time bidirectional communication
- Can implement custom transport
- Have specific low-latency requirements
- Official support arrives

---

## Practical Examples

### Example 1: Weather MCP Server and Client

#### Server (weather-server.js)

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: "weather-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

// Mock weather data
const weatherData = {
  'london': { temp: 15, condition: 'Cloudy', humidity: 70 },
  'new york': { temp: 22, condition: 'Sunny', humidity: 50 },
  'tokyo': { temp: 18, condition: 'Rainy', humidity: 80 }
};

// Resources
server.setRequestHandler('resources/list', async () => ({
  resources: [
    {
      uri: 'weather://cities',
      name: 'Available Cities',
      mimeType: 'application/json',
      description: 'List of cities with weather data'
    }
  ]
}));

server.setRequestHandler('resources/read', async (request) => {
  const uri = request.params.uri;

  if (uri === 'weather://cities') {
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(Object.keys(weatherData))
      }]
    };
  }

  throw new Error('Resource not found');
});

// Tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'get_weather',
      description: 'Get current weather for a city',
      inputSchema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name'
          },
          units: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature units',
            default: 'celsius'
          }
        },
        required: ['city']
      }
    },
    {
      name: 'compare_weather',
      description: 'Compare weather between two cities',
      inputSchema: {
        type: 'object',
        properties: {
          city1: { type: 'string' },
          city2: { type: 'string' }
        },
        required: ['city1', 'city2']
      }
    }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'get_weather') {
    const city = args.city.toLowerCase();
    const weather = weatherData[city];

    if (!weather) {
      return {
        content: [{
          type: 'text',
          text: `Weather data not available for ${args.city}`
        }],
        isError: true
      };
    }

    let temp = weather.temp;
    if (args.units === 'fahrenheit') {
      temp = (temp * 9/5) + 32;
    }

    return {
      content: [{
        type: 'text',
        text: `Weather in ${args.city}:\nTemperature: ${temp}°${args.units === 'fahrenheit' ? 'F' : 'C'}\nCondition: ${weather.condition}\nHumidity: ${weather.humidity}%`
      }]
    };
  }

  if (name === 'compare_weather') {
    const city1 = args.city1.toLowerCase();
    const city2 = args.city2.toLowerCase();
    const w1 = weatherData[city1];
    const w2 = weatherData[city2];

    if (!w1 || !w2) {
      return {
        content: [{
          type: 'text',
          text: 'One or both cities not found'
        }],
        isError: true
      };
    }

    const comparison = {
      cities: [args.city1, args.city2],
      temperature_diff: Math.abs(w1.temp - w2.temp),
      warmer: w1.temp > w2.temp ? args.city1 : args.city2,
      conditions: [w1.condition, w2.condition]
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(comparison, null, 2)
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Client (weather-client.js)

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const client = new Client({
    name: "weather-client",
    version: "1.0.0"
  });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./weather-server.js']
  });

  await client.connect(transport);
  console.log('Connected to weather server');

  // List resources
  const resources = await client.listResources();
  console.log('\n📚 Available resources:', resources);

  // Read cities resource
  const cities = await client.readResource({
    uri: 'weather://cities'
  });
  console.log('\n🌍 Cities:', JSON.parse(cities.contents[0].text));

  // List tools
  const tools = await client.listTools();
  console.log('\n🔧 Available tools:', tools.tools.map(t => t.name));

  // Get weather for London
  const londonWeather = await client.callTool({
    name: 'get_weather',
    arguments: { city: 'London', units: 'celsius' }
  });
  console.log('\n🌤️  London Weather:');
  console.log(londonWeather.content[0].text);

  // Compare two cities
  const comparison = await client.callTool({
    name: 'compare_weather',
    arguments: { city1: 'London', city2: 'Tokyo' }
  });
  console.log('\n📊 Weather Comparison:');
  console.log(comparison.content[0].text);

  await client.close();
}

main().catch(console.error);
```

### Example 2: Single-File Todo App with MCP

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Todo App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      width: 100%;
      padding: 30px;
    }

    h1 {
      color: #333;
      margin-bottom: 10px;
    }

    .status {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .status.connected {
      background: #10b981;
      color: white;
    }

    .status.disconnected {
      background: #ef4444;
      color: white;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    input[type="text"] {
      flex: 1;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
    }

    button {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    button:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    button:active {
      transform: translateY(0);
    }

    button.danger {
      background: #ef4444;
    }

    button.danger:hover {
      background: #dc2626;
    }

    .todos {
      list-style: none;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 10px;
      transition: all 0.3s;
    }

    .todo-item:hover {
      background: #f3f4f6;
      transform: translateX(5px);
    }

    .todo-item.completed {
      opacity: 0.6;
    }

    .todo-item.completed .todo-text {
      text-decoration: line-through;
    }

    .todo-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .todo-text {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .delete-btn {
      padding: 8px 16px;
      font-size: 12px;
    }

    .stats {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .error {
      background: #fee2e2;
      color: #991b1b;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📝 MCP Todo App</h1>
    <div id="status" class="status disconnected">Disconnected</div>

    <div id="error" style="display: none;" class="error"></div>

    <div class="input-group">
      <input type="text" id="todoInput" placeholder="What needs to be done?" />
      <button onclick="addTodo()">Add Todo</button>
    </div>

    <ul id="todoList" class="todos"></ul>

    <div class="stats">
      <span id="totalCount">Total: 0</span>
      <span id="completedCount">Completed: 0</span>
      <span id="pendingCount">Pending: 0</span>
    </div>
  </div>

  <script type="module">
    // Configuration
    const MCP_SERVER_URL = 'http://localhost:3000/mcp';

    let sessionId = null;
    let todos = [];

    // Initialize
    async function init() {
      try {
        await connectToMCP();
        await loadTodos();
        renderTodos();
      } catch (error) {
        showError('Failed to initialize: ' + error.message);
      }
    }

    // Connect to MCP server
    async function connectToMCP() {
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
              name: "todo-app",
              version: "1.0.0"
            }
          },
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to MCP server');
      }

      sessionId = response.headers.get('Mcp-Session-Id');
      updateStatus(true);
    }

    // MCP request helper
    async function mcpRequest(method, params = {}) {
      const response = await fetch(MCP_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Mcp-Session-Id': sessionId || ''
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: Date.now()
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.result;
    }

    // Load todos from MCP server
    async function loadTodos() {
      const result = await mcpRequest('tools/call', {
        name: 'list_todos',
        arguments: {}
      });

      todos = JSON.parse(result.content[0].text);
    }

    // Add todo
    window.addTodo = async function() {
      const input = document.getElementById('todoInput');
      const text = input.value.trim();

      if (!text) return;

      try {
        const result = await mcpRequest('tools/call', {
          name: 'add_todo',
          arguments: { text }
        });

        await loadTodos();
        renderTodos();
        input.value = '';
      } catch (error) {
        showError('Failed to add todo: ' + error.message);
      }
    };

    // Toggle todo completion
    window.toggleTodo = async function(id) {
      try {
        await mcpRequest('tools/call', {
          name: 'toggle_todo',
          arguments: { id }
        });

        await loadTodos();
        renderTodos();
      } catch (error) {
        showError('Failed to toggle todo: ' + error.message);
      }
    };

    // Delete todo
    window.deleteTodo = async function(id) {
      try {
        await mcpRequest('tools/call', {
          name: 'delete_todo',
          arguments: { id }
        });

        await loadTodos();
        renderTodos();
      } catch (error) {
        showError('Failed to delete todo: ' + error.message);
      }
    };

    // Render todos
    function renderTodos() {
      const list = document.getElementById('todoList');

      if (todos.length === 0) {
        list.innerHTML = '<li style="text-align: center; padding: 40px; color: #9ca3af;">No todos yet. Add one above!</li>';
      } else {
        list.innerHTML = todos.map(todo => `
          <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input
              type="checkbox"
              class="todo-checkbox"
              ${todo.completed ? 'checked' : ''}
              onchange="toggleTodo(${todo.id})"
            />
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn danger" onclick="deleteTodo(${todo.id})">Delete</button>
          </li>
        `).join('');
      }

      updateStats();
    }

    // Update statistics
    function updateStats() {
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      const pending = total - completed;

      document.getElementById('totalCount').textContent = `Total: ${total}`;
      document.getElementById('completedCount').textContent = `Completed: ${completed}`;
      document.getElementById('pendingCount').textContent = `Pending: ${pending}`;
    }

    // Update connection status
    function updateStatus(connected) {
      const statusEl = document.getElementById('status');
      statusEl.textContent = connected ? 'Connected' : 'Disconnected';
      statusEl.className = `status ${connected ? 'connected' : 'disconnected'}`;
    }

    // Show error
    function showError(message) {
      const errorEl = document.getElementById('error');
      errorEl.textContent = message;
      errorEl.style.display = 'block';

      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    }

    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Enter key support
    document.getElementById('todoInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTodo();
      }
    });

    // Initialize on load
    init();
  </script>
</body>
</html>
```

#### Corresponding MCP Server for Todo App

```javascript
// todo-server.js
import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory todo storage
let todos = [];
let nextId = 1;

app.post('/mcp', async (req, res) => {
  const server = new Server(
    { name: "todo-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // List tools
  server.setRequestHandler('tools/list', async () => ({
    tools: [
      {
        name: 'list_todos',
        description: 'List all todos',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'add_todo',
        description: 'Add a new todo',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Todo text' }
          },
          required: ['text']
        }
      },
      {
        name: 'toggle_todo',
        description: 'Toggle todo completion',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Todo ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'delete_todo',
        description: 'Delete a todo',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Todo ID' }
          },
          required: ['id']
        }
      }
    ]
  }));

  // Handle tool calls
  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'list_todos') {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(todos)
        }]
      };
    }

    if (name === 'add_todo') {
      const todo = {
        id: nextId++,
        text: args.text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.push(todo);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(todo)
        }]
      };
    }

    if (name === 'toggle_todo') {
      const todo = todos.find(t => t.id === args.id);
      if (!todo) {
        return {
          content: [{ type: 'text', text: 'Todo not found' }],
          isError: true
        };
      }

      todo.completed = !todo.completed;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(todo)
        }]
      };
    }

    if (name === 'delete_todo') {
      const index = todos.findIndex(t => t.id === args.id);
      if (index === -1) {
        return {
          content: [{ type: 'text', text: 'Todo not found' }],
          isError: true
        };
      }

      todos.splice(index, 1);

      return {
        content: [{
          type: 'text',
          text: 'Deleted successfully'
        }]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // Handle the request
  const message = req.body;

  // Simple JSON-RPC handling
  if (message.method === 'initialize') {
    const sessionId = Math.random().toString(36).substring(7);
    res.setHeader('Mcp-Session-Id', sessionId);
    res.json({
      jsonrpc: "2.0",
      id: message.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "todo-server", version: "1.0.0" }
      }
    });
  } else {
    const handler = server._requestHandlers.get(message.method);
    if (handler) {
      try {
        const result = await handler(message);
        res.json({
          jsonrpc: "2.0",
          id: message.id,
          result
        });
      } catch (error) {
        res.json({
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32603,
            message: error.message
          }
        });
      }
    } else {
      res.json({
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32601,
          message: 'Method not found'
        }
      });
    }
  }
});

app.listen(3000, () => {
  console.log('Todo MCP server running on http://localhost:3000/mcp');
});
```

### Example 3: Database Query MCP Server

```javascript
// database-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Database from 'better-sqlite3';

const db = new Database('app.db');

// Create sample tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    created_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const server = new Server(
  { name: "database-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// Resources
server.setRequestHandler('resources/list', async () => ({
  resources: [
    {
      uri: 'db://schema',
      name: 'Database Schema',
      description: 'Database table structure',
      mimeType: 'application/json'
    },
    {
      uri: 'db://stats',
      name: 'Database Statistics',
      description: 'Table row counts',
      mimeType: 'application/json'
    }
  ]
}));

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  if (uri === 'db://schema') {
    const tables = db.prepare(`
      SELECT name, sql
      FROM sqlite_master
      WHERE type='table'
    `).all();

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(tables, null, 2)
      }]
    };
  }

  if (uri === 'db://stats') {
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
      posts: db.prepare('SELECT COUNT(*) as count FROM posts').get()
    };

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(stats, null, 2)
      }]
    };
  }

  throw new Error('Resource not found');
});

// Tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'query',
      description: 'Execute a SELECT query',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SELECT query' }
        },
        required: ['sql']
      }
    },
    {
      name: 'insert_user',
      description: 'Insert a new user',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        },
        required: ['name', 'email']
      }
    },
    {
      name: 'create_post',
      description: 'Create a new post',
      inputSchema: {
        type: 'object',
        properties: {
          user_id: { type: 'number' },
          title: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['user_id', 'title', 'content']
      }
    }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'query') {
    // Security: Only allow SELECT queries
    if (!args.sql.trim().toUpperCase().startsWith('SELECT')) {
      return {
        content: [{
          type: 'text',
          text: 'Only SELECT queries are allowed'
        }],
        isError: true
      };
    }

    try {
      const results = db.prepare(args.sql).all();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Query error: ${error.message}`
        }],
        isError: true
      };
    }
  }

  if (name === 'insert_user') {
    const result = db.prepare(`
      INSERT INTO users (name, email, created_at)
      VALUES (?, ?, ?)
    `).run(args.name, args.email, new Date().toISOString());

    return {
      content: [{
        type: 'text',
        text: `User created with ID: ${result.lastInsertRowid}`
      }]
    };
  }

  if (name === 'create_post') {
    const result = db.prepare(`
      INSERT INTO posts (user_id, title, content, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      args.user_id,
      args.title,
      args.content,
      new Date().toISOString()
    );

    return {
      content: [{
        type: 'text',
        text: `Post created with ID: ${result.lastInsertRowid}`
      }]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## Summary and Best Practices

### Key Takeaways

1. **MCP is the Standard**: As of 2025, MCP is the open standard for connecting AI applications with external data and tools, with support from Anthropic, OpenAI, and Google.

2. **Choose the Right Transport**:
   - **stdio**: Desktop apps, maximum performance
   - **Streamable HTTP**: Web apps, remote access (recommended for web)
   - **WebSocket**: Real-time apps (when official support arrives)

3. **Browser Limitations**: Use proxy architecture or browser-compatible SDKs like `@moinfra/mcp-client-sdk`.

4. **Security First**: Implement OAuth 2.1, use PKCE, validate origins, configure CORS properly.

5. **Start Simple**: Begin with basic resources and tools, then add complexity as needed.

### Development Checklist

- [ ] Choose appropriate transport for your use case
- [ ] Install correct SDK (`@modelcontextprotocol/sdk` or `@moinfra/mcp-client-sdk`)
- [ ] Implement proper error handling and reconnection logic
- [ ] Configure CORS for browser-based clients
- [ ] Implement authentication (OAuth 2.1, API keys, or JWT)
- [ ] Define clear resource and tool schemas
- [ ] Add input validation for all tool arguments
- [ ] Test with multiple clients and scenarios
- [ ] Monitor performance and optimize as needed
- [ ] Document your MCP server's capabilities

### Resources for Further Learning

- **Official Documentation**: https://modelcontextprotocol.io
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Python SDK**: https://github.com/modelcontextprotocol/python-sdk
- **Examples**: https://modelcontextprotocol.io/examples
- **Specification**: https://modelcontextprotocol.io/specification
- **Community Servers**: 30+ example servers available on GitHub

### Future Developments

- Official WebSocket transport support
- Enhanced streaming capabilities
- More language SDK implementations
- Broader ecosystem adoption
- Improved debugging and monitoring tools

---

*Document created: 2025-11-09*
*MCP Protocol Version: 2024-11-05 (Streamable HTTP)*
*Based on research of official documentation, community implementations, and real-world usage patterns*
