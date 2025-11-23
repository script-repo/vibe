# External Services Integration Patterns for Single-File Web Apps

A comprehensive guide to integrating external services in standalone HTML applications.

## Table of Contents

1. [REST API Integration Patterns](#rest-api-integration-patterns)
2. [GraphQL Client Implementations](#graphql-client-implementations)
3. [WebSocket Connections](#websocket-connections)
4. [Server-Sent Events (SSE)](#server-sent-events-sse)
5. [OAuth and Authentication Flows](#oauth-and-authentication-flows)
6. [CORS Handling and Proxy Strategies](#cors-handling-and-proxy-strategies)
7. [API Client Libraries](#api-client-libraries)
8. [Caching and Offline Strategies](#caching-and-offline-strategies)
9. [Error Handling and Retry Logic](#error-handling-and-retry-logic)
10. [Popular Service Integrations](#popular-service-integrations)
11. [CDN and Asset Loading Strategies](#cdn-and-asset-loading-strategies)

---

## REST API Integration Patterns

### Basic Fetch Pattern

```javascript
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Usage
const api = new APIClient('https://api.example.com');
api.setAuthToken('your-token-here');

// Make requests
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John', email: 'john@example.com' });
```

### Advanced REST Pattern with Request Interceptors

```javascript
class AdvancedAPIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.headers = {};
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  addRequestInterceptor(fn) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn) {
    this.responseInterceptors.push(fn);
  }

  async request(endpoint, options = {}) {
    let url = `${this.baseURL}${endpoint}`;
    let config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor({ url, config });
      url = result.url || url;
      config = result.config || config;
    }

    let response = await fetch(url, config);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Usage with interceptors
const api = new AdvancedAPIClient('https://api.example.com');

// Add auth token to all requests
api.addRequestInterceptor(({ url, config }) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return { url, config };
});

// Log all requests
api.addRequestInterceptor(({ url, config }) => {
  console.log(`${config.method || 'GET'} ${url}`);
  return { url, config };
});

// Handle token refresh on 401
api.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Token expired, refresh it
    const newToken = await refreshAuthToken();
    localStorage.setItem('authToken', newToken);
    // Retry the original request
    return fetch(response.url, { ...response.config, headers: { ...response.config.headers, 'Authorization': `Bearer ${newToken}` }});
  }
  return response;
});
```

### Pagination Pattern

```javascript
class PaginatedAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async *fetchPages(endpoint, limit = 20) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${this.baseURL}${endpoint}?page=${page}&limit=${limit}`);
      const data = await response.json();

      yield data.items;

      hasMore = data.items.length === limit;
      page++;
    }
  }

  async fetchAll(endpoint, limit = 20) {
    const allItems = [];
    for await (const items of this.fetchPages(endpoint, limit)) {
      allItems.push(...items);
    }
    return allItems;
  }
}

// Usage
const api = new PaginatedAPI('https://api.example.com');

// Iterate through pages
for await (const items of api.fetchPages('/products')) {
  console.log('Page items:', items);
}

// Or fetch all at once
const allProducts = await api.fetchAll('/products');
```

---

## GraphQL Client Implementations

### Minimal GraphQL Client

```javascript
class GraphQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    return result.data;
  }

  async mutate(mutation, variables = {}) {
    return this.query(mutation, variables);
  }
}

// Usage
const gqlClient = new GraphQLClient('https://api.example.com/graphql');
gqlClient.setAuthToken('your-token');

// Query
const data = await gqlClient.query(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`, { id: '123' });

// Mutation
const result = await gqlClient.mutate(`
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
    }
  }
`, { title: 'New Post', content: 'Content here' });
```

### GraphQL Client with Caching

```javascript
class CachedGraphQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.cache = new Map();
    this.headers = { 'Content-Type': 'application/json' };
  }

  getCacheKey(query, variables) {
    return JSON.stringify({ query, variables });
  }

  async query(query, variables = {}, options = { cache: true }) {
    const cacheKey = this.getCacheKey(query, variables);

    // Check cache
    if (options.cache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const now = Date.now();

      // Cache valid for 5 minutes
      if (now - cached.timestamp < 5 * 60 * 1000) {
        console.log('Returning cached data');
        return cached.data;
      }
    }

    // Fetch from server
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    // Store in cache
    if (options.cache) {
      this.cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
    }

    return result.data;
  }

  invalidateCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Batched GraphQL Requests

```javascript
class BatchedGraphQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.batchTimeout = 10; // ms
    this.pendingQueries = [];
    this.batchTimer = null;
  }

  async query(query, variables = {}) {
    return new Promise((resolve, reject) => {
      this.pendingQueries.push({ query, variables, resolve, reject });

      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.executeBatch();
        }, this.batchTimeout);
      }
    });
  }

  async executeBatch() {
    const batch = this.pendingQueries.splice(0);
    this.batchTimer = null;

    if (batch.length === 0) return;

    try {
      // Create batch query
      const batchedQuery = batch.map((item, index) => `
        query${index}: ${item.query.replace('query', '').trim()}
      `).join('\n');

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { ${batchedQuery} }`,
          variables: Object.assign({}, ...batch.map(b => b.variables))
        })
      });

      const result = await response.json();

      // Resolve individual queries
      batch.forEach((item, index) => {
        const key = `query${index}`;
        if (result.data && result.data[key]) {
          item.resolve(result.data[key]);
        } else {
          item.reject(new Error('Query failed'));
        }
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}
```

---

## WebSocket Connections

### Basic WebSocket Wrapper

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.handleReconnect();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const event = message.event || message.type;

      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(callback => {
          callback(message.data || message);
        });
      }

      // Also emit to wildcard listeners
      if (this.listeners.has('*')) {
        this.listeners.get('*').forEach(callback => {
          callback(message);
        });
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  send(event, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  close() {
    if (this.ws) {
      this.maxReconnectAttempts = 0; // Prevent reconnection
      this.ws.close();
    }
  }
}

// Usage
const ws = new WebSocketClient('wss://api.example.com/ws');

await ws.connect();

ws.on('message', (data) => {
  console.log('Received message:', data);
});

ws.on('userJoined', (user) => {
  console.log('User joined:', user);
});

ws.send('chatMessage', { text: 'Hello, World!' });
```

### Room-Based WebSocket Client

```javascript
class RoomWebSocketClient extends WebSocketClient {
  constructor(url) {
    super(url);
    this.currentRoom = null;
  }

  joinRoom(roomId) {
    this.currentRoom = roomId;
    this.send('joinRoom', { roomId });
  }

  leaveRoom() {
    if (this.currentRoom) {
      this.send('leaveRoom', { roomId: this.currentRoom });
      this.currentRoom = null;
    }
  }

  sendToRoom(event, data) {
    if (!this.currentRoom) {
      console.error('Not in a room');
      return;
    }

    this.send(event, {
      ...data,
      roomId: this.currentRoom
    });
  }
}

// Usage
const roomWs = new RoomWebSocketClient('wss://api.example.com/ws');
await roomWs.connect();

roomWs.joinRoom('room-123');
roomWs.on('roomMessage', (data) => {
  console.log('Room message:', data);
});

roomWs.sendToRoom('chatMessage', { text: 'Hello room!' });
```

---

## Server-Sent Events (SSE)

### SSE Client Implementation

```javascript
class SSEClient {
  constructor(url) {
    this.url = url;
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error);

        if (this.eventSource.readyState === EventSource.CLOSED) {
          this.handleReconnect();
        }

        reject(error);
      };

      this.eventSource.onmessage = (event) => {
        this.handleMessage(event);
      };
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Reconnecting SSE in ${delay}ms...`);

      setTimeout(() => {
        this.connect().catch(err => {
          console.error('SSE reconnection failed:', err);
        });
      }, delay);
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      // Emit to specific event listeners
      if (this.listeners.has(data.type)) {
        this.listeners.get(data.type).forEach(callback => {
          callback(data);
        });
      }

      // Emit to all message listeners
      if (this.listeners.has('message')) {
        this.listeners.get('message').forEach(callback => {
          callback(data);
        });
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Register with EventSource for custom events
    if (event !== 'message' && this.eventSource) {
      this.eventSource.addEventListener(event, (e) => {
        try {
          const data = JSON.parse(e.data);
          callback(data);
        } catch (error) {
          callback(e.data);
        }
      });
    }
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  close() {
    if (this.eventSource) {
      this.maxReconnectAttempts = 0;
      this.eventSource.close();
    }
  }
}

// Usage
const sse = new SSEClient('https://api.example.com/events');
await sse.connect();

sse.on('message', (data) => {
  console.log('Received:', data);
});

sse.on('notification', (data) => {
  console.log('Notification:', data);
});

// Clean up when done
sse.close();
```

### SSE with Automatic Retry and Backoff

```javascript
class RobustSSEClient {
  constructor(url, options = {}) {
    this.url = url;
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = null;
  }

  connect() {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.log('SSE connected');
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.startHeartbeatMonitor();
    };

    this.eventSource.onerror = () => {
      console.error('SSE connection error');
      this.stopHeartbeatMonitor();
      this.reconnect();
    };

    this.eventSource.onmessage = (event) => {
      this.lastHeartbeat = Date.now();
      this.handleMessage(event.data);
    };
  }

  startHeartbeatMonitor() {
    this.heartbeatTimer = setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;

      if (timeSinceLastHeartbeat > this.heartbeatInterval * 2) {
        console.warn('No heartbeat received, reconnecting...');
        this.eventSource.close();
        this.reconnect();
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeatMonitor() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const baseDelay = Math.min(
      this.initialDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxDelay
    );
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  handleMessage(data) {
    try {
      const parsed = JSON.parse(data);
      const eventType = parsed.type || 'message';

      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType).forEach(cb => cb(parsed));
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  close() {
    this.stopHeartbeatMonitor();
    this.maxReconnectAttempts = 0;
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

---

## OAuth and Authentication Flows

### OAuth 2.0 PKCE Flow (for SPAs)

```javascript
class OAuth2Client {
  constructor(config) {
    this.clientId = config.clientId;
    this.authorizationEndpoint = config.authorizationEndpoint;
    this.tokenEndpoint = config.tokenEndpoint;
    this.redirectUri = config.redirectUri || window.location.origin;
    this.scope = config.scope || 'openid profile email';
  }

  // Generate random string for PKCE
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    randomValues.forEach(value => {
      result += chars[value % chars.length];
    });
    return result;
  }

  // Generate PKCE challenge
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);

    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async startLogin() {
    // Generate and store PKCE values
    const state = this.generateRandomString(32);
    const codeVerifier = this.generateRandomString(128);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // Store in session storage
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${this.authorizationEndpoint}?${params.toString()}`;

    // Redirect to authorization endpoint
    window.location.href = authUrl;
  }

  async handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    // Verify state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Get code verifier
    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, codeVerifier);

    // Clean up session storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_code_verifier');

    return tokens;
  }

  async exchangeCodeForTokens(code, codeVerifier) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      code: code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await response.json();

    // Store tokens
    localStorage.setItem('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }

    return tokens;
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      refresh_token: refreshToken
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const tokens = await response.json();

    localStorage.setItem('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }

    return tokens;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// Usage
const oauth = new OAuth2Client({
  clientId: 'your-client-id',
  authorizationEndpoint: 'https://auth.example.com/oauth/authorize',
  tokenEndpoint: 'https://auth.example.com/oauth/token',
  scope: 'read write'
});

// Start login flow
document.getElementById('loginBtn').addEventListener('click', () => {
  oauth.startLogin();
});

// Handle callback
if (window.location.search.includes('code=')) {
  oauth.handleCallback()
    .then(tokens => {
      console.log('Logged in!', tokens);
      // Redirect to app
      window.location.href = '/';
    })
    .catch(error => {
      console.error('Login failed:', error);
    });
}
```

### JWT Token Management

```javascript
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenRefreshTimer = null;
  }

  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return null;
    }
  }

  isTokenExpired(token) {
    const payload = this.parseJWT(token);
    if (!payload || !payload.exp) return true;

    // Check if token expires in less than 5 minutes
    const expiresIn = payload.exp * 1000 - Date.now();
    return expiresIn < 5 * 60 * 1000;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    this.scheduleTokenRefresh();
  }

  scheduleTokenRefresh() {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (!this.accessToken) return;

    const payload = this.parseJWT(this.accessToken);
    if (!payload || !payload.exp) return;

    // Refresh 5 minutes before expiration
    const expiresIn = payload.exp * 1000 - Date.now() - (5 * 60 * 1000);

    if (expiresIn > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshTokens();
      }, expiresIn);
    }
  }

  async refreshTokens() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://api.example.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      this.setTokens(tokens.accessToken, tokens.refreshToken);

      return tokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  getAccessToken() {
    if (!this.accessToken || this.isTokenExpired(this.accessToken)) {
      return null;
    }
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
  }

  loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');

    if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
      this.scheduleTokenRefresh();
      return true;
    }

    return false;
  }
}

// Usage
const tokenManager = new TokenManager();

// Load existing tokens on app start
if (tokenManager.loadTokensFromStorage()) {
  console.log('User is authenticated');
} else {
  console.log('User needs to login');
}
```

---

## CORS Handling and Proxy Strategies

### CORS Proxy Pattern

```javascript
class CORSProxy {
  constructor(proxyUrl) {
    this.proxyUrl = proxyUrl;
  }

  async fetch(url, options = {}) {
    const proxiedUrl = `${this.proxyUrl}?url=${encodeURIComponent(url)}`;
    return fetch(proxiedUrl, options);
  }
}

// Usage with public CORS proxies (for development only!)
const proxy = new CORSProxy('https://corsproxy.io/');
const response = await proxy.fetch('https://api.example.com/data');
const data = await response.json();
```

### Server-Side Proxy Endpoints

```javascript
// Instead of calling external API directly, call your own proxy endpoint
class ProxiedAPIClient {
  constructor(proxyBaseUrl) {
    this.proxyBaseUrl = proxyBaseUrl;
  }

  async request(endpoint, options = {}) {
    // Your server proxies requests to the external API
    const url = `${this.proxyBaseUrl}/proxy${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        // Your server handles auth with the external API
      }
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status}`);
    }

    return response.json();
  }
}

// Usage
const api = new ProxiedAPIClient('https://yourserver.com');
const data = await api.request('/external-api/users');
```

### JSONP Fallback (Legacy)

```javascript
class JSONPClient {
  constructor() {
    this.callbackCounter = 0;
  }

  fetch(url) {
    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_callback_${this.callbackCounter++}`;

      // Create script element
      const script = document.createElement('script');
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('JSONP request timeout'));
      }, 10000);

      // Setup cleanup
      const cleanup = () => {
        delete window[callbackName];
        document.head.removeChild(script);
        clearTimeout(timeoutId);
      };

      // Setup callback
      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      // Add callback parameter to URL
      const separator = url.includes('?') ? '&' : '?';
      script.src = `${url}${separator}callback=${callbackName}`;

      script.onerror = () => {
        cleanup();
        reject(new Error('JSONP request failed'));
      };

      document.head.appendChild(script);
    });
  }
}

// Usage (only works with APIs that support JSONP)
const jsonp = new JSONPClient();
const data = await jsonp.fetch('https://api.example.com/data');
```

---

## API Client Libraries

### Fetch Wrapper with Advanced Features

```javascript
class AdvancedFetch {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = options.headers || {};
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async fetchWithRetry(url, options, attempt = 1) {
    try {
      return await this.fetchWithTimeout(url, options);
    } catch (error) {
      if (attempt >= this.retries) {
        throw error;
      }

      console.log(`Retry attempt ${attempt} of ${this.retries}`);

      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.fetchWithRetry(url, options, attempt + 1);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };

    const response = await this.fetchWithRetry(url, config);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.response = response;
      throw error;
    }

    // Auto-detect response type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Upload file with progress
  async upload(endpoint, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', `${this.baseURL}${endpoint}`);

      // Add default headers
      Object.entries(this.defaultHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }
}

// Usage
const api = new AdvancedFetch('https://api.example.com', {
  timeout: 10000,
  retries: 3,
  headers: {
    'Authorization': 'Bearer token'
  }
});

const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });

// Upload with progress
await api.upload('/upload', file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

### Axios-like API Client

```javascript
class AxiosLike {
  constructor(config = {}) {
    this.defaults = {
      baseURL: config.baseURL || '',
      headers: config.headers || {},
      timeout: config.timeout || 0,
      validateStatus: config.validateStatus || ((status) => status >= 200 && status < 300)
    };
    this.interceptors = {
      request: [],
      response: []
    };
  }

  async request(config) {
    // Merge with defaults
    const finalConfig = {
      ...this.defaults,
      ...config,
      headers: {
        ...this.defaults.headers,
        ...config.headers
      }
    };

    // Apply request interceptors
    let requestConfig = finalConfig;
    for (const interceptor of this.interceptors.request) {
      requestConfig = await interceptor(requestConfig);
    }

    const url = requestConfig.baseURL + (requestConfig.url || '');

    try {
      let response = await fetch(url, {
        method: requestConfig.method || 'GET',
        headers: requestConfig.headers,
        body: requestConfig.data ? JSON.stringify(requestConfig.data) : undefined
      });

      // Build response object
      let responseObj = {
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: requestConfig,
        request: response
      };

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseObj.data = await response.json();
      } else {
        responseObj.data = await response.text();
      }

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        responseObj = await interceptor(responseObj);
      }

      // Validate status
      if (!this.defaults.validateStatus(response.status)) {
        throw responseObj;
      }

      return responseObj;
    } catch (error) {
      throw error;
    }
  }

  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

// Usage
const axios = new AxiosLike({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
axios.interceptors.request.push((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
axios.interceptors.response.push((response) => {
  console.log('Response:', response);
  return response;
});

// Make requests
const response = await axios.get('/users');
console.log(response.data);
```

---

## Caching and Offline Strategies

### Service Worker for Offline Support

```javascript
// Service Worker (sw.js)
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// In your main HTML file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
```

### Advanced Caching Strategy

```javascript
class CacheManager {
  constructor(cacheName = 'api-cache', ttl = 5 * 60 * 1000) {
    this.cacheName = cacheName;
    this.ttl = ttl; // Time to live in milliseconds
  }

  generateKey(url, options = {}) {
    return JSON.stringify({ url, method: options.method || 'GET', body: options.body });
  }

  async get(url, options = {}) {
    const key = this.generateKey(url, options);
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    try {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > this.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async set(url, data, options = {}) {
    const key = this.generateKey(url, options);
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      // LocalStorage might be full
      console.error('Cache write error:', error);
      this.clearOldest();
      // Try again
      try {
        localStorage.setItem(key, JSON.stringify(cacheEntry));
      } catch (e) {
        console.error('Cache still full after cleanup');
      }
    }
  }

  clearOldest() {
    const entries = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value.timestamp) {
          entries.push({ key, timestamp: value.timestamp });
        }
      } catch (e) {
        // Not a cache entry
      }
    }

    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25%
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  clear() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }

    keys.forEach(key => {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value.timestamp) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Not a cache entry
      }
    });
  }
}

// API Client with caching
class CachedAPIClient {
  constructor(baseURL, cacheOptions = {}) {
    this.baseURL = baseURL;
    this.cache = new CacheManager('api-cache', cacheOptions.ttl);
  }

  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Check cache for GET requests
    if (!options.method || options.method === 'GET') {
      const cached = await this.cache.get(url, options);
      if (cached) {
        console.log('Returning cached data');
        return cached;
      }
    }

    // Fetch from network
    const response = await fetch(url, options);
    const data = await response.json();

    // Cache successful GET requests
    if (response.ok && (!options.method || options.method === 'GET')) {
      await this.cache.set(url, data, options);
    }

    return data;
  }

  clearCache() {
    this.cache.clear();
  }
}

// Usage
const api = new CachedAPIClient('https://api.example.com', { ttl: 5 * 60 * 1000 });
const data = await api.fetch('/users'); // Network request
const data2 = await api.fetch('/users'); // Cached
```

### IndexedDB for Large Data Storage

```javascript
class IndexedDBStore {
  constructor(dbName = 'AppDB', storeName = 'cache', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'key' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async set(key, value, ttl = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);

      const data = {
        key,
        value,
        timestamp: Date.now(),
        ttl
      };

      const request = objectStore.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const result = request.result;

        if (!result) {
          resolve(null);
          return;
        }

        // Check TTL
        if (result.ttl) {
          const age = Date.now() - result.timestamp;
          if (age > result.ttl) {
            this.delete(key);
            resolve(null);
            return;
          }
        }

        resolve(result.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async delete(key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllKeys() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAllKeys();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Usage
const store = new IndexedDBStore('MyApp', 'apiCache');
await store.init();

// Store data with 5 minute TTL
await store.set('users', usersData, 5 * 60 * 1000);

// Retrieve data
const users = await store.get('users');
```

---

## Error Handling and Retry Logic

### Comprehensive Error Handler

```javascript
class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ErrorHandler {
  static async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData = null;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response is not JSON
      }

      throw new APIError(errorMessage, response.status, errorData);
    }

    return response;
  }

  static async handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);

    if (error instanceof APIError) {
      switch (error.status) {
        case 400:
          return { error: 'Bad request. Please check your input.' };
        case 401:
          return { error: 'Unauthorized. Please login again.', action: 'login' };
        case 403:
          return { error: 'Access denied.' };
        case 404:
          return { error: 'Resource not found.' };
        case 429:
          return { error: 'Too many requests. Please try again later.', action: 'retry' };
        case 500:
          return { error: 'Server error. Please try again later.', action: 'retry' };
        default:
          return { error: error.message };
      }
    }

    if (error instanceof NetworkError) {
      return { error: 'Network error. Please check your connection.', action: 'retry' };
    }

    return { error: 'An unexpected error occurred.' };
  }
}

// Usage
async function fetchUsers() {
  try {
    const response = await fetch('https://api.example.com/users');
    await ErrorHandler.handleResponse(response);
    return await response.json();
  } catch (error) {
    const handled = await ErrorHandler.handleError(error, 'fetchUsers');

    if (handled.action === 'login') {
      // Redirect to login
      window.location.href = '/login';
    } else if (handled.action === 'retry') {
      // Show retry button
      showRetryButton();
    }

    showErrorMessage(handled.error);
  }
}
```

### Retry Logic with Exponential Backoff

```javascript
class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.factor = options.factor || 2;
    this.jitter = options.jitter !== false;
  }

  shouldRetry(error, attempt) {
    if (attempt >= this.maxRetries) return false;

    // Retry on network errors
    if (error instanceof TypeError) return true;

    // Retry on specific HTTP status codes
    if (error.status === 429 || error.status === 503 || error.status >= 500) {
      return true;
    }

    return false;
  }

  getDelay(attempt) {
    let delay = this.initialDelay * Math.pow(this.factor, attempt);
    delay = Math.min(delay, this.maxDelay);

    if (this.jitter) {
      // Add random jitter (±25%)
      const jitterAmount = delay * 0.25;
      delay = delay + (Math.random() * jitterAmount * 2 - jitterAmount);
    }

    return delay;
  }

  async execute(fn, context = '') {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }

        const delay = this.getDelay(attempt);
        console.log(`${context} failed (attempt ${attempt + 1}/${this.maxRetries + 1}). Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Usage
const retryHandler = new RetryHandler({
  maxRetries: 3,
  initialDelay: 1000,
  factor: 2
});

const data = await retryHandler.execute(
  async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  'Fetch data'
);
```

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.requestLog = [];
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      // Try to close circuit
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= 2) {
        this.state = 'CLOSED';
        this.successes = 0;
        console.log('Circuit breaker CLOSED');
      }
    }

    this.recordRequest(true);
  }

  onFailure() {
    this.failures++;
    this.successes = 0;
    this.recordRequest(false);

    const recentFailures = this.getRecentFailureRate();

    if (recentFailures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.log(`Circuit breaker OPEN for ${this.resetTimeout}ms`);
    }
  }

  recordRequest(success) {
    this.requestLog.push({
      timestamp: Date.now(),
      success
    });

    // Clean old entries
    const cutoff = Date.now() - this.monitoringPeriod;
    this.requestLog = this.requestLog.filter(r => r.timestamp > cutoff);
  }

  getRecentFailureRate() {
    const recent = this.requestLog.filter(r => !r.success);
    return recent.length;
  }

  getState() {
    return this.state;
  }
}

// Usage
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});

async function fetchWithCircuitBreaker() {
  try {
    return await breaker.execute(async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('Request failed');
      return response.json();
    });
  } catch (error) {
    if (error.message === 'Circuit breaker is OPEN') {
      console.log('Service is temporarily unavailable');
    }
    throw error;
  }
}
```

---

## Popular Service Integrations

### Firebase Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Firebase Integration</title>
</head>
<body>
  <script type="module">
    // Import Firebase
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
    import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
    import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "your-api-key",
      authDomain: "your-auth-domain",
      projectId: "your-project-id",
      storageBucket: "your-storage-bucket",
      messagingSenderId: "your-sender-id",
      appId: "your-app-id"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Authentication
    async function login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Logged in:', userCredential.user);
      } catch (error) {
        console.error('Login error:', error);
      }
    }

    // Monitor auth state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.uid);
      } else {
        console.log('User is signed out');
      }
    });

    // Firestore CRUD operations
    async function createDocument(collectionName, data) {
      try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.log('Document created:', docRef.id);
        return docRef.id;
      } catch (error) {
        console.error('Error creating document:', error);
      }
    }

    async function getDocuments(collectionName) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        return documents;
      } catch (error) {
        console.error('Error getting documents:', error);
      }
    }

    async function updateDocument(collectionName, docId, data) {
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        console.log('Document updated');
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }

    async function deleteDocument(collectionName, docId) {
      try {
        await deleteDoc(doc(db, collectionName, docId));
        console.log('Document deleted');
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }

    // Example usage
    const users = await getDocuments('users');
    console.log('Users:', users);
  </script>
</body>
</html>
```

### Supabase Integration

```javascript
class SupabaseClient {
  constructor(supabaseUrl, supabaseKey) {
    this.url = supabaseUrl;
    this.key = supabaseKey;
    this.headers = {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    };
  }

  setAuthToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  async query(table) {
    return new SupabaseQuery(this, table);
  }

  async signUp(email, password) {
    const response = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async signIn(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.access_token) {
      this.setAuthToken(data.access_token);
    }
    return data;
  }

  async select(table, columns = '*', filters = {}) {
    let url = `${this.url}/rest/v1/${table}?select=${columns}`;

    Object.entries(filters).forEach(([key, value]) => {
      url += `&${key}=eq.${value}`;
    });

    const response = await fetch(url, {
      headers: this.headers
    });

    return response.json();
  }

  async insert(table, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    return response.json();
  }

  async update(table, id, data) {
    const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });

    return response.json();
  }

  async delete(table, id) {
    const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.headers
    });

    return response.ok;
  }
}

// Usage
const supabase = new SupabaseClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Authentication
const { user } = await supabase.signIn('user@example.com', 'password');

// Database operations
const users = await supabase.select('users', '*', { active: true });
const newUser = await supabase.insert('users', { name: 'John', email: 'john@example.com' });
await supabase.update('users', userId, { name: 'Jane' });
await supabase.delete('users', userId);
```

### Stripe Integration

```javascript
class StripeClient {
  constructor(publishableKey) {
    this.publishableKey = publishableKey;
    this.loaded = false;
    this.stripe = null;
  }

  async loadStripe() {
    if (this.loaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;

      script.onload = () => {
        this.stripe = Stripe(this.publishableKey);
        this.loaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Stripe'));
      };

      document.head.appendChild(script);
    });
  }

  async createCheckoutSession(items, successUrl, cancelUrl) {
    // This requires a server endpoint to create the session
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items,
        successUrl,
        cancelUrl
      })
    });

    const { sessionId } = await response.json();
    return sessionId;
  }

  async redirectToCheckout(sessionId) {
    if (!this.loaded) await this.loadStripe();

    const { error } = await this.stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  async createPaymentElement(clientSecret, elementId) {
    if (!this.loaded) await this.loadStripe();

    const elements = this.stripe.elements({ clientSecret });
    const paymentElement = elements.create('payment');
    paymentElement.mount(`#${elementId}`);

    return { elements, paymentElement };
  }

  async confirmPayment(elements, returnUrl) {
    const { error } = await this.stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl
      }
    });

    if (error) {
      throw error;
    }
  }
}

// Usage
const stripe = new StripeClient('pk_test_your_publishable_key');

// Checkout flow
async function checkout() {
  const sessionId = await stripe.createCheckoutSession(
    [{ price: 'price_xxx', quantity: 1 }],
    'https://example.com/success',
    'https://example.com/cancel'
  );

  await stripe.redirectToCheckout(sessionId);
}

// Payment Element flow
async function setupPayment(clientSecret) {
  const { elements } = await stripe.createPaymentElement(clientSecret, 'payment-element');

  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await stripe.confirmPayment(elements, 'https://example.com/completion');
  });
}
```

### Auth0 Integration

```javascript
class Auth0Client {
  constructor(config) {
    this.domain = config.domain;
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri || window.location.origin;
    this.audience = config.audience;
  }

  async loadAuth0() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Auth0'));

      document.head.appendChild(script);
    });
  }

  async initialize() {
    await this.loadAuth0();

    this.auth0 = await window.auth0.createAuth0Client({
      domain: this.domain,
      clientId: this.clientId,
      authorizationParams: {
        redirect_uri: this.redirectUri,
        audience: this.audience
      }
    });

    return this.auth0;
  }

  async login() {
    await this.auth0.loginWithRedirect();
  }

  async handleRedirectCallback() {
    const result = await this.auth0.handleRedirectCallback();
    return result;
  }

  async getUser() {
    return await this.auth0.getUser();
  }

  async getToken() {
    return await this.auth0.getTokenSilently();
  }

  async logout() {
    await this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  async isAuthenticated() {
    return await this.auth0.isAuthenticated();
  }
}

// Usage
const auth0 = new Auth0Client({
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id',
  audience: 'https://your-api.com'
});

await auth0.initialize();

// Check if returning from redirect
if (window.location.search.includes('code=')) {
  await auth0.handleRedirectCallback();
  window.history.replaceState({}, document.title, window.location.pathname);
}

// Check auth status
const isAuthenticated = await auth0.isAuthenticated();
if (isAuthenticated) {
  const user = await auth0.getUser();
  const token = await auth0.getToken();
  console.log('User:', user);
}

// Login/Logout
document.getElementById('loginBtn').addEventListener('click', () => auth0.login());
document.getElementById('logoutBtn').addEventListener('click', () => auth0.logout());
```

---

## CDN and Asset Loading Strategies

### Dynamic Script Loading

```javascript
class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.loadingPromises = new Map();
  }

  async loadScript(url, options = {}) {
    // Check if already loaded
    if (this.loadedScripts.has(url)) {
      return Promise.resolve();
    }

    // Check if currently loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // Create loading promise
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = options.async !== false;
      script.defer = options.defer || false;

      if (options.integrity) {
        script.integrity = options.integrity;
        script.crossOrigin = 'anonymous';
      }

      script.onload = () => {
        this.loadedScripts.add(url);
        this.loadingPromises.delete(url);
        resolve();
      };

      script.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load script: ${url}`));
      };

      document.head.appendChild(script);
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  async loadScripts(urls, parallel = true) {
    if (parallel) {
      return Promise.all(urls.map(url => this.loadScript(url)));
    } else {
      for (const url of urls) {
        await this.loadScript(url);
      }
    }
  }

  async loadCSS(url, options = {}) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      if (options.integrity) {
        link.integrity = options.integrity;
        link.crossOrigin = 'anonymous';
      }

      link.onload = resolve;
      link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));

      document.head.appendChild(link);
    });
  }
}

// Usage
const loader = new ScriptLoader();

// Load single script
await loader.loadScript('https://cdn.example.com/library.js');

// Load multiple scripts in parallel
await loader.loadScripts([
  'https://cdn.example.com/lib1.js',
  'https://cdn.example.com/lib2.js'
], true);

// Load scripts sequentially
await loader.loadScripts([
  'https://cdn.example.com/jquery.js',
  'https://cdn.example.com/jquery-plugin.js'
], false);

// Load with integrity check
await loader.loadScript(
  'https://cdn.example.com/library.js',
  {
    integrity: 'sha384-xxx',
    async: true
  }
);

// Load CSS
await loader.loadCSS('https://cdn.example.com/styles.css');
```

### CDN Fallback Strategy

```javascript
class CDNLoader {
  constructor() {
    this.retries = 2;
  }

  async loadWithFallback(cdnUrls, localUrl) {
    for (const cdnUrl of cdnUrls) {
      try {
        await this.loadScript(cdnUrl);
        console.log(`Loaded from CDN: ${cdnUrl}`);
        return;
      } catch (error) {
        console.warn(`CDN failed: ${cdnUrl}`, error);
      }
    }

    // All CDNs failed, use local fallback
    try {
      await this.loadScript(localUrl);
      console.log(`Loaded from local: ${localUrl}`);
    } catch (error) {
      throw new Error('All CDN sources failed and local fallback failed');
    }
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error('Script load timeout'));
      }, 10000);

      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error(`Failed to load: ${url}`));
      };

      document.head.appendChild(script);
    });
  }
}

// Usage
const cdnLoader = new CDNLoader();

await cdnLoader.loadWithFallback(
  [
    'https://cdn.jsdelivr.net/npm/library@1.0.0/dist/library.min.js',
    'https://unpkg.com/library@1.0.0/dist/library.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/library/1.0.0/library.min.js'
  ],
  '/local/library.min.js'
);
```

### Lazy Loading Strategy

```javascript
class LazyLoader {
  constructor() {
    this.observer = null;
    this.setupObserver();
  }

  setupObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadElement(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px'
      });
    }
  }

  loadElement(element) {
    const src = element.dataset.src;
    const srcset = element.dataset.srcset;

    if (element.tagName === 'IMG') {
      if (srcset) element.srcset = srcset;
      if (src) element.src = src;
    } else if (element.tagName === 'IFRAME') {
      if (src) element.src = src;
    } else if (element.tagName === 'SCRIPT') {
      const script = document.createElement('script');
      script.src = src;
      element.parentNode.replaceChild(script, element);
    }

    element.classList.add('loaded');
  }

  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadElement(element);
    }
  }

  observeAll(selector = '[data-src]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => this.observe(element));
  }
}

// Usage in HTML
/*
<img data-src="image.jpg" data-srcset="image@2x.jpg 2x" alt="Lazy loaded image">
<iframe data-src="https://www.youtube.com/embed/xxx" frameborder="0"></iframe>
<script data-src="https://cdn.example.com/large-library.js"></script>
*/

// Initialize
const lazyLoader = new LazyLoader();
lazyLoader.observeAll();
```

### Preloading and Resource Hints

```javascript
class ResourceHintManager {
  preload(url, as, type = null) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;

    if (type) {
      link.type = type;
    }

    document.head.appendChild(link);
  }

  prefetch(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  preconnect(url) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  dnsPrefetch(url) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // Preload critical resources
  preloadCritical() {
    // Preload fonts
    this.preload('/fonts/main.woff2', 'font', 'font/woff2');

    // Preload critical CSS
    this.preload('/css/critical.css', 'style');

    // Preload hero image
    this.preload('/images/hero.webp', 'image');
  }

  // Prefetch next page resources
  prefetchNextPage(urls) {
    urls.forEach(url => this.prefetch(url));
  }

  // Connect to third-party origins
  connectToOrigins(origins) {
    origins.forEach(origin => {
      this.dnsPrefetch(origin);
      this.preconnect(origin);
    });
  }
}

// Usage
const resourceHints = new ResourceHintManager();

// Preload critical resources
resourceHints.preloadCritical();

// Connect to external services
resourceHints.connectToOrigins([
  'https://api.example.com',
  'https://cdn.example.com',
  'https://fonts.googleapis.com'
]);

// Prefetch next page
document.querySelectorAll('a[href^="/"]').forEach(link => {
  link.addEventListener('mouseenter', () => {
    resourceHints.prefetch(link.href);
  });
});
```

### Asset Version Management

```javascript
class AssetVersionManager {
  constructor(version) {
    this.version = version;
    this.cache = new Map();
  }

  getVersionedUrl(url) {
    // Add version query parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${this.version}`;
  }

  async loadScript(url) {
    const versionedUrl = this.getVersionedUrl(url);

    if (this.cache.has(versionedUrl)) {
      return this.cache.get(versionedUrl);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = versionedUrl;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    this.cache.set(versionedUrl, promise);
    return promise;
  }

  async loadCSS(url) {
    const versionedUrl = this.getVersionedUrl(url);

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = versionedUrl;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  clearCache() {
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    // Clear application cache
    this.cache.clear();

    // Reload page
    window.location.reload(true);
  }

  checkVersion(latestVersion) {
    if (this.version !== latestVersion) {
      console.log('New version available:', latestVersion);
      return false;
    }
    return true;
  }
}

// Usage
const APP_VERSION = '1.2.3';
const assets = new AssetVersionManager(APP_VERSION);

// Load versioned assets
await assets.loadScript('/js/app.js'); // Loads /js/app.js?v=1.2.3
await assets.loadCSS('/css/styles.css'); // Loads /css/styles.css?v=1.2.3

// Check for updates
setInterval(async () => {
  const response = await fetch('/api/version');
  const { version } = await response.json();

  if (!assets.checkVersion(version)) {
    if (confirm('New version available. Reload?')) {
      assets.clearCache();
    }
  }
}, 60000); // Check every minute
```

---

## Complete Integration Example

Here's a complete example combining multiple patterns:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Integration Example</title>

  <!-- Preconnect to external services -->
  <link rel="preconnect" href="https://api.example.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">

  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .status {
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }

    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
    .loading { background: #d1ecf1; color: #0c5460; }
  </style>
</head>
<body>
  <h1>External Services Integration Demo</h1>

  <div id="status"></div>

  <button id="fetchData">Fetch Data</button>
  <button id="subscribe">Subscribe to Updates</button>

  <div id="data"></div>

  <script type="module">
    // Import patterns from above
    class APIClient {
      constructor(baseURL) {
        this.baseURL = baseURL;
        this.headers = {};
      }

      setAuthToken(token) {
        this.headers['Authorization'] = `Bearer ${token}`;
      }

      async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
            ...options.headers
          }
        };

        try {
          const response = await fetch(url, config);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.json();
        } catch (error) {
          console.error('API Request failed:', error);
          throw error;
        }
      }

      get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
      }
    }

    class WebSocketClient {
      constructor(url) {
        this.url = url;
        this.ws = null;
        this.listeners = new Map();
      }

      connect() {
        return new Promise((resolve) => {
          this.ws = new WebSocket(this.url);

          this.ws.onopen = () => {
            console.log('WebSocket connected');
            resolve();
          };

          this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.emit('message', data);
          };
        });
      }

      on(event, callback) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
      }

      emit(event, data) {
        if (this.listeners.has(event)) {
          this.listeners.get(event).forEach(cb => cb(data));
        }
      }

      send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      }
    }

    // Initialize services
    const api = new APIClient('https://api.example.com');
    const ws = new WebSocketClient('wss://api.example.com/ws');

    const statusEl = document.getElementById('status');
    const dataEl = document.getElementById('data');

    function showStatus(message, type = 'loading') {
      statusEl.innerHTML = `<div class="status ${type}">${message}</div>`;
    }

    // Fetch data with error handling
    document.getElementById('fetchData').addEventListener('click', async () => {
      try {
        showStatus('Fetching data...', 'loading');
        const data = await api.get('/data');
        dataEl.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        showStatus('Data loaded successfully!', 'success');
      } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
      }
    });

    // WebSocket subscription
    document.getElementById('subscribe').addEventListener('click', async () => {
      try {
        showStatus('Connecting to WebSocket...', 'loading');
        await ws.connect();

        ws.on('message', (data) => {
          dataEl.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        });

        showStatus('Subscribed to updates!', 'success');
      } catch (error) {
        showStatus(`WebSocket error: ${error.message}`, 'error');
      }
    });

    // Service Worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed:', err));
    }
  </script>
</body>
</html>
```

---

## Best Practices Summary

1. **Always handle errors gracefully** - Provide user feedback and retry options
2. **Implement proper authentication** - Use OAuth 2.0 PKCE for SPAs, refresh tokens
3. **Cache strategically** - Use appropriate caching for different data types
4. **Monitor connection health** - Implement heartbeats and reconnection logic
5. **Lazy load resources** - Load external libraries only when needed
6. **Use CDN fallbacks** - Have backup sources for critical dependencies
7. **Implement rate limiting** - Respect API limits with queuing and throttling
8. **Secure your tokens** - Store sensitive data appropriately, never in localStorage for production
9. **Optimize network requests** - Batch, debounce, and minimize API calls
10. **Test offline scenarios** - Ensure graceful degradation when services are unavailable

---

## Additional Resources

- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs - WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MDN Web Docs - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [OAuth 2.0 PKCE Flow](https://oauth.net/2/pkce/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
