# AI Integration Learning Path

**Duration:** 3-4 weeks
**Difficulty:** Intermediate to Advanced
**Prerequisites:**
- Completed [Web Fundamentals Path](./web-fundamentals.md)
- Understanding of async/await and Promises
- Basic knowledge of REST APIs
- Familiarity with JSON

---

## Overview

This path teaches you how to integrate AI capabilities into single-file web applications. You'll learn to work with LLM APIs (OpenAI, Claude), implement RAG systems, use function calling, explore client-side AI, and integrate with the Model Context Protocol (MCP).

---

## Learning Objectives

By the end of this path, you will:

- Integrate OpenAI and Anthropic Claude APIs
- Implement streaming responses with typewriter effects
- Build RAG (Retrieval Augmented Generation) systems
- Create AI agents with function calling/tool use
- Run AI models client-side in the browser
- Implement MCP (Model Context Protocol) integration
- Optimize token usage and manage costs
- Handle errors and rate limits gracefully

---

## Week 1: LLM API Fundamentals

### Day 1-2: Getting Started with LLM APIs
**Focus:** Basic integration with OpenAI and Claude

**Topics:**
- API key management (never expose in client!)
- Basic chat completions
- Request/response structure
- Error handling and rate limits
- CORS proxies for browser apps
- Environment variables and security

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (API Basics section)

**Practice:**
- Create a simple chat interface
- Implement API error handling
- Add loading states and retry logic
- Set up a simple proxy server (or use serverless functions)

**Security Warning:** Never expose API keys in client-side code! Use backend proxies or serverless functions.

**Code Structure:**
```javascript
async function callOpenAI(messages) {
  const response = await fetch('YOUR_PROXY_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}
```

---

### Day 3-5: Streaming Responses
**Focus:** Real-time AI responses with smooth UX

**Topics:**
- Server-Sent Events (SSE) for streaming
- ReadableStream processing
- Token-by-token rendering
- Typewriter effect implementation
- Handling incomplete JSON chunks
- Auto-scrolling to latest content

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (Streaming section)

**Practice:**
- Implement OpenAI streaming chat
- Add Claude streaming support
- Create smooth typewriter effect
- Handle stream interruptions gracefully

**Key Pattern:**
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...params, stream: true })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Process token
      updateUI(data.choices[0].delta.content);
    }
  }
}
```

**Examples:**
- [../examples/28-streaming-chat-typewriter.html](../examples/28-streaming-chat-typewriter.html)

**Snippet:** See [../snippets/streaming-chat.js](../snippets/streaming-chat.js)

---

### Day 6-7: Prompt Engineering
**Focus:** Crafting effective prompts for better results

**Topics:**
- System prompts vs user prompts
- Few-shot learning (examples in prompts)
- Chain-of-thought prompting
- Role-playing and persona prompts
- Structured output formatting
- Temperature and top_p tuning

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (Prompt Engineering section)

**Practice:**
- Create a coding assistant with system prompt
- Implement few-shot classification
- Build a structured data extractor
- Experiment with temperature settings

**Best Practices:**
- Be specific and clear
- Provide examples (few-shot)
- Use delimiters (```, ---, ###)
- Request step-by-step reasoning
- Specify output format (JSON, markdown)

---

## Week 2: Advanced LLM Features

### Day 8-10: Function Calling & Tool Use
**Focus:** AI agents that can perform actions

**Topics:**
- OpenAI function calling API
- Claude tool use API
- Function schema definition
- Automatic tool execution
- Multi-turn conversations with tool results
- Error handling in tool calls

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (Function Calling section)

**Practice:**
- Create calculator tool
- Build weather lookup function
- Implement database query tool
- Create multi-tool agent

**Function Schema Example:**
```javascript
const tools = [{
  type: "function",
  function: {
    name: "get_weather",
    description: "Get current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name, e.g. San Francisco"
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"]
        }
      },
      required: ["location"]
    }
  }
}];
```

**Examples:**
- [../examples/38-function-calling-tool-use.html](../examples/38-function-calling-tool-use.html)

**Snippet:** See [../snippets/function-calling.js](../snippets/function-calling.js)

---

### Day 11-13: RAG (Retrieval Augmented Generation)
**Focus:** Building AI that answers from your documents

**Topics:**
- Document chunking strategies
- Embeddings API (OpenAI)
- Vector similarity search
- Hybrid search (vector + keyword)
- Local vector storage (IndexedDB)
- Citation and source tracking
- Chunk overlap for context

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (RAG section)

**Practice:**
- Build document uploader
- Implement chunking algorithm
- Create vector search system
- Build Q&A interface with citations

**RAG Pipeline:**
1. Chunk documents (500-1000 tokens, 50-100 overlap)
2. Generate embeddings for each chunk
3. Store chunks + embeddings in local DB
4. On query: generate query embedding
5. Find top-k similar chunks (cosine similarity)
6. Combine chunks into context
7. Send to LLM with query

**Hybrid Search Formula:**
```javascript
score = α × vectorSimilarity + (1 - α) × keywordScore
// α = 0.7 works well for most cases
```

**Examples:**
- [../examples/19-rag-knowledge-base.html](../examples/19-rag-knowledge-base.html)
- [../examples/27-rag-knowledge-base.html](../examples/27-rag-knowledge-base.html)

**Snippet:** See [../snippets/rag-system.js](../snippets/rag-system.js)

---

### Day 14: Token Management & Cost Optimization
**Focus:** Reducing API costs while maintaining quality

**Topics:**
- Token counting (tiktoken approximation)
- Context window management
- Conversation summarization
- Caching strategies
- Model selection (GPT-4 vs 3.5, Claude Sonnet vs Haiku)
- Batch processing

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (Cost Optimization section)

**Practice:**
- Implement token counter
- Build conversation summarizer
- Add context trimming
- Create cost estimator

**Cost-Saving Strategies:**
- Use cheaper models for simple tasks
- Summarize long conversations
- Cache responses when possible
- Truncate context intelligently
- Use streaming to show progress

---

## Week 3: Client-Side AI & MCP

### Day 15-17: Client-Side LLMs
**Focus:** Running AI models entirely in the browser

**Topics:**
- WebLLM for full LLMs in browser
- Transformers.js for HuggingFace models
- TensorFlow.js for embeddings
- WebGPU acceleration
- Progressive loading with caching
- Offline AI capabilities

**Reference:** [../reference/llm-integration.md](../reference/llm-integration.md) (Client-Side AI section)

**Practice:**
- Load small LLM with WebLLM
- Implement local embeddings with Transformers.js
- Create offline RAG system
- Build privacy-first chat app

**Trade-offs:**
- **Pros:** No API costs, full privacy, offline support
- **Cons:** Large initial download, slower than API, limited model quality

**Example Setup:**
```javascript
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f32_1", {
  initProgressCallback: (progress) => {
    console.log(`Loading: ${progress.text}`);
  }
});

const response = await engine.chat.completions.create({
  messages: [{ role: "user", content: "Hello!" }]
});
```

**Examples:**
- [../examples/29-client-side-llms.html](../examples/29-client-side-llms.html)

---

### Day 18-20: Model Context Protocol (MCP)
**Focus:** Standardized AI-to-service integration

**Topics:**
- MCP architecture (Resources, Tools, Prompts)
- Streamable HTTP Transport for browsers
- Session management
- Implementing MCP resources
- Creating MCP tools
- Template prompts

**Reference:** [../reference/mcp-integration.md](../reference/mcp-integration.md)

**Practice:**
- Set up MCP client in browser
- Create MCP resource provider
- Implement MCP tools
- Build prompt templates

**MCP Concepts:**
- **Resources:** Data sources (documents, configs, DB records)
- **Tools:** Actions AI can invoke (search, query, transform)
- **Prompts:** Template workflows for common tasks

**MCP Client Setup:**
```javascript
import { Client } from '@moinfra/mcp-client-sdk';

const client = new Client({
  name: "my-app",
  version: "1.0.0"
});

await client.connect(new HttpTransport({
  url: "https://your-mcp-server.com"
}));

// List available tools
const tools = await client.listTools();

// Call a tool
const result = await client.callTool({
  name: "search_docs",
  arguments: { query: "pricing" }
});
```

**Examples:**
- [../examples/34-mcp-integration.html](../examples/34-mcp-integration.html)

**Note:** MCP is new (Nov 2024) and rapidly evolving. Check docs for latest updates.

---

### Day 21: AI Application Architecture
**Focus:** Structuring complex AI applications

**Topics:**
- Conversation state management
- Message history optimization
- Multi-agent architectures
- Error recovery and retry logic
- Rate limiting and backoff
- Graceful degradation

**Practice:**
- Build conversation manager
- Implement retry with exponential backoff
- Create multi-agent system
- Add fallback models

---

## Week 4: Real-World Applications

### Day 22-24: Building AI-Powered Apps
**Focus:** Complete application development

**Choose one to build:**

**Option A: AI Code Assistant**
- Code explanation and generation
- Syntax highlighting
- Multiple language support
- Function calling for code execution
- **Reference:** [../reference/use-cases.md](../reference/use-cases.md) (AI Code Playground)

**Option B: AI Recipe Generator**
- Ingredient-based search
- Nutritional calculations
- Shopping list export
- Dietary restriction handling
- **Reference:** [../reference/use-cases.md](../reference/use-cases.md) (Recipe Generator)

**Option C: AI Chatbot with Tools**
- Multi-turn conversations
- Weather, calculator, search tools
- Streaming responses
- Conversation export

**Examples:**
- [../examples/16-ai-code-playground.html](../examples/16-ai-code-playground.html)
- [../examples/18-ai-recipe-generator.html](../examples/18-ai-recipe-generator.html)

---

### Day 25-26: Advanced RAG Techniques
**Focus:** Production-grade RAG systems

**Topics:**
- Re-ranking retrieved results
- Query expansion and reformulation
- Metadata filtering
- Hierarchical chunking
- Multi-query RAG
- Source attribution UI

**Practice:**
- Implement re-ranking algorithm
- Add metadata filters
- Create better chunking strategy
- Build citation UI

---

### Day 27-28: Production Considerations
**Focus:** Deploying AI apps to production

**Topics:**
- API key security (environment variables, proxies)
- Rate limit handling
- Error monitoring
- Cost tracking
- User privacy and data handling
- Model fallbacks
- Compliance (GDPR, data retention)

**Practice:**
- Set up serverless API proxy
- Implement rate limiting
- Add cost tracking
- Create privacy policy

**Security Checklist:**
- [ ] Never expose API keys in client code
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Don't log sensitive data
- [ ] Handle PII appropriately
- [ ] Use environment variables

---

## Capstone Projects

Choose one advanced AI application:

### Option 1: AI-Powered Knowledge Base
Complete RAG system with:
- Document upload (PDF, TXT, MD)
- Smart chunking with overlap
- Vector + keyword hybrid search
- Streaming answers with citations
- Conversation history
- Export conversations

**Skills Used:** RAG, streaming, embeddings, function calling

---

### Option 2: Multi-Tool AI Agent
Intelligent assistant with:
- Weather lookup
- Calculator
- Web search
- Database queries
- Code execution
- Task management

**Skills Used:** Function calling, tool use, state management

---

### Option 3: AI Content Studio
Creative tool with:
- Text generation with templates
- Image prompt generator
- SEO optimization suggestions
- Multiple writing styles
- Revision history
- Export to multiple formats

**Skills Used:** Prompt engineering, streaming, conversation management

---

## Skills Assessment Checklist

After completing this path, you should be able to:

**API Integration:**
- [ ] Integrate OpenAI and Claude APIs
- [ ] Implement streaming responses
- [ ] Handle errors and rate limits
- [ ] Manage API costs effectively

**Advanced Features:**
- [ ] Build function calling systems
- [ ] Implement RAG pipelines
- [ ] Use embeddings for similarity search
- [ ] Create multi-turn conversations

**Client-Side AI:**
- [ ] Run models in the browser
- [ ] Implement offline AI features
- [ ] Understand WebLLM and Transformers.js
- [ ] Use WebGPU acceleration

**MCP:**
- [ ] Understand MCP architecture
- [ ] Implement MCP resources and tools
- [ ] Use MCP client in browser apps

**Production:**
- [ ] Secure API keys properly
- [ ] Optimize token usage
- [ ] Handle privacy and compliance
- [ ] Monitor costs and errors

---

## Next Steps

After mastering AI integration:

1. **Combine with [3D Graphics Path](./3d-graphics-path.md)** - AI-generated 3D content
2. **Combine with [Architecture Path](./architecture-path.md)** - Plugin-based AI systems
3. **Advanced Topics:** Fine-tuning, custom models, AI agents

---

## Resources

### Documentation
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [WebLLM Docs](https://webllm.mlc.ai/)
- [Transformers.js](https://huggingface.co/docs/transformers.js/)

### Tools
- [OpenAI Playground](https://platform.openai.com/playground)
- [Anthropic Console](https://console.anthropic.com/)
- [Tiktoken Tokenizer](https://tiktokenizer.vercel.app/)

### Reference Files
- [llm-integration.md](../reference/llm-integration.md) - Complete LLM documentation (95KB!)
- [mcp-integration.md](../reference/mcp-integration.md) - MCP integration guide
- [external-services.md](../reference/external-services.md) - API patterns
- [top-25-web-app-methods.md](../reference/top-25-web-app-methods.md)

---

## Tips for Success

1. **Start with simple chat** - Don't jump to RAG immediately
2. **Understand prompts** - Good prompts = better results
3. **Stream everything** - Better UX than waiting
4. **Secure your keys** - Never expose them in client code
5. **Monitor costs** - Tokens add up quickly
6. **Handle errors gracefully** - APIs fail, plan for it
7. **Test with edge cases** - Empty inputs, long text, etc.
8. **Privacy matters** - Don't send sensitive data to APIs

---

## Common Pitfalls

- **Exposed API keys:** Always use backend proxies
- **Ignoring rate limits:** Implement backoff and retry
- **Poor error handling:** APIs fail, handle it gracefully
- **Inefficient prompts:** More tokens = more cost
- **No streaming:** Users hate waiting for long responses
- **Ignoring context limits:** Models have max token limits
- **No cost tracking:** Expenses can surprise you

---

## Cost Estimation

Approximate costs (as of 2025):

**OpenAI:**
- GPT-4o: $2.50/1M input, $10/1M output tokens
- GPT-4o-mini: $0.15/1M input, $0.60/1M output
- Embeddings: $0.02/1M tokens

**Anthropic:**
- Claude Opus: $15/1M input, $75/1M output
- Claude Sonnet: $3/1M input, $15/1M output
- Claude Haiku: $0.25/1M input, $1.25/1M output

**Example:** 1000 chat messages (~500 tokens each) = ~$1-5 depending on model

---

**Remember:** AI integration is about enhancing user experience while managing costs and maintaining privacy. Start simple, iterate based on user needs, and always prioritize security.

Happy building! 🤖
