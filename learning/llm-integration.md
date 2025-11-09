# LLM Integration Strategies for Single-File Web Apps

A comprehensive guide to integrating Large Language Models into web applications with practical code examples.

## Table of Contents

1. [OpenAI API Integration](#1-openai-api-integration)
2. [Anthropic Claude API Integration](#2-anthropic-claude-api-integration)
3. [Other LLM Providers](#3-other-llm-providers)
4. [Streaming Responses](#4-streaming-responses-and-real-time-updates)
5. [Token Management](#5-token-management-and-cost-optimization)
6. [Prompt Engineering](#6-prompt-engineering-techniques)
7. [Context Management](#7-context-management-and-conversation-history)
8. [Client-Side LLM Options](#8-client-side-llm-options)
9. [RAG Patterns](#9-rag-retrieval-augmented-generation-patterns)
10. [Function Calling](#10-function-calling-and-tool-use)
11. [Safety & Content Filtering](#11-safety-and-content-filtering)
12. [Rate Limiting & Error Handling](#12-rate-limiting-and-error-handling)

---

## 1. OpenAI API Integration

### Basic Integration Pattern

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenAI Chat App</title>
</head>
<body>
    <div id="chat"></div>
    <input type="text" id="input" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>

    <script>
        const API_KEY = 'your-api-key-here'; // Never expose in production!
        const API_URL = 'https://api.openai.com/v1/chat/completions';

        async function sendMessage() {
            const input = document.getElementById('input');
            const message = input.value;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4',
                        messages: [
                            { role: 'user', content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    })
                });

                const data = await response.json();
                const reply = data.choices[0].message.content;

                document.getElementById('chat').innerHTML +=
                    `<p><strong>You:</strong> ${message}</p>
                     <p><strong>AI:</strong> ${reply}</p>`;

                input.value = '';
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to get response');
            }
        }
    </script>
</body>
</html>
```

### Using Proxy Server for Security

```javascript
// Instead of exposing API key client-side, use a backend proxy
async function sendMessageSecure(message) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    return await response.json();
}

// Backend endpoint example (Node.js/Express)
// app.post('/api/chat', async (req, res) => {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//             model: 'gpt-4',
//             messages: [{ role: 'user', content: req.body.message }]
//         })
//     });
//     const data = await response.json();
//     res.json(data);
// });
```

### Advanced Configuration

```javascript
const openAIConfig = {
    // Model selection based on use case
    models: {
        fast: 'gpt-3.5-turbo',      // Cheaper, faster
        balanced: 'gpt-4-turbo',     // Good balance
        advanced: 'gpt-4',           // Most capable
        vision: 'gpt-4-vision-preview' // Image understanding
    },

    // Default parameters
    defaultParams: {
        temperature: 0.7,        // Creativity (0-2)
        top_p: 1,               // Nucleus sampling
        frequency_penalty: 0,   // Reduce repetition
        presence_penalty: 0,    // Encourage new topics
        max_tokens: 1000       // Response length limit
    }
};

async function chatWithOpenAI(messages, options = {}) {
    const params = {
        model: options.model || openAIConfig.models.fast,
        messages: messages,
        ...openAIConfig.defaultParams,
        ...options
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(params)
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    return await response.json();
}
```

---

## 2. Anthropic Claude API Integration

### Basic Integration

```javascript
const CLAUDE_API_KEY = 'your-anthropic-api-key';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function chatWithClaude(message, options = {}) {
    const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: options.model || 'claude-3-5-sonnet-20241022',
            max_tokens: options.max_tokens || 1024,
            messages: [
                { role: 'user', content: message }
            ],
            temperature: options.temperature || 1.0,
            system: options.systemPrompt || ''
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

// Usage example
async function exampleClaude() {
    const result = await chatWithClaude(
        "Explain quantum computing in simple terms",
        {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            systemPrompt: 'You are a helpful teacher who explains complex topics simply.'
        }
    );
    console.log(result);
}
```

### Multi-Turn Conversation

```javascript
class ClaudeChat {
    constructor(apiKey, model = 'claude-3-5-sonnet-20241022') {
        this.apiKey = apiKey;
        this.model = model;
        this.messages = [];
        this.systemPrompt = '';
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    async sendMessage(userMessage) {
        // Add user message to history
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 1024,
                messages: this.messages,
                system: this.systemPrompt
            })
        });

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        // Add assistant response to history
        this.messages.push({
            role: 'assistant',
            content: assistantMessage
        });

        return assistantMessage;
    }

    clearHistory() {
        this.messages = [];
    }

    getHistory() {
        return this.messages;
    }
}

// Usage
const chat = new ClaudeChat(CLAUDE_API_KEY);
chat.setSystemPrompt('You are a helpful coding assistant.');
const response1 = await chat.sendMessage('What is React?');
const response2 = await chat.sendMessage('How do I create a component?');
```

### Vision Capabilities

```javascript
async function analyzeImageWithClaude(imageBase64, prompt) {
    const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: 'image/jpeg',
                            data: imageBase64
                        }
                    },
                    {
                        type: 'text',
                        text: prompt
                    }
                ]
            }]
        })
    });

    const data = await response.json();
    return data.content[0].text;
}

// Helper to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Usage with file input
document.getElementById('imageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const base64 = await fileToBase64(file);
    const analysis = await analyzeImageWithClaude(base64, 'Describe this image in detail');
    console.log(analysis);
});
```

---

## 3. Other LLM Providers

### Google Gemini API

```javascript
const GEMINI_API_KEY = 'your-google-api-key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function chatWithGemini(message) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: message }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Gemini with image
async function geminiVision(imageBase64, prompt) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: imageBase64
                            }
                        }
                    ]
                }]
            })
        }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
```

### Cohere API

```javascript
const COHERE_API_KEY = 'your-cohere-api-key';
const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

async function chatWithCohere(message, chatHistory = []) {
    const response = await fetch(COHERE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${COHERE_API_KEY}`
        },
        body: JSON.stringify({
            message: message,
            chat_history: chatHistory,
            model: 'command-r-plus',
            temperature: 0.7,
            max_tokens: 500
        })
    });

    const data = await response.json();
    return {
        text: data.text,
        chatHistory: data.chat_history
    };
}

// Cohere's specialized features
async function cohereWithTools(message, tools) {
    const response = await fetch(COHERE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${COHERE_API_KEY}`
        },
        body: JSON.stringify({
            message: message,
            tools: tools,
            model: 'command-r-plus'
        })
    });

    return await response.json();
}
```

### Hugging Face Inference API

```javascript
const HF_API_KEY = 'your-huggingface-api-key';

async function queryHuggingFace(model, inputs) {
    const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs })
        }
    );

    return await response.json();
}

// Examples with different models
async function examplesHF() {
    // Text generation
    const generated = await queryHuggingFace(
        'meta-llama/Llama-2-7b-chat-hf',
        'Once upon a time'
    );

    // Summarization
    const summary = await queryHuggingFace(
        'facebook/bart-large-cnn',
        'Long article text here...'
    );

    // Question answering
    const answer = await queryHuggingFace(
        'deepset/roberta-base-squad2',
        {
            question: 'What is the capital of France?',
            context: 'Paris is the capital and most populous city of France.'
        }
    );
}
```

---

## 4. Streaming Responses and Real-Time Updates

### OpenAI Streaming

```javascript
async function streamOpenAI(messages, onChunk, onComplete) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: messages,
            stream: true
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                    onComplete();
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) {
                        onChunk(content);
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                }
            }
        }
    }
}

// Usage with typewriter effect
async function chatWithStreaming(message) {
    const outputDiv = document.getElementById('output');
    outputDiv.textContent = '';
    let fullResponse = '';

    await streamOpenAI(
        [{ role: 'user', content: message }],
        (chunk) => {
            fullResponse += chunk;
            outputDiv.textContent = fullResponse;
        },
        () => {
            console.log('Streaming complete:', fullResponse);
        }
    );
}
```

### Claude Streaming

```javascript
async function streamClaude(message, onChunk, onComplete) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [{ role: 'user', content: message }],
            stream: true
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);

                try {
                    const parsed = JSON.parse(data);

                    if (parsed.type === 'content_block_delta') {
                        const text = parsed.delta?.text;
                        if (text) {
                            onChunk(text);
                        }
                    } else if (parsed.type === 'message_stop') {
                        onComplete();
                        return;
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                }
            }
        }
    }
}
```

### Universal Streaming Component

```javascript
class StreamingChat {
    constructor(container) {
        this.container = container;
        this.currentMessage = '';
    }

    async stream(provider, message, options = {}) {
        this.currentMessage = '';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'streaming-message';
        this.container.appendChild(messageDiv);

        const onChunk = (text) => {
            this.currentMessage += text;
            messageDiv.textContent = this.currentMessage;

            // Auto-scroll
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        };

        const onComplete = () => {
            messageDiv.classList.add('complete');
            if (options.onComplete) {
                options.onComplete(this.currentMessage);
            }
        };

        if (provider === 'openai') {
            await streamOpenAI([{ role: 'user', content: message }], onChunk, onComplete);
        } else if (provider === 'claude') {
            await streamClaude(message, onChunk, onComplete);
        }
    }
}

// Usage
const chat = new StreamingChat(document.getElementById('chat-container'));
await chat.stream('claude', 'Tell me a story', {
    onComplete: (text) => console.log('Done:', text)
});
```

### Server-Sent Events (SSE) Alternative

```javascript
// Backend proxy that converts to SSE
function streamWithSSE(url, message, onChunk, onComplete) {
    const eventSource = new EventSource(`${url}?message=${encodeURIComponent(message)}`);

    eventSource.addEventListener('chunk', (event) => {
        onChunk(event.data);
    });

    eventSource.addEventListener('complete', (event) => {
        eventSource.close();
        onComplete(event.data);
    });

    eventSource.addEventListener('error', (error) => {
        console.error('SSE error:', error);
        eventSource.close();
    });
}

// Usage
streamWithSSE(
    '/api/stream',
    'Hello, AI!',
    (chunk) => console.log('Chunk:', chunk),
    (final) => console.log('Complete:', final)
);
```

---

## 5. Token Management and Cost Optimization

### Token Counting

```javascript
// Approximate token counting (OpenAI GPT models)
function estimateTokens(text) {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4);
}

// More accurate token counting using tiktoken (requires library)
// npm install tiktoken
// import { encoding_for_model } from 'tiktoken';
// const encoder = encoding_for_model('gpt-4');
// const tokens = encoder.encode(text);
// const count = tokens.length;

class TokenTracker {
    constructor() {
        this.totalTokens = 0;
        this.totalCost = 0;
        this.pricing = {
            'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
        };
    }

    trackUsage(model, inputTokens, outputTokens) {
        const pricing = this.pricing[model];
        if (!pricing) return;

        const cost = (inputTokens / 1000 * pricing.input) +
                     (outputTokens / 1000 * pricing.output);

        this.totalTokens += (inputTokens + outputTokens);
        this.totalCost += cost;

        return {
            tokens: inputTokens + outputTokens,
            cost: cost,
            totalTokens: this.totalTokens,
            totalCost: this.totalCost
        };
    }

    getStats() {
        return {
            totalTokens: this.totalTokens,
            totalCost: this.totalCost.toFixed(4)
        };
    }
}

// Usage
const tracker = new TokenTracker();
const usage = tracker.trackUsage('gpt-4', 100, 200);
console.log(`Cost: $${usage.cost.toFixed(4)}`);
```

### Smart Context Window Management

```javascript
class ContextManager {
    constructor(maxTokens = 4000) {
        this.maxTokens = maxTokens;
        this.messages = [];
        this.systemPrompt = '';
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    addMessage(role, content) {
        this.messages.push({ role, content });
        this.trimContext();
    }

    trimContext() {
        // Always keep system prompt
        const systemTokens = estimateTokens(this.systemPrompt);
        let availableTokens = this.maxTokens - systemTokens - 500; // Reserve for response

        // Keep most recent messages that fit
        let totalTokens = 0;
        const keptMessages = [];

        // Iterate backwards to keep recent messages
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msgTokens = estimateTokens(this.messages[i].content);
            if (totalTokens + msgTokens <= availableTokens) {
                keptMessages.unshift(this.messages[i]);
                totalTokens += msgTokens;
            } else {
                break;
            }
        }

        this.messages = keptMessages;
    }

    getMessages() {
        return this.messages;
    }

    getSummary() {
        return {
            messageCount: this.messages.length,
            estimatedTokens: this.messages.reduce((sum, msg) =>
                sum + estimateTokens(msg.content), 0)
        };
    }
}

// Usage
const context = new ContextManager(4000);
context.setSystemPrompt('You are a helpful assistant.');
context.addMessage('user', 'Hello!');
context.addMessage('assistant', 'Hi there!');
console.log(context.getSummary());
```

### Caching Strategies

```javascript
class LLMCache {
    constructor(ttl = 3600000) { // 1 hour default
        this.cache = new Map();
        this.ttl = ttl;
    }

    generateKey(prompt, options = {}) {
        return JSON.stringify({ prompt, ...options });
    }

    get(prompt, options) {
        const key = this.generateKey(prompt, options);
        const cached = this.cache.get(key);

        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.response;
    }

    set(prompt, options, response) {
        const key = this.generateKey(prompt, options);
        this.cache.set(key, {
            response,
            timestamp: Date.now()
        });
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

// Usage with API calls
const llmCache = new LLMCache(3600000); // 1 hour TTL

async function cachedChatCompletion(prompt, options = {}) {
    // Check cache first
    const cached = llmCache.get(prompt, options);
    if (cached) {
        console.log('Cache hit!');
        return cached;
    }

    // Make API call
    const response = await chatWithOpenAI(
        [{ role: 'user', content: prompt }],
        options
    );

    // Store in cache
    llmCache.set(prompt, options, response);
    return response;
}
```

### Cost-Aware Model Selection

```javascript
class CostOptimizer {
    constructor() {
        this.models = [
            {
                name: 'gpt-3.5-turbo',
                costPer1k: 0.002,
                capability: 0.7,
                maxTokens: 4096
            },
            {
                name: 'gpt-4',
                costPer1k: 0.06,
                capability: 1.0,
                maxTokens: 8192
            },
            {
                name: 'claude-3-haiku-20240307',
                costPer1k: 0.00125,
                capability: 0.75,
                maxTokens: 200000
            },
            {
                name: 'claude-3-5-sonnet-20241022',
                costPer1k: 0.015,
                capability: 0.95,
                maxTokens: 200000
            }
        ];
    }

    selectModel(taskComplexity, budget, tokenCount) {
        // Filter models that fit budget and token requirements
        const candidates = this.models.filter(m => {
            const estimatedCost = (tokenCount / 1000) * m.costPer1k;
            return estimatedCost <= budget && tokenCount <= m.maxTokens;
        });

        if (candidates.length === 0) {
            throw new Error('No model fits budget and token requirements');
        }

        // Select model with capability closest to task complexity
        candidates.sort((a, b) => {
            const aDiff = Math.abs(a.capability - taskComplexity);
            const bDiff = Math.abs(b.capability - taskComplexity);
            return aDiff - bDiff;
        });

        return candidates[0];
    }
}

// Usage
const optimizer = new CostOptimizer();
const model = optimizer.selectModel(
    0.8,    // Task complexity (0-1)
    0.10,   // Budget in dollars
    2000    // Estimated token count
);
console.log('Selected model:', model.name);
```

---

## 6. Prompt Engineering Techniques

### Template System

```javascript
class PromptTemplate {
    constructor(template) {
        this.template = template;
    }

    fill(variables) {
        let result = this.template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }
}

// Predefined templates
const templates = {
    summarize: new PromptTemplate(
        `Summarize the following text in {{length}} sentences:\n\n{{text}}`
    ),

    codeReview: new PromptTemplate(
        `Review this {{language}} code and provide feedback on:\n` +
        `1. Code quality\n2. Best practices\n3. Potential bugs\n\n` +
        `Code:\n{{code}}`
    ),

    translate: new PromptTemplate(
        `Translate the following text from {{from}} to {{to}}:\n\n{{text}}`
    ),

    explain: new PromptTemplate(
        `Explain {{concept}} to a {{level}} level audience. ` +
        `Use {{style}} style and include examples.`
    )
};

// Usage
const prompt = templates.summarize.fill({
    length: '3',
    text: 'Long article text here...'
});
```

### Few-Shot Learning

```javascript
class FewShotPrompt {
    constructor(instruction, examples = []) {
        this.instruction = instruction;
        this.examples = examples;
    }

    addExample(input, output) {
        this.examples.push({ input, output });
    }

    build(newInput) {
        let prompt = this.instruction + '\n\n';

        // Add examples
        this.examples.forEach((ex, i) => {
            prompt += `Example ${i + 1}:\n`;
            prompt += `Input: ${ex.input}\n`;
            prompt += `Output: ${ex.output}\n\n`;
        });

        // Add new input
        prompt += `Now, process this:\n`;
        prompt += `Input: ${newInput}\n`;
        prompt += `Output:`;

        return prompt;
    }
}

// Usage for sentiment analysis
const sentimentPrompt = new FewShotPrompt(
    'Classify the sentiment of the following text as positive, negative, or neutral.'
);

sentimentPrompt.addExample(
    'I love this product! It works great.',
    'positive'
);
sentimentPrompt.addExample(
    'This is terrible. Complete waste of money.',
    'negative'
);
sentimentPrompt.addExample(
    'The item arrived today.',
    'neutral'
);

const prompt = sentimentPrompt.build('The service was okay, nothing special.');
```

### Chain of Thought Prompting

```javascript
const chainOfThoughtPrompts = {
    math: (problem) => `
Let's solve this step by step:

Problem: ${problem}

Step 1: Identify what we know
Step 2: Determine what we need to find
Step 3: Choose the appropriate method
Step 4: Perform the calculation
Step 5: Verify the answer

Please work through each step clearly.
`,

    reasoning: (question) => `
Question: ${question}

Let's think through this systematically:

1. What are the key facts?
2. What assumptions can we make?
3. What are the possible conclusions?
4. Which conclusion is most supported by the evidence?

Please reason through each step.
`,

    coding: (task) => `
Task: ${task}

Let's approach this systematically:

1. Understand the requirements
2. Break down into smaller steps
3. Consider edge cases
4. Write the solution
5. Test with examples

Please show your thinking process.
`
};

// Usage
async function solveWithCOT(problem) {
    const prompt = chainOfThoughtPrompts.math(problem);
    const response = await chatWithOpenAI([
        { role: 'user', content: prompt }
    ]);
    return response;
}
```

### Structured Output Prompting

```javascript
class StructuredPrompt {
    constructor(outputSchema) {
        this.schema = outputSchema;
    }

    createPrompt(instruction, input) {
        return `
${instruction}

Input: ${input}

Output format (JSON):
${JSON.stringify(this.schema, null, 2)}

Respond with ONLY valid JSON matching this schema:
`;
    }

    async execute(instruction, input, apiFunction) {
        const prompt = this.createPrompt(instruction, input);
        const response = await apiFunction(prompt);

        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found in response');
        } catch (error) {
            console.error('Failed to parse structured output:', error);
            return null;
        }
    }
}

// Usage example: Extract contact information
const contactSchema = {
    name: "string",
    email: "string",
    phone: "string",
    company: "string"
};

const extractor = new StructuredPrompt(contactSchema);
const result = await extractor.execute(
    "Extract contact information from the following text",
    "John Doe, senior developer at TechCorp. Contact: john@techcorp.com or 555-1234",
    (prompt) => chatWithOpenAI([{ role: 'user', content: prompt }])
);

console.log(result);
// { name: "John Doe", email: "john@techcorp.com", phone: "555-1234", company: "TechCorp" }
```

### System Prompts Best Practices

```javascript
const systemPrompts = {
    // Precise and factual
    assistant: `You are a helpful, accurate, and concise assistant.
Always provide factual information and cite sources when possible.
If you're unsure about something, say so clearly.`,

    // Creative writing
    creative: `You are a creative writing assistant with expertise in storytelling.
Use vivid descriptions, engaging dialogue, and compelling narratives.
Match the tone and style requested by the user.`,

    // Code helper
    coder: `You are an expert programmer proficient in multiple languages.
Provide clean, well-commented code following best practices.
Explain your solutions and suggest optimizations.
Always consider edge cases and error handling.`,

    // Domain expert
    expert: (domain) => `You are a world-class expert in ${domain}.
Provide detailed, authoritative answers backed by current research.
Use technical terminology appropriately and explain complex concepts clearly.
Reference important papers, books, or resources when relevant.`,

    // Persona-based
    persona: (traits) => `You are an assistant with the following characteristics:
${traits.join('\n')}

Maintain this personality consistently while being helpful and accurate.`
};

// Usage
async function chatWithPersona(message, persona = 'assistant') {
    const systemPrompt = typeof systemPrompts[persona] === 'function'
        ? systemPrompts[persona]()
        : systemPrompts[persona];

    return await chatWithClaude(message, { systemPrompt });
}
```

---

## 7. Context Management and Conversation History

### Conversation Manager

```javascript
class ConversationManager {
    constructor(maxMessages = 20) {
        this.conversations = new Map();
        this.maxMessages = maxMessages;
    }

    createConversation(id, systemPrompt = '') {
        this.conversations.set(id, {
            id,
            systemPrompt,
            messages: [],
            metadata: {
                createdAt: Date.now(),
                lastActivity: Date.now(),
                messageCount: 0
            }
        });
    }

    addMessage(conversationId, role, content) {
        const conv = this.conversations.get(conversationId);
        if (!conv) {
            throw new Error('Conversation not found');
        }

        conv.messages.push({
            role,
            content,
            timestamp: Date.now()
        });

        conv.metadata.lastActivity = Date.now();
        conv.metadata.messageCount++;

        // Trim old messages if exceeding limit
        if (conv.messages.length > this.maxMessages) {
            conv.messages = conv.messages.slice(-this.maxMessages);
        }
    }

    getMessages(conversationId, limit = null) {
        const conv = this.conversations.get(conversationId);
        if (!conv) return [];

        const messages = conv.messages;
        return limit ? messages.slice(-limit) : messages;
    }

    summarizeOldMessages(conversationId, threshold = 10) {
        const conv = this.conversations.get(conversationId);
        if (!conv || conv.messages.length <= threshold) return;

        const oldMessages = conv.messages.slice(0, -threshold);
        const recentMessages = conv.messages.slice(-threshold);

        // Create summary of old messages
        const summary = {
            role: 'system',
            content: `[Summary of previous conversation: ${oldMessages.length} messages exchanged covering: ${this.extractTopics(oldMessages).join(', ')}]`,
            timestamp: Date.now(),
            isSummary: true
        };

        conv.messages = [summary, ...recentMessages];
    }

    extractTopics(messages) {
        // Simple topic extraction
        const topics = new Set();
        messages.forEach(msg => {
            const words = msg.content.toLowerCase().split(/\s+/);
            // Extract meaningful words (simplified)
            words.forEach(word => {
                if (word.length > 5) topics.add(word);
            });
        });
        return Array.from(topics).slice(0, 5);
    }

    exportConversation(conversationId) {
        const conv = this.conversations.get(conversationId);
        if (!conv) return null;

        return {
            ...conv,
            exported: new Date().toISOString()
        };
    }

    importConversation(data) {
        this.conversations.set(data.id, data);
    }

    deleteConversation(conversationId) {
        this.conversations.delete(conversationId);
    }

    getAllConversations() {
        return Array.from(this.conversations.values()).map(conv => ({
            id: conv.id,
            messageCount: conv.metadata.messageCount,
            lastActivity: conv.metadata.lastActivity
        }));
    }
}

// Usage
const manager = new ConversationManager();
manager.createConversation('chat-1', 'You are a helpful assistant.');
manager.addMessage('chat-1', 'user', 'Hello!');
manager.addMessage('chat-1', 'assistant', 'Hi there!');
const messages = manager.getMessages('chat-1');
```

### Persistent Storage

```javascript
class PersistentConversation {
    constructor(storageKey = 'llm_conversations') {
        this.storageKey = storageKey;
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            this.data = data ? JSON.parse(data) : { conversations: {} };
        } catch (error) {
            console.error('Failed to load conversations:', error);
            this.data = { conversations: {} };
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save conversations:', error);
        }
    }

    createConversation(id, title = 'New Conversation') {
        this.data.conversations[id] = {
            id,
            title,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.save();
    }

    addMessage(conversationId, message) {
        const conv = this.data.conversations[conversationId];
        if (!conv) return;

        conv.messages.push({
            ...message,
            timestamp: Date.now()
        });
        conv.updatedAt = Date.now();
        this.save();
    }

    getConversation(id) {
        return this.data.conversations[id] || null;
    }

    deleteConversation(id) {
        delete this.data.conversations[id];
        this.save();
    }

    searchConversations(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        for (const conv of Object.values(this.data.conversations)) {
            const titleMatch = conv.title.toLowerCase().includes(lowerQuery);
            const messageMatch = conv.messages.some(msg =>
                msg.content.toLowerCase().includes(lowerQuery)
            );

            if (titleMatch || messageMatch) {
                results.push({
                    id: conv.id,
                    title: conv.title,
                    excerpt: this.getExcerpt(conv, query),
                    updatedAt: conv.updatedAt
                });
            }
        }

        return results.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    getExcerpt(conversation, query) {
        const msg = conversation.messages.find(m =>
            m.content.toLowerCase().includes(query.toLowerCase())
        );
        return msg ? msg.content.substring(0, 100) + '...' : '';
    }

    exportAll() {
        return JSON.stringify(this.data, null, 2);
    }

    importAll(jsonString) {
        try {
            this.data = JSON.parse(jsonString);
            this.save();
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    getStats() {
        const conversations = Object.values(this.data.conversations);
        return {
            totalConversations: conversations.length,
            totalMessages: conversations.reduce((sum, c) => sum + c.messages.length, 0),
            oldestConversation: Math.min(...conversations.map(c => c.createdAt)),
            newestConversation: Math.max(...conversations.map(c => c.updatedAt))
        };
    }
}

// Usage
const storage = new PersistentConversation();
storage.createConversation('chat-1', 'My First Chat');
storage.addMessage('chat-1', {
    role: 'user',
    content: 'Hello!'
});
```

### Context Compression

```javascript
class ContextCompressor {
    async compressContext(messages, targetLength = 2000) {
        // Strategy 1: Remove redundant information
        const deduplicated = this.removeDuplicates(messages);

        // Strategy 2: Summarize old messages
        const withSummaries = await this.summarizeOldMessages(deduplicated);

        // Strategy 3: Extract key points
        const compressed = this.extractKeyPoints(withSummaries, targetLength);

        return compressed;
    }

    removeDuplicates(messages) {
        const seen = new Set();
        return messages.filter(msg => {
            const key = `${msg.role}:${msg.content}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    async summarizeOldMessages(messages, threshold = 10) {
        if (messages.length <= threshold) return messages;

        const oldMessages = messages.slice(0, -threshold);
        const recentMessages = messages.slice(-threshold);

        // Combine old messages into one summary
        const oldText = oldMessages.map(m => `${m.role}: ${m.content}`).join('\n');

        const summary = await chatWithOpenAI([{
            role: 'user',
            content: `Summarize this conversation in 3-5 sentences:\n\n${oldText}`
        }], { max_tokens: 200 });

        return [
            { role: 'system', content: `Previous context: ${summary}` },
            ...recentMessages
        ];
    }

    extractKeyPoints(messages, maxTokens) {
        // Simple extraction based on message importance
        const scored = messages.map(msg => ({
            ...msg,
            score: this.calculateImportance(msg)
        }));

        // Sort by importance
        scored.sort((a, b) => b.score - a.score);

        // Keep messages until token limit
        let tokens = 0;
        const kept = [];

        for (const msg of scored) {
            const msgTokens = estimateTokens(msg.content);
            if (tokens + msgTokens <= maxTokens) {
                kept.push(msg);
                tokens += msgTokens;
            }
        }

        // Restore chronological order
        return kept.sort((a, b) =>
            messages.indexOf(a) - messages.indexOf(b)
        );
    }

    calculateImportance(message) {
        let score = 0;

        // System messages are important
        if (message.role === 'system') score += 10;

        // Recent messages are more important
        const recency = message.timestamp || 0;
        score += recency / 1000000;

        // Longer messages might be more important
        score += Math.min(message.content.length / 100, 5);

        // Questions are important
        if (message.content.includes('?')) score += 3;

        return score;
    }
}

// Usage
const compressor = new ContextCompressor();
const compressed = await compressor.compressContext(longConversation, 2000);
```

---

## 8. Client-Side LLM Options

### WebLLM Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebLLM Chat</title>
    <script type="module">
        import { CreateWebWorkerMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

        let engine = null;

        async function initializeWebLLM() {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = 'Initializing WebLLM...';

            try {
                engine = await CreateWebWorkerMLCEngine(
                    "Llama-2-7b-chat-hf-q4f32_1",
                    {
                        initProgressCallback: (progress) => {
                            statusDiv.textContent = `Loading: ${(progress.progress * 100).toFixed(1)}%`;
                        }
                    }
                );
                statusDiv.textContent = 'Ready!';
            } catch (error) {
                statusDiv.textContent = 'Error: ' + error.message;
            }
        }

        async function chat(message) {
            if (!engine) {
                alert('Engine not initialized');
                return;
            }

            const outputDiv = document.getElementById('output');
            outputDiv.textContent = 'Thinking...';

            try {
                const response = await engine.chat.completions.create({
                    messages: [{ role: 'user', content: message }],
                    temperature: 0.7,
                    max_tokens: 256
                });

                outputDiv.textContent = response.choices[0].message.content;
            } catch (error) {
                outputDiv.textContent = 'Error: ' + error.message;
            }
        }

        // Streaming example
        async function chatStream(message) {
            if (!engine) return;

            const outputDiv = document.getElementById('output');
            outputDiv.textContent = '';

            const chunks = await engine.chat.completions.create({
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 256,
                stream: true
            });

            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || '';
                outputDiv.textContent += content;
            }
        }

        window.initializeWebLLM = initializeWebLLM;
        window.chat = chat;
        window.chatStream = chatStream;
    </script>
</head>
<body>
    <div id="status">Click to initialize</div>
    <button onclick="initializeWebLLM()">Initialize WebLLM</button>
    <input type="text" id="input" placeholder="Type a message...">
    <button onclick="chat(document.getElementById('input').value)">Send</button>
    <button onclick="chatStream(document.getElementById('input').value)">Stream</button>
    <div id="output"></div>
</body>
</html>
```

### Transformers.js Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Transformers.js Examples</title>
    <script type="module">
        import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

        // Configure to use local models or CDN
        env.allowLocalModels = false;

        let sentimentAnalyzer = null;
        let textGenerator = null;
        let questionAnswerer = null;

        // Sentiment Analysis
        async function analyzeSentiment(text) {
            if (!sentimentAnalyzer) {
                sentimentAnalyzer = await pipeline('sentiment-analysis');
            }
            return await sentimentAnalyzer(text);
        }

        // Text Generation
        async function generateText(prompt) {
            if (!textGenerator) {
                textGenerator = await pipeline(
                    'text-generation',
                    'Xenova/gpt2'
                );
            }
            return await textGenerator(prompt, {
                max_new_tokens: 50,
                temperature: 0.8
            });
        }

        // Question Answering
        async function answerQuestion(question, context) {
            if (!questionAnswerer) {
                questionAnswerer = await pipeline('question-answering');
            }
            return await questionAnswerer(question, context);
        }

        // Summarization
        async function summarizeText(text) {
            const summarizer = await pipeline(
                'summarization',
                'Xenova/distilbart-cnn-6-6'
            );
            return await summarizer(text, {
                max_length: 100,
                min_length: 30
            });
        }

        // Translation
        async function translate(text, targetLang = 'fr') {
            const translator = await pipeline(
                'translation',
                `Xenova/nllb-200-distilled-600M`
            );
            return await translator(text, {
                tgt_lang: targetLang,
                src_lang: 'eng_Latn'
            });
        }

        // Text Embeddings
        async function getEmbeddings(text) {
            const extractor = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2'
            );
            const output = await extractor(text, {
                pooling: 'mean',
                normalize: true
            });
            return output.data;
        }

        // Zero-shot Classification
        async function classifyText(text, candidateLabels) {
            const classifier = await pipeline(
                'zero-shot-classification',
                'Xenova/distilbert-base-uncased-mnli'
            );
            return await classifier(text, candidateLabels);
        }

        // Example usage
        async function runExamples() {
            // Sentiment
            const sentiment = await analyzeSentiment('I love this!');
            console.log('Sentiment:', sentiment);

            // Generation
            const generated = await generateText('Once upon a time');
            console.log('Generated:', generated);

            // Q&A
            const answer = await answerQuestion(
                'What is the capital of France?',
                'Paris is the capital and most populous city of France.'
            );
            console.log('Answer:', answer);

            // Classification
            const classification = await classifyText(
                'This is a story about a brave knight.',
                ['fiction', 'news', 'science']
            );
            console.log('Classification:', classification);
        }

        window.transformersExamples = {
            analyzeSentiment,
            generateText,
            answerQuestion,
            summarizeText,
            translate,
            getEmbeddings,
            classifyText,
            runExamples
        };
    </script>
</head>
<body>
    <h1>Transformers.js Client-Side ML</h1>
    <button onclick="transformersExamples.runExamples()">Run Examples</button>
    <div id="output"></div>
</body>
</html>
```

### ONNX Runtime Web

```javascript
// Using ONNX Runtime for efficient client-side inference
class ONNXModelRunner {
    constructor() {
        this.session = null;
    }

    async loadModel(modelUrl) {
        const ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');

        try {
            this.session = await ort.InferenceSession.create(modelUrl);
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Failed to load model:', error);
            throw error;
        }
    }

    async runInference(inputTensor) {
        if (!this.session) {
            throw new Error('Model not loaded');
        }

        const feeds = { input: inputTensor };
        const results = await this.session.run(feeds);
        return results;
    }

    getInputNames() {
        return this.session.inputNames;
    }

    getOutputNames() {
        return this.session.outputNames;
    }
}

// Usage
const runner = new ONNXModelRunner();
await runner.loadModel('path/to/model.onnx');
```

### TensorFlow.js Integration

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder"></script>
</head>
<body>
    <script>
        // Text similarity using Universal Sentence Encoder
        let model;

        async function loadModel() {
            model = await use.load();
            console.log('Model loaded');
        }

        async function computeSimilarity(text1, text2) {
            if (!model) await loadModel();

            const embeddings = await model.embed([text1, text2]);
            const embeddingsArray = await embeddings.array();

            // Compute cosine similarity
            const similarity = cosineSimilarity(
                embeddingsArray[0],
                embeddingsArray[1]
            );

            return similarity;
        }

        function cosineSimilarity(vecA, vecB) {
            const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
            const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
            const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
            return dotProduct / (magnitudeA * magnitudeB);
        }

        // Semantic search
        async function semanticSearch(query, documents) {
            if (!model) await loadModel();

            const allTexts = [query, ...documents];
            const embeddings = await model.embed(allTexts);
            const embeddingsArray = await embeddings.array();

            const queryEmbedding = embeddingsArray[0];
            const docEmbeddings = embeddingsArray.slice(1);

            const similarities = docEmbeddings.map((docEmb, i) => ({
                index: i,
                text: documents[i],
                similarity: cosineSimilarity(queryEmbedding, docEmb)
            }));

            return similarities.sort((a, b) => b.similarity - a.similarity);
        }

        // Example usage
        async function example() {
            await loadModel();

            const sim = await computeSimilarity(
                'The cat sat on the mat',
                'A feline rested on the rug'
            );
            console.log('Similarity:', sim);

            const results = await semanticSearch(
                'machine learning',
                [
                    'Artificial intelligence and neural networks',
                    'Cooking recipes for dinner',
                    'Deep learning algorithms'
                ]
            );
            console.log('Search results:', results);
        }
    </script>
</body>
</html>
```

---

## 9. RAG (Retrieval Augmented Generation) Patterns

### Basic RAG Implementation

```javascript
class SimpleRAG {
    constructor(llmFunction) {
        this.llmFunction = llmFunction;
        this.documents = [];
        this.embeddings = [];
    }

    // Add documents to the knowledge base
    async addDocuments(docs) {
        for (const doc of docs) {
            this.documents.push(doc);
            // In production, use proper embedding model
            const embedding = await this.getEmbedding(doc.content);
            this.embeddings.push(embedding);
        }
    }

    // Simple embedding (in production, use actual embedding model)
    async getEmbedding(text) {
        // This is a placeholder - use actual embeddings in production
        // like OpenAI embeddings, sentence-transformers, etc.
        const words = text.toLowerCase().split(/\s+/);
        const vocab = new Set(words);
        return Array.from({ length: 384 }, () => Math.random());
    }

    // Find most relevant documents
    async retrieveRelevant(query, topK = 3) {
        const queryEmbedding = await this.getEmbedding(query);

        const scores = this.embeddings.map((embedding, index) => ({
            index,
            score: this.cosineSimilarity(queryEmbedding, embedding),
            document: this.documents[index]
        }));

        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    }

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    // Generate answer using RAG
    async answer(question) {
        // Retrieve relevant documents
        const relevant = await this.retrieveRelevant(question, 3);

        // Build context from retrieved documents
        const context = relevant
            .map(r => r.document.content)
            .join('\n\n');

        // Create prompt with context
        const prompt = `
Answer the following question based on the provided context.
If the answer cannot be found in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

        // Generate answer
        const answer = await this.llmFunction(prompt);

        return {
            answer,
            sources: relevant.map(r => ({
                title: r.document.title,
                score: r.score
            }))
        };
    }
}

// Usage
const rag = new SimpleRAG(async (prompt) => {
    return await chatWithOpenAI([{ role: 'user', content: prompt }]);
});

await rag.addDocuments([
    { title: 'Doc 1', content: 'Paris is the capital of France.' },
    { title: 'Doc 2', content: 'The Eiffel Tower is in Paris.' },
    { title: 'Doc 3', content: 'France is in Europe.' }
]);

const result = await rag.answer('What is the capital of France?');
console.log(result.answer);
console.log('Sources:', result.sources);
```

### Advanced RAG with OpenAI Embeddings

```javascript
class AdvancedRAG {
    constructor(openaiApiKey) {
        this.apiKey = openaiApiKey;
        this.documents = [];
        this.embeddings = [];
    }

    // Get embeddings from OpenAI
    async getEmbedding(text) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text
            })
        });

        const data = await response.json();
        return data.data[0].embedding;
    }

    // Chunk large documents
    chunkDocument(text, chunkSize = 500, overlap = 50) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            chunks.push(text.substring(start, end));
            start += chunkSize - overlap;
        }

        return chunks;
    }

    // Add document with chunking
    async addDocument(title, content, metadata = {}) {
        const chunks = this.chunkDocument(content);

        for (let i = 0; i < chunks.length; i++) {
            const embedding = await this.getEmbedding(chunks[i]);

            this.documents.push({
                title,
                content: chunks[i],
                chunkIndex: i,
                totalChunks: chunks.length,
                metadata
            });

            this.embeddings.push(embedding);
        }
    }

    // Hybrid search: vector + keyword
    async hybridSearch(query, topK = 5, alpha = 0.7) {
        const queryEmbedding = await this.getEmbedding(query);
        const queryTerms = query.toLowerCase().split(/\s+/);

        const scores = this.embeddings.map((embedding, index) => {
            // Vector similarity
            const vectorScore = this.cosineSimilarity(queryEmbedding, embedding);

            // Keyword match score (BM25-like)
            const doc = this.documents[index];
            const keywordScore = this.keywordScore(queryTerms, doc.content);

            // Combine scores
            const finalScore = alpha * vectorScore + (1 - alpha) * keywordScore;

            return {
                index,
                score: finalScore,
                document: doc
            };
        });

        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    }

    keywordScore(queryTerms, docContent) {
        const docTerms = docContent.toLowerCase().split(/\s+/);
        const docTermSet = new Set(docTerms);

        let matches = 0;
        for (const term of queryTerms) {
            if (docTermSet.has(term)) matches++;
        }

        return matches / queryTerms.length;
    }

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }

    // Generate answer with citations
    async answerWithCitations(question) {
        const relevant = await this.hybridSearch(question, 5);

        const context = relevant
            .map((r, i) => `[${i + 1}] ${r.document.title}: ${r.document.content}`)
            .join('\n\n');

        const prompt = `
Answer the following question based on the provided context.
Cite your sources using [1], [2], etc.

Context:
${context}

Question: ${question}

Answer:`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const answer = data.choices[0].message.content;

        return {
            answer,
            sources: relevant.map((r, i) => ({
                id: i + 1,
                title: r.document.title,
                excerpt: r.document.content.substring(0, 200) + '...',
                score: r.score,
                metadata: r.document.metadata
            }))
        };
    }

    // Save and load the knowledge base
    async save() {
        return {
            documents: this.documents,
            embeddings: this.embeddings
        };
    }

    async load(data) {
        this.documents = data.documents;
        this.embeddings = data.embeddings;
    }
}

// Usage
const advancedRAG = new AdvancedRAG(API_KEY);

// Add a long document
await advancedRAG.addDocument(
    'AI Overview',
    'Very long article about artificial intelligence...',
    { source: 'wikipedia', date: '2024' }
);

// Query with citations
const result = await advancedRAG.answerWithCitations(
    'What is machine learning?'
);
console.log(result.answer);
console.log('Sources:', result.sources);
```

### Document Preprocessing

```javascript
class DocumentProcessor {
    // Clean and normalize text
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')           // Normalize whitespace
            .replace(/[^\w\s.,!?-]/g, '')   // Remove special chars
            .trim();
    }

    // Extract text from HTML
    extractFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove script and style tags
        doc.querySelectorAll('script, style').forEach(el => el.remove());

        return this.cleanText(doc.body.textContent);
    }

    // Extract metadata
    extractMetadata(text) {
        const lines = text.split('\n');
        const metadata = {
            title: lines[0] || 'Untitled',
            wordCount: text.split(/\s+/).length,
            language: this.detectLanguage(text)
        };

        return metadata;
    }

    // Simple language detection
    detectLanguage(text) {
        // Very basic - in production use proper language detection
        const sample = text.toLowerCase().substring(0, 100);
        if (/the|and|is|are|was|were/.test(sample)) return 'en';
        if (/le|la|les|de|et/.test(sample)) return 'fr';
        return 'unknown';
    }

    // Smart chunking based on sentences
    smartChunk(text, maxChunkSize = 500) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += ' ' + sentence;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }
}

// Usage
const processor = new DocumentProcessor();
const cleaned = processor.cleanText(rawText);
const chunks = processor.smartChunk(cleaned);
const metadata = processor.extractMetadata(cleaned);
```

---

## 10. Function Calling and Tool Use

### OpenAI Function Calling

```javascript
// Define available functions
const functions = [
    {
        name: 'get_weather',
        description: 'Get the current weather for a location',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city and state, e.g. San Francisco, CA'
                },
                unit: {
                    type: 'string',
                    enum: ['celsius', 'fahrenheit'],
                    description: 'The temperature unit'
                }
            },
            required: ['location']
        }
    },
    {
        name: 'search_web',
        description: 'Search the web for information',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The search query'
                },
                num_results: {
                    type: 'number',
                    description: 'Number of results to return'
                }
            },
            required: ['query']
        }
    }
];

// Implement the actual functions
const availableFunctions = {
    get_weather: async (args) => {
        // Call weather API
        return {
            location: args.location,
            temperature: 72,
            condition: 'sunny',
            unit: args.unit || 'fahrenheit'
        };
    },

    search_web: async (args) => {
        // Call search API
        return {
            query: args.query,
            results: [
                { title: 'Result 1', url: 'https://example.com/1' },
                { title: 'Result 2', url: 'https://example.com/2' }
            ]
        };
    }
};

// Function calling implementation
async function chatWithFunctions(userMessage, conversationHistory = []) {
    const messages = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    // Initial API call
    let response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: messages,
            functions: functions,
            function_call: 'auto'
        })
    });

    let data = await response.json();
    let message = data.choices[0].message;

    // Check if function call is requested
    if (message.function_call) {
        const functionName = message.function_call.name;
        const functionArgs = JSON.parse(message.function_call.arguments);

        console.log(`Calling function: ${functionName}`, functionArgs);

        // Execute the function
        const functionResponse = await availableFunctions[functionName](functionArgs);

        // Add function result to conversation
        messages.push(message);
        messages.push({
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResponse)
        });

        // Get final response
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: messages
            })
        });

        data = await response.json();
        message = data.choices[0].message;
    }

    return {
        message: message.content,
        conversationHistory: [...messages, message]
    };
}

// Usage
const result = await chatWithFunctions("What's the weather in New York?");
console.log(result.message);
```

### Claude Tool Use

```javascript
const tools = [
    {
        name: 'get_stock_price',
        description: 'Get the current stock price for a given ticker symbol',
        input_schema: {
            type: 'object',
            properties: {
                ticker: {
                    type: 'string',
                    description: 'The stock ticker symbol, e.g., AAPL for Apple'
                }
            },
            required: ['ticker']
        }
    },
    {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        input_schema: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: 'The mathematical expression to evaluate'
                }
            },
            required: ['expression']
        }
    }
];

const toolImplementations = {
    get_stock_price: async (input) => {
        // Mock implementation
        return {
            ticker: input.ticker,
            price: 150.25,
            currency: 'USD',
            timestamp: new Date().toISOString()
        };
    },

    calculate: async (input) => {
        try {
            // Safe evaluation (in production, use a proper math parser)
            const result = Function(`'use strict'; return (${input.expression})`)();
            return { result, expression: input.expression };
        } catch (error) {
            return { error: 'Invalid expression' };
        }
    }
};

async function chatWithClaudeTools(userMessage, conversationHistory = []) {
    const messages = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    let response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: messages,
            tools: tools
        })
    });

    let data = await response.json();

    // Process tool use
    while (data.stop_reason === 'tool_use') {
        const toolUse = data.content.find(block => block.type === 'tool_use');

        if (toolUse) {
            console.log(`Using tool: ${toolUse.name}`, toolUse.input);

            // Execute the tool
            const toolResult = await toolImplementations[toolUse.name](toolUse.input);

            // Add assistant response and tool result to messages
            messages.push({
                role: 'assistant',
                content: data.content
            });

            messages.push({
                role: 'user',
                content: [{
                    type: 'tool_result',
                    tool_use_id: toolUse.id,
                    content: JSON.stringify(toolResult)
                }]
            });

            // Continue conversation
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: messages,
                    tools: tools
                })
            });

            data = await response.json();
        }
    }

    // Extract text response
    const textContent = data.content.find(block => block.type === 'text');

    return {
        message: textContent ? textContent.text : 'No response',
        conversationHistory: messages
    };
}

// Usage
const result = await chatWithClaudeTools("What's 25 * 37?");
console.log(result.message);
```

### Universal Tool System

```javascript
class ToolManager {
    constructor() {
        this.tools = new Map();
    }

    registerTool(name, description, parameters, implementation) {
        this.tools.set(name, {
            name,
            description,
            parameters,
            implementation
        });
    }

    getTool(name) {
        return this.tools.get(name);
    }

    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }

        try {
            return await tool.implementation(args);
        } catch (error) {
            return { error: error.message };
        }
    }

    getToolDefinitions(format = 'openai') {
        const tools = Array.from(this.tools.values());

        if (format === 'openai') {
            return tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }));
        } else if (format === 'claude') {
            return tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.parameters
            }));
        }
    }
}

// Usage
const toolManager = new ToolManager();

// Register tools
toolManager.registerTool(
    'get_time',
    'Get the current time',
    {
        type: 'object',
        properties: {
            timezone: {
                type: 'string',
                description: 'Timezone name'
            }
        }
    },
    async (args) => {
        return {
            time: new Date().toLocaleTimeString('en-US', {
                timeZone: args.timezone || 'UTC'
            })
        };
    }
);

toolManager.registerTool(
    'fetch_url',
    'Fetch content from a URL',
    {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'The URL to fetch'
            }
        },
        required: ['url']
    },
    async (args) => {
        const response = await fetch(args.url);
        const text = await response.text();
        return { content: text.substring(0, 1000) };
    }
);

// Get tool definitions for OpenAI
const openaiTools = toolManager.getToolDefinitions('openai');

// Execute a tool
const result = await toolManager.executeTool('get_time', { timezone: 'America/New_York' });
console.log(result);
```

---

## 11. Safety and Content Filtering

### Input Validation and Sanitization

```javascript
class InputValidator {
    constructor() {
        this.maxLength = 10000;
        this.bannedPatterns = [
            /\b(ignore|disregard) (all )?(previous|prior|above) (instructions?|prompts?)\b/i,
            /\b(system|developer) (prompt|message|instruction)\b/i,
            /\b(jailbreak|bypass|override)\b/i
        ];
    }

    validate(input) {
        const issues = [];

        // Check length
        if (input.length > this.maxLength) {
            issues.push(`Input too long (max ${this.maxLength} characters)`);
        }

        // Check for prompt injection attempts
        for (const pattern of this.bannedPatterns) {
            if (pattern.test(input)) {
                issues.push('Potentially unsafe input detected');
                break;
            }
        }

        // Check for excessive repetition
        if (this.hasExcessiveRepetition(input)) {
            issues.push('Excessive repetition detected');
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    hasExcessiveRepetition(text) {
        const words = text.split(/\s+/);
        if (words.length < 10) return false;

        const wordCount = new Map();
        for (const word of words) {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        }

        // Check if any word appears more than 30% of the time
        for (const count of wordCount.values()) {
            if (count / words.length > 0.3) {
                return true;
            }
        }

        return false;
    }

    sanitize(input) {
        return input
            .trim()
            .replace(/[<>]/g, '')              // Remove HTML brackets
            .replace(/javascript:/gi, '')       // Remove javascript: protocol
            .substring(0, this.maxLength);
    }
}

// Usage
const validator = new InputValidator();
const validation = validator.validate(userInput);

if (!validation.valid) {
    console.error('Invalid input:', validation.issues);
} else {
    const sanitized = validator.sanitize(userInput);
    // Proceed with sanitized input
}
```

### Output Filtering

```javascript
class OutputFilter {
    constructor() {
        this.sensitivePatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/g,                    // SSN
            /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit card
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
            /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g            // Phone number
        ];

        this.replacements = {
            ssn: '[SSN REDACTED]',
            creditCard: '[CARD NUMBER REDACTED]',
            email: '[EMAIL REDACTED]',
            phone: '[PHONE REDACTED]'
        };
    }

    filterSensitiveInfo(text) {
        let filtered = text;

        // Redact SSN
        filtered = filtered.replace(this.sensitivePatterns[0], this.replacements.ssn);

        // Redact credit cards
        filtered = filtered.replace(this.sensitivePatterns[1], this.replacements.creditCard);

        // Redact emails
        filtered = filtered.replace(this.sensitivePatterns[2], this.replacements.email);

        // Redact phone numbers
        filtered = filtered.replace(this.sensitivePatterns[3], this.replacements.phone);

        return filtered;
    }

    async checkToxicity(text) {
        // Integration with toxicity detection API
        // Example: Perspective API by Google
        const response = await fetch('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=' + PERSPECTIVE_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: { text },
                requestedAttributes: {
                    TOXICITY: {},
                    SEVERE_TOXICITY: {},
                    INSULT: {},
                    PROFANITY: {}
                }
            })
        });

        const data = await response.json();

        return {
            toxic: data.attributeScores.TOXICITY.summaryScore.value > 0.7,
            scores: {
                toxicity: data.attributeScores.TOXICITY.summaryScore.value,
                severeToxicity: data.attributeScores.SEVERE_TOXICITY.summaryScore.value,
                insult: data.attributeScores.INSULT.summaryScore.value,
                profanity: data.attributeScores.PROFANITY.summaryScore.value
            }
        };
    }

    containsUnsafeContent(text) {
        const unsafeKeywords = [
            'violence', 'harm', 'illegal', 'dangerous',
            // Add more as needed
        ];

        const lowerText = text.toLowerCase();
        return unsafeKeywords.some(keyword => lowerText.includes(keyword));
    }
}

// Usage
const outputFilter = new OutputFilter();

async function safeResponse(llmOutput) {
    // Filter sensitive information
    let filtered = outputFilter.filterSensitiveInfo(llmOutput);

    // Check toxicity
    const toxicityCheck = await outputFilter.checkToxicity(filtered);
    if (toxicityCheck.toxic) {
        return {
            success: false,
            message: 'Response contains inappropriate content',
            scores: toxicityCheck.scores
        };
    }

    return {
        success: true,
        response: filtered
    };
}
```

### Content Moderation API Integration

```javascript
class ContentModerator {
    constructor(openaiApiKey) {
        this.apiKey = openaiApiKey;
    }

    async moderate(text) {
        const response = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ input: text })
        });

        const data = await response.json();
        const result = data.results[0];

        return {
            flagged: result.flagged,
            categories: result.categories,
            categoryScores: result.category_scores
        };
    }

    async isContentSafe(text) {
        const moderation = await this.moderate(text);
        return !moderation.flagged;
    }

    async moderateConversation(messages) {
        const results = [];

        for (const message of messages) {
            const moderation = await this.moderate(message.content);
            results.push({
                message: message,
                moderation: moderation
            });
        }

        return {
            allSafe: results.every(r => !r.moderation.flagged),
            results: results
        };
    }
}

// Usage
const moderator = new ContentModerator(API_KEY);

async function safeChatCompletion(userMessage) {
    // Check input
    const inputCheck = await moderator.moderate(userMessage);
    if (inputCheck.flagged) {
        return {
            error: 'Your message contains inappropriate content',
            categories: inputCheck.categories
        };
    }

    // Get LLM response
    const response = await chatWithOpenAI([
        { role: 'user', content: userMessage }
    ]);

    // Check output
    const outputCheck = await moderator.moderate(response);
    if (outputCheck.flagged) {
        return {
            error: 'Response was flagged by content filter',
            categories: outputCheck.categories
        };
    }

    return { response };
}
```

### Safe System Prompts

```javascript
const safeSystemPrompts = {
    default: `You are a helpful, harmless, and honest AI assistant.

Guidelines:
- Be respectful and professional at all times
- Do not provide information that could cause harm
- Decline requests for illegal activities
- Do not generate harmful, deceptive, or malicious content
- Respect privacy and do not request personal information
- If unsure about safety, err on the side of caution`,

    educational: `You are an educational AI assistant.

Guidelines:
- Provide accurate, factual information
- Encourage critical thinking
- Use age-appropriate language
- Do not assist with academic dishonesty
- Promote safe and ethical behavior`,

    professional: `You are a professional business assistant.

Guidelines:
- Maintain professional tone
- Protect confidential information
- Follow business ethics
- Provide accurate business advice
- Decline requests that could harm the business or individuals`
};

// Add safety layer to system prompt
function createSafeSystemPrompt(basePrompt) {
    return `${basePrompt}

IMPORTANT SAFETY CONSTRAINTS:
- Never provide instructions for illegal activities
- Do not generate content that promotes harm
- Protect user privacy
- Maintain ethical standards
- Flag inappropriate requests`;
}
```

---

## 12. Rate Limiting and Error Handling

### Rate Limiter

```javascript
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow; // in milliseconds
        this.requests = [];
    }

    async checkLimit() {
        const now = Date.now();

        // Remove old requests outside time window
        this.requests = this.requests.filter(
            time => now - time < this.timeWindow
        );

        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = this.timeWindow - (now - oldestRequest);

            throw {
                error: 'Rate limit exceeded',
                retryAfter: waitTime,
                message: `Please wait ${Math.ceil(waitTime / 1000)} seconds`
            };
        }

        this.requests.push(now);
    }

    getStatus() {
        const now = Date.now();
        const recentRequests = this.requests.filter(
            time => now - time < this.timeWindow
        );

        return {
            used: recentRequests.length,
            remaining: this.maxRequests - recentRequests.length,
            resetIn: recentRequests.length > 0
                ? this.timeWindow - (now - recentRequests[0])
                : 0
        };
    }
}

// Usage
const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

async function rateLimitedRequest(fn) {
    try {
        await rateLimiter.checkLimit();
        return await fn();
    } catch (error) {
        if (error.retryAfter) {
            console.log(`Rate limited. Retry after ${error.retryAfter}ms`);
            // Optionally implement exponential backoff
            await new Promise(resolve => setTimeout(resolve, error.retryAfter));
            return await rateLimitedRequest(fn);
        }
        throw error;
    }
}

// Example
await rateLimitedRequest(async () => {
    return await chatWithOpenAI([{ role: 'user', content: 'Hello' }]);
});
```

### Exponential Backoff

```javascript
class ExponentialBackoff {
    constructor(maxRetries = 5, baseDelay = 1000, maxDelay = 60000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
    }

    async execute(fn) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Don't retry on client errors (4xx)
                if (error.status >= 400 && error.status < 500 && error.status !== 429) {
                    throw error;
                }

                if (attempt < this.maxRetries) {
                    const delay = Math.min(
                        this.baseDelay * Math.pow(2, attempt),
                        this.maxDelay
                    );

                    // Add jitter to prevent thundering herd
                    const jitter = Math.random() * delay * 0.1;
                    const totalDelay = delay + jitter;

                    console.log(`Retry attempt ${attempt + 1} after ${totalDelay}ms`);
                    await new Promise(resolve => setTimeout(resolve, totalDelay));
                }
            }
        }

        throw new Error(`Failed after ${this.maxRetries} retries: ${lastError.message}`);
    }
}

// Usage
const backoff = new ExponentialBackoff(5, 1000, 60000);

const result = await backoff.execute(async () => {
    return await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: 'Hello' }]
        })
    });
});
```

### Comprehensive Error Handler

```javascript
class LLMErrorHandler {
    constructor() {
        this.errorLog = [];
    }

    async handleRequest(requestFn) {
        try {
            const response = await requestFn();

            if (!response.ok) {
                throw await this.parseError(response);
            }

            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    async parseError(response) {
        const status = response.status;
        let message = 'Unknown error';

        try {
            const data = await response.json();
            message = data.error?.message || data.message || message;
        } catch (e) {
            message = await response.text();
        }

        const error = new Error(message);
        error.status = status;
        error.type = this.getErrorType(status);

        return error;
    }

    getErrorType(status) {
        if (status === 400) return 'bad_request';
        if (status === 401) return 'unauthorized';
        if (status === 403) return 'forbidden';
        if (status === 404) return 'not_found';
        if (status === 429) return 'rate_limit';
        if (status >= 500) return 'server_error';
        return 'unknown';
    }

    handleError(error) {
        this.logError(error);

        const errorResponse = {
            success: false,
            error: error.message,
            type: error.type || 'unknown',
            timestamp: Date.now()
        };

        switch (error.type) {
            case 'rate_limit':
                errorResponse.userMessage = 'Too many requests. Please try again later.';
                errorResponse.retryable = true;
                errorResponse.retryAfter = 60000; // 1 minute
                break;

            case 'unauthorized':
                errorResponse.userMessage = 'Authentication failed. Please check your API key.';
                errorResponse.retryable = false;
                break;

            case 'bad_request':
                errorResponse.userMessage = 'Invalid request. Please check your input.';
                errorResponse.retryable = false;
                break;

            case 'server_error':
                errorResponse.userMessage = 'Service temporarily unavailable. Please try again.';
                errorResponse.retryable = true;
                errorResponse.retryAfter = 5000;
                break;

            case 'network_error':
                errorResponse.userMessage = 'Network error. Please check your connection.';
                errorResponse.retryable = true;
                break;

            default:
                errorResponse.userMessage = 'An error occurred. Please try again.';
                errorResponse.retryable = true;
        }

        return errorResponse;
    }

    logError(error) {
        this.errorLog.push({
            timestamp: Date.now(),
            type: error.type,
            message: error.message,
            status: error.status
        });

        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog.shift();
        }

        console.error('LLM Error:', error);
    }

    getErrorStats() {
        const stats = {};

        for (const log of this.errorLog) {
            stats[log.type] = (stats[log.type] || 0) + 1;
        }

        return {
            total: this.errorLog.length,
            byType: stats,
            recent: this.errorLog.slice(-10)
        };
    }
}

// Usage
const errorHandler = new LLMErrorHandler();

async function safeAPICall(message) {
    return await errorHandler.handleRequest(async () => {
        return await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: message }]
            })
        });
    });
}
```

### Request Queue with Concurrency Control

```javascript
class RequestQueue {
    constructor(maxConcurrent = 3) {
        this.maxConcurrent = maxConcurrent;
        this.running = 0;
        this.queue = [];
    }

    async add(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                fn: requestFn,
                resolve,
                reject
            });
            this.process();
        });
    }

    async process() {
        if (this.running >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        this.running++;
        const { fn, resolve, reject } = this.queue.shift();

        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.process(); // Process next in queue
        }
    }

    getStatus() {
        return {
            running: this.running,
            queued: this.queue.length,
            total: this.running + this.queue.length
        };
    }

    clear() {
        this.queue = [];
    }
}

// Usage
const queue = new RequestQueue(3); // Max 3 concurrent requests

// Add multiple requests
const promises = [];
for (let i = 0; i < 10; i++) {
    promises.push(
        queue.add(async () => {
            return await chatWithOpenAI([
                { role: 'user', content: `Request ${i}` }
            ]);
        })
    );
}

// Wait for all to complete
const results = await Promise.all(promises);
console.log('All requests completed:', results);
```

### Complete Production-Ready Wrapper

```javascript
class ProductionLLMClient {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.rateLimiter = new RateLimiter(
            options.maxRequests || 10,
            options.timeWindow || 60000
        );
        this.backoff = new ExponentialBackoff();
        this.errorHandler = new LLMErrorHandler();
        this.queue = new RequestQueue(options.maxConcurrent || 3);
        this.cache = new LLMCache(options.cacheTTL || 3600000);
    }

    async chat(message, options = {}) {
        // Check cache first
        if (options.cache !== false) {
            const cached = this.cache.get(message, options);
            if (cached) {
                console.log('Cache hit');
                return cached;
            }
        }

        // Add to queue with rate limiting and retry logic
        return await this.queue.add(async () => {
            return await this.rateLimiter.checkLimit().then(() => {
                return this.backoff.execute(async () => {
                    const result = await this.errorHandler.handleRequest(async () => {
                        return await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${this.apiKey}`
                            },
                            body: JSON.stringify({
                                model: options.model || 'gpt-4',
                                messages: [{ role: 'user', content: message }],
                                ...options
                            })
                        });
                    });

                    if (result.success !== false) {
                        // Cache successful result
                        if (options.cache !== false) {
                            this.cache.set(message, options, result);
                        }
                    }

                    return result;
                });
            });
        });
    }

    getStats() {
        return {
            rateLimiter: this.rateLimiter.getStatus(),
            queue: this.queue.getStatus(),
            cache: { size: this.cache.size() },
            errors: this.errorHandler.getErrorStats()
        };
    }
}

// Usage
const client = new ProductionLLMClient(API_KEY, {
    maxRequests: 10,
    timeWindow: 60000,
    maxConcurrent: 3,
    cacheTTL: 3600000
});

const response = await client.chat('Hello, AI!', {
    model: 'gpt-4',
    temperature: 0.7,
    cache: true
});

console.log('Stats:', client.getStats());
```

---

## Conclusion

This document covers comprehensive strategies for integrating LLMs into single-file web applications, including:

- Multiple provider integrations (OpenAI, Claude, Google, Cohere, Hugging Face)
- Streaming for real-time responses
- Token management and cost optimization
- Advanced prompt engineering
- Context management and persistence
- Client-side LLM options
- RAG implementation patterns
- Function calling and tool use
- Safety and content filtering
- Production-ready error handling and rate limiting

Each pattern includes practical, copy-paste ready code examples that can be adapted for specific use cases. Remember to:

1. **Never expose API keys in client-side code** - use backend proxies
2. **Implement proper error handling** - APIs can fail
3. **Monitor costs** - track token usage and set limits
4. **Validate inputs and outputs** - protect against prompt injection and inappropriate content
5. **Cache when possible** - reduce costs and improve performance
6. **Rate limit requests** - avoid hitting API limits
7. **Test thoroughly** - LLM outputs can be unpredictable

For production applications, consider using established SDKs and frameworks rather than raw implementations, but these patterns provide the foundation for understanding and customizing LLM integrations.
