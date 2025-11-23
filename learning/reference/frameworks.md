# Lightweight Frameworks for Modular Single-File Web Applications

**Research Report: Building Web Applications Under 1MB**

*Last Updated: November 2025*

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Framework Comparison](#framework-comparison)
3. [Build-Free Approaches](#build-free-approaches)
4. [Size Optimization Techniques](#size-optimization-techniques)
5. [Module Patterns for Single-File Apps](#module-patterns-for-single-file-apps)
6. [State Management Patterns](#state-management-patterns)
7. [Code Organization Best Practices](#code-organization-best-practices)
8. [Use Case Recommendations](#use-case-recommendations)
9. [Code Examples](#code-examples)
10. [Resources & Documentation](#resources--documentation)

---

## Executive Summary

This report analyzes lightweight frameworks and approaches for building modular single-file web applications under 1MB. The landscape has matured significantly in 2025, with several excellent options ranging from ultra-minimal (1KB) to feature-rich (16KB) frameworks, all capable of delivering production-ready applications without build steps.

### Key Findings

- **Smallest frameworks**: Hyperapp (1.7KB) → lit-html (3.3KB) → Preact (4.8KB)
- **Most feature-rich lightweight**: Alpine.js (16.3KB) offers Vue-like syntax with no build required
- **Best build-free workflow**: Preact + HTM with ES modules and import maps
- **Rising star**: Solid.js (7KB) with exceptional performance through fine-grained reactivity
- **ES Modules + Import Maps** are now supported in all modern browsers, enabling true zero-build workflows

---

## Framework Comparison

### Size Comparison (Minified + Gzipped)

| Framework | Size | Virtual DOM | JSX Support | Build Required |
|-----------|------|-------------|-------------|----------------|
| **Hyperapp** | ~1.7 KB | Yes | Yes (optional) | No |
| **lit-html** | ~3.3 KB | No | No (tagged templates) | No |
| **Preact** | ~4.8 KB | Yes | Yes (with HTM) | No (with HTM) |
| **Lit** (full) | ~5.8 KB | No (Web Components) | No (tagged templates) | No |
| **Petite Vue** | ~6.9 KB | Yes | No (Vue templates) | No |
| **Solid.js** | ~7.0 KB | No (fine-grained) | Yes | Yes (recommended) |
| **Svelte** | ~10 KB | No (compiled) | No | Yes (required) |
| **Alpine.js** | ~16.3 KB | No (DOM-based) | No (HTML attributes) | No |

**For Reference:**
- React: ~40-45 KB (gzipped)
- Vue 3: ~40-45 KB (gzipped)
- Angular: ~179 KB (gzipped)

### Feature Comparison

#### **Hyperapp** (1.7 KB)
**Strengths:**
- Smallest full-featured framework
- Built-in state management (Elm architecture)
- Virtual DOM with optimized diff algorithm
- Pure functions for predictability
- JSX or hyperscript support

**Limitations:**
- Smaller ecosystem compared to React/Vue
- Less community resources
- Steeper learning curve for Elm architecture

**Best For:**
- Ultra-lightweight single-page apps
- Projects where every byte counts
- Developers familiar with functional programming

---

#### **Preact** (4.8 KB)
**Strengths:**
- React-compatible API (drop-in replacement)
- Fast performance
- Hooks, context, and modern React features
- Works with HTM for zero-build workflow
- Large ecosystem via React compatibility

**Limitations:**
- Not 100% React compatible (some edge cases)
- Smaller than React but larger than alternatives

**Best For:**
- React developers wanting smaller bundles
- Embedded widgets and micro-frontends
- Progressive web apps with strict size limits

---

#### **Alpine.js** (16.3 KB)
**Strengths:**
- No build step required
- Vue-like declarative syntax
- Works directly in HTML with `x-` attributes
- Built-in state management (`$store`)
- Easy to learn for beginners
- Great for progressive enhancement

**Limitations:**
- Larger than other options (~16KB)
- Less suitable for complex SPAs
- Performance limitations for very large apps

**Best For:**
- Enhancing static HTML sites
- Small to medium interactive components
- Teams familiar with Vue.js
- Rapid prototyping

---

#### **Lit / lit-html** (5.8 KB / 3.3 KB)
**Strengths:**
- Web Components standard
- Framework-agnostic components
- Tagged template literals (native JS)
- Excellent browser support
- Small bundle size
- No virtual DOM overhead

**Limitations:**
- Web Components learning curve
- Shadow DOM can complicate styling
- Less intuitive than JSX for some developers

**Best For:**
- Reusable component libraries
- Design systems
- Framework-independent components
- Modern browser-only applications

---

#### **Solid.js** (7 KB)
**Strengths:**
- Exceptional performance (2-3x faster than React)
- Fine-grained reactivity (no virtual DOM)
- JSX syntax
- Minimal re-rendering
- Small bundle size
- Components render once

**Limitations:**
- Requires build step (not ideal for zero-build)
- Smaller ecosystem than React
- Less mature tooling

**Best For:**
- Performance-critical applications
- Highly interactive UIs
- Apps with complex state updates
- When build step is acceptable

---

#### **Petite Vue** (6.9 KB)
**Strengths:**
- Subset of Vue.js optimized for progressive enhancement
- Vue-compatible syntax
- No build required
- Reactive data binding
- Very small footprint

**Limitations:**
- Limited compared to full Vue
- Smaller community than Alpine.js
- Less documentation

**Best For:**
- Progressive enhancement
- Vue developers wanting minimal bundle
- Simple interactive components

---

## Build-Free Approaches

### ES Modules + Import Maps (Recommended 2025)

Import maps are now supported in **all modern browsers** (Chrome, Edge, Safari, Firefox), enabling true zero-build workflows.

#### Basic Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Build-Free App</title>

  <!-- Import Map Definition -->
  <script type="importmap">
  {
    "imports": {
      "preact": "https://esm.sh/preact@10.23.1",
      "preact/hooks": "https://esm.sh/preact@10.23.1/hooks",
      "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact",
      "alpinejs": "https://esm.sh/alpinejs@3.13.3"
    }
  }
  </script>
</head>
<body>
  <div id="app"></div>

  <!-- Your Application -->
  <script type="module">
    import { render } from 'preact';
    import { useState } from 'preact/hooks';
    import { html } from 'htm/preact';

    function App() {
      const [count, setCount] = useState(0);
      return html`
        <div>
          <h1>Count: ${count}</h1>
          <button onClick=${() => setCount(count + 1)}>Increment</button>
        </div>
      `;
    }

    render(html`<${App} />`, document.getElementById('app'));
  </script>
</body>
</html>
```

### CDN Comparison for ES Modules

#### **esm.sh** (Recommended for most projects)
- **URL**: `https://esm.sh/`
- **Strengths**:
  - Fast, Deno-friendly
  - Automatic TypeScript types via headers
  - Built on esbuild (fast transpilation)
  - Handles Node.js built-in modules
- **Best For**: Production applications, Deno projects

#### **Skypack** (Best for bleeding-edge ESM)
- **URL**: `https://cdn.skypack.dev/`
- **Strengths**:
  - On-the-fly ESM transforms
  - Aggressive caching
  - Optimized for modern browsers
  - TypeScript support
- **Limitations**: May be slower for some packages
- **Best For**: ESM-native projects, prototyping

#### **jsDelivr** (Best for global distribution)
- **URL**: `https://cdn.jsdelivr.net/npm/`
- **Strengths**:
  - Multi-CDN backbone (global performance)
  - Excellent uptime and reliability
  - NPM and GitHub integration
  - Automatic minification
- **Best For**: Enterprise applications, worldwide traffic

#### **unpkg** (Best for simplicity)
- **URL**: `https://unpkg.com/`
- **Strengths**:
  - Simple, zero-config
  - Direct npm proxy
  - Fast for simple use cases
- **Limitations**: No ESM transforms, serves raw files
- **Best For**: Quick prototypes, simple dependencies

### Standalone Bundles (HTM + Preact)

For the absolute simplest setup:

```html
<!DOCTYPE html>
<html>
<head><title>HTM Demo</title></head>
<body>
  <script type="module">
    import { html, Component, render } from
      'https://unpkg.com/htm/preact/standalone.module.js';

    const App = ({ name }) => html`<h1>Hello ${name}!</h1>`;
    render(html`<${App} name="World" />`, document.body);
  </script>
</body>
</html>
```

### Alpine.js (Script Tag)

```html
<!DOCTYPE html>
<html>
<head>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
  <div x-data="{ count: 0 }">
    <button @click="count++">Increment</button>
    <span x-text="count"></span>
  </div>
</body>
</html>
```

---

## Size Optimization Techniques

### 1. Performance Budget Strategy

Set a strict 1MB limit (or smaller) for your entire application:

```
Total Budget: 1000 KB
- HTML: 10 KB
- CSS: 50 KB
- JavaScript (framework): 15-20 KB
- JavaScript (app code): 100-150 KB
- Images: 600-700 KB
- Fonts: 50-100 KB
- Other assets: 50-100 KB
```

### 2. Image Optimization

Images typically account for 50%+ of page weight.

**Techniques:**
- **Format Selection**:
  - WebP: 25-35% smaller than JPEG
  - AVIF: 50% smaller than JPEG (newer format)
  - SVG: For icons and simple graphics

- **Compression Tools**:
  - TinyPNG / JPEGmini: Lossless compression (1MB → 300KB typical)
  - Squoosh.app: Browser-based image optimizer
  - ImageOptim (Mac) / RIOT (Windows)

- **Lazy Loading**:
  ```html
  <img src="image.jpg" loading="lazy" alt="Description">
  ```

- **Responsive Images**:
  ```html
  <picture>
    <source srcset="image-small.webp" media="(max-width: 600px)">
    <source srcset="image-large.webp" media="(min-width: 601px)">
    <img src="image.jpg" alt="Fallback">
  </picture>
  ```

### 3. Code Optimization

#### Minification
Remove whitespace, comments, and rename variables:

**Tools:**
- Terser (JavaScript)
- cssnano (CSS)
- html-minifier (HTML)

**Results**: 30-50% size reduction typical

#### Tree Shaking

Remove unused code from your bundle.

**How it works:**
- Analyzes ES module imports/exports
- Eliminates unused functions and variables
- Only includes "live" code in final bundle

**Requirements:**
- Use ES modules (`import/export`)
- Avoid CommonJS (`require/module.exports`)
- Use bundlers: Rollup, Webpack (production mode), esbuild

**Example package.json:**
```json
{
  "sideEffects": false,
  "type": "module"
}
```

**Webpack config:**
```javascript
module.exports = {
  mode: 'production', // Enables tree shaking
  optimization: {
    usedExports: true,
    minimize: true
  }
};
```

**Real-world impact**: 40-60% bundle size reduction

#### Code Splitting

Break large files into smaller chunks loaded on demand:

```javascript
// Dynamic import
const loadChart = async () => {
  const { Chart } = await import('./chart.js');
  return new Chart();
};

// Only load when needed
button.addEventListener('click', async () => {
  const chart = await loadChart();
  chart.render();
});
```

### 4. Compression

#### Brotli (Recommended)
- Better compression than Gzip (15-25% smaller)
- Supported by all modern browsers
- Best for text assets (HTML, CSS, JS)

#### Gzip
- Universal support (fallback)
- Good compression ratios
- Widely supported by CDNs

**Server configuration (nginx):**
```nginx
gzip on;
gzip_types text/plain text/css application/javascript;
brotli on;
brotli_types text/plain text/css application/javascript;
```

### 5. Font Optimization

**Techniques:**
- Use system fonts (zero bytes):
  ```css
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  ```
- Subset fonts (include only needed characters)
- Use `font-display: swap` for better perceived performance
- WOFF2 format (30% smaller than WOFF)

**Google Fonts optimized:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
```

### 6. CSS Optimization

**Techniques:**
- Remove unused CSS (PurgeCSS, UnCSS)
- Use CSS-in-JS for automatic scoping and removal
- Minimize use of large frameworks (Bootstrap: 150KB)
- Consider utility-first with purging (Tailwind + PurgeCSS)

**Real-world case study:**
- Before: 12.9 MB, 3.06s load time
- After: 1.2 MB, 1.41s load time
- **Techniques**: Image optimization, minification, compression, code splitting

---

## Module Patterns for Single-File Apps

### 1. IIFE (Immediately Invoked Function Expression)

**Classic pattern for encapsulation without build tools:**

```javascript
const MyModule = (function() {
  // Private variables
  let privateData = [];

  // Private functions
  function privateHelper() {
    return privateData.length;
  }

  // Public API
  return {
    addItem(item) {
      privateData.push(item);
    },
    getCount() {
      return privateHelper();
    },
    reset() {
      privateData = [];
    }
  };
})();

// Usage
MyModule.addItem('test');
console.log(MyModule.getCount()); // 1
```

### 2. Revealing Module Pattern

**Improved readability - define everything, reveal selectively:**

```javascript
const AppModule = (function() {
  // Private state
  let state = { count: 0 };

  // Private methods
  function increment() {
    state.count++;
    render();
  }

  function decrement() {
    state.count--;
    render();
  }

  function render() {
    document.getElementById('counter').textContent = state.count;
  }

  function init() {
    document.getElementById('inc').addEventListener('click', increment);
    document.getElementById('dec').addEventListener('click', decrement);
    render();
  }

  // Reveal public interface
  return {
    init,
    getState: () => state.count
  };
})();

// Initialize app
AppModule.init();
```

### 3. ES Module Pattern (Modern)

**For single-file apps using ES modules:**

```javascript
// app.js - Single file application

// State module
const createStore = (initialState) => {
  let state = initialState;
  const listeners = [];

  return {
    getState: () => state,
    setState: (newState) => {
      state = { ...state, ...newState };
      listeners.forEach(fn => fn(state));
    },
    subscribe: (fn) => listeners.push(fn)
  };
};

// View module
const createView = (store) => {
  const render = (state) => {
    document.getElementById('app').innerHTML = `
      <h1>Count: ${state.count}</h1>
      <button id="inc">+</button>
      <button id="dec">-</button>
    `;
    attachListeners();
  };

  const attachListeners = () => {
    document.getElementById('inc')?.addEventListener('click',
      () => store.setState({ count: store.getState().count + 1 }));
    document.getElementById('dec')?.addEventListener('click',
      () => store.setState({ count: store.getState().count - 1 }));
  };

  return { render };
};

// Initialize app
const store = createStore({ count: 0 });
const view = createView(store);

store.subscribe(view.render);
view.render(store.getState());
```

### 4. Object Literal Pattern

**Simple namespacing for smaller apps:**

```javascript
const App = {
  state: {
    todos: [],
    filter: 'all'
  },

  actions: {
    addTodo(text) {
      App.state.todos.push({ id: Date.now(), text, done: false });
      App.render();
    },

    toggleTodo(id) {
      const todo = App.state.todos.find(t => t.id === id);
      if (todo) todo.done = !todo.done;
      App.render();
    }
  },

  render() {
    // Render logic
  },

  init() {
    this.render();
    // Attach event listeners
  }
};

App.init();
```

### 5. Functional Composition Pattern

**For functional programming enthusiasts:**

```javascript
// Composable functions
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const createState = (initial) => {
  let current = initial;
  return {
    get: () => current,
    set: (fn) => { current = fn(current); }
  };
};

const createActions = (state) => ({
  increment: () => state.set(s => ({ ...s, count: s.count + 1 })),
  decrement: () => state.set(s => ({ ...s, count: s.count - 1 }))
});

const createView = (state, actions) => {
  const render = () => {
    const { count } = state.get();
    document.body.innerHTML = `
      <h1>${count}</h1>
      <button onclick="app.actions.increment()">+</button>
      <button onclick="app.actions.decrement()">-</button>
    `;
  };
  return { render };
};

// Compose application
const state = createState({ count: 0 });
const actions = createActions(state);
const view = createView(state, actions);

window.app = { actions }; // Expose for onclick handlers
view.render();
```

---

## State Management Patterns

### Alpine.js State Management

#### Component State (Simple)

```html
<div x-data="{ open: false, count: 0 }">
  <button @click="open = !open">Toggle</button>
  <button @click="count++">Increment: <span x-text="count"></span></button>

  <div x-show="open" x-transition>
    <p>Content here</p>
  </div>
</div>
```

#### Global Store (Complex Apps)

```html
<!DOCTYPE html>
<html>
<head>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
  <script>
    // Define global store before Alpine loads
    document.addEventListener('alpine:init', () => {
      Alpine.store('auth', {
        user: null,
        isAuthenticated: false,

        login(username) {
          this.user = { username, id: Date.now() };
          this.isAuthenticated = true;
        },

        logout() {
          this.user = null;
          this.isAuthenticated = false;
        }
      });

      Alpine.store('cart', {
        items: [],

        get total() {
          return this.items.reduce((sum, item) => sum + item.price, 0);
        },

        addItem(item) {
          this.items.push(item);
        },

        removeItem(id) {
          this.items = this.items.filter(item => item.id !== id);
        }
      });
    });
  </script>

  <!-- Usage -->
  <div x-data>
    <template x-if="$store.auth.isAuthenticated">
      <div>
        <p>Welcome, <span x-text="$store.auth.user.username"></span></p>
        <button @click="$store.auth.logout()">Logout</button>
      </div>
    </template>

    <div>
      Cart Total: $<span x-text="$store.cart.total"></span>
      <p>Items: <span x-text="$store.cart.items.length"></span></p>
    </div>
  </div>
</body>
</html>
```

#### Persistent Store (LocalStorage)

```javascript
document.addEventListener('alpine:init', () => {
  Alpine.store('settings', {
    darkMode: localStorage.getItem('darkMode') === 'true',

    init() {
      this.$watch('darkMode', value => {
        localStorage.setItem('darkMode', value);
        document.body.classList.toggle('dark', value);
      });
    },

    toggle() {
      this.darkMode = !this.darkMode;
    }
  });
});
```

### Hyperapp State Management (Elm Architecture)

```javascript
import { app } from "https://unpkg.com/hyperapp";

// State
const state = {
  count: 0,
  todos: []
};

// Actions (pure functions)
const actions = {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  decrement: (state) => ({ ...state, count: state.count - 1 }),

  addTodo: (state, text) => ({
    ...state,
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  }),

  toggleTodo: (state, id) => ({
    ...state,
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  })
};

// View
const view = (state) => (
  <div>
    <h1>Count: {state.count}</h1>
    <button onclick={actions.increment}>+</button>
    <button onclick={actions.decrement}>-</button>

    <ul>
      {state.todos.map(todo => (
        <li
          onclick={() => actions.toggleTodo(todo.id)}
          style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  </div>
);

app({ init: state, view, node: document.getElementById("app") });
```

### Preact Hooks State Management

```javascript
import { render } from 'preact';
import { useState, useEffect, createContext, useContext } from 'preact/hooks';
import { html } from 'htm/preact';

// Context for global state
const StoreContext = createContext();

// Custom hook for store
const useStore = () => useContext(StoreContext);

// Store provider
function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  const store = {
    user, setUser,
    cart, addToCart, removeFromCart,
    cartTotal: cart.reduce((sum, item) => sum + item.price, 0)
  };

  return html`
    <${StoreContext.Provider} value=${store}>
      ${children}
    <//>
  `;
}

// Component using store
function CartWidget() {
  const { cart, cartTotal, removeFromCart } = useStore();

  return html`
    <div class="cart">
      <h3>Cart (${cart.length} items)</h3>
      <p>Total: $${cartTotal}</p>
      <ul>
        ${cart.map(item => html`
          <li key=${item.id}>
            ${item.name} - $${item.price}
            <button onClick=${() => removeFromCart(item.id)}>Remove</button>
          </li>
        `)}
      </ul>
    </div>
  `;
}

// App
function App() {
  return html`
    <${StoreProvider}>
      <${CartWidget} />
    <//>
  `;
}

render(html`<${App} />`, document.body);
```

### Vanilla JavaScript Observer Pattern

```javascript
// Simple reactive state management
class Store {
  constructor(initialState) {
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
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Usage
const store = new Store({
  count: 0,
  user: null
});

// Subscribe to changes
store.subscribe((state) => {
  document.getElementById('counter').textContent = state.count;
});

// Update state
document.getElementById('inc').addEventListener('click', () => {
  store.setState({ count: store.getState().count + 1 });
});
```

---

## Code Organization Best Practices

### Single-File Structure Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Name</title>

  <!-- 1. IMPORT MAP (if using ES modules) -->
  <script type="importmap">
  {
    "imports": {
      "framework": "https://esm.sh/framework@version"
    }
  }
  </script>

  <!-- 2. STYLES -->
  <style>
    /* CSS Variables for theming */
    :root {
      --primary: #007bff;
      --background: #ffffff;
      --text: #333333;
    }

    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* Layout */
    body { font-family: system-ui, sans-serif; }

    /* Components */
    .button { /* ... */ }
    .card { /* ... */ }
  </style>
</head>
<body>
  <!-- 3. HTML STRUCTURE -->
  <div id="app"></div>

  <!-- 4. APPLICATION CODE -->
  <script type="module">
    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
      apiUrl: 'https://api.example.com',
      pageSize: 10
    };

    // ============================================
    // UTILITIES
    // ============================================
    const debounce = (fn, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US').format(date);
    };

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const createStore = (initialState) => {
      let state = initialState;
      const listeners = [];

      return {
        getState: () => state,
        setState: (updates) => {
          state = { ...state, ...updates };
          listeners.forEach(fn => fn(state));
        },
        subscribe: (fn) => listeners.push(fn)
      };
    };

    const store = createStore({
      items: [],
      loading: false,
      error: null
    });

    // ============================================
    // API / DATA LAYER
    // ============================================
    const api = {
      async fetchItems() {
        store.setState({ loading: true, error: null });
        try {
          const response = await fetch(`${CONFIG.apiUrl}/items`);
          const data = await response.json();
          store.setState({ items: data, loading: false });
        } catch (error) {
          store.setState({ error: error.message, loading: false });
        }
      }
    };

    // ============================================
    // COMPONENTS / VIEW
    // ============================================
    const renderItem = (item) => `
      <div class="item">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `;

    const renderApp = (state) => {
      const app = document.getElementById('app');

      if (state.loading) {
        app.innerHTML = '<div class="loading">Loading...</div>';
        return;
      }

      if (state.error) {
        app.innerHTML = `<div class="error">${state.error}</div>`;
        return;
      }

      app.innerHTML = `
        <div class="container">
          <h1>My App</h1>
          <div class="items">
            ${state.items.map(renderItem).join('')}
          </div>
        </div>
      `;

      attachEventListeners();
    };

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const attachEventListeners = () => {
      // Attach listeners to dynamically created elements
      document.querySelectorAll('.item').forEach(el => {
        el.addEventListener('click', handleItemClick);
      });
    };

    const handleItemClick = (e) => {
      console.log('Item clicked:', e.currentTarget);
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    const init = () => {
      store.subscribe(renderApp);
      renderApp(store.getState());
      api.fetchItems();
    };

    init();
  </script>
</body>
</html>
```

### Recommended Section Order

1. **Configuration** - Constants, API URLs, feature flags
2. **Utilities** - Helper functions, formatters, validators
3. **State Management** - Store creation, initial state
4. **Data Layer** - API calls, data transformations
5. **Components/View** - Render functions, templates
6. **Event Handlers** - User interactions, side effects
7. **Initialization** - Bootstrap code, initial render

### Code Organization Tips

#### 1. Use Comments as Section Dividers
```javascript
// ============================================
// SECTION NAME
// ============================================
```

#### 2. Group Related Functionality
```javascript
// Auth module
const auth = {
  currentUser: null,
  login(credentials) { /* ... */ },
  logout() { /* ... */ },
  isAuthenticated() { return !!this.currentUser; }
};
```

#### 3. Use Constants for Magic Values
```javascript
const CONSTANTS = {
  MAX_ITEMS: 100,
  DEBOUNCE_DELAY: 300,
  CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};
```

#### 4. Extract Complex Logic to Named Functions
```javascript
// Bad - inline complex logic
button.onclick = () => {
  if (items.length > 0 && !loading && user !== null) {
    // ... complex logic
  }
};

// Good - extracted and named
const canSubmit = () => items.length > 0 && !loading && user !== null;
const handleSubmit = () => { /* ... */ };

button.onclick = () => {
  if (canSubmit()) handleSubmit();
};
```

#### 5. Use JSDoc Comments for Complex Functions
```javascript
/**
 * Fetches paginated items from the API
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Promise<Array>} Array of items
 */
async function fetchItems(page = 1, pageSize = 10) {
  // ...
}
```

### Multi-Module Single-File Pattern

For larger apps, simulate modules in a single file:

```javascript
// ============================================
// MODULE: Store
// ============================================
const StoreModule = (() => {
  let state = {};
  const listeners = [];

  return {
    getState: () => state,
    setState: (updates) => {
      state = { ...state, ...updates };
      listeners.forEach(fn => fn(state));
    },
    subscribe: (fn) => listeners.push(fn)
  };
})();

// ============================================
// MODULE: API
// ============================================
const ApiModule = (() => {
  const BASE_URL = 'https://api.example.com';

  const request = async (endpoint, options = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  return {
    getUsers: () => request('/users'),
    getUser: (id) => request(`/users/${id}`),
    createUser: (data) => request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  };
})();

// ============================================
// MODULE: UI
// ============================================
const UIModule = (() => {
  const render = (state) => {
    // Rendering logic
  };

  const showNotification = (message, type = 'info') => {
    // Notification logic
  };

  return { render, showNotification };
})();

// ============================================
// BOOTSTRAP
// ============================================
StoreModule.subscribe(UIModule.render);
ApiModule.getUsers().then(users => {
  StoreModule.setState({ users });
});
```

---

## Use Case Recommendations

### 1. Static Site Enhancement (Progressive Enhancement)

**Best Choice: Alpine.js**

**Why:**
- No build step required
- Works directly in HTML
- Easy to learn and integrate
- Perfect for adding interactivity to static pages

**Use When:**
- Enhancing server-rendered HTML
- Adding interactive components to static sites
- Quick prototypes
- Small to medium interactive features

**Example Use Cases:**
- Dropdown menus, tabs, accordions
- Form validation and dynamic forms
- Modal dialogs
- Simple shopping carts

---

### 2. Embedded Widgets / Third-Party Scripts

**Best Choice: Preact + HTM**

**Why:**
- Very small bundle (< 10KB total)
- React-like API (familiar to many developers)
- Self-contained
- Won't conflict with host page

**Use When:**
- Building embeddable widgets
- Chat widgets, feedback forms
- Analytics dashboards
- Social media feeds

**Alternative: Hyperapp (if even smaller bundle needed)**

---

### 3. Performance-Critical Single-Page Apps

**Best Choice: Solid.js or Preact**

**Why:**
- Solid.js: Best raw performance (fine-grained reactivity)
- Preact: Good performance + larger ecosystem

**Use When:**
- Complex interactive UIs
- Real-time data updates
- Large lists with frequent updates
- Mobile-first applications

**Note:** Solid.js requires build step, but performance gains often worth it

---

### 4. Reusable Component Libraries / Design Systems

**Best Choice: Lit (Web Components)**

**Why:**
- Framework-agnostic
- Web Components standard
- Excellent encapsulation
- Can be used anywhere (React, Vue, Angular, vanilla)

**Use When:**
- Building component libraries
- Design systems for multiple projects
- Components that need to work across frameworks
- Long-term component reusability

---

### 5. Prototypes / MVPs / Learning Projects

**Best Choice: Alpine.js or Preact + HTM**

**Why:**
- Fast setup (minutes, not hours)
- No build configuration
- Low learning curve
- Easy to share (single HTML file)

**Use When:**
- Validating ideas quickly
- Demos and presentations
- Teaching/learning modern web development
- Proof of concepts

---

### 6. Ultra-Lightweight Apps (< 50KB total)

**Best Choice: Hyperapp**

**Why:**
- Smallest full-featured framework (1.7KB)
- Built-in state management
- Functional programming patterns

**Use When:**
- Every kilobyte matters
- Targeting slow networks / low-end devices
- 2G/3G mobile networks
- Embedded systems with web interfaces

**Example Use Cases:**
- IoT device interfaces
- Progressive Web Apps for emerging markets
- Offline-first applications

---

### 7. Zero-Build Constraint Projects

**Best Choices:**
1. **Alpine.js** - for HTML-centric approach
2. **Preact + HTM** - for component-based approach
3. **Vanilla JS + ES Modules** - for maximum control

**Use When:**
- Build tools not available/allowed
- Deploying to restricted environments
- Educational environments
- Maximum simplicity required

---

### 8. Framework Migration / Gradual Adoption

**Best Choice: Petite Vue or Alpine.js**

**Why:**
- Can coexist with existing code
- Gradual adoption possible
- No need to rewrite entire app
- Progressive enhancement approach

**Use When:**
- Migrating from jQuery
- Modernizing legacy applications
- Adding reactivity to existing sites
- Risk-averse environments

---

## Decision Matrix

| Requirement | Recommended Framework | Size | Build Required |
|-------------|----------------------|------|----------------|
| Smallest possible | Hyperapp | 1.7KB | No |
| React-like API | Preact + HTM | 8KB | No |
| Best performance | Solid.js | 7KB | Yes |
| Easiest to learn | Alpine.js | 16KB | No |
| Framework-agnostic | Lit | 6KB | No |
| Vue-like syntax | Petite Vue | 7KB | No |
| Progressive enhancement | Alpine.js | 16KB | No |
| Component libraries | Lit | 6KB | No |

---

## Code Examples

### Complete Todo App: Alpine.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alpine Todo App</title>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
    input[type="text"] { padding: 10px; width: 70%; border: 1px solid #ddd; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    .todo-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
    .done { text-decoration: line-through; opacity: 0.6; }
    .filters button { margin: 5px; padding: 5px 10px; background: #f0f0f0; color: #333; }
    .filters button.active { background: #007bff; color: white; }
  </style>
</head>
<body>
  <div x-data="todoApp()">
    <h1>Todo App</h1>

    <!-- Add Todo Form -->
    <div>
      <input
        type="text"
        x-model="newTodo"
        @keyup.enter="addTodo()"
        placeholder="What needs to be done?"
      >
      <button @click="addTodo()">Add</button>
    </div>

    <!-- Filters -->
    <div class="filters" style="margin: 20px 0;">
      <button
        @click="filter = 'all'"
        :class="{ 'active': filter === 'all' }"
      >All</button>
      <button
        @click="filter = 'active'"
        :class="{ 'active': filter === 'active' }"
      >Active</button>
      <button
        @click="filter = 'completed'"
        :class="{ 'active': filter === 'completed' }"
      >Completed</button>
    </div>

    <!-- Stats -->
    <p>
      <span x-text="filteredTodos.length"></span> items
      (<span x-text="activeTodos"></span> active,
      <span x-text="completedTodos"></span> completed)
    </p>

    <!-- Todo List -->
    <div>
      <template x-for="todo in filteredTodos" :key="todo.id">
        <div class="todo-item">
          <div>
            <input
              type="checkbox"
              :checked="todo.done"
              @change="toggleTodo(todo.id)"
            >
            <span :class="{ 'done': todo.done }" x-text="todo.text"></span>
          </div>
          <button @click="removeTodo(todo.id)" style="background: #dc3545;">Delete</button>
        </div>
      </template>
    </div>

    <!-- Clear Completed -->
    <button
      @click="clearCompleted()"
      x-show="completedTodos > 0"
      style="margin-top: 20px; background: #6c757d;"
    >
      Clear Completed
    </button>
  </div>

  <script>
    function todoApp() {
      return {
        todos: JSON.parse(localStorage.getItem('todos') || '[]'),
        newTodo: '',
        filter: 'all',

        addTodo() {
          if (this.newTodo.trim()) {
            this.todos.push({
              id: Date.now(),
              text: this.newTodo.trim(),
              done: false
            });
            this.newTodo = '';
            this.saveTodos();
          }
        },

        removeTodo(id) {
          this.todos = this.todos.filter(t => t.id !== id);
          this.saveTodos();
        },

        toggleTodo(id) {
          const todo = this.todos.find(t => t.id === id);
          if (todo) todo.done = !todo.done;
          this.saveTodos();
        },

        clearCompleted() {
          this.todos = this.todos.filter(t => !t.done);
          this.saveTodos();
        },

        saveTodos() {
          localStorage.setItem('todos', JSON.stringify(this.todos));
        },

        get filteredTodos() {
          if (this.filter === 'active') return this.todos.filter(t => !t.done);
          if (this.filter === 'completed') return this.todos.filter(t => t.done);
          return this.todos;
        },

        get activeTodos() {
          return this.todos.filter(t => !t.done).length;
        },

        get completedTodos() {
          return this.todos.filter(t => t.done).length;
        }
      }
    }
  </script>
</body>
</html>
```

### Complete Todo App: Preact + HTM

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Preact Todo App</title>
  <script type="importmap">
  {
    "imports": {
      "preact": "https://esm.sh/preact@10.23.1",
      "preact/hooks": "https://esm.sh/preact@10.23.1/hooks",
      "htm/preact": "https://esm.sh/htm@3.1.1/preact?external=preact"
    }
  }
  </script>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
    input[type="text"] { padding: 10px; width: 70%; border: 1px solid #ddd; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    .todo-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
    .done { text-decoration: line-through; opacity: 0.6; }
    .filters button { margin: 5px; padding: 5px 10px; background: #f0f0f0; color: #333; }
    .filters button.active { background: #007bff; color: white; }
  </style>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import { render } from 'preact';
    import { useState, useEffect } from 'preact/hooks';
    import { html } from 'htm/preact';

    function TodoApp() {
      const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
      });
      const [newTodo, setNewTodo] = useState('');
      const [filter, setFilter] = useState('all');

      // Persist to localStorage
      useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
      }, [todos]);

      const addTodo = () => {
        if (newTodo.trim()) {
          setTodos([...todos, {
            id: Date.now(),
            text: newTodo.trim(),
            done: false
          }]);
          setNewTodo('');
        }
      };

      const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        ));
      };

      const removeTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
      };

      const clearCompleted = () => {
        setTodos(todos.filter(t => !t.done));
      };

      const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.done;
        if (filter === 'completed') return todo.done;
        return true;
      });

      const activeTodos = todos.filter(t => !t.done).length;
      const completedTodos = todos.filter(t => t.done).length;

      return html`
        <div>
          <h1>Todo App</h1>

          <!-- Add Todo -->
          <div>
            <input
              type="text"
              value=${newTodo}
              onInput=${(e) => setNewTodo(e.target.value)}
              onKeyUp=${(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
            />
            <button onClick=${addTodo}>Add</button>
          </div>

          <!-- Filters -->
          <div class="filters" style="margin: 20px 0;">
            <button
              onClick=${() => setFilter('all')}
              class=${filter === 'all' ? 'active' : ''}
            >All</button>
            <button
              onClick=${() => setFilter('active')}
              class=${filter === 'active' ? 'active' : ''}
            >Active</button>
            <button
              onClick=${() => setFilter('completed')}
              class=${filter === 'completed' ? 'active' : ''}
            >Completed</button>
          </div>

          <!-- Stats -->
          <p>
            ${filteredTodos.length} items
            (${activeTodos} active, ${completedTodos} completed)
          </p>

          <!-- Todo List -->
          <div>
            ${filteredTodos.map(todo => html`
              <div key=${todo.id} class="todo-item">
                <div>
                  <input
                    type="checkbox"
                    checked=${todo.done}
                    onChange=${() => toggleTodo(todo.id)}
                  />
                  <span class=${todo.done ? 'done' : ''}>${todo.text}</span>
                </div>
                <button
                  onClick=${() => removeTodo(todo.id)}
                  style="background: #dc3545;"
                >Delete</button>
              </div>
            `)}
          </div>

          <!-- Clear Completed -->
          ${completedTodos > 0 && html`
            <button
              onClick=${clearCompleted}
              style="margin-top: 20px; background: #6c757d;"
            >
              Clear Completed
            </button>
          `}
        </div>
      `;
    }

    render(html`<${TodoApp} />`, document.getElementById('app'));
  </script>
</body>
</html>
```

### Complete Todo App: Hyperapp

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hyperapp Todo</title>
  <script type="module">
    import { app, h, text } from "https://unpkg.com/hyperapp";

    // Load from localStorage
    const loadTodos = () => {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    };

    // Initial state
    const init = {
      todos: loadTodos(),
      newTodo: '',
      filter: 'all'
    };

    // Actions
    const SetNewTodo = (state, value) => ({ ...state, newTodo: value });

    const AddTodo = (state) => {
      if (!state.newTodo.trim()) return state;

      const newState = {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: state.newTodo.trim(),
          done: false
        }],
        newTodo: ''
      };
      localStorage.setItem('todos', JSON.stringify(newState.todos));
      return newState;
    };

    const ToggleTodo = (state, id) => {
      const newState = {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      };
      localStorage.setItem('todos', JSON.stringify(newState.todos));
      return newState;
    };

    const RemoveTodo = (state, id) => {
      const newState = {
        ...state,
        todos: state.todos.filter(t => t.id !== id)
      };
      localStorage.setItem('todos', JSON.stringify(newState.todos));
      return newState;
    };

    const SetFilter = (state, filter) => ({ ...state, filter });

    const ClearCompleted = (state) => {
      const newState = {
        ...state,
        todos: state.todos.filter(t => !t.done)
      };
      localStorage.setItem('todos', JSON.stringify(newState.todos));
      return newState;
    };

    // View
    const view = (state) => {
      const filteredTodos = state.todos.filter(todo => {
        if (state.filter === 'active') return !todo.done;
        if (state.filter === 'completed') return todo.done;
        return true;
      });

      const activeTodos = state.todos.filter(t => !t.done).length;
      const completedTodos = state.todos.filter(t => t.done).length;

      return h('div', { style: { fontFamily: 'system-ui', maxWidth: '600px', margin: '50px auto', padding: '20px' } }, [
        h('h1', {}, text('Todo App')),

        // Add todo
        h('div', {}, [
          h('input', {
            type: 'text',
            value: state.newTodo,
            oninput: (state, event) => SetNewTodo(state, event.target.value),
            onkeyup: (state, event) => event.key === 'Enter' ? AddTodo(state) : state,
            placeholder: 'What needs to be done?',
            style: { padding: '10px', width: '70%', border: '1px solid #ddd' }
          }),
          h('button', {
            onclick: AddTodo,
            style: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }
          }, text('Add'))
        ]),

        // Filters
        h('div', { style: { margin: '20px 0' } }, [
          h('button', {
            onclick: (state) => SetFilter(state, 'all'),
            style: {
              margin: '5px', padding: '5px 10px',
              background: state.filter === 'all' ? '#007bff' : '#f0f0f0',
              color: state.filter === 'all' ? 'white' : '#333',
              border: 'none', cursor: 'pointer'
            }
          }, text('All')),
          h('button', {
            onclick: (state) => SetFilter(state, 'active'),
            style: {
              margin: '5px', padding: '5px 10px',
              background: state.filter === 'active' ? '#007bff' : '#f0f0f0',
              color: state.filter === 'active' ? 'white' : '#333',
              border: 'none', cursor: 'pointer'
            }
          }, text('Active')),
          h('button', {
            onclick: (state) => SetFilter(state, 'completed'),
            style: {
              margin: '5px', padding: '5px 10px',
              background: state.filter === 'completed' ? '#007bff' : '#f0f0f0',
              color: state.filter === 'completed' ? 'white' : '#333',
              border: 'none', cursor: 'pointer'
            }
          }, text('Completed'))
        ]),

        // Stats
        h('p', {}, text(`${filteredTodos.length} items (${activeTodos} active, ${completedTodos} completed)`)),

        // Todo list
        h('div', {}, filteredTodos.map(todo =>
          h('div', {
            key: todo.id,
            style: { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }
          }, [
            h('div', {}, [
              h('input', {
                type: 'checkbox',
                checked: todo.done,
                onchange: (state) => ToggleTodo(state, todo.id)
              }),
              h('span', {
                style: { textDecoration: todo.done ? 'line-through' : 'none', opacity: todo.done ? 0.6 : 1 }
              }, text(todo.text))
            ]),
            h('button', {
              onclick: (state) => RemoveTodo(state, todo.id),
              style: { padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }
            }, text('Delete'))
          ])
        )),

        // Clear completed
        completedTodos > 0 && h('button', {
          onclick: ClearCompleted,
          style: { marginTop: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }
        }, text('Clear Completed'))
      ]);
    };

    app({ init, view, node: document.body });
  </script>
</head>
<body></body>
</html>
```

### Complete Todo App: Vanilla JavaScript (No Framework)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vanilla JS Todo</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
    input[type="text"] { padding: 10px; width: 70%; border: 1px solid #ddd; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    .todo-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
    .done { text-decoration: line-through; opacity: 0.6; }
    .filters button { margin: 5px; padding: 5px 10px; background: #f0f0f0; color: #333; }
    .filters button.active { background: #007bff; color: white; }
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const createStore = (initialState) => {
      let state = initialState;
      const listeners = [];

      return {
        getState: () => state,
        setState: (updates) => {
          state = { ...state, ...updates };
          listeners.forEach(fn => fn(state));
        },
        subscribe: (fn) => listeners.push(fn)
      };
    };

    const store = createStore({
      todos: JSON.parse(localStorage.getItem('todos') || '[]'),
      newTodo: '',
      filter: 'all'
    });

    // ============================================
    // ACTIONS
    // ============================================
    const actions = {
      setNewTodo(text) {
        store.setState({ newTodo: text });
      },

      addTodo() {
        const { newTodo, todos } = store.getState();
        if (!newTodo.trim()) return;

        const updatedTodos = [...todos, {
          id: Date.now(),
          text: newTodo.trim(),
          done: false
        }];

        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        store.setState({ todos: updatedTodos, newTodo: '' });
      },

      toggleTodo(id) {
        const { todos } = store.getState();
        const updatedTodos = todos.map(todo =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        );
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        store.setState({ todos: updatedTodos });
      },

      removeTodo(id) {
        const { todos } = store.getState();
        const updatedTodos = todos.filter(t => t.id !== id);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        store.setState({ todos: updatedTodos });
      },

      setFilter(filter) {
        store.setState({ filter });
      },

      clearCompleted() {
        const { todos } = store.getState();
        const updatedTodos = todos.filter(t => !t.done);
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
        store.setState({ todos: updatedTodos });
      }
    };

    // ============================================
    // VIEW
    // ============================================
    const render = (state) => {
      const filteredTodos = state.todos.filter(todo => {
        if (state.filter === 'active') return !todo.done;
        if (state.filter === 'completed') return todo.done;
        return true;
      });

      const activeTodos = state.todos.filter(t => !t.done).length;
      const completedTodos = state.todos.filter(t => t.done).length;

      document.getElementById('app').innerHTML = `
        <h1>Todo App</h1>

        <!-- Add Todo -->
        <div>
          <input
            type="text"
            id="newTodo"
            value="${state.newTodo}"
            placeholder="What needs to be done?"
          />
          <button id="addBtn">Add</button>
        </div>

        <!-- Filters -->
        <div class="filters" style="margin: 20px 0;">
          <button class="${state.filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button class="${state.filter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
          <button class="${state.filter === 'completed' ? 'active' : ''}" data-filter="completed">Completed</button>
        </div>

        <!-- Stats -->
        <p>
          ${filteredTodos.length} items
          (${activeTodos} active, ${completedTodos} completed)
        </p>

        <!-- Todo List -->
        <div>
          ${filteredTodos.map(todo => `
            <div class="todo-item">
              <div>
                <input
                  type="checkbox"
                  ${todo.done ? 'checked' : ''}
                  data-toggle="${todo.id}"
                />
                <span class="${todo.done ? 'done' : ''}">${todo.text}</span>
              </div>
              <button data-remove="${todo.id}" style="background: #dc3545;">Delete</button>
            </div>
          `).join('')}
        </div>

        <!-- Clear Completed -->
        ${completedTodos > 0 ? `
          <button id="clearBtn" style="margin-top: 20px; background: #6c757d;">
            Clear Completed
          </button>
        ` : ''}
      `;

      attachEventListeners();
    };

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const attachEventListeners = () => {
      const newTodoInput = document.getElementById('newTodo');
      newTodoInput.addEventListener('input', (e) => actions.setNewTodo(e.target.value));
      newTodoInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') actions.addTodo();
      });

      document.getElementById('addBtn').addEventListener('click', actions.addTodo);

      document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => actions.setFilter(btn.dataset.filter));
      });

      document.querySelectorAll('[data-toggle]').forEach(checkbox => {
        checkbox.addEventListener('change', () => actions.toggleTodo(Number(checkbox.dataset.toggle)));
      });

      document.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => actions.removeTodo(Number(btn.dataset.remove)));
      });

      const clearBtn = document.getElementById('clearBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', actions.clearCompleted);
      }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    store.subscribe(render);
    render(store.getState());
  </script>
</body>
</html>
```

---

## Resources & Documentation

### Framework Documentation

#### Alpine.js
- **Official Site**: https://alpinejs.dev/
- **GitHub**: https://github.com/alpinejs/alpine
- **Getting Started**: https://alpinejs.dev/start-here
- **Store Documentation**: https://alpinejs.dev/globals/alpine-store
- **Examples**: https://www.alpinetoolbox.com/

#### Preact
- **Official Site**: https://preactjs.com/
- **GitHub**: https://github.com/preactjs/preact
- **No-Build Workflows**: https://preactjs.com/guide/v10/no-build-workflows/
- **HTM Documentation**: https://github.com/developit/htm
- **Standalone Bundle**: https://unpkg.com/htm/preact/standalone.module.js

#### Hyperapp
- **Official Site**: https://hyperapp.dev/
- **GitHub**: https://github.com/jorgebucaran/hyperapp
- **Tutorial**: https://github.com/jorgebucaran/hyperapp/blob/main/docs/tutorial.md
- **Examples**: https://github.com/jorgebucaran/hyperapp/tree/main/examples
- **Hyperawesome (community resources)**: https://github.com/jorgebucaran/hyperawesome

#### Lit / lit-html
- **Official Site**: https://lit.dev/
- **GitHub**: https://github.com/lit/lit
- **Getting Started**: https://lit.dev/docs/
- **Playground**: https://lit.dev/playground/
- **Google Codelabs**: https://codelabs.developers.google.com/codelabs/the-lit-path

#### Solid.js
- **Official Site**: https://www.solidjs.com/
- **GitHub**: https://github.com/solidjs/solid
- **Tutorial**: https://www.solidjs.com/tutorial
- **Playground**: https://playground.solidjs.com/
- **Docs**: https://www.solidjs.com/docs/latest

#### Petite Vue
- **GitHub**: https://github.com/vuejs/petite-vue
- **Documentation**: https://github.com/vuejs/petite-vue#readme
- **Examples**: https://github.com/vuejs/petite-vue/tree/main/examples

### CDN Services

#### esm.sh
- **URL**: https://esm.sh/
- **GitHub**: https://github.com/esm-dev/esm.sh
- **Usage**: `https://esm.sh/package@version`

#### Skypack
- **URL**: https://www.skypack.dev/
- **Docs**: https://docs.skypack.dev/
- **Usage**: `https://cdn.skypack.dev/package@version`

#### jsDelivr
- **URL**: https://www.jsdelivr.com/
- **Docs**: https://www.jsdelivr.com/documentation
- **Usage**: `https://cdn.jsdelivr.net/npm/package@version`

#### unpkg
- **URL**: https://unpkg.com/
- **Usage**: `https://unpkg.com/package@version`

### Tools & Resources

#### Bundle Size Analysis
- **Bundlephobia**: https://bundlephobia.com/
- **Bundle Size Checker**: https://www.bundle-buddy.com/
- **Import Cost (VS Code extension)**: Check bundle sizes inline

#### Image Optimization
- **Squoosh**: https://squoosh.app/ (browser-based)
- **TinyPNG**: https://tinypng.com/
- **ImageOptim**: https://imageoptim.com/ (Mac)
- **SVGOMG**: https://jakearchibald.github.io/svgomg/ (SVG optimizer)

#### Performance Testing
- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/

#### Learning Resources
- **MDN Web Docs (ES Modules)**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Import Maps Spec**: https://github.com/WICG/import-maps
- **Web.dev (Performance)**: https://web.dev/fast/
- **JavaScript Framework Benchmark**: https://krausest.github.io/js-framework-benchmark/

### Community & Comparisons

- **Best of JS**: https://bestofjs.org/ (framework comparisons)
- **State of JS**: https://stateofjs.com/ (annual developer survey)
- **LogRocket Blog**: https://blog.logrocket.com/ (framework comparisons)
- **CSS-Tricks**: https://css-tricks.com/ (tutorials and guides)

### Articles & Guides

1. **"Building a TODO app without a bundler"** - DEV Community
   https://dev.to/ekeijl/no-build-todo-app-using-htm-preact-209p

2. **"ES Modules in browsers with import-maps"** - LogRocket
   https://blog.logrocket.com/es-modules-in-browsers-with-import-maps/

3. **"Tree Shaking: A Reference Guide"** - Smashing Magazine
   https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/

4. **"JavaScript Modules in 2025: ESM, Import Maps & Best Practices"** - Medium
   https://siddsr0015.medium.com/javascript-modules-in-2025-esm-import-maps-best-practices-7b6996fa8ea3

5. **"Implementing single-file Web Components"** - CKEditor
   https://ckeditor.com/blog/implementing-single-file-web-components/

---

## Conclusion

The landscape of lightweight JavaScript frameworks in 2025 offers excellent options for building modular single-file web applications under 1MB. Key takeaways:

### When to Use What

- **Alpine.js**: Best for progressive enhancement and HTML-first development
- **Preact + HTM**: Best for React-like development without build tools
- **Hyperapp**: Best when every kilobyte counts
- **Lit**: Best for reusable, framework-agnostic components
- **Solid.js**: Best for maximum performance (when build step is acceptable)

### Zero-Build is Viable in 2025

With ES Modules and Import Maps now supported in all modern browsers, zero-build workflows are production-ready. This is ideal for:
- Rapid prototyping
- Educational projects
- Embedded widgets
- Simple to medium complexity apps

### The 1MB Budget is Achievable

By combining:
- Lightweight frameworks (< 20KB)
- Aggressive image optimization (WebP/AVIF)
- Code minification and compression (Brotli)
- Lazy loading and code splitting
- Minimal dependencies

You can build feature-rich applications well under 1MB total size.

### Best Practices Summary

1. Start with a performance budget
2. Choose the lightest framework that meets your needs
3. Use ES Modules + Import Maps for zero-build
4. Optimize images aggressively (50%+ of typical bundle)
5. Enable Brotli compression on your server
6. Lazy load non-critical resources
7. Use tree shaking if you have a build step
8. Monitor bundle size continuously

---

*This document is a comprehensive guide to lightweight web development in 2025. Bookmark it, share it, and build amazing things with minimal overhead!*
