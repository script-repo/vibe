# Code Snippets Library

Ready-to-use code snippets for single-file web applications. All snippets are production-ready, well-documented, and optimized for minimal file size.

---

## Available Snippets

### Architecture Patterns

#### **observable-store.js**
Minimal reactive state management in ~20 lines.
- Subscribe/notify pattern
- Immutable state updates
- LocalStorage persistence
- Computed values support

**Use when:** You need reactive state without frameworks like Redux

---

#### **plugin-registry.js**
WordPress-level plugin system for extensible apps.
- Plugin validation and registration
- Priority-based loading
- Lifecycle hooks (init, enable, disable, destroy)
- Dependency injection

**Use when:** Building extensible applications with plugin support

---

#### **hook-system.js**
Actions and Filters pattern (WordPress-style).
- Actions: Execute code at specific points
- Filters: Transform data through chains
- Priority-based execution
- Safe error handling

**Use when:** You want plugins to modify app behavior without tight coupling

---

### UI & Styling

#### **glassmorphism.css**
Modern frosted glass effects using backdrop-filter.
- Multiple intensity levels
- Color tinted variants
- Component styles (cards, buttons, inputs)
- Hover effects
- Dark mode support

**Use when:** Creating premium, modern UI elements

---

### Network & API (Coming Soon)

These snippets will be added soon:

- `streaming-chat.js` - SSE/streaming for LLM APIs
- `rag-system.js` - Complete RAG pipeline
- `circuit-breaker.js` - Fault tolerance pattern
- `http-interceptors.js` - Request/response middleware
- `websocket-reconnect.js` - WebSocket with auto-reconnect

---

### Graphics & Animation (Coming Soon)

- `particle-system.js` - Canvas particle system
- `noise-functions.js` - Perlin/Simplex noise
- `shader-library.glsl` - Common GLSL shaders

---

## Usage

### 1. Copy-Paste
Simply copy the snippet into your HTML file:

```html
<script>
  // Paste snippet code here
  const store = new Store({ count: 0 });
</script>
```

### 2. ES Module Import
If using modules:

```javascript
import { Store } from './snippets/observable-store.js';
const store = new Store({ count: 0 });
```

### 3. Inline in HTML
For single-file apps:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Paste CSS snippets here */
    @import url('./snippets/glassmorphism.css');
  </style>
</head>
<body>
  <script>
    // Paste JS snippets here
  </script>
</body>
</html>
```

---

## Snippet Guidelines

All snippets follow these principles:

✅ **Self-contained** - No external dependencies
✅ **Well-documented** - Inline comments and examples
✅ **Size-optimized** - Minimal code, maximum value
✅ **Production-ready** - Error handling and edge cases
✅ **Browser-compatible** - Works in modern browsers
✅ **Copy-paste friendly** - Just works out of the box

---

## File Size Reference

| Snippet | Size | Minified | Gzipped |
|---------|------|----------|---------|
| observable-store.js | ~4KB | ~2KB | ~1KB |
| plugin-registry.js | ~6KB | ~3KB | ~1.5KB |
| hook-system.js | ~8KB | ~4KB | ~2KB |
| glassmorphism.css | ~6KB | ~4KB | ~1.5KB |

*All snippets are designed to be extremely small when minified and gzipped.*

---

## Contributing

To add a new snippet:

1. Create a well-documented file
2. Include usage examples
3. Keep it under 10KB
4. Test in modern browsers
5. Follow the existing style
6. Update this README

---

## Integration with Learning Paths

These snippets are referenced in the learning paths:

- **Web Fundamentals:** glassmorphism.css, observable-store.js
- **3D Graphics:** noise-functions.js, shader-library.glsl
- **AI Integration:** streaming-chat.js, rag-system.js
- **Architecture:** All architecture patterns

See [../paths/](../paths/) for complete learning guides.

---

## Quick Reference

### Most Used Snippets

**For state management:**
```javascript
// observable-store.js
const store = new Store({ count: 0 });
store.subscribe(state => updateUI(state));
store.setState({ count: 1 });
```

**For plugins:**
```javascript
// plugin-registry.js + hook-system.js
const registry = new PluginRegistry();
const hooks = new HookSystem();

registry.register('myPlugin', {
  init: () => {
    hooks.addAction('save', () => console.log('Saving...'));
  }
});
```

**For UI:**
```html
<!-- glassmorphism.css -->
<div class="glass-card">Beautiful glass effect</div>
```

---

## License

All snippets are provided for educational and commercial use. Feel free to use them in your projects without attribution (though it's appreciated!).

---

## Need Help?

- Check the inline comments in each snippet
- See usage examples at the end of each file
- Refer to the [learning paths](../paths/) for context
- Review the [reference documentation](../reference/)

---

**Pro Tip:** Start with observable-store.js and glassmorphism.css - they provide the most value with the least code!
