# Plugin Architecture and Modular Patterns for Single-File Web Apps

## Table of Contents
1. [Introduction](#introduction)
2. [Plugin/Extension Patterns](#pluginextension-patterns)
3. [Event-Driven Architecture](#event-driven-architecture)
4. [Dependency Injection Patterns](#dependency-injection-patterns)
5. [Module Registration Systems](#module-registration-systems)
6. [Hooks and Middleware Patterns](#hooks-and-middleware-patterns)
7. [Dynamic Loading Strategies](#dynamic-loading-strategies)
8. [Configuration-Based Modularity](#configuration-based-modularity)
9. [Feature Flags and Conditional Loading](#feature-flags-and-conditional-loading)
10. [Micro-Frontend Concepts for Single File](#micro-frontend-concepts-for-single-file)
11. [Real-World Examples](#real-world-examples)
12. [Complete Integration Example](#complete-integration-example)

---

## Introduction

Creating extensible, modular applications within a single-file constraint presents unique challenges. This document explores proven architectural patterns that enable plugin-style extensibility while maintaining the simplicity of a self-contained HTML file.

**Key Principles:**
- Loose coupling between core and plugins
- Clear extension points
- Lifecycle management
- Graceful degradation
- No external dependencies

---

## Plugin/Extension Patterns

### 1. Registry Pattern

The registry pattern maintains a central collection of plugins with lifecycle management.

```javascript
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }

  register(name, plugin) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin "${name}" is already registered`);
      return false;
    }

    // Validate plugin interface
    if (typeof plugin.init !== 'function') {
      console.error(`Plugin "${name}" must have an init method`);
      return false;
    }

    this.plugins.set(name, {
      instance: plugin,
      enabled: false,
      priority: plugin.priority || 10
    });

    return true;
  }

  unregister(name) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.enabled) {
      this.disable(name);
    }
    return this.plugins.delete(name);
  }

  enable(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;

    if (plugin.instance.init) {
      plugin.instance.init(this.getAPI());
    }

    plugin.enabled = true;
    this.emit('plugin:enabled', { name, plugin: plugin.instance });
    return true;
  }

  disable(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;

    if (plugin.instance.destroy) {
      plugin.instance.destroy();
    }

    plugin.enabled = false;
    this.emit('plugin:disabled', { name });
    return true;
  }

  getAPI() {
    return {
      registerHook: this.registerHook.bind(this),
      emit: this.emit.bind(this),
      getPlugins: () => Array.from(this.plugins.entries())
    };
  }

  registerHook(hookName, callback, priority = 10) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push({ callback, priority });
    this.hooks.get(hookName).sort((a, b) => a.priority - b.priority);
  }

  emit(hookName, data) {
    const hooks = this.hooks.get(hookName) || [];
    hooks.forEach(hook => hook.callback(data));
  }
}

// Usage Example
const registry = new PluginRegistry();

// Define a plugin
const themePlugin = {
  name: 'theme-switcher',
  priority: 5,

  init(api) {
    console.log('Theme plugin initialized');
    api.registerHook('app:ready', this.applyTheme.bind(this));
  },

  applyTheme() {
    document.body.classList.add('dark-theme');
  },

  destroy() {
    document.body.classList.remove('dark-theme');
  }
};

registry.register('theme-switcher', themePlugin);
registry.enable('theme-switcher');
```

### 2. Namespace Pattern

Organize plugins within a global namespace to avoid conflicts.

```javascript
const App = {
  plugins: {},
  core: {},

  registerPlugin(name, plugin) {
    if (this.plugins[name]) {
      throw new Error(`Plugin ${name} already exists`);
    }

    this.plugins[name] = plugin;

    // Auto-initialize if core is ready
    if (this.core.initialized && typeof plugin.init === 'function') {
      plugin.init(this.getPluginContext());
    }
  },

  getPluginContext() {
    return {
      utils: this.core.utils,
      events: this.core.events,
      state: this.core.state
    };
  }
};

// Plugin definition
App.registerPlugin('analytics', {
  init(context) {
    context.events.on('page:view', this.track);
  },

  track(data) {
    console.log('Analytics:', data);
  }
});
```

### 3. Factory Pattern

Create plugins dynamically with dependency injection.

```javascript
class PluginFactory {
  constructor() {
    this.creators = new Map();
    this.instances = new Map();
  }

  define(name, creator) {
    this.creators.set(name, creator);
  }

  create(name, config = {}) {
    const creator = this.creators.get(name);
    if (!creator) {
      throw new Error(`Plugin "${name}" not defined`);
    }

    const instance = creator(config);
    this.instances.set(name, instance);
    return instance;
  }

  get(name) {
    return this.instances.get(name);
  }
}

// Usage
const factory = new PluginFactory();

factory.define('logger', (config) => ({
  level: config.level || 'info',

  log(message) {
    if (this.level === 'debug' || this.level === 'info') {
      console.log(`[${this.level.toUpperCase()}]`, message);
    }
  },

  error(message) {
    console.error('[ERROR]', message);
  }
}));

const logger = factory.create('logger', { level: 'debug' });
logger.log('Application started');
```

---

## Event-Driven Architecture

Event-driven architecture enables loose coupling between components.

### 1. Event Emitter Pattern

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
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
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, []);
    }
    this.onceEvents.get(event).push(callback);
  }

  off(event, callback) {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    // Regular listeners
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }

    // Once listeners
    if (this.onceEvents.has(event)) {
      const callbacks = this.onceEvents.get(event);
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in once listener for "${event}":`, error);
        }
      });
      this.onceEvents.delete(event);
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
      this.onceEvents.delete(event);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }
}

// Usage with namespaced events
const app = new EventEmitter();

// Plugin subscribes to events
app.on('user:login', (user) => {
  console.log('User logged in:', user.name);
});

app.on('user:logout', () => {
  console.log('User logged out');
});

// Core emits events
app.emit('user:login', { name: 'Alice', id: 1 });
```

### 2. Custom Event System with Priority

```javascript
class PriorityEventSystem {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback, priority = 10) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push({ callback, priority });

    // Sort by priority (lower numbers run first)
    this.listeners.get(event).sort((a, b) => a.priority - b.priority);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);

    for (const listener of listeners) {
      const result = listener.callback(data);

      // Allow listeners to stop propagation
      if (result === false) {
        break;
      }
    }
  }

  // Emit and collect results
  emitCollect(event, data) {
    if (!this.listeners.has(event)) return [];

    const results = [];
    const listeners = this.listeners.get(event);

    for (const listener of listeners) {
      const result = listener.callback(data);
      if (result !== undefined) {
        results.push(result);
      }
    }

    return results;
  }
}

// Usage
const events = new PriorityEventSystem();

// High priority plugin
events.on('render:before', (data) => {
  console.log('Pre-processing render data');
  data.processed = true;
}, 1);

// Normal priority plugin
events.on('render:before', (data) => {
  console.log('Normal render hook');
}, 10);

events.emit('render:before', { content: 'Hello' });
```

### 3. DOM-Based Event Bus

```javascript
class DOMEventBus {
  constructor() {
    this.element = document.createElement('div');
    this.element.style.display = 'none';
    document.body.appendChild(this.element);
  }

  on(eventType, callback) {
    this.element.addEventListener(eventType, (e) => {
      callback(e.detail);
    });
  }

  emit(eventType, data) {
    const event = new CustomEvent(eventType, {
      detail: data,
      bubbles: false,
      cancelable: true
    });
    this.element.dispatchEvent(event);
  }

  destroy() {
    this.element.remove();
  }
}

// Usage - works with native DOM events
const bus = new DOMEventBus();

bus.on('app:navigate', (data) => {
  console.log('Navigating to:', data.route);
});

bus.emit('app:navigate', { route: '/dashboard' });
```

---

## Dependency Injection Patterns

Dependency injection allows plugins to receive dependencies without hard-coding them.

### 1. Constructor Injection

```javascript
class Container {
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
      throw new Error(`Service "${name}" not registered`);
    }

    // Return existing singleton
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Create new instance
    const instance = service.factory(this);

    // Store singleton
    if (service.singleton) {
      this.singletons.set(name, instance);
    }

    return instance;
  }

  inject(fn) {
    return fn(this);
  }
}

// Usage
const container = new Container();

// Register services
container.register('config', () => ({
  apiUrl: 'https://api.example.com',
  timeout: 5000
}), true);

container.register('http', (c) => {
  const config = c.resolve('config');

  return {
    get(url) {
      return fetch(config.apiUrl + url, {
        timeout: config.timeout
      });
    }
  };
}, true);

// Plugin uses injected dependencies
const plugin = {
  init(container) {
    this.http = container.resolve('http');
    this.config = container.resolve('config');
  },

  async fetchData() {
    const response = await this.http.get('/data');
    return response.json();
  }
};
```

### 2. Property Injection

```javascript
class Injector {
  constructor() {
    this.dependencies = new Map();
  }

  provide(name, value) {
    this.dependencies.set(name, value);
  }

  inject(target, ...depNames) {
    depNames.forEach(name => {
      if (!this.dependencies.has(name)) {
        throw new Error(`Dependency "${name}" not found`);
      }
      target[name] = this.dependencies.get(name);
    });
    return target;
  }
}

// Usage
const injector = new Injector();

injector.provide('logger', {
  log: (msg) => console.log('[LOG]', msg),
  error: (msg) => console.error('[ERROR]', msg)
});

injector.provide('storage', {
  get: (key) => localStorage.getItem(key),
  set: (key, val) => localStorage.setItem(key, val)
});

const plugin = {
  init() {
    this.logger.log('Plugin initialized');
  }
};

injector.inject(plugin, 'logger', 'storage');
```

### 3. Context Pattern

```javascript
const AppContext = {
  services: {},

  createContext() {
    return {
      get: (name) => {
        if (!this.services[name]) {
          throw new Error(`Service "${name}" not found`);
        }
        return this.services[name];
      },

      register: (name, service) => {
        this.services[name] = service;
      }
    };
  }
};

// Usage
const context = AppContext.createContext();

context.register('api', {
  fetch: async (endpoint) => {
    const response = await fetch(endpoint);
    return response.json();
  }
});

// Plugins receive context
const dataPlugin = {
  init(ctx) {
    this.api = ctx.get('api');
  },

  async loadData() {
    return await this.api.fetch('/api/data');
  }
};

dataPlugin.init(context);
```

---

## Module Registration Systems

### 1. Self-Registering Modules

```javascript
class ModuleSystem {
  constructor() {
    this.modules = new Map();
    this.loadOrder = [];
    this.initialized = false;
  }

  define(name, dependencies, factory) {
    this.modules.set(name, {
      name,
      dependencies,
      factory,
      instance: null,
      loaded: false
    });
  }

  require(name) {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module "${name}" not found`);
    }

    // Return cached instance
    if (module.loaded) {
      return module.instance;
    }

    // Load dependencies first
    const deps = module.dependencies.map(dep => this.require(dep));

    // Create instance
    module.instance = module.factory(...deps);
    module.loaded = true;
    this.loadOrder.push(name);

    return module.instance;
  }

  init(entryModule) {
    this.require(entryModule);
    this.initialized = true;
  }

  getLoadOrder() {
    return this.loadOrder;
  }
}

// Usage
const modules = new ModuleSystem();

// Define modules
modules.define('logger', [], () => ({
  log: (msg) => console.log('[APP]', msg)
}));

modules.define('storage', ['logger'], (logger) => ({
  data: {},

  set(key, value) {
    logger.log(`Setting ${key}`);
    this.data[key] = value;
  },

  get(key) {
    return this.data[key];
  }
}));

modules.define('app', ['logger', 'storage'], (logger, storage) => ({
  init() {
    logger.log('App initialized');
    storage.set('initialized', true);
  }
}));

// Initialize
modules.init('app');
```

### 2. Plugin Manifest System

```javascript
class ManifestSystem {
  constructor() {
    this.plugins = [];
    this.manifests = new Map();
  }

  registerManifest(manifest) {
    // Validate manifest
    const required = ['name', 'version', 'main'];
    for (const field of required) {
      if (!manifest[field]) {
        throw new Error(`Manifest missing required field: ${field}`);
      }
    }

    this.manifests.set(manifest.name, manifest);
    return true;
  }

  loadPlugin(name) {
    const manifest = this.manifests.get(name);
    if (!manifest) {
      throw new Error(`Plugin "${name}" not found`);
    }

    // Check dependencies
    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) {
        if (!this.plugins.find(p => p.name === dep)) {
          this.loadPlugin(dep);
        }
      }
    }

    // Load main plugin code
    const plugin = manifest.main;
    if (typeof plugin.init === 'function') {
      plugin.init({
        manifest,
        getPlugin: (n) => this.plugins.find(p => p.name === n)
      });
    }

    this.plugins.push({
      name: manifest.name,
      version: manifest.version,
      instance: plugin
    });
  }
}

// Usage
const system = new ManifestSystem();

// Register plugin manifests
system.registerManifest({
  name: 'core-utils',
  version: '1.0.0',
  description: 'Core utility functions',
  main: {
    init() {
      this.utils = {
        debounce: (fn, delay) => {
          let timeout;
          return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
          };
        }
      };
    }
  }
});

system.registerManifest({
  name: 'search-plugin',
  version: '1.0.0',
  dependencies: ['core-utils'],
  main: {
    init(context) {
      const coreUtils = context.getPlugin('core-utils').instance;
      this.search = coreUtils.utils.debounce((query) => {
        console.log('Searching for:', query);
      }, 300);
    }
  }
});

system.loadPlugin('search-plugin');
```

---

## Hooks and Middleware Patterns

### 1. Filter/Action Hook System (WordPress-style)

```javascript
class HookSystem {
  constructor() {
    this.filters = new Map();
    this.actions = new Map();
  }

  // Filters modify and return data
  addFilter(name, callback, priority = 10) {
    if (!this.filters.has(name)) {
      this.filters.set(name, []);
    }
    this.filters.get(name).push({ callback, priority });
    this.filters.get(name).sort((a, b) => a.priority - b.priority);
  }

  applyFilters(name, value, ...args) {
    if (!this.filters.has(name)) return value;

    let filtered = value;
    const hooks = this.filters.get(name);

    for (const hook of hooks) {
      filtered = hook.callback(filtered, ...args);
    }

    return filtered;
  }

  // Actions execute without returning
  addAction(name, callback, priority = 10) {
    if (!this.actions.has(name)) {
      this.actions.set(name, []);
    }
    this.actions.get(name).push({ callback, priority });
    this.actions.get(name).sort((a, b) => a.priority - b.priority);
  }

  doAction(name, ...args) {
    if (!this.actions.has(name)) return;

    const hooks = this.actions.get(name);
    for (const hook of hooks) {
      hook.callback(...args);
    }
  }

  removeFilter(name, callback) {
    if (!this.filters.has(name)) return;
    const hooks = this.filters.get(name);
    const index = hooks.findIndex(h => h.callback === callback);
    if (index > -1) hooks.splice(index, 1);
  }

  removeAction(name, callback) {
    if (!this.actions.has(name)) return;
    const hooks = this.actions.get(name);
    const index = hooks.findIndex(h => h.callback === callback);
    if (index > -1) hooks.splice(index, 1);
  }
}

// Usage
const hooks = new HookSystem();

// Plugin adds filters
hooks.addFilter('content:render', (content) => {
  return content.toUpperCase();
}, 10);

hooks.addFilter('content:render', (content) => {
  return `<div class="content">${content}</div>`;
}, 20);

// Core applies filters
let content = 'Hello World';
content = hooks.applyFilters('content:render', content);
console.log(content); // <div class="content">HELLO WORLD</div>

// Plugin adds actions
hooks.addAction('app:init', () => {
  console.log('Plugin initialized');
});

hooks.addAction('app:init', () => {
  console.log('Another plugin initialized');
});

// Core triggers actions
hooks.doAction('app:init');
```

### 2. Middleware Chain Pattern

```javascript
class MiddlewareChain {
  constructor() {
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  async execute(context) {
    let index = 0;

    const next = async () => {
      if (index >= this.middleware.length) return;

      const fn = this.middleware[index++];
      await fn(context, next);
    };

    await next();
    return context;
  }
}

// Usage
const chain = new MiddlewareChain();

// Authentication middleware
chain.use(async (ctx, next) => {
  console.log('Auth check');
  ctx.user = { id: 1, name: 'Alice' };
  await next();
});

// Logging middleware
chain.use(async (ctx, next) => {
  console.log('Request:', ctx.path);
  await next();
  console.log('Response sent');
});

// Main handler
chain.use(async (ctx, next) => {
  console.log('Handling request for user:', ctx.user.name);
  ctx.response = { status: 200, data: 'OK' };
  await next();
});

// Execute
chain.execute({ path: '/api/data' });
```

### 3. Pipeline Pattern

```javascript
class Pipeline {
  constructor() {
    this.stages = [];
  }

  pipe(fn) {
    this.stages.push(fn);
    return this;
  }

  async process(input) {
    let result = input;

    for (const stage of this.stages) {
      result = await stage(result);
    }

    return result;
  }
}

// Usage
const pipeline = new Pipeline();

pipeline
  .pipe(async (data) => {
    console.log('Stage 1: Validate');
    if (!data.text) throw new Error('Text required');
    return data;
  })
  .pipe(async (data) => {
    console.log('Stage 2: Transform');
    return {
      ...data,
      text: data.text.trim().toLowerCase()
    };
  })
  .pipe(async (data) => {
    console.log('Stage 3: Enrich');
    return {
      ...data,
      length: data.text.length,
      timestamp: Date.now()
    };
  });

// Process data through pipeline
pipeline.process({ text: '  Hello World  ' })
  .then(result => console.log('Result:', result));
```

---

## Dynamic Loading Strategies

While maintaining a single-file constraint, we can still achieve dynamic behavior.

### 1. Lazy Initialization Pattern

```javascript
class LazyLoader {
  constructor() {
    this.modules = new Map();
    this.loaded = new Set();
  }

  register(name, initializer) {
    this.modules.set(name, {
      initializer,
      instance: null
    });
  }

  load(name) {
    if (this.loaded.has(name)) {
      return this.modules.get(name).instance;
    }

    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module "${name}" not registered`);
    }

    module.instance = module.initializer();
    this.loaded.add(name);
    return module.instance;
  }

  unload(name) {
    if (this.loaded.has(name)) {
      const module = this.modules.get(name);
      if (module.instance && typeof module.instance.destroy === 'function') {
        module.instance.destroy();
      }
      module.instance = null;
      this.loaded.delete(name);
    }
  }
}

// Usage
const loader = new LazyLoader();

// Register heavy modules
loader.register('chart', () => {
  console.log('Initializing chart module (heavy)');
  return {
    render(data) {
      console.log('Rendering chart:', data);
    },
    destroy() {
      console.log('Chart destroyed');
    }
  };
});

loader.register('editor', () => {
  console.log('Initializing editor (heavy)');
  return {
    content: '',
    setText(text) {
      this.content = text;
    }
  };
});

// Load only when needed
document.getElementById('showChart')?.addEventListener('click', () => {
  const chart = loader.load('chart');
  chart.render({ values: [1, 2, 3] });
});
```

### 2. Code Splitting with String Evaluation

```javascript
class CodeLoader {
  constructor() {
    this.chunks = new Map();
  }

  defineChunk(name, code) {
    this.chunks.set(name, {
      code,
      loaded: false,
      exports: null
    });
  }

  loadChunk(name) {
    const chunk = this.chunks.get(name);
    if (!chunk) {
      throw new Error(`Chunk "${name}" not found`);
    }

    if (chunk.loaded) {
      return chunk.exports;
    }

    // Create isolated scope
    const exports = {};
    const module = { exports };

    // Execute code in isolated context
    const fn = new Function('exports', 'module', chunk.code);
    fn(exports, module);

    chunk.exports = module.exports;
    chunk.loaded = true;

    return chunk.exports;
  }
}

// Usage
const codeLoader = new CodeLoader();

// Define code chunks as strings (can be in HTML comments or script tags)
codeLoader.defineChunk('utils', `
  exports.formatDate = function(date) {
    return new Date(date).toLocaleDateString();
  };

  exports.formatCurrency = function(amount) {
    return '$' + amount.toFixed(2);
  };
`);

codeLoader.defineChunk('validator', `
  module.exports = {
    isEmail: function(str) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(str);
    },

    isPhone: function(str) {
      return /^\\d{10}$/.test(str.replace(/\\D/g, ''));
    }
  };
`);

// Load when needed
const utils = codeLoader.loadChunk('utils');
console.log(utils.formatDate(Date.now()));

const validator = codeLoader.loadChunk('validator');
console.log(validator.isEmail('test@example.com'));
```

### 3. Progressive Enhancement Pattern

```javascript
class ProgressiveLoader {
  constructor() {
    this.features = new Map();
    this.loaded = new Set();
  }

  register(name, feature, requirements = {}) {
    this.features.set(name, {
      feature,
      requirements,
      priority: requirements.priority || 10
    });
  }

  canLoad(name) {
    const feature = this.features.get(name);
    if (!feature) return false;

    const { requirements } = feature;

    // Check browser capabilities
    if (requirements.apis) {
      for (const api of requirements.apis) {
        if (!window[api]) return false;
      }
    }

    // Check dependencies
    if (requirements.dependencies) {
      for (const dep of requirements.dependencies) {
        if (!this.loaded.has(dep)) return false;
      }
    }

    return true;
  }

  async loadAll() {
    // Get all features sorted by priority
    const features = Array.from(this.features.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.priority - b.priority);

    for (const { name, feature } of features) {
      if (this.canLoad(name)) {
        await this.load(name);
      } else {
        console.log(`Skipping feature "${name}" - requirements not met`);
      }
    }
  }

  async load(name) {
    if (this.loaded.has(name)) return;

    const featureData = this.features.get(name);
    if (!featureData) return;

    const { feature } = featureData;

    if (typeof feature.init === 'function') {
      await feature.init();
    }

    this.loaded.add(name);
    console.log(`Feature "${name}" loaded`);
  }
}

// Usage
const progressive = new ProgressiveLoader();

// Core features (always load)
progressive.register('base', {
  priority: 1,
  init() {
    console.log('Base features loaded');
  }
});

// Optional features (load if supported)
progressive.register('offlineMode', {
  priority: 5,
  requirements: {
    apis: ['serviceWorker'],
    dependencies: ['base']
  },
  init() {
    console.log('Offline mode enabled');
    navigator.serviceWorker.register('/sw.js');
  }
});

progressive.register('notifications', {
  priority: 10,
  requirements: {
    apis: ['Notification'],
    dependencies: ['base']
  },
  init() {
    console.log('Notifications enabled');
    Notification.requestPermission();
  }
});

// Load features
progressive.loadAll();
```

---

## Configuration-Based Modularity

### 1. JSON Configuration System

```javascript
class ConfigurableApp {
  constructor(config) {
    this.config = config;
    this.modules = new Map();
    this.state = {};
  }

  loadFromConfig() {
    // Load core modules
    if (this.config.core) {
      this.config.core.forEach(moduleName => {
        this.loadModule(moduleName);
      });
    }

    // Load optional modules
    if (this.config.modules) {
      Object.entries(this.config.modules).forEach(([name, moduleConfig]) => {
        if (moduleConfig.enabled) {
          this.loadModule(name, moduleConfig);
        }
      });
    }

    // Apply theme
    if (this.config.theme) {
      this.applyTheme(this.config.theme);
    }
  }

  loadModule(name, config = {}) {
    const moduleFactory = this.getModuleFactory(name);
    if (!moduleFactory) {
      console.warn(`Module "${name}" not found`);
      return;
    }

    const module = moduleFactory(config);
    this.modules.set(name, module);

    if (typeof module.init === 'function') {
      module.init(this.getContext());
    }
  }

  getModuleFactory(name) {
    // Module factories would be defined in the app
    const factories = {
      'logger': (config) => ({
        level: config.level || 'info',
        init(ctx) {
          ctx.log = (msg) => {
            if (this.level === 'debug' || this.level === 'info') {
              console.log(msg);
            }
          };
        }
      }),

      'analytics': (config) => ({
        trackingId: config.trackingId,
        init(ctx) {
          console.log('Analytics initialized:', this.trackingId);
        }
      }),

      'darkMode': (config) => ({
        init(ctx) {
          if (config.default) {
            document.body.classList.add('dark-mode');
          }
        }
      })
    };

    return factories[name];
  }

  applyTheme(theme) {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }

  getContext() {
    return {
      state: this.state,
      getModule: (name) => this.modules.get(name)
    };
  }
}

// Usage with configuration
const appConfig = {
  core: ['logger'],

  modules: {
    analytics: {
      enabled: true,
      trackingId: 'UA-12345'
    },
    darkMode: {
      enabled: true,
      default: false
    },
    advancedFeatures: {
      enabled: false
    }
  },

  theme: {
    'primary-color': '#007bff',
    'secondary-color': '#6c757d',
    'font-family': 'Arial, sans-serif'
  }
};

const app = new ConfigurableApp(appConfig);
app.loadFromConfig();
```

### 2. Feature Configuration Pattern

```javascript
class FeatureManager {
  constructor() {
    this.features = new Map();
    this.config = new Map();
  }

  defineFeature(name, feature) {
    this.features.set(name, feature);
  }

  configure(config) {
    Object.entries(config).forEach(([name, settings]) => {
      this.config.set(name, settings);

      if (settings.enabled) {
        this.enableFeature(name);
      }
    });
  }

  enableFeature(name) {
    const feature = this.features.get(name);
    const config = this.config.get(name) || {};

    if (!feature) {
      console.warn(`Feature "${name}" not defined`);
      return;
    }

    if (typeof feature.enable === 'function') {
      feature.enable(config);
    }
  }

  disableFeature(name) {
    const feature = this.features.get(name);

    if (feature && typeof feature.disable === 'function') {
      feature.disable();
    }
  }

  isEnabled(name) {
    const config = this.config.get(name);
    return config && config.enabled;
  }
}

// Usage
const features = new FeatureManager();

// Define features
features.defineFeature('autoSave', {
  enable(config) {
    const interval = config.interval || 30000;
    this.timer = setInterval(() => {
      console.log('Auto-saving...');
    }, interval);
  },

  disable() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
});

features.defineFeature('spellCheck', {
  enable(config) {
    document.querySelectorAll('textarea, input[type="text"]').forEach(el => {
      el.setAttribute('spellcheck', 'true');
    });
  },

  disable() {
    document.querySelectorAll('textarea, input[type="text"]').forEach(el => {
      el.removeAttribute('spellcheck');
    });
  }
});

// Configure from user preferences or defaults
features.configure({
  autoSave: {
    enabled: true,
    interval: 60000
  },
  spellCheck: {
    enabled: false
  }
});
```

---

## Feature Flags and Conditional Loading

### 1. Feature Flag System

```javascript
class FeatureFlags {
  constructor() {
    this.flags = new Map();
    this.listeners = new Map();
  }

  define(name, defaultValue = false) {
    if (!this.flags.has(name)) {
      this.flags.set(name, defaultValue);
    }
  }

  set(name, value) {
    const oldValue = this.flags.get(name);
    this.flags.set(name, value);

    // Notify listeners
    if (oldValue !== value && this.listeners.has(name)) {
      this.listeners.get(name).forEach(callback => {
        callback(value, oldValue);
      });
    }
  }

  get(name) {
    return this.flags.get(name) || false;
  }

  isEnabled(name) {
    return this.get(name) === true;
  }

  onChange(name, callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, []);
    }
    this.listeners.get(name).push(callback);
  }

  // Bulk operations
  setMany(flags) {
    Object.entries(flags).forEach(([name, value]) => {
      this.set(name, value);
    });
  }

  // Load from storage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('featureFlags');
      if (stored) {
        const flags = JSON.parse(stored);
        this.setMany(flags);
      }
    } catch (e) {
      console.error('Failed to load feature flags:', e);
    }
  }

  // Save to storage
  saveToStorage() {
    try {
      const flags = Object.fromEntries(this.flags);
      localStorage.setItem('featureFlags', JSON.stringify(flags));
    } catch (e) {
      console.error('Failed to save feature flags:', e);
    }
  }
}

// Usage
const flags = new FeatureFlags();

// Define flags
flags.define('newUI', false);
flags.define('betaFeatures', false);
flags.define('experimentalMode', false);

// Load from storage
flags.loadFromStorage();

// Conditional loading
if (flags.isEnabled('newUI')) {
  console.log('Loading new UI...');
  // Load new UI components
}

// Listen for changes
flags.onChange('betaFeatures', (newValue, oldValue) => {
  console.log(`Beta features ${newValue ? 'enabled' : 'disabled'}`);
  if (newValue) {
    // Load beta features
  } else {
    // Unload beta features
  }
});

// Admin panel to toggle flags
function createFlagToggle(flagName) {
  const toggle = document.createElement('label');
  toggle.innerHTML = `
    <input type="checkbox" ${flags.isEnabled(flagName) ? 'checked' : ''}>
    ${flagName}
  `;

  toggle.querySelector('input').addEventListener('change', (e) => {
    flags.set(flagName, e.target.checked);
    flags.saveToStorage();
  });

  return toggle;
}
```

### 2. Environment-Based Loading

```javascript
class EnvironmentLoader {
  constructor() {
    this.env = this.detectEnvironment();
    this.modules = new Map();
  }

  detectEnvironment() {
    // Detect from URL, localStorage, or defaults
    const params = new URLSearchParams(window.location.search);

    if (params.has('env')) {
      return params.get('env');
    }

    const stored = localStorage.getItem('environment');
    if (stored) {
      return stored;
    }

    // Default to production
    return window.location.hostname === 'localhost' ? 'development' : 'production';
  }

  registerModule(name, environments, factory) {
    this.modules.set(name, {
      environments: Array.isArray(environments) ? environments : [environments],
      factory
    });
  }

  loadModules() {
    this.modules.forEach((module, name) => {
      if (module.environments.includes(this.env) || module.environments.includes('*')) {
        console.log(`Loading module "${name}" for ${this.env}`);
        module.factory(this.env);
      }
    });
  }

  getEnvironment() {
    return this.env;
  }

  setEnvironment(env) {
    this.env = env;
    localStorage.setItem('environment', env);
  }
}

// Usage
const envLoader = new EnvironmentLoader();

// Development-only modules
envLoader.registerModule('devTools', 'development', () => {
  console.log('Dev tools enabled');

  window.debug = {
    state: () => console.log('Current state:', app.state),
    plugins: () => console.log('Loaded plugins:', app.plugins)
  };
});

// Production-only modules
envLoader.registerModule('analytics', 'production', () => {
  console.log('Analytics enabled');
  // Initialize analytics
});

// All environments
envLoader.registerModule('core', '*', (env) => {
  console.log(`Core loaded in ${env} mode`);
});

envLoader.loadModules();
```

### 3. A/B Testing Framework

```javascript
class ABTestFramework {
  constructor() {
    this.tests = new Map();
    this.assignments = new Map();
  }

  defineTest(name, variants) {
    this.tests.set(name, {
      variants,
      weights: variants.map(v => v.weight || 1)
    });
  }

  getVariant(testName) {
    // Check if already assigned
    if (this.assignments.has(testName)) {
      return this.assignments.get(testName);
    }

    // Get or create from storage
    const stored = this.loadAssignmentFromStorage(testName);
    if (stored) {
      this.assignments.set(testName, stored);
      return stored;
    }

    // Assign new variant
    const test = this.tests.get(testName);
    if (!test) return null;

    const variant = this.weightedRandom(test.variants, test.weights);
    this.assignments.set(testName, variant);
    this.saveAssignmentToStorage(testName, variant);

    return variant;
  }

  weightedRandom(items, weights) {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * total;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[0];
  }

  loadAssignmentFromStorage(testName) {
    try {
      const stored = localStorage.getItem(`ab_test_${testName}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  saveAssignmentToStorage(testName, variant) {
    try {
      localStorage.setItem(`ab_test_${testName}`, JSON.stringify(variant));
    } catch (e) {
      console.error('Failed to save A/B test assignment:', e);
    }
  }

  track(testName, event) {
    const variant = this.getVariant(testName);
    console.log(`Event "${event}" for test "${testName}" variant:`, variant.name);
    // Send to analytics
  }
}

// Usage
const abTest = new ABTestFramework();

// Define test
abTest.defineTest('newCheckoutFlow', [
  { name: 'control', weight: 1 },
  { name: 'variant_a', weight: 1 },
  { name: 'variant_b', weight: 1 }
]);

// Get assigned variant
const variant = abTest.getVariant('newCheckoutFlow');

// Load different implementations
if (variant.name === 'variant_a') {
  console.log('Loading variant A');
  // Load variant A code
} else if (variant.name === 'variant_b') {
  console.log('Loading variant B');
  // Load variant B code
} else {
  console.log('Loading control');
  // Load control code
}

// Track events
document.getElementById('checkout')?.addEventListener('click', () => {
  abTest.track('newCheckoutFlow', 'checkout_clicked');
});
```

---

## Micro-Frontend Concepts for Single File

### 1. Component Islands

```javascript
class IslandArchitecture {
  constructor() {
    this.islands = new Map();
  }

  defineIsland(name, component) {
    this.islands.set(name, component);
  }

  mount(name, element, props = {}) {
    const component = this.islands.get(name);
    if (!component) {
      console.error(`Island "${name}" not found`);
      return;
    }

    // Create isolated scope
    const island = {
      element,
      props,
      state: {},

      setState(newState) {
        this.state = { ...this.state, ...newState };
        if (component.render) {
          this.render();
        }
      },

      render() {
        element.innerHTML = component.render(this.state, this.props);
        if (component.hydrate) {
          component.hydrate(element, this);
        }
      }
    };

    // Initialize
    if (component.init) {
      component.init(island);
    }

    // Initial render
    if (component.render) {
      island.render();
    }

    return island;
  }

  mountAll() {
    document.querySelectorAll('[data-island]').forEach(element => {
      const name = element.dataset.island;
      const props = element.dataset.props ? JSON.parse(element.dataset.props) : {};
      this.mount(name, element, props);
    });
  }
}

// Usage
const islands = new IslandArchitecture();

// Define counter island
islands.defineIsland('counter', {
  init(island) {
    island.setState({ count: 0 });
  },

  render(state, props) {
    return `
      <div class="counter">
        <h3>${props.title || 'Counter'}</h3>
        <p>Count: ${state.count}</p>
        <button id="increment">+</button>
        <button id="decrement">-</button>
      </div>
    `;
  },

  hydrate(element, island) {
    element.querySelector('#increment').addEventListener('click', () => {
      island.setState({ count: island.state.count + 1 });
    });

    element.querySelector('#decrement').addEventListener('click', () => {
      island.setState({ count: island.state.count - 1 });
    });
  }
});

// HTML usage:
// <div data-island="counter" data-props='{"title": "My Counter"}'></div>

// Mount all islands
islands.mountAll();
```

### 2. Slot-Based Architecture

```javascript
class SlotSystem {
  constructor() {
    this.slots = new Map();
    this.providers = new Map();
  }

  defineSlot(name) {
    if (!this.slots.has(name)) {
      this.slots.set(name, []);
    }
  }

  registerProvider(slotName, provider, priority = 10) {
    if (!this.slots.has(slotName)) {
      this.defineSlot(slotName);
    }

    this.slots.get(slotName).push({
      provider,
      priority
    });

    // Sort by priority
    this.slots.get(slotName).sort((a, b) => a.priority - b.priority);
  }

  render(slotName, context = {}) {
    const providers = this.slots.get(slotName) || [];

    return providers.map(({ provider }) => {
      if (typeof provider === 'function') {
        return provider(context);
      }
      return provider;
    }).join('');
  }

  renderToElement(slotName, element, context = {}) {
    element.innerHTML = this.render(slotName, context);
  }
}

// Usage
const slots = new SlotSystem();

// Define slots
slots.defineSlot('header');
slots.defineSlot('sidebar');
slots.defineSlot('footer');

// Plugins register providers
slots.registerProvider('header', (ctx) => {
  return `<div class="logo">My App</div>`;
}, 1);

slots.registerProvider('header', (ctx) => {
  return `<nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>`;
}, 10);

// Analytics plugin adds to footer
slots.registerProvider('footer', () => {
  return `<div class="analytics">Tracking ID: UA-12345</div>`;
});

// Render slots
document.addEventListener('DOMContentLoaded', () => {
  slots.renderToElement('header', document.getElementById('header'));
  slots.renderToElement('footer', document.getElementById('footer'));
});
```

### 3. Micro-Frontend Router

```javascript
class MicroRouter {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.container = null;
  }

  setContainer(element) {
    this.container = element;
  }

  register(path, microApp) {
    this.routes.set(path, microApp);
  }

  navigate(path) {
    const microApp = this.routes.get(path);

    if (!microApp) {
      console.error(`Route "${path}" not found`);
      return;
    }

    // Unmount current
    if (this.currentRoute && this.currentRoute.unmount) {
      this.currentRoute.unmount();
    }

    // Mount new route
    if (microApp.mount) {
      microApp.mount(this.container);
    }

    this.currentRoute = microApp;
    history.pushState({ path }, '', path);
  }

  init() {
    // Handle back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.path) {
        this.navigate(e.state.path);
      }
    });

    // Handle link clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('data-route'));
      }
    });

    // Initial route
    const initialPath = window.location.pathname;
    if (this.routes.has(initialPath)) {
      this.navigate(initialPath);
    }
  }
}

// Usage
const router = new MicroRouter();
router.setContainer(document.getElementById('app'));

// Define micro-apps
router.register('/', {
  mount(container) {
    container.innerHTML = `
      <h1>Home</h1>
      <p>Welcome to the app</p>
      <a data-route="/dashboard">Go to Dashboard</a>
    `;
  },

  unmount() {
    console.log('Home unmounted');
  }
});

router.register('/dashboard', {
  state: { count: 0 },

  mount(container) {
    container.innerHTML = `
      <h1>Dashboard</h1>
      <p>Count: <span id="count">0</span></p>
      <button id="increment">Increment</button>
      <a data-route="/">Back to Home</a>
    `;

    document.getElementById('increment').addEventListener('click', () => {
      this.state.count++;
      document.getElementById('count').textContent = this.state.count;
    });
  },

  unmount() {
    console.log('Dashboard unmounted');
  }
});

router.init();
```

---

## Real-World Examples

### 1. WordPress-Style Plugin System

```javascript
class WordPressStyleApp {
  constructor() {
    this.plugins = new Map();
    this.hooks = {
      filters: new Map(),
      actions: new Map()
    };
  }

  // Plugin registration
  registerPlugin(plugin) {
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have name and version');
    }

    this.plugins.set(plugin.name, plugin);

    // Initialize plugin
    if (typeof plugin.init === 'function') {
      plugin.init(this.getPluginAPI());
    }
  }

  getPluginAPI() {
    return {
      addFilter: this.addFilter.bind(this),
      addAction: this.addAction.bind(this),
      applyFilters: this.applyFilters.bind(this),
      doAction: this.doAction.bind(this)
    };
  }

  addFilter(tag, callback, priority = 10) {
    if (!this.hooks.filters.has(tag)) {
      this.hooks.filters.set(tag, []);
    }
    this.hooks.filters.get(tag).push({ callback, priority });
    this.hooks.filters.get(tag).sort((a, b) => a.priority - b.priority);
  }

  applyFilters(tag, value, ...args) {
    if (!this.hooks.filters.has(tag)) return value;

    let filtered = value;
    for (const hook of this.hooks.filters.get(tag)) {
      filtered = hook.callback(filtered, ...args);
    }
    return filtered;
  }

  addAction(tag, callback, priority = 10) {
    if (!this.hooks.actions.has(tag)) {
      this.hooks.actions.set(tag, []);
    }
    this.hooks.actions.get(tag).push({ callback, priority });
    this.hooks.actions.get(tag).sort((a, b) => a.priority - b.priority);
  }

  doAction(tag, ...args) {
    if (!this.hooks.actions.has(tag)) return;

    for (const hook of this.hooks.actions.get(tag)) {
      hook.callback(...args);
    }
  }
}

// Usage
const wpApp = new WordPressStyleApp();

// Example plugin: SEO
wpApp.registerPlugin({
  name: 'seo-plugin',
  version: '1.0.0',

  init(api) {
    // Modify page title
    api.addFilter('page_title', (title) => {
      return `${title} | My Site`;
    });

    // Add meta tags
    api.addAction('head_render', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', 'My awesome site');
      document.head.appendChild(meta);
    });
  }
});

// Example plugin: Analytics
wpApp.registerPlugin({
  name: 'analytics',
  version: '1.0.0',

  init(api) {
    api.addAction('page_load', () => {
      console.log('Page view tracked');
    });

    api.addAction('button_click', (buttonId) => {
      console.log('Button clicked:', buttonId);
    });
  }
});

// Core usage
let pageTitle = 'Home';
pageTitle = wpApp.applyFilters('page_title', pageTitle);
document.title = pageTitle;

wpApp.doAction('head_render');
wpApp.doAction('page_load');
```

### 2. VS Code Extension Model

```javascript
class VSCodeStyleExtension {
  constructor() {
    this.extensions = new Map();
    this.commands = new Map();
    this.disposables = [];
  }

  activate(extension) {
    const context = this.createExtensionContext(extension);

    if (typeof extension.activate === 'function') {
      extension.activate(context);
    }

    this.extensions.set(extension.name, {
      extension,
      context,
      active: true
    });
  }

  deactivate(name) {
    const ext = this.extensions.get(name);
    if (!ext) return;

    // Call deactivate
    if (typeof ext.extension.deactivate === 'function') {
      ext.extension.deactivate();
    }

    // Dispose subscriptions
    ext.context.subscriptions.forEach(disposable => {
      if (typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });

    ext.active = false;
  }

  createExtensionContext(extension) {
    return {
      subscriptions: [],

      registerCommand: (command, callback) => {
        this.commands.set(command, callback);

        const disposable = {
          dispose: () => this.commands.delete(command)
        };

        this.subscriptions.push(disposable);
        return disposable;
      },

      executeCommand: (command, ...args) => {
        const callback = this.commands.get(command);
        if (callback) {
          return callback(...args);
        }
      }
    };
  }

  executeCommand(command, ...args) {
    const callback = this.commands.get(command);
    if (!callback) {
      throw new Error(`Command "${command}" not found`);
    }
    return callback(...args);
  }
}

// Usage
const vscode = new VSCodeStyleExtension();

// Example extension
const themeExtension = {
  name: 'theme-extension',

  activate(context) {
    console.log('Theme extension activated');

    // Register commands
    context.registerCommand('theme.switchToLight', () => {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    });

    context.registerCommand('theme.switchToDark', () => {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    });
  },

  deactivate() {
    console.log('Theme extension deactivated');
  }
};

vscode.activate(themeExtension);

// Execute command
vscode.executeCommand('theme.switchToDark');
```

### 3. Chrome Extension Architecture

```javascript
class ChromeExtensionStyle {
  constructor() {
    this.background = this.createBackground();
    this.contentScripts = [];
    this.runtime = this.createRuntime();
  }

  createBackground() {
    const listeners = new Map();

    return {
      onMessage: {
        addListener(callback) {
          if (!listeners.has('message')) {
            listeners.set('message', []);
          }
          listeners.get('message').push(callback);
        },

        trigger(message, sender, sendResponse) {
          const callbacks = listeners.get('message') || [];
          callbacks.forEach(cb => cb(message, sender, sendResponse));
        }
      }
    };
  }

  createRuntime() {
    return {
      sendMessage: (message, callback) => {
        this.background.onMessage.trigger(message, { tab: {} }, callback);
      }
    };
  }

  registerContentScript(script) {
    this.contentScripts.push(script);

    if (typeof script.init === 'function') {
      script.init({
        runtime: this.runtime
      });
    }
  }
}

// Usage
const chrome = new ChromeExtensionStyle();

// Background script
chrome.background.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received:', message);

  if (message.type === 'getData') {
    sendResponse({ data: 'some data' });
  }
});

// Content script
chrome.registerContentScript({
  init(browser) {
    console.log('Content script initialized');

    // Send message to background
    browser.runtime.sendMessage({
      type: 'getData'
    }, (response) => {
      console.log('Response:', response);
    });
  }
});
```

---

## Complete Integration Example

Here's a complete example integrating multiple patterns:

```javascript
// ============================================
// Complete Plugin System Integration
// ============================================

class ModularApp {
  constructor(config = {}) {
    this.config = config;
    this.state = {};

    // Core systems
    this.events = new EventEmitter();
    this.hooks = new HookSystem();
    this.registry = new PluginRegistry();
    this.features = new FeatureFlags();
    this.container = new DependencyContainer();

    // Initialize
    this.init();
  }

  init() {
    // Register core services
    this.registerCoreServices();

    // Load plugins
    this.loadPlugins();

    // Apply configuration
    this.applyConfiguration();

    // Emit ready event
    this.events.emit('app:ready');
  }

  registerCoreServices() {
    this.container.register('events', () => this.events, true);
    this.container.register('hooks', () => this.hooks, true);
    this.container.register('features', () => this.features, true);

    this.container.register('logger', () => ({
      log: (...args) => console.log('[APP]', ...args),
      error: (...args) => console.error('[ERROR]', ...args),
      warn: (...args) => console.warn('[WARN]', ...args)
    }), true);

    this.container.register('storage', () => ({
      get: (key) => localStorage.getItem(key),
      set: (key, value) => localStorage.setItem(key, value),
      remove: (key) => localStorage.removeItem(key)
    }), true);
  }

  loadPlugins() {
    // Plugins would be defined in the HTML file
    const plugins = this.config.plugins || [];

    plugins.forEach(plugin => {
      try {
        this.registry.register(plugin.name, plugin);
        this.registry.enable(plugin.name);
      } catch (error) {
        console.error(`Failed to load plugin ${plugin.name}:`, error);
      }
    });
  }

  applyConfiguration() {
    if (this.config.features) {
      this.features.setMany(this.config.features);
    }

    if (this.config.theme) {
      this.applyTheme(this.config.theme);
    }
  }

  applyTheme(theme) {
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }

  getAPI() {
    return {
      events: this.events,
      hooks: this.hooks,
      features: this.features,
      container: this.container,
      state: this.state,

      // Helper methods
      setState: (newState) => {
        this.state = { ...this.state, ...newState };
        this.events.emit('state:change', this.state);
      },

      getState: () => this.state
    };
  }
}

// Example usage in HTML file:
/*
<!DOCTYPE html>
<html>
<head>
  <title>Modular App</title>
</head>
<body>
  <div id="app"></div>

  <script>
    // Event Emitter class (from above)
    class EventEmitter { ... }

    // Hook System class (from above)
    class HookSystem { ... }

    // Plugin Registry class (from above)
    class PluginRegistry { ... }

    // Feature Flags class (from above)
    class FeatureFlags { ... }

    // Dependency Container class (from above)
    class DependencyContainer { ... }

    // Main app class (from above)
    class ModularApp { ... }

    // Define plugins
    const themePlugin = {
      name: 'theme',
      version: '1.0.0',
      priority: 1,

      init(api) {
        this.api = api;

        // Register hooks
        api.hooks.addAction('app:ready', () => {
          this.applyTheme();
        });

        // Listen to feature flags
        api.features.onChange('darkMode', (enabled) => {
          this.toggleDarkMode(enabled);
        });
      },

      applyTheme() {
        const isDark = this.api.features.isEnabled('darkMode');
        this.toggleDarkMode(isDark);
      },

      toggleDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
      },

      destroy() {
        document.body.classList.remove('dark-mode');
      }
    };

    const analyticsPlugin = {
      name: 'analytics',
      version: '1.0.0',

      init(api) {
        api.events.on('page:view', this.trackPageView);
        api.events.on('button:click', this.trackClick);
      },

      trackPageView(data) {
        console.log('Page view:', data);
      },

      trackClick(data) {
        console.log('Click:', data);
      },

      destroy() {
        // Cleanup
      }
    };

    const autoSavePlugin = {
      name: 'autoSave',
      version: '1.0.0',

      init(api) {
        if (!api.features.isEnabled('autoSave')) {
          return;
        }

        const storage = api.container.resolve('storage');

        api.events.on('state:change', (state) => {
          this.save(storage, state);
        });
      },

      save(storage, state) {
        storage.set('app_state', JSON.stringify(state));
        console.log('State auto-saved');
      },

      destroy() {
        // Cleanup
      }
    };

    // Initialize app
    const app = new ModularApp({
      plugins: [themePlugin, analyticsPlugin, autoSavePlugin],

      features: {
        darkMode: false,
        autoSave: true,
        betaFeatures: false
      },

      theme: {
        'primary-color': '#007bff',
        'secondary-color': '#6c757d'
      }
    });

    // Make API available globally
    window.app = app.getAPI();

    // Example usage
    app.getAPI().setState({ user: 'Alice' });
    app.getAPI().events.emit('page:view', { path: '/' });
  </script>
</body>
</html>
*/
```

---

## Best Practices

### 1. Plugin Lifecycle

Always implement proper lifecycle methods:

```javascript
const pluginTemplate = {
  name: 'my-plugin',
  version: '1.0.0',

  // Required: initialization
  init(api) {
    // Setup code
  },

  // Optional: cleanup
  destroy() {
    // Cleanup code
  },

  // Optional: configuration
  configure(config) {
    // Apply configuration
  },

  // Optional: enable/disable
  enable() {
    // Enable functionality
  },

  disable() {
    // Disable functionality
  }
};
```

### 2. Error Handling

Wrap plugin operations in try-catch blocks:

```javascript
function safeExecutePlugin(plugin, method, ...args) {
  try {
    if (typeof plugin[method] === 'function') {
      return plugin[method](...args);
    }
  } catch (error) {
    console.error(`Plugin error in ${plugin.name}.${method}:`, error);
    return null;
  }
}
```

### 3. Documentation

Document your plugin system:

```javascript
/**
 * Plugin API Documentation
 *
 * @interface Plugin
 * @property {string} name - Unique plugin identifier
 * @property {string} version - Semantic version
 * @property {function} init - Initialization function
 * @property {function} [destroy] - Cleanup function
 *
 * @example
 * const myPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   init(api) {
 *     api.events.on('app:ready', () => {
 *       console.log('Plugin ready');
 *     });
 *   }
 * };
 */
```

### 4. Testing

Create a test harness for plugins:

```javascript
class PluginTester {
  constructor() {
    this.mockAPI = this.createMockAPI();
  }

  createMockAPI() {
    return {
      events: {
        on: (event, callback) => console.log(`Mock: on(${event})`),
        emit: (event, data) => console.log(`Mock: emit(${event})`, data)
      },
      hooks: {
        addFilter: (name, cb) => console.log(`Mock: addFilter(${name})`),
        addAction: (name, cb) => console.log(`Mock: addAction(${name})`)
      }
    };
  }

  test(plugin) {
    console.log(`Testing plugin: ${plugin.name}`);

    try {
      plugin.init(this.mockAPI);
      console.log('✓ Init successful');

      if (plugin.destroy) {
        plugin.destroy();
        console.log('✓ Destroy successful');
      }

      return true;
    } catch (error) {
      console.error('✗ Test failed:', error);
      return false;
    }
  }
}
```

---

## Conclusion

These patterns enable building highly modular, extensible single-file web applications. Key takeaways:

1. **Use registries** for central plugin management
2. **Implement event systems** for loose coupling
3. **Provide dependency injection** for flexibility
4. **Support hooks and filters** for extensibility
5. **Use feature flags** for conditional loading
6. **Design clear APIs** for plugin developers
7. **Handle errors gracefully** to prevent plugin failures from breaking the app
8. **Document thoroughly** to enable third-party plugins

The single-file constraint doesn't limit architectural sophistication - it encourages thoughtful design and clear separation of concerns within a unified codebase.
