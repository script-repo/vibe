// ========================================
// Architecture Workshop Exercises Data
// ========================================

const exercises = [
  {
    title: "Event Bus Pattern",
    preamble: `<div class="preamble"><h3>Building an Event Bus</h3><p>Learn to create a central event bus for decoupled component communication.</p>
      <div class="key-concepts"><h4>Key Concepts:</h4><ul>
        <li><strong>Event Bus</strong>: Central hub for event communication</li>
        <li><strong>Publish/Subscribe</strong>: Decoupled messaging pattern</li>
        <li><strong>Callbacks</strong>: Functions passed as event handlers</li>
        <li><strong>Event Names</strong>: String-based event identification</li>
      </ul></div></div>`,
    description: "Create a simple event bus that allows components to communicate without direct references.",
    objectives: ["Create event bus object", "Implement on() for subscriptions", "Implement emit() for publishing", "Handle multiple listeners"],
    starterCode: `<!DOCTYPE html>
<html><head><title>Event Bus</title><style>body{padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif}</style></head>
<body>
  <button onclick="publish()">Publish Event</button>
  <div id="output"></div>
  <script>
    const eventBus = {
      events: {},
      on(event, callback) {
        // TODO: Store callback for event
      },
      emit(event, data) {
        // TODO: Call all callbacks for event
      }
    };
    
    // TODO: Subscribe to events
    // TODO: Publish events
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><head><title>Event Bus</title><style>body{padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif}#output{margin-top:1rem;padding:1rem;background:rgba(255,255,255,0.1);border-radius:8px}</style></head>
<body>
  <button onclick="publish()">Publish Event</button>
  <div id="output"></div>
  <script>
    const eventBus = {
      events: {},
      on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
      },
      emit(event, data) {
        if (this.events[event]) {
          this.events[event].forEach(callback => callback(data));
        }
      }
    };
    
    eventBus.on('message', (data) => {
      document.getElementById('output').innerHTML += '<p>Received: ' + data + '</p>';
    });
    
    function publish() {
      eventBus.emit('message', 'Hello from event bus! ' + new Date().toLocaleTimeString());
    }
  </script>
</body></html>`,
    hint: "Store an array of callbacks for each event name. In emit(), loop through callbacks and call each one with the data.",
    validation: (code) => code.includes('on') && code.includes('emit') && code.includes('events')
  },

  {
    title: "Pub/Sub System",
    preamble: `<div class="preamble"><h3>Publish/Subscribe Pattern</h3><p>Build a full pub/sub system with unsubscribe functionality.</p></div>`,
    description: "Extend the event bus with unsubscribe capability and event namespacing.",
    objectives: ["Add unsubscribe method", "Return subscription token", "Support wildcard events", "Implement once() for single-fire events"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff">
  <script>
    class PubSub {
      constructor() {
        this.events = {};
        this.id = 0;
      }
      // TODO: Implement subscribe, unsubscribe, publish
    }
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Pub/Sub</button>
  <div id="output"></div>
  <script>
    class PubSub {
      constructor() {
        this.events = {};
        this.id = 0;
      }
      subscribe(event, callback) {
        const token = this.id++;
        if (!this.events[event]) this.events[event] = {};
        this.events[event][token] = callback;
        return token;
      }
      unsubscribe(token) {
        for (let event in this.events) {
          if (this.events[event][token]) {
            delete this.events[event][token];
            return true;
          }
        }
        return false;
      }
      publish(event, data) {
        if (this.events[event]) {
          Object.values(this.events[event]).forEach(callback => callback(data));
        }
      }
      once(event, callback) {
        const token = this.subscribe(event, (data) => {
          callback(data);
          this.unsubscribe(token);
        });
      }
    }
    
    const pubsub = new PubSub();
    function test() {
      const token = pubsub.subscribe('test', (data) => {
        document.getElementById('output').innerHTML += '<p>Sub 1: ' + data + '</p>';
      });
      pubsub.once('test', (data) => {
        document.getElementById('output').innerHTML += '<p>Once: ' + data + '</p>';
      });
      pubsub.publish('test', 'First message');
      pubsub.publish('test', 'Second message');
      pubsub.unsubscribe(token);
      pubsub.publish('test', 'Third message (sub 1 removed)');
    }
  </script>
</body></html>`,
    hint: "Use tokens (unique IDs) to track subscriptions. Store callbacks in an object keyed by token for easy removal.",
    validation: (code) => code.includes('subscribe') && code.includes('unsubscribe') && code.includes('once')
  },

  {
    title: "Plugin Registry",
    preamble: `<div class="preamble"><h3>Plugin System Foundation</h3><p>Create a registry to manage plugins dynamically.</p></div>`,
    description: "Build a plugin registry that can register, activate, and deactivate plugins.",
    objectives: ["Register plugins", "Store plugin metadata", "Activate/deactivate plugins", "Query registered plugins"],
    starterCode: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff">
  <script>
    class PluginRegistry {
      constructor() {
        this.plugins = new Map();
      }
      // TODO: Implement register, activate, deactivate
    }
  </script>
</body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Plugins</button>
  <div id="output"></div>
  <script>
    class PluginRegistry {
      constructor() {
        this.plugins = new Map();
        this.active = new Set();
      }
      register(name, plugin) {
        this.plugins.set(name, plugin);
        return this;
      }
      activate(name) {
        if (this.plugins.has(name)) {
          const plugin = this.plugins.get(name);
          if (plugin.init) plugin.init();
          this.active.add(name);
          return true;
        }
        return false;
      }
      deactivate(name) {
        if (this.active.has(name)) {
          const plugin = this.plugins.get(name);
          if (plugin.destroy) plugin.destroy();
          this.active.delete(name);
          return true;
        }
        return false;
      }
      getActive() {
        return Array.from(this.active);
      }
    }
    
    const registry = new PluginRegistry();
    const logPlugin = {
      name: 'Logger',
      init() { log('Logger plugin activated'); },
      destroy() { log('Logger plugin deactivated'); }
    };
    
    function log(msg) {
      document.getElementById('output').innerHTML += '<p>' + msg + '</p>';
    }
    
    function test() {
      registry.register('logger', logPlugin);
      registry.activate('logger');
      log('Active plugins: ' + registry.getActive().join(', '));
      registry.deactivate('logger');
    }
  </script>
</body></html>`,
    hint: "Use a Map to store plugins by name and a Set to track active plugins. Call init() on activation and destroy() on deactivation.",
    validation: (code) => code.includes('register') && code.includes('activate') && code.includes('Map')
  },

  {
    title: "Plugin Lifecycle",
    preamble: `<div class="preamble"><h3>Plugin Lifecycle Management</h3><p>Implement full lifecycle hooks: install, init, update, destroy.</p></div>`,
    description: "Add lifecycle methods and dependency management to the plugin system.",
    objectives: ["Lifecycle hooks", "Dependency checking", "Version management", "Error handling"],
    starterCode: `<!DOCTYPE html>
<html><body><!-- TODO: Add lifecycle management --></body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Lifecycle</button>
  <div id="output"></div>
  <script>
    class PluginManager {
      constructor() {
        this.plugins = new Map();
        this.states = new Map();
      }
      register(plugin) {
        this.plugins.set(plugin.name, plugin);
        this.states.set(plugin.name, 'registered');
        if (plugin.onInstall) plugin.onInstall();
        log(plugin.name + ' installed');
      }
      activate(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) return false;
        if (plugin.onInit) plugin.onInit();
        this.states.set(name, 'active');
        log(name + ' activated');
        return true;
      }
      deactivate(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) return false;
        if (plugin.onDestroy) plugin.onDestroy();
        this.states.set(name, 'inactive');
        log(name + ' deactivated');
        return true;
      }
      getState(name) {
        return this.states.get(name);
      }
    }
    
    function log(msg) {
      document.getElementById('output').innerHTML += '<p>→ ' + msg + '</p>';
    }
    
    function test() {
      const manager = new PluginManager();
      manager.register({
        name: 'Analytics',
        version: '1.0.0',
        onInstall() { log('Setting up analytics...'); },
        onInit() { log('Analytics tracking started'); },
        onDestroy() { log('Analytics tracking stopped'); }
      });
      manager.activate('Analytics');
      log('State: ' + manager.getState('Analytics'));
      manager.deactivate('Analytics');
    }
  </script>
</body></html>`,
    hint: "Define standard lifecycle methods (onInstall, onInit, onDestroy) and call them at appropriate times. Track plugin states.",
    validation: (code) => code.includes('onInstall') && code.includes('onInit') && code.includes('onDestroy')
  },

  {
    title: "Action Hooks",
    preamble: `<div class="preamble"><h3>WordPress-Style Actions</h3><p>Implement action hooks that let plugins execute code at specific points.</p></div>`,
    description: "Create an action hook system inspired by WordPress.",
    objectives: ["Add action hooks", "Register callbacks", "Execute hooks with priority", "Pass data to actions"],
    starterCode: `<!DOCTYPE html>
<html><body><!-- TODO: Implement action hooks --></body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Actions</button>
  <div id="output"></div>
  <script>
    class ActionHooks {
      constructor() {
        this.actions = {};
      }
      addAction(name, callback, priority = 10) {
        if (!this.actions[name]) this.actions[name] = [];
        this.actions[name].push({ callback, priority });
        this.actions[name].sort((a, b) => a.priority - b.priority);
      }
      doAction(name, ...args) {
        if (this.actions[name]) {
          this.actions[name].forEach(action => action.callback(...args));
        }
      }
      hasAction(name) {
        return this.actions[name] && this.actions[name].length > 0;
      }
    }
    
    const hooks = new ActionHooks();
    function log(msg) {
      document.getElementById('output').innerHTML += '<p>' + msg + '</p>';
    }
    
    function test() {
      hooks.addAction('user_login', (user) => log('Logging: ' + user + ' logged in'), 10);
      hooks.addAction('user_login', (user) => log('Analytics: Track ' + user), 5);
      hooks.addAction('user_login', (user) => log('Welcome email sent to ' + user), 20);
      
      log('Has user_login hooks: ' + hooks.hasAction('user_login'));
      log('--- Executing user_login ---');
      hooks.doAction('user_login', 'John');
    }
  </script>
</body></html>`,
    hint: "Store actions in an array sorted by priority. When executing, call each callback in priority order with the provided arguments.",
    validation: (code) => code.includes('addAction') && code.includes('doAction') && code.includes('priority')
  },

  {
    title: "Filter Hooks",
    preamble: `<div class="preamble"><h3>Filter Hook Pattern</h3><p>Implement filter hooks that let plugins modify data as it flows through the app.</p></div>`,
    description: "Create a filter system where data can be modified by multiple plugins in sequence.",
    objectives: ["Add filter hooks", "Chain filters", "Modify and return data", "Set default values"],
    starterCode: `<!DOCTYPE html>
<html><body><!-- TODO: Implement filter hooks --></body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Filters</button>
  <div id="output"></div>
  <script>
    class FilterHooks {
      constructor() {
        this.filters = {};
      }
      addFilter(name, callback, priority = 10) {
        if (!this.filters[name]) this.filters[name] = [];
        this.filters[name].push({ callback, priority });
        this.filters[name].sort((a, b) => a.priority - b.priority);
      }
      applyFilters(name, value, ...args) {
        if (this.filters[name]) {
          return this.filters[name].reduce((val, filter) => {
            return filter.callback(val, ...args);
          }, value);
        }
        return value;
      }
    }
    
    const filters = new FilterHooks();
    function log(msg) {
      document.getElementById('output').innerHTML += '<p>' + msg + '</p>';
    }
    
    function test() {
      filters.addFilter('format_price', (price) => {
        log('Filter 1: Adding $');
        return '$' + price;
      }, 10);
      
      filters.addFilter('format_price', (price) => {
        log('Filter 2: Adding commas');
        return price.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }, 20);
      
      const price = filters.applyFilters('format_price', '1000');
      log('Final price: ' + price);
    }
  </script>
</body></html>`,
    hint: "Use reduce() to chain filters. Each filter receives the modified value from the previous filter and returns a new value.",
    validation: (code) => code.includes('addFilter') && code.includes('applyFilters') && code.includes('reduce')
  },

  {
    title: "Middleware Pattern",
    preamble: `<div class="preamble"><h3>Request/Response Middleware</h3><p>Implement middleware pattern for request processing pipelines.</p></div>`,
    description: "Create a middleware system that processes requests through a chain of handlers.",
    objectives: ["Chain middleware", "next() function", "Early termination", "Error handling"],
    starterCode: `<!DOCTYPE html>
<html><body><!-- TODO: Implement middleware --></body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Middleware</button>
  <div id="output"></div>
  <script>
    class Middleware {
      constructor() {
        this.stack = [];
      }
      use(fn) {
        this.stack.push(fn);
        return this;
      }
      async execute(context) {
        let index = 0;
        const next = async () => {
          if (index < this.stack.length) {
            const fn = this.stack[index++];
            await fn(context, next);
          }
        };
        await next();
        return context;
      }
    }
    
    function log(msg) {
      document.getElementById('output').innerHTML += '<p>' + msg + '</p>';
    }
    
    async function test() {
      const mw = new Middleware();
      
      mw.use(async (ctx, next) => {
        log('MW1: Before');
        ctx.count = (ctx.count || 0) + 1;
        await next();
        log('MW1: After');
      });
      
      mw.use(async (ctx, next) => {
        log('MW2: Processing');
        ctx.processed = true;
        await next();
      });
      
      mw.use(async (ctx, next) => {
        log('MW3: Final handler');
        ctx.result = 'Done! Count: ' + ctx.count;
      });
      
      const result = await mw.execute({});
      log('Result: ' + result.result);
    }
  </script>
</body></html>`,
    hint: "Create a next() function that calls the next middleware in the stack. Each middleware receives context and next, and can call next() to continue.",
    validation: (code) => code.includes('next') && code.includes('stack') && code.includes('async')
  },

  {
    title: "Complete Plugin System",
    preamble: `<div class="preamble"><h3>Full-Featured Architecture</h3><p>Combine everything into a production-ready plugin system with hooks, filters, and middleware.</p></div>`,
    description: "Build a complete architecture with registry, hooks, filters, middleware, and state management.",
    objectives: ["Integrated system", "State management", "Error boundaries", "Plugin communication"],
    starterCode: `<!DOCTYPE html>
<html><body><!-- TODO: Build complete system --></body></html>`,
    solution: `<!DOCTYPE html>
<html><body style="padding:2rem;background:#1e293b;color:#fff;font-family:sans-serif">
  <button onclick="test()">Test Complete System</button>
  <div id="output"></div>
  <script>
    class PluginSystem {
      constructor() {
        this.plugins = new Map();
        this.actions = {};
        this.filters = {};
        this.state = {};
      }
      
      register(plugin) {
        this.plugins.set(plugin.name, plugin);
        if (plugin.init) plugin.init(this);
        log('✓ Plugin registered: ' + plugin.name);
      }
      
      addAction(name, callback, priority = 10) {
        if (!this.actions[name]) this.actions[name] = [];
        this.actions[name].push({ callback, priority });
        this.actions[name].sort((a, b) => a.priority - b.priority);
      }
      
      doAction(name, ...args) {
        if (this.actions[name]) {
          this.actions[name].forEach(action => action.callback(...args));
        }
      }
      
      addFilter(name, callback, priority = 10) {
        if (!this.filters[name]) this.filters[name] = [];
        this.filters[name].push({ callback, priority });
        this.filters[name].sort((a, b) => a.priority - b.priority);
      }
      
      applyFilters(name, value, ...args) {
        if (this.filters[name]) {
          return this.filters[name].reduce((val, filter) => {
            return filter.callback(val, ...args);
          }, value);
        }
        return value;
      }
      
      setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        this.doAction('state_changed', key, value, oldValue);
      }
      
      getState(key) {
        return this.state[key];
      }
    }
    
    function log(msg) {
      document.getElementById('output').innerHTML += '<p>' + msg + '</p>';
    }
    
    function test() {
      const system = new PluginSystem();
      
      // Register plugins
      system.register({
        name: 'Analytics',
        init(sys) {
          sys.addAction('user_action', (action) => {
            log('📊 Analytics: Tracked ' + action);
          });
        }
      });
      
      system.register({
        name: 'Logger',
        init(sys) {
          sys.addAction('user_action', (action) => {
            log('📝 Logger: ' + action);
          });
          sys.addAction('state_changed', (key, val) => {
            log('📝 State changed: ' + key + ' = ' + val);
          });
        }
      });
      
      system.register({
        name: 'Formatter',
        init(sys) {
          sys.addFilter('format_message', (msg) => {
            return '✨ ' + msg + ' ✨';
          });
        }
      });
      
      // Test the system
      log('--- Testing Actions ---');
      system.doAction('user_action', 'clicked button');
      
      log('--- Testing Filters ---');
      const formatted = system.applyFilters('format_message', 'Hello World');
      log('Formatted: ' + formatted);
      
      log('--- Testing State ---');
      system.setState('user', 'John');
      log('State user: ' + system.getState('user'));
    }
  </script>
</body></html>`,
    hint: "Combine registry, actions, filters, and state into one cohesive system. Plugins can hook into any part of the system.",
    validation: (code) => code.includes('register') && code.includes('addAction') && code.includes('addFilter') && code.includes('setState')
  }
];

const workshopSummary = {
  message: "Congratulations! You've mastered software architecture patterns!",
  skillsLearned: ["Event-Driven Architecture", "Plugin Systems", "Hook Patterns", "Middleware", "State Management", "Pub/Sub", "Filter Chains", "Extensible Design"],
  achievements: [
    {icon: "🏗️", title: "Architect", description: "Designed scalable systems"},
    {icon: "🔌", title: "Plugin Master", description: "Built extensible architectures"},
    {icon: "⚡", title: "Event Pro", description: "Mastered event-driven patterns"},
    {icon: "🎯", title: "Hook Expert", description: "Implemented WordPress-style hooks"}
  ],
  nextSteps: [
    "Build a complete plugin ecosystem",
    "Implement dependency injection",
    "Add module federation",
    "Create micro-frontend architecture",
    "Study design patterns in depth"
  ],
  resources: [
    {name: "JavaScript Design Patterns", url: "https://www.patterns.dev/"},
    {name: "WordPress Plugin Handbook", url: "https://developer.wordpress.org/plugins/"},
    {name: "Martin Fowler's Architecture", url: "https://martinfowler.com/architecture/"},
    {name: "Clean Architecture", url: "https://blog.cleancoder.com/"}
  ]
};
