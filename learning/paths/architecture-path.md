# Architecture Learning Path

**Duration:** 3-4 weeks
**Difficulty:** Intermediate to Advanced
**Prerequisites:**
- Completed [Web Fundamentals Path](./web-fundamentals.md)
- Solid understanding of JavaScript (closures, prototypes, async)
- Experience building multi-feature applications
- Understanding of design patterns basics

---

## Overview

This path teaches you how to build extensible, maintainable single-file applications using professional architectural patterns. You'll learn plugin systems, event-driven architecture, state management, middleware patterns, and fault tolerance techniques used in production systems.

---

## Learning Objectives

By the end of this path, you will:

- Design plugin-based architectures for extensibility
- Implement event-driven systems with pub/sub patterns
- Create middleware and interceptor chains
- Build resilient systems with circuit breakers and retry logic
- Master state management patterns
- Implement dependency injection
- Handle errors gracefully with fault tolerance
- Apply enterprise patterns to single-file apps

---

## Week 1: Plugin Architecture

### Day 1-2: Plugin Registry Pattern
**Focus:** Building extensible applications

**Topics:**
- Central plugin registry
- Plugin validation and registration
- Plugin lifecycle (init, enable, disable, destroy)
- Priority-based loading
- Graceful degradation on plugin failures
- Dependency injection for plugin context

**Reference:** [../reference/plugin-architecture.md](../reference/plugin-architecture.md) (Registry Pattern section)

**Practice:**
- Build a plugin registry from scratch
- Create 3-5 sample plugins
- Implement priority-based execution
- Add plugin enable/disable functionality

**Core Pattern:**
```javascript
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
  }

  register(name, plugin, priority = 10) {
    if (!this.validate(plugin)) {
      throw new Error(`Invalid plugin: ${name}`);
    }
    this.plugins.set(name, { plugin, priority });
  }

  validate(plugin) {
    return typeof plugin.init === 'function';
  }

  async initAll() {
    const sorted = [...this.plugins.values()]
      .sort((a, b) => a.priority - b.priority);

    for (const { plugin } of sorted) {
      try {
        await plugin.init();
      } catch (error) {
        console.error('Plugin init failed:', error);
        // Continue with other plugins
      }
    }
  }
}
```

**Examples:**
- [../examples/35-plugin-architecture.html](../examples/35-plugin-architecture.html)

**Snippet:** See [../snippets/plugin-registry.js](../snippets/plugin-registry.js)

---

### Day 3-5: Hook System (WordPress-Style)
**Focus:** Allowing plugins to modify behavior

**Topics:**
- Actions (execute code at specific points)
- Filters (modify and return data)
- Priority-based execution
- Hook registration and removal
- Chain filtering pattern
- Safe execution with error handling

**Reference:** [../reference/plugin-architecture.md](../reference/plugin-architecture.md) (Hook System section)

**Practice:**
- Implement actions and filters
- Create a hook-based application
- Build plugins that extend via hooks
- Handle plugin conflicts

**Actions vs Filters:**
- **Actions:** Execute code, no return value
- **Filters:** Transform data, return modified value

**Implementation:**
```javascript
class HookSystem {
  constructor() {
    this.actions = new Map();
    this.filters = new Map();
  }

  // Actions: Execute callbacks without return
  addAction(name, callback, priority = 10) {
    if (!this.actions.has(name)) {
      this.actions.set(name, []);
    }
    this.actions.get(name).push({ callback, priority });
    this.actions.get(name).sort((a, b) => a.priority - b.priority);
  }

  doAction(name, ...args) {
    const callbacks = this.actions.get(name) || [];
    for (const { callback } of callbacks) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Action ${name} failed:`, error);
      }
    }
  }

  // Filters: Chain transformations
  addFilter(name, callback, priority = 10) {
    if (!this.filters.has(name)) {
      this.filters.set(name, []);
    }
    this.filters.get(name).push({ callback, priority });
    this.filters.get(name).sort((a, b) => a.priority - b.priority);
  }

  applyFilters(name, value, ...args) {
    const callbacks = this.filters.get(name) || [];
    let result = value;

    for (const { callback } of callbacks) {
      try {
        result = callback(result, ...args);
      } catch (error) {
        console.error(`Filter ${name} failed:`, error);
        // Return previous value on error
      }
    }

    return result;
  }
}
```

**Usage Example:**
```javascript
// Add filters
hooks.addFilter('post_title', (title) => title.toUpperCase(), 5);
hooks.addFilter('post_title', (title) => `📝 ${title}`, 10);

// Apply filters (executed in priority order)
const title = hooks.applyFilters('post_title', 'Hello World');
// Result: "📝 HELLO WORLD"

// Add actions
hooks.addAction('post_published', (post) => {
  console.log('Post published:', post.title);
});

// Trigger action
hooks.doAction('post_published', { title: 'My Post' });
```

**Examples:**
- [../examples/36-wordpress-hook-system.html](../examples/36-wordpress-hook-system.html)

**Snippet:** See [../snippets/hook-system.js](../snippets/hook-system.js)

---

### Day 6-7: Module Federation & Feature Flags
**Focus:** Conditional feature loading

**Topics:**
- Feature flag system
- Lazy loading modules
- Dynamic imports
- A/B testing support
- User-based feature toggles
- Graceful feature degradation

**Reference:** [../reference/plugin-architecture.md](../reference/plugin-architecture.md) (Feature Flags section)

**Practice:**
- Build feature flag system
- Implement lazy module loading
- Create A/B testing framework
- Add user-based toggles

**Feature Flag Pattern:**
```javascript
class FeatureFlags {
  constructor() {
    this.flags = new Map();
  }

  enable(feature, condition = true) {
    this.flags.set(feature, condition);
  }

  isEnabled(feature, context = {}) {
    const condition = this.flags.get(feature);

    if (typeof condition === 'function') {
      return condition(context);
    }

    return !!condition;
  }

  async loadFeature(feature, modulePath) {
    if (!this.isEnabled(feature)) {
      return null;
    }

    try {
      const module = await import(modulePath);
      return module.default;
    } catch (error) {
      console.error(`Failed to load ${feature}:`, error);
      return null;
    }
  }
}

// Usage
flags.enable('darkMode', true);
flags.enable('premium', (user) => user.isPremium);

if (flags.isEnabled('premium', { user })) {
  const premium = await flags.loadFeature('premium', './premium.js');
}
```

---

## Week 2: Event-Driven Architecture

### Day 8-10: Event Emitter Pattern
**Focus:** Loose coupling with events

**Topics:**
- Custom event emitters
- Observer pattern
- Event namespacing
- Once listeners
- Event bubbling and delegation
- Memory leak prevention

**Reference:** [../reference/plugin-architecture.md](../reference/plugin-architecture.md) (Event-Driven section)

**Practice:**
- Build event emitter from scratch
- Create event-driven app
- Implement event delegation
- Add wildcard listeners

**Event Emitter Implementation:**
```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off(event, callback) {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, ...args) {
    const callbacks = this.events.get(event) || [];
    for (const callback of callbacks) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Event ${event} handler error:`, error);
      }
    }
  }
}
```

**Usage:**
```javascript
const emitter = new EventEmitter();

// Subscribe
const unsubscribe = emitter.on('userLogin', (user) => {
  console.log('User logged in:', user.name);
});

// Emit
emitter.emit('userLogin', { name: 'Alice' });

// Unsubscribe
unsubscribe();
```

---

### Day 11-12: Pub/Sub Pattern
**Focus:** Decoupled messaging system

**Topics:**
- Message broker pattern
- Topic-based subscriptions
- Message queuing
- Async message handling
- Message persistence
- Dead letter queue

**Practice:**
- Build pub/sub system
- Create message broker
- Implement topic filtering
- Add message persistence

**Pub/Sub vs Event Emitter:**
- Event Emitter: Direct connection between emitter and listener
- Pub/Sub: Central broker, publishers/subscribers don't know each other

---

### Day 13-14: State Machine Pattern
**Focus:** Managing complex state transitions

**Topics:**
- Finite state machines
- State transition validation
- Actions on state change
- State history tracking
- Undo/redo with states

**Practice:**
- Build a state machine
- Create form wizard with states
- Implement game state management
- Add undo/redo functionality

**State Machine Example:**
```javascript
class StateMachine {
  constructor(initialState, transitions) {
    this.state = initialState;
    this.transitions = transitions;
    this.listeners = [];
  }

  can(action) {
    return !!this.transitions[this.state]?.[action];
  }

  transition(action, data) {
    if (!this.can(action)) {
      throw new Error(`Cannot ${action} from ${this.state}`);
    }

    const oldState = this.state;
    this.state = this.transitions[this.state][action];

    this.emit('transition', { from: oldState, to: this.state, action, data });
    return this.state;
  }

  on(callback) {
    this.listeners.push(callback);
  }

  emit(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }
}

// Usage: Order state machine
const orderSM = new StateMachine('pending', {
  pending: { pay: 'paid', cancel: 'cancelled' },
  paid: { ship: 'shipped', refund: 'refunded' },
  shipped: { deliver: 'delivered', return: 'returned' },
  delivered: { return: 'returned' },
  cancelled: {},
  refunded: {},
  returned: {}
});

orderSM.transition('pay');  // pending -> paid
orderSM.transition('ship'); // paid -> shipped
```

---

## Week 3: Middleware & Fault Tolerance

### Day 15-17: Middleware Pattern
**Focus:** Request/response interceptors

**Topics:**
- Middleware chain pattern
- Request interceptors
- Response interceptors
- Error interceptors
- Async middleware
- Middleware composition

**Reference:** [../reference/external-services.md](../reference/external-services.md) (Interceptors section)

**Practice:**
- Build HTTP client with interceptors
- Create authentication middleware
- Add logging middleware
- Implement retry middleware

**Interceptor Implementation:**
```javascript
class HttpClient {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  addRequestInterceptor(fn) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn) {
    this.responseInterceptors.push(fn);
  }

  async request(config) {
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    // Make request
    let response = await fetch(config.url, config);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response, config);
    }

    return response;
  }
}

// Usage
const client = new HttpClient();

// Add auth header
client.addRequestInterceptor((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

// Auto-refresh token on 401
client.addResponseInterceptor(async (response, config) => {
  if (response.status === 401) {
    const newToken = await refreshToken();
    localStorage.setItem('token', newToken);
    // Retry original request
    return client.request(config);
  }
  return response;
});
```

**Examples:**
- [../examples/30-rest-api-client-interceptors.html](../examples/30-rest-api-client-interceptors.html)

**Snippet:** See [../snippets/http-interceptors.js](../snippets/http-interceptors.js)

---

### Day 18-19: Circuit Breaker Pattern
**Focus:** Fault tolerance for external services

**Topics:**
- Circuit states (CLOSED, OPEN, HALF_OPEN)
- Failure rate tracking
- Automatic recovery attempts
- Fallback strategies
- Timeout handling
- Health monitoring

**Reference:** [../reference/external-services.md](../reference/external-services.md) (Circuit Breaker section)

**Practice:**
- Implement circuit breaker
- Add to HTTP client
- Create health dashboard
- Test failure scenarios

**Circuit Breaker States:**
- **CLOSED:** Normal operation, requests pass through
- **OPEN:** Too many failures, reject requests immediately
- **HALF_OPEN:** Testing if service recovered, allow one request

**Implementation:**
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 60s
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10s

    this.state = 'CLOSED';
    this.failures = [];
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
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
    this.failures = [];
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  onFailure() {
    this.failures.push(Date.now());

    // Clean old failures outside monitoring period
    const cutoff = Date.now() - this.monitoringPeriod;
    this.failures = this.failures.filter(t => t > cutoff);

    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 60000
});

try {
  const data = await breaker.execute(() => fetch('/api/data'));
} catch (error) {
  // Circuit is open or request failed
  console.log('Using fallback data');
}
```

**Examples:**
- [../examples/33-circuit-breaker-pattern.html](../examples/33-circuit-breaker-pattern.html)

**Snippet:** See [../snippets/circuit-breaker.js](../snippets/circuit-breaker.js)

---

### Day 20-21: Retry Logic & Exponential Backoff
**Focus:** Resilient API calls

**Topics:**
- Retry strategies
- Exponential backoff algorithm
- Jitter for retry timing
- Max retry limits
- Idempotency considerations
- Timeout handling

**Reference:** [../reference/external-services.md](../reference/external-services.md) (Retry Logic section)

**Practice:**
- Implement retry with exponential backoff
- Add to HTTP client
- Handle different error types
- Test with flaky services

**Exponential Backoff:**
```javascript
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);

      // Add jitter (±25%) to prevent thundering herd
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);

      await sleep(delay + jitter);
    }
  }
}

// Usage
const data = await retryWithBackoff(() => fetch('/api/data'));
```

**Examples:**
- [../examples/32-websocket-exponential-backoff.html](../examples/32-websocket-exponential-backoff.html)

---

## Week 4: State Management & Patterns

### Day 22-23: Observable Store Pattern
**Focus:** Reactive state without frameworks

**Topics:**
- Observable pattern
- State immutability
- Computed values
- State persistence
- DevTools integration
- Time-travel debugging

**Reference:** [../reference/frameworks.md](../reference/frameworks.md) (State Management section)

**Practice:**
- Build observable store
- Add computed values
- Implement persistence
- Create DevTools

**Minimal Store (20 lines):**
```javascript
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      this.listeners.splice(index, 1);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Usage
const store = new Store({ count: 0 });

store.subscribe((state) => {
  console.log('State updated:', state);
});

store.setState({ count: store.getState().count + 1 });
```

**Examples:**
- [../examples/37-observable-store-pattern.html](../examples/37-observable-store-pattern.html)

**Snippet:** See [../snippets/observable-store.js](../snippets/observable-store.js)

---

### Day 24-25: Dependency Injection
**Focus:** Loose coupling and testability

**Topics:**
- DI container pattern
- Service registration
- Singleton vs transient services
- Constructor injection
- Factory pattern
- Service locator pattern

**Practice:**
- Build DI container
- Register services
- Inject dependencies
- Create testable modules

**DI Container:**
```javascript
class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory, singleton = false) {
    this.services.set(name, { factory, singleton });
  }

  resolve(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not registered`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }
}

// Usage
const container = new DIContainer();

container.register('logger', () => new Logger(), true);
container.register('api', (c) => new API(c.resolve('logger')));

const api = container.resolve('api');
```

---

### Day 26-28: Design Patterns for Single-File Apps
**Focus:** Applying classic patterns

**Topics:**
- Module pattern (IIFE)
- Revealing module pattern
- Singleton pattern
- Factory pattern
- Strategy pattern
- Command pattern
- Proxy pattern
- Decorator pattern

**Practice:**
- Implement 5+ design patterns
- Combine patterns in application
- Refactor code using patterns
- Create pattern library

**Module Pattern:**
```javascript
const MyModule = (function() {
  // Private
  let privateVar = 0;

  function privateMethod() {
    console.log('Private');
  }

  // Public API
  return {
    publicMethod() {
      privateMethod();
      return privateVar++;
    },

    get value() {
      return privateVar;
    }
  };
})();
```

**Strategy Pattern:**
```javascript
class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  process(amount) {
    return this.strategy.pay(amount);
  }
}

const strategies = {
  creditCard: {
    pay: (amount) => console.log(`Paid ${amount} with credit card`)
  },
  paypal: {
    pay: (amount) => console.log(`Paid ${amount} with PayPal`)
  }
};

const processor = new PaymentProcessor(strategies.creditCard);
processor.process(100);
```

---

## Capstone Projects

Choose one architectural challenge:

### Option 1: Modular CMS
Build a content management system with:
- Plugin architecture for content types
- Hook system for extending functionality
- Event-driven updates
- State management for content
- API client with interceptors
- Circuit breaker for external services

**Skills Used:** All architecture patterns

---

### Option 2: Real-Time Collaboration Tool
Create a collaborative workspace with:
- WebSocket with auto-reconnect
- Event-driven sync
- Operational transforms
- Conflict resolution
- Offline support with sync
- Plugin system for tools

**Skills Used:** Events, state, fault tolerance

---

### Option 3: Extensible Dashboard Platform
Build a dashboard framework with:
- Widget plugin system
- Hook-based customization
- Feature flags for widgets
- State management
- API middleware
- Theme system

**Skills Used:** Plugins, hooks, state, middleware

---

## Skills Assessment Checklist

After completing this path, you should be able to:

**Plugin Architecture:**
- [ ] Design extensible plugin systems
- [ ] Implement hook-based architecture
- [ ] Create feature flag systems
- [ ] Handle plugin dependencies

**Event-Driven:**
- [ ] Build event emitters
- [ ] Implement pub/sub patterns
- [ ] Create state machines
- [ ] Manage event memory leaks

**Fault Tolerance:**
- [ ] Implement circuit breakers
- [ ] Add retry logic with backoff
- [ ] Create middleware chains
- [ ] Handle graceful degradation

**State Management:**
- [ ] Build observable stores
- [ ] Implement computed values
- [ ] Add state persistence
- [ ] Create time-travel debugging

**Patterns:**
- [ ] Apply design patterns appropriately
- [ ] Use dependency injection
- [ ] Implement strategy pattern
- [ ] Combine multiple patterns

---

## Next Steps

You've completed all learning paths! Now:

1. **Build complex applications** combining all skills
2. **Contribute to open source** with your knowledge
3. **Teach others** - best way to solidify learning
4. **Stay updated** - web standards evolve constantly

---

## Resources

### Documentation
- [Patterns.dev](https://www.patterns.dev/) - Modern patterns
- [Refactoring Guru](https://refactoring.guru/) - Design patterns
- [JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/)

### Books
- "Design Patterns" (Gang of Four)
- "Clean Architecture" (Robert Martin)
- "JavaScript Patterns" (Stoyan Stefanov)

### Reference Files
- [plugin-architecture.md](../reference/plugin-architecture.md) - Complete plugin guide
- [external-services.md](../reference/external-services.md) - API patterns
- [frameworks.md](../reference/frameworks.md) - State management

---

## Tips for Success

1. **Start simple** - Don't over-engineer
2. **Solve real problems** - Patterns should help, not hinder
3. **Refactor gradually** - Improve architecture over time
4. **Test patterns** - Understand why they work
5. **Combine wisely** - Some patterns work better together
6. **Consider trade-offs** - Every pattern has costs
7. **Keep it maintainable** - Future you will thank you
8. **Document decisions** - Explain why you chose patterns

---

**Remember:** Good architecture enables change. The best architecture for a single-file app is the simplest one that solves your current problems while allowing for future growth.

Congratulations on completing all learning paths! 🎉
