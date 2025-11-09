# Intelligent UI Components for Single-File Web Apps

> A comprehensive guide to building lightweight, reusable UI components under 1MB

## Table of Contents

1. [Lightweight Component Libraries](#lightweight-component-libraries)
2. [Web Components and Custom Elements](#web-components-and-custom-elements)
3. [Headless UI Patterns](#headless-ui-patterns)
4. [Accessible UI Components](#accessible-ui-components)
5. [Responsive Design Patterns](#responsive-design-patterns)
6. [Form Components and Validation](#form-components-and-validation)
7. [Modal, Dropdown, and Tooltip Patterns](#modal-dropdown-and-tooltip-patterns)
8. [Data Visualization Components](#data-visualization-components)
9. [Interactive UI Patterns](#interactive-ui-patterns)
10. [CSS-Only vs JavaScript-Enhanced](#css-only-vs-javascript-enhanced)

---

## Lightweight Component Libraries

### DaisyUI Concepts (CSS-Only Utility Classes)

DaisyUI's approach uses semantic class names built on Tailwind CSS principles. You can implement similar patterns without frameworks:

```html
<style>
  /* Button Base */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    font-weight: 600;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  /* Button Variants */
  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-ghost {
    background: transparent;
    color: #374151;
  }

  .btn-ghost:hover {
    background: #f3f4f6;
  }

  /* Button Sizes */
  .btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  /* Card Component */
  .card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  /* Badge Component */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
  }

  .badge-success {
    background: #10b981;
    color: white;
  }

  .badge-warning {
    background: #f59e0b;
    color: white;
  }

  .badge-error {
    background: #ef4444;
    color: white;
  }
</style>

<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary btn-lg">Large Secondary</button>
<button class="btn btn-ghost btn-sm">Small Ghost</button>

<div class="card">
  <div class="card-body">
    <h2 class="card-title">Card Title <span class="badge badge-success">New</span></h2>
    <p>Card content goes here</p>
  </div>
</div>
```

### Custom Micro-Libraries (< 5KB)

Building your own component system:

```javascript
// Minimal Component System (~2KB)
const UI = {
  // Create reusable component factory
  component(name, template, styles) {
    const styleId = `style-${name}`;

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = styles;
      document.head.appendChild(style);
    }

    return (props = {}) => {
      const element = document.createElement('div');
      element.innerHTML = typeof template === 'function'
        ? template(props)
        : template;
      return element.firstElementChild;
    };
  },

  // State management for components
  state(initialState) {
    let state = initialState;
    const listeners = new Set();

    return {
      get() { return state; },
      set(newState) {
        state = typeof newState === 'function' ? newState(state) : newState;
        listeners.forEach(fn => fn(state));
      },
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      }
    };
  },

  // Event delegation helper
  on(selector, event, handler) {
    document.addEventListener(event, e => {
      if (e.target.matches(selector)) {
        handler(e);
      }
    });
  }
};

// Usage Example
const Button = UI.component('button',
  ({ text, variant = 'primary', onClick }) => `
    <button class="ui-btn ui-btn-${variant}" data-onclick="${onClick}">
      ${text}
    </button>
  `,
  `
    .ui-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
    }
    .ui-btn-primary {
      background: #3b82f6;
      color: white;
    }
    .ui-btn-secondary {
      background: #6b7280;
      color: white;
    }
  `
);

// Create and append button
const btn = Button({ text: 'Click Me', variant: 'primary' });
document.body.appendChild(btn);
```

---

## Web Components and Custom Elements

### Basic Custom Element

```javascript
class SmartButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['variant', 'size', 'disabled'];
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('button')
      .addEventListener('click', () => this.handleClick());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  handleClick() {
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent('smart-click', {
        bubbles: true,
        composed: true,
        detail: { variant: this.variant }
      }));
    }
  }

  get variant() {
    return this.getAttribute('variant') || 'primary';
  }

  get size() {
    return this.getAttribute('size') || 'md';
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        button {
          padding: var(--btn-padding, 0.5rem 1rem);
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: var(--btn-font-size, 1rem);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .primary {
          background: #3b82f6;
          color: white;
        }
        .primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .secondary {
          background: #6b7280;
          color: white;
        }
        .secondary:hover:not(:disabled) {
          background: #4b5563;
        }
        .sm {
          --btn-padding: 0.25rem 0.75rem;
          --btn-font-size: 0.875rem;
        }
        .lg {
          --btn-padding: 0.75rem 1.5rem;
          --btn-font-size: 1.125rem;
        }
      </style>
      <button
        class="${this.variant} ${this.size}"
        ${this.disabled ? 'disabled' : ''}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('smart-button', SmartButton);
```

```html
<!-- Usage -->
<smart-button variant="primary" size="lg">Click Me</smart-button>
<smart-button variant="secondary" disabled>Disabled</smart-button>

<script>
  document.querySelector('smart-button').addEventListener('smart-click', (e) => {
    console.log('Button clicked:', e.detail);
  });
</script>
```

### Advanced: Tabs Component

```javascript
class TabsComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.activeTab = 0;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.shadowRoot.querySelectorAll('[role="tab"]').forEach((tab, index) => {
      tab.addEventListener('click', () => this.selectTab(index));
      tab.addEventListener('keydown', (e) => this.handleKeyboard(e, index));
    });
  }

  handleKeyboard(e, currentIndex) {
    const tabs = this.shadowRoot.querySelectorAll('[role="tab"]');
    let newIndex = currentIndex;

    switch(e.key) {
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    this.selectTab(newIndex);
    tabs[newIndex].focus();
  }

  selectTab(index) {
    this.activeTab = index;
    this.render();
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { index }
    }));
  }

  render() {
    const tabs = Array.from(this.querySelectorAll('[slot^="tab-"]'));
    const panels = Array.from(this.querySelectorAll('[slot^="panel-"]'));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .tabs {
          display: flex;
          border-bottom: 2px solid #e5e7eb;
          gap: 0.5rem;
        }
        [role="tab"] {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          color: #6b7280;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        [role="tab"]:hover {
          color: #374151;
        }
        [role="tab"][aria-selected="true"] {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }
        [role="tab"]:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        [role="tabpanel"] {
          padding: 1.5rem 0;
        }
        [role="tabpanel"][hidden] {
          display: none;
        }
      </style>
      <div role="tablist" class="tabs">
        ${tabs.map((tab, i) => `
          <button
            role="tab"
            aria-selected="${i === this.activeTab}"
            aria-controls="panel-${i}"
            id="tab-${i}"
            tabindex="${i === this.activeTab ? '0' : '-1'}"
          >
            <slot name="tab-${i}"></slot>
          </button>
        `).join('')}
      </div>
      ${panels.map((panel, i) => `
        <div
          role="tabpanel"
          id="panel-${i}"
          aria-labelledby="tab-${i}"
          ${i !== this.activeTab ? 'hidden' : ''}
        >
          <slot name="panel-${i}"></slot>
        </div>
      `).join('')}
    `;

    this.setupEventListeners();
  }
}

customElements.define('tabs-component', TabsComponent);
```

```html
<!-- Usage -->
<tabs-component>
  <span slot="tab-0">Profile</span>
  <span slot="tab-1">Settings</span>
  <span slot="tab-2">Notifications</span>

  <div slot="panel-0">Profile content here</div>
  <div slot="panel-1">Settings content here</div>
  <div slot="panel-2">Notifications content here</div>
</tabs-component>
```

---

## Headless UI Patterns

Headless components provide logic and accessibility without styling, giving you full control over presentation.

### Headless Dropdown Controller

```javascript
class HeadlessDropdown {
  constructor(options = {}) {
    this.trigger = options.trigger;
    this.menu = options.menu;
    this.items = options.items || [];
    this.isOpen = false;
    this.activeIndex = -1;

    this.init();
  }

  init() {
    // Setup ARIA attributes
    const menuId = `menu-${Math.random().toString(36).substr(2, 9)}`;
    this.menu.id = menuId;
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-controls', menuId);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('role', 'menu');

    this.items.forEach(item => {
      item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
    });

    // Event listeners
    this.trigger.addEventListener('click', () => this.toggle());
    this.trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));
    this.menu.addEventListener('keydown', (e) => this.handleMenuKeydown(e));

    this.items.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.handleSelect(index);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.menu.removeAttribute('hidden');
    this.activeIndex = 0;
    this.items[0]?.focus();
  }

  close() {
    this.isOpen = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('hidden', '');
    this.activeIndex = -1;
    this.trigger.focus();
  }

  handleTriggerKeydown(e) {
    switch(e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        this.open();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.open();
        this.activeIndex = this.items.length - 1;
        this.items[this.activeIndex]?.focus();
        break;
    }
  }

  handleMenuKeydown(e) {
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % this.items.length;
        this.items[this.activeIndex]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
        this.items[this.activeIndex]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        this.activeIndex = 0;
        this.items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        this.activeIndex = this.items.length - 1;
        this.items[this.activeIndex]?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleSelect(this.activeIndex);
        break;
    }
  }

  handleSelect(index) {
    const item = this.items[index];
    const value = item.getAttribute('data-value');

    // Dispatch custom event
    this.trigger.dispatchEvent(new CustomEvent('select', {
      detail: { value, index, item }
    }));

    this.close();
  }
}
```

```html
<!-- Usage -->
<div class="dropdown-container">
  <button id="dropdown-trigger" class="btn">
    Select Option
  </button>
  <ul id="dropdown-menu" hidden>
    <li class="dropdown-item" data-value="option1">Option 1</li>
    <li class="dropdown-item" data-value="option2">Option 2</li>
    <li class="dropdown-item" data-value="option3">Option 3</li>
  </ul>
</div>

<script>
  const dropdown = new HeadlessDropdown({
    trigger: document.getElementById('dropdown-trigger'),
    menu: document.getElementById('dropdown-menu'),
    items: Array.from(document.querySelectorAll('.dropdown-item'))
  });

  document.getElementById('dropdown-trigger').addEventListener('select', (e) => {
    console.log('Selected:', e.detail.value);
    e.target.textContent = e.detail.item.textContent;
  });
</script>
```

### Headless Dialog/Modal Controller

```javascript
class HeadlessDialog {
  constructor(options = {}) {
    this.dialog = options.dialog;
    this.trigger = options.trigger;
    this.closeButtons = options.closeButtons || [];
    this.isOpen = false;
    this.previousActiveElement = null;

    this.init();
  }

  init() {
    // Setup ARIA
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('aria-modal', 'true');
    this.dialog.setAttribute('hidden', '');

    if (this.trigger) {
      const dialogId = `dialog-${Math.random().toString(36).substr(2, 9)}`;
      this.dialog.id = dialogId;
      this.trigger.setAttribute('aria-haspopup', 'dialog');
      this.trigger.setAttribute('aria-controls', dialogId);
      this.trigger.addEventListener('click', () => this.open());
    }

    // Close buttons
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // ESC key
    this.dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });

    // Trap focus
    this.dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.trapFocus(e);
      }
    });
  }

  open() {
    this.isOpen = true;
    this.previousActiveElement = document.activeElement;
    this.dialog.removeAttribute('hidden');

    // Focus first focusable element
    const focusable = this.getFocusableElements();
    focusable[0]?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    this.dialog.dispatchEvent(new CustomEvent('dialog-open'));
  }

  close() {
    this.isOpen = false;
    this.dialog.setAttribute('hidden', '');

    // Restore focus
    this.previousActiveElement?.focus();

    // Restore body scroll
    document.body.style.overflow = '';

    this.dialog.dispatchEvent(new CustomEvent('dialog-close'));
  }

  getFocusableElements() {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(this.dialog.querySelectorAll(selector))
      .filter(el => !el.disabled && el.offsetParent !== null);
  }

  trapFocus(e) {
    const focusable = this.getFocusableElements();
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
}
```

---

## Accessible UI Components

### ARIA Best Practices

```javascript
// Accessible Toggle Button
class ToggleButton {
  constructor(element) {
    this.element = element;
    this.pressed = element.getAttribute('aria-pressed') === 'true';

    element.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.pressed = !this.pressed;
    this.element.setAttribute('aria-pressed', this.pressed);
    this.element.dispatchEvent(new CustomEvent('toggle', {
      detail: { pressed: this.pressed }
    }));
  }
}

// Accessible Accordion
class AccessibleAccordion {
  constructor(container) {
    this.container = container;
    this.headers = container.querySelectorAll('[data-accordion-header]');
    this.panels = container.querySelectorAll('[data-accordion-panel]');

    this.init();
  }

  init() {
    this.headers.forEach((header, index) => {
      const button = header.querySelector('button') || header;
      const panel = this.panels[index];

      // Setup IDs
      const headerId = `accordion-header-${index}`;
      const panelId = `accordion-panel-${index}`;

      button.id = headerId;
      panel.id = panelId;

      // Setup ARIA
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', panelId);
      panel.setAttribute('aria-labelledby', headerId);
      panel.setAttribute('role', 'region');
      panel.setAttribute('hidden', '');

      // Event listeners
      button.addEventListener('click', () => this.toggle(index));
      button.addEventListener('keydown', (e) => this.handleKeyboard(e, index));
    });
  }

  toggle(index) {
    const button = this.headers[index].querySelector('button') || this.headers[index];
    const panel = this.panels[index];
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', !isExpanded);

    if (isExpanded) {
      panel.setAttribute('hidden', '');
    } else {
      panel.removeAttribute('hidden');
    }
  }

  handleKeyboard(e, currentIndex) {
    let newIndex;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (currentIndex + 1) % this.headers.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = (currentIndex - 1 + this.headers.length) % this.headers.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = this.headers.length - 1;
        break;
      default:
        return;
    }

    const nextButton = this.headers[newIndex].querySelector('button') || this.headers[newIndex];
    nextButton.focus();
  }
}
```

```html
<!-- Accessible Accordion HTML -->
<div id="accordion" class="accordion">
  <div data-accordion-header>
    <button>Section 1</button>
  </div>
  <div data-accordion-panel>
    <p>Content for section 1</p>
  </div>

  <div data-accordion-header>
    <button>Section 2</button>
  </div>
  <div data-accordion-panel>
    <p>Content for section 2</p>
  </div>
</div>

<script>
  new AccessibleAccordion(document.getElementById('accordion'));
</script>
```

### Keyboard Navigation Utilities

```javascript
const KeyboardNav = {
  // Roving tabindex for widget navigation
  rovingTabindex(container, selector) {
    const items = Array.from(container.querySelectorAll(selector));
    let currentIndex = 0;

    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;

      item.addEventListener('keydown', (e) => {
        let newIndex = currentIndex;

        switch(e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            newIndex = (currentIndex + 1) % items.length;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            newIndex = (currentIndex - 1 + items.length) % items.length;
            break;
          case 'Home':
            newIndex = 0;
            break;
          case 'End':
            newIndex = items.length - 1;
            break;
          default:
            return;
        }

        e.preventDefault();
        items[currentIndex].tabIndex = -1;
        items[newIndex].tabIndex = 0;
        items[newIndex].focus();
        currentIndex = newIndex;
      });

      item.addEventListener('focus', () => {
        currentIndex = index;
      });
    });
  },

  // Skip links for accessibility
  createSkipLink(targetId, text = 'Skip to main content') {
    const link = document.createElement('a');
    link.href = `#${targetId}`;
    link.className = 'skip-link';
    link.textContent = text;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView();
    });
    return link;
  },

  // Focus trap utility
  trapFocus(container) {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });
  }
};
```

---

## Responsive Design Patterns

### Container Queries (Modern Approach)

```css
/* Container Queries for Component-Level Responsiveness */
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

/* Default: stacked layout */
.card {
  grid-template-columns: 1fr;
}

/* When container is wider than 400px: side-by-side */
@container card (min-width: 400px) {
  .card {
    grid-template-columns: auto 1fr;
  }

  .card-image {
    width: 150px;
  }
}

/* When container is wider than 600px: enhanced layout */
@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr auto;
  }

  .card-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
```

### Fluid Typography and Spacing

```css
/* Clamp for fluid typography */
:root {
  /* font-size scales from 14px to 18px between 320px and 1200px viewport */
  --font-size-sm: clamp(0.75rem, 0.5rem + 0.5vw, 0.875rem);
  --font-size-base: clamp(0.875rem, 0.7rem + 0.5vw, 1rem);
  --font-size-lg: clamp(1rem, 0.8rem + 0.6vw, 1.125rem);
  --font-size-xl: clamp(1.25rem, 1rem + 0.8vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.2rem + 1vw, 2rem);
  --font-size-3xl: clamp(2rem, 1.5rem + 1.5vw, 3rem);

  /* Fluid spacing */
  --space-xs: clamp(0.25rem, 0.2rem + 0.2vw, 0.5rem);
  --space-sm: clamp(0.5rem, 0.4rem + 0.3vw, 0.75rem);
  --space-md: clamp(1rem, 0.8rem + 0.5vw, 1.5rem);
  --space-lg: clamp(1.5rem, 1.2rem + 0.8vw, 2rem);
  --space-xl: clamp(2rem, 1.5rem + 1vw, 3rem);
}

/* Usage */
.heading {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
}

.section {
  padding: var(--space-lg) var(--space-md);
}
```

### Responsive Grid System

```css
/* Intrinsic Grid - Auto-responsive without media queries */
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
}

/* Auto-fill vs Auto-fit */
.grid-fill {
  /* Creates as many columns as fit, including empty ones */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.grid-fit {
  /* Creates columns and stretches them to fill space */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* RAM (Repeat, Auto, Minmax) Pattern */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(250px, 50%, 350px), 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}
```

### Breakpoint Utilities (JavaScript)

```javascript
const Responsive = {
  // Watch for breakpoint changes
  watchBreakpoint(breakpoint, callback) {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    callback(mq.matches);
    mq.addEventListener('change', (e) => callback(e.matches));
    return () => mq.removeEventListener('change', callback);
  },

  // Get current breakpoint
  getBreakpoint() {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };

    const width = window.innerWidth;
    let current = 'xs';

    for (const [name, size] of Object.entries(breakpoints)) {
      if (width >= size) current = name;
    }

    return current;
  },

  // Conditional rendering based on screen size
  renderByBreakpoint(renders) {
    const bp = this.getBreakpoint();
    return renders[bp] || renders.default || null;
  }
};

// Usage
Responsive.watchBreakpoint(768, (matches) => {
  if (matches) {
    console.log('Desktop view');
  } else {
    console.log('Mobile view');
  }
});
```

---

## Form Components and Validation

### Smart Form Component

```javascript
class SmartForm {
  constructor(form, options = {}) {
    this.form = form;
    this.validators = options.validators || {};
    this.onSubmit = options.onSubmit;
    this.validateOnBlur = options.validateOnBlur !== false;
    this.validateOnInput = options.validateOnInput || false;
    this.errors = {};

    this.init();
  }

  init() {
    this.form.noValidate = true; // Disable HTML5 validation

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Add validation listeners to inputs
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (this.validateOnBlur) {
        input.addEventListener('blur', () => this.validateField(input));
      }

      if (this.validateOnInput) {
        input.addEventListener('input', () => this.validateField(input));
      }
    });
  }

  validateField(input) {
    const name = input.name;
    const value = input.value;
    const validators = this.validators[name] || [];

    // Clear previous errors
    delete this.errors[name];
    this.clearFieldError(input);

    // Run validators
    for (const validator of validators) {
      const error = validator(value, this.getFormData());
      if (error) {
        this.errors[name] = error;
        this.showFieldError(input, error);
        return false;
      }
    }

    return true;
  }

  validateAll() {
    this.errors = {};
    const inputs = this.form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(input, message) {
    input.setAttribute('aria-invalid', 'true');

    let errorEl = input.parentElement.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.setAttribute('role', 'alert');
      input.parentElement.appendChild(errorEl);
    }

    errorEl.textContent = message;
    const errorId = `${input.name}-error`;
    errorEl.id = errorId;
    input.setAttribute('aria-describedby', errorId);
  }

  clearFieldError(input) {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    const errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.remove();
  }

  getFormData() {
    return new FormData(this.form);
  }

  async handleSubmit() {
    if (!this.validateAll()) {
      // Focus first error
      const firstError = this.form.querySelector('[aria-invalid="true"]');
      firstError?.focus();
      return;
    }

    if (this.onSubmit) {
      const data = Object.fromEntries(this.getFormData());
      await this.onSubmit(data);
    }
  }
}

// Common Validators
const Validators = {
  required: (message = 'This field is required') =>
    (value) => !value.trim() ? message : null,

  email: (message = 'Please enter a valid email') =>
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return value && !emailRegex.test(value) ? message : null;
    },

  minLength: (min, message) =>
    (value) => {
      message = message || `Minimum ${min} characters required`;
      return value.length < min ? message : null;
    },

  maxLength: (max, message) =>
    (value) => {
      message = message || `Maximum ${max} characters allowed`;
      return value.length > max ? message : null;
    },

  pattern: (regex, message = 'Invalid format') =>
    (value) => value && !regex.test(value) ? message : null,

  match: (fieldName, message) =>
    (value, formData) => {
      const otherValue = formData.get(fieldName);
      return value !== otherValue ? (message || `Must match ${fieldName}`) : null;
    },

  custom: (fn, message) =>
    (value, formData) => fn(value, formData) ? null : message
};
```

```html
<!-- Usage -->
<form id="signup-form">
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" />
  </div>

  <div>
    <label for="password">Password</label>
    <input type="password" id="password" name="password" />
  </div>

  <div>
    <label for="confirm">Confirm Password</label>
    <input type="password" id="confirm" name="confirm" />
  </div>

  <button type="submit">Sign Up</button>
</form>

<style>
  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  [aria-invalid="true"] {
    border-color: #ef4444;
  }
</style>

<script>
  new SmartForm(document.getElementById('signup-form'), {
    validators: {
      email: [
        Validators.required(),
        Validators.email()
      ],
      password: [
        Validators.required(),
        Validators.minLength(8)
      ],
      confirm: [
        Validators.required(),
        Validators.match('password', 'Passwords must match')
      ]
    },
    onSubmit: async (data) => {
      console.log('Form submitted:', data);
      // Submit to API
    }
  });
</script>
```

### Custom Input Components

```javascript
// Auto-growing textarea
class AutoGrowTextarea extends HTMLElement {
  connectedCallback() {
    this.textarea = this.querySelector('textarea');
    if (!this.textarea) {
      this.textarea = document.createElement('textarea');
      this.appendChild(this.textarea);
    }

    this.textarea.addEventListener('input', () => this.resize());
    this.resize();
  }

  resize() {
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}

customElements.define('auto-grow-textarea', AutoGrowTextarea);

// Number input with step buttons
class NumberStepper extends HTMLElement {
  connectedCallback() {
    const value = this.getAttribute('value') || 0;
    const min = this.getAttribute('min') || -Infinity;
    const max = this.getAttribute('max') || Infinity;
    const step = this.getAttribute('step') || 1;

    this.innerHTML = `
      <div class="number-stepper">
        <button type="button" class="stepper-btn" data-action="decrement">-</button>
        <input type="number" value="${value}" min="${min}" max="${max}" step="${step}" />
        <button type="button" class="stepper-btn" data-action="increment">+</button>
      </div>
    `;

    this.input = this.querySelector('input');

    this.querySelector('[data-action="increment"]').addEventListener('click', () => {
      this.input.stepUp();
      this.dispatchChange();
    });

    this.querySelector('[data-action="decrement"]').addEventListener('click', () => {
      this.input.stepDown();
      this.dispatchChange();
    });
  }

  dispatchChange() {
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

customElements.define('number-stepper', NumberStepper);
```

---

## Modal, Dropdown, and Tooltip Patterns

### CSS-Only Modal with Backdrop

```css
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1000;
}

.modal-backdrop[data-open="true"] {
  opacity: 1;
  pointer-events: all;
}

/* Modal Container */
.modal {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  transform: scale(0.9);
  transition: transform 0.3s;
}

.modal-backdrop[data-open="true"] .modal {
  transform: scale(1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
```

### Advanced Tooltip Component

```javascript
class SmartTooltip {
  constructor(options = {}) {
    this.triggers = options.triggers || document.querySelectorAll('[data-tooltip]');
    this.tooltip = this.createTooltip();
    this.currentTrigger = null;
    this.showDelay = options.showDelay || 200;
    this.hideDelay = options.hideDelay || 100;
    this.showTimeout = null;
    this.hideTimeout = null;

    this.init();
  }

  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'smart-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.style.cssText = `
      position: absolute;
      z-index: 9999;
      background: #1f2937;
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      max-width: 300px;
    `;
    document.body.appendChild(tooltip);
    return tooltip;
  }

  init() {
    this.triggers.forEach(trigger => {
      const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
      this.tooltip.id = tooltipId;
      trigger.setAttribute('aria-describedby', tooltipId);

      trigger.addEventListener('mouseenter', () => this.scheduleShow(trigger));
      trigger.addEventListener('mouseleave', () => this.scheduleHide());
      trigger.addEventListener('focus', () => this.show(trigger));
      trigger.addEventListener('blur', () => this.hide());
    });
  }

  scheduleShow(trigger) {
    clearTimeout(this.hideTimeout);
    this.showTimeout = setTimeout(() => this.show(trigger), this.showDelay);
  }

  scheduleHide() {
    clearTimeout(this.showTimeout);
    this.hideTimeout = setTimeout(() => this.hide(), this.hideDelay);
  }

  show(trigger) {
    this.currentTrigger = trigger;
    const text = trigger.getAttribute('data-tooltip');
    const placement = trigger.getAttribute('data-tooltip-placement') || 'top';

    this.tooltip.textContent = text;
    this.tooltip.style.opacity = '1';

    this.position(trigger, placement);
  }

  hide() {
    this.tooltip.style.opacity = '0';
    this.currentTrigger = null;
  }

  position(trigger, placement) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const gap = 8;

    let top, left;

    switch(placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep within viewport
    top = Math.max(gap, Math.min(top, window.innerHeight - tooltipRect.height - gap));
    left = Math.max(gap, Math.min(left, window.innerWidth - tooltipRect.width - gap));

    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  }
}

// Usage
new SmartTooltip();
```

```html
<button data-tooltip="Click to save" data-tooltip-placement="top">
  Save
</button>
```

### Popover Component

```javascript
class Popover {
  constructor(trigger, content, options = {}) {
    this.trigger = trigger;
    this.content = content;
    this.isOpen = false;
    this.placement = options.placement || 'bottom';
    this.offset = options.offset || 8;

    this.init();
  }

  init() {
    // Create popover container
    this.popover = document.createElement('div');
    this.popover.className = 'popover';
    this.popover.setAttribute('role', 'dialog');
    this.popover.setAttribute('hidden', '');
    this.popover.innerHTML = `
      <div class="popover-arrow"></div>
      <div class="popover-content"></div>
    `;

    this.popover.querySelector('.popover-content').appendChild(this.content);
    document.body.appendChild(this.popover);

    // Event listeners
    this.trigger.addEventListener('click', () => this.toggle());

    document.addEventListener('click', (e) => {
      if (!this.trigger.contains(e.target) && !this.popover.contains(e.target)) {
        this.close();
      }
    });

    // Update position on scroll/resize
    window.addEventListener('scroll', () => {
      if (this.isOpen) this.position();
    });

    window.addEventListener('resize', () => {
      if (this.isOpen) this.position();
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.popover.removeAttribute('hidden');
    this.position();
  }

  close() {
    this.isOpen = false;
    this.popover.setAttribute('hidden', '');
  }

  position() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const popoverRect = this.popover.getBoundingClientRect();

    let top, left;

    switch(this.placement) {
      case 'top':
        top = triggerRect.top - popoverRect.height - this.offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + this.offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.left - popoverRect.width - this.offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.right + this.offset;
        break;
    }

    this.popover.style.top = `${top + window.scrollY}px`;
    this.popover.style.left = `${left + window.scrollX}px`;
  }
}
```

---

## Data Visualization Components

### Lightweight Chart Component (< 10KB)

```javascript
class MicroChart {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = data;
    this.type = options.type || 'line';
    this.colors = options.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
    this.padding = options.padding || 40;

    this.resize();
    this.draw();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    switch(this.type) {
      case 'line':
        this.drawLineChart();
        break;
      case 'bar':
        this.drawBarChart();
        break;
      case 'pie':
        this.drawPieChart();
        break;
    }
  }

  drawLineChart() {
    const chartWidth = this.width - this.padding * 2;
    const chartHeight = this.height - this.padding * 2;

    const max = Math.max(...this.data.map(d => d.value));
    const min = Math.min(...this.data.map(d => d.value));
    const range = max - min;

    // Draw axes
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, this.padding);
    this.ctx.lineTo(this.padding, this.height - this.padding);
    this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
    this.ctx.stroke();

    // Draw line
    this.ctx.strokeStyle = this.colors[0];
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    this.data.forEach((point, i) => {
      const x = this.padding + (i / (this.data.length - 1)) * chartWidth;
      const y = this.height - this.padding - ((point.value - min) / range) * chartHeight;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.stroke();

    // Draw points
    this.data.forEach((point, i) => {
      const x = this.padding + (i / (this.data.length - 1)) * chartWidth;
      const y = this.height - this.padding - ((point.value - min) / range) * chartHeight;

      this.ctx.fillStyle = this.colors[0];
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Label
      this.ctx.fillStyle = '#6b7280';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(point.label, x, this.height - this.padding + 20);
    });
  }

  drawBarChart() {
    const chartWidth = this.width - this.padding * 2;
    const chartHeight = this.height - this.padding * 2;
    const max = Math.max(...this.data.map(d => d.value));
    const barWidth = chartWidth / this.data.length * 0.8;
    const gap = chartWidth / this.data.length * 0.2;

    this.data.forEach((point, i) => {
      const x = this.padding + i * (barWidth + gap);
      const barHeight = (point.value / max) * chartHeight;
      const y = this.height - this.padding - barHeight;

      // Draw bar
      this.ctx.fillStyle = this.colors[i % this.colors.length];
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      this.ctx.fillStyle = '#6b7280';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(point.label, x + barWidth / 2, this.height - this.padding + 20);

      // Value
      this.ctx.fillStyle = '#1f2937';
      this.ctx.fillText(point.value, x + barWidth / 2, y - 5);
    });
  }

  drawPieChart() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 2 - this.padding;

    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -Math.PI / 2;

    this.data.forEach((point, i) => {
      const sliceAngle = (point.value / total) * Math.PI * 2;

      // Draw slice
      this.ctx.fillStyle = this.colors[i % this.colors.length];
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`${Math.round(point.value / total * 100)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Legend
    this.data.forEach((point, i) => {
      const y = this.padding + i * 25;

      // Color box
      this.ctx.fillStyle = this.colors[i % this.colors.length];
      this.ctx.fillRect(10, y, 15, 15);

      // Label
      this.ctx.fillStyle = '#1f2937';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${point.label}: ${point.value}`, 30, y + 12);
    });
  }
}
```

```html
<!-- Usage -->
<canvas id="chart" style="width: 600px; height: 400px;"></canvas>

<script>
  const data = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 59 },
    { label: 'Mar', value: 80 },
    { label: 'Apr', value: 81 },
    { label: 'May', value: 56 }
  ];

  new MicroChart(document.getElementById('chart'), data, {
    type: 'line',
    colors: ['#3b82f6', '#10b981', '#f59e0b']
  });
</script>
```

### Sparkline Component (Tiny Charts)

```javascript
class Sparkline {
  static generate(data, width = 100, height = 30, color = '#3b82f6') {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return `
      <svg width="${width}" height="${height}" style="display: inline-block; vertical-align: middle;">
        <polyline
          points="${points}"
          fill="none"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  }
}

// Usage
document.getElementById('sparkline').innerHTML =
  Sparkline.generate([4, 8, 15, 16, 23, 42, 30, 25, 20], 150, 40);
```

### Progress Indicators

```css
/* Circular Progress */
.circular-progress {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 calc(var(--progress) * 1%),
    #e5e7eb 0
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circular-progress::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
}

.circular-progress-text {
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}
```

```html
<div class="circular-progress" style="--progress: 75">
  <div class="circular-progress-text">75%</div>
</div>
```

---

## Interactive UI Patterns

### Drag and Drop Component

```javascript
class DragDrop {
  constructor(container, options = {}) {
    this.container = container;
    this.items = Array.from(container.children);
    this.onReorder = options.onReorder;
    this.draggedItem = null;
    this.placeholder = null;

    this.init();
  }

  init() {
    this.items.forEach(item => {
      item.draggable = true;
      item.addEventListener('dragstart', (e) => this.handleDragStart(e));
      item.addEventListener('dragend', (e) => this.handleDragEnd(e));
      item.addEventListener('dragover', (e) => this.handleDragOver(e));
      item.addEventListener('drop', (e) => this.handleDrop(e));
    });
  }

  handleDragStart(e) {
    this.draggedItem = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';

    // Create placeholder
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'drag-placeholder';
    this.placeholder.style.height = e.target.offsetHeight + 'px';
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.remove();
    }
    this.draggedItem = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (e.target === this.draggedItem || e.target === this.placeholder) {
      return;
    }

    const bounding = e.target.getBoundingClientRect();
    const offset = e.clientY - bounding.top;

    if (offset > bounding.height / 2) {
      e.target.after(this.placeholder);
    } else {
      e.target.before(this.placeholder);
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.placeholder.parentNode) {
      this.placeholder.parentNode.replaceChild(this.draggedItem, this.placeholder);
    }

    this.items = Array.from(this.container.children);

    if (this.onReorder) {
      this.onReorder(this.items.map(item => item.dataset.id));
    }
  }
}
```

```css
.dragging {
  opacity: 0.5;
}

.drag-placeholder {
  background: #e5e7eb;
  border: 2px dashed #9ca3af;
  margin: 0.5rem 0;
}
```

```html
<div id="sortable-list">
  <div class="sortable-item" data-id="1">Item 1</div>
  <div class="sortable-item" data-id="2">Item 2</div>
  <div class="sortable-item" data-id="3">Item 3</div>
</div>

<script>
  new DragDrop(document.getElementById('sortable-list'), {
    onReorder: (order) => console.log('New order:', order)
  });
</script>
```

### Resizable Component

```javascript
class Resizable {
  constructor(element, options = {}) {
    this.element = element;
    this.minWidth = options.minWidth || 100;
    this.minHeight = options.minHeight || 100;
    this.handles = options.handles || ['e', 's', 'se'];

    this.init();
  }

  init() {
    this.element.style.position = 'relative';

    this.handles.forEach(handle => {
      const handleEl = document.createElement('div');
      handleEl.className = `resize-handle resize-handle-${handle}`;
      handleEl.dataset.handle = handle;
      this.element.appendChild(handleEl);

      handleEl.addEventListener('mousedown', (e) => this.startResize(e, handle));
    });
  }

  startResize(e, handle) {
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = this.element.offsetWidth;
    const startHeight = this.element.offsetHeight;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (handle.includes('e')) {
        const newWidth = Math.max(this.minWidth, startWidth + deltaX);
        this.element.style.width = newWidth + 'px';
      }

      if (handle.includes('s')) {
        const newHeight = Math.max(this.minHeight, startHeight + deltaY);
        this.element.style.height = newHeight + 'px';
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      this.element.dispatchEvent(new CustomEvent('resized', {
        detail: {
          width: this.element.offsetWidth,
          height: this.element.offsetHeight
        }
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
}
```

```css
.resize-handle {
  position: absolute;
  background: #3b82f6;
}

.resize-handle-e {
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
}

.resize-handle-s {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  cursor: ns-resize;
}

.resize-handle-se {
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
}
```

### Infinite Scroll

```javascript
class InfiniteScroll {
  constructor(options = {}) {
    this.container = options.container || window;
    this.threshold = options.threshold || 200;
    this.onLoadMore = options.onLoadMore;
    this.loading = false;

    this.init();
  }

  init() {
    this.container.addEventListener('scroll', () => this.checkScroll());
  }

  checkScroll() {
    if (this.loading) return;

    const scrollable = this.container === window
      ? document.documentElement
      : this.container;

    const scrollTop = this.container === window
      ? window.scrollY
      : this.container.scrollTop;

    const scrollHeight = scrollable.scrollHeight;
    const clientHeight = this.container === window
      ? window.innerHeight
      : this.container.clientHeight;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceFromBottom < this.threshold) {
      this.loadMore();
    }
  }

  async loadMore() {
    this.loading = true;

    if (this.onLoadMore) {
      await this.onLoadMore();
    }

    this.loading = false;
  }
}

// Usage
new InfiniteScroll({
  threshold: 300,
  onLoadMore: async () => {
    // Fetch more data
    const response = await fetch('/api/items?page=' + nextPage);
    const items = await response.json();

    // Append to DOM
    items.forEach(item => {
      const el = document.createElement('div');
      el.textContent = item.name;
      document.getElementById('items-list').appendChild(el);
    });

    nextPage++;
  }
});
```

---

## CSS-Only vs JavaScript-Enhanced

### Pure CSS Components

```css
/* CSS-Only Accordion */
.css-accordion {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.css-accordion-item {
  border-bottom: 1px solid #e5e7eb;
}

.css-accordion-item:last-child {
  border-bottom: none;
}

.css-accordion-input {
  display: none;
}

.css-accordion-label {
  display: block;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  background: #f9fafb;
  transition: background 0.2s;
}

.css-accordion-label:hover {
  background: #f3f4f6;
}

.css-accordion-label::after {
  content: '▼';
  float: right;
  transition: transform 0.2s;
}

.css-accordion-input:checked + .css-accordion-label::after {
  transform: rotate(-180deg);
}

.css-accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.css-accordion-input:checked ~ .css-accordion-content {
  max-height: 500px;
}

.css-accordion-content-inner {
  padding: 1rem 1.5rem;
}
```

```html
<div class="css-accordion">
  <div class="css-accordion-item">
    <input type="checkbox" id="item1" class="css-accordion-input">
    <label for="item1" class="css-accordion-label">Item 1</label>
    <div class="css-accordion-content">
      <div class="css-accordion-content-inner">
        Content for item 1
      </div>
    </div>
  </div>
</div>
```

### CSS-Only Tabs

```css
.css-tabs {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.css-tabs-nav {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.css-tabs-input {
  display: none;
}

.css-tabs-label {
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.css-tabs-label:hover {
  color: #374151;
}

.css-tabs-input:checked + .css-tabs-label {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.css-tabs-content {
  display: none;
  padding: 1.5rem;
}

.css-tabs-input:checked ~ .css-tabs-content {
  display: block;
}
```

```html
<div class="css-tabs">
  <div class="css-tabs-nav">
    <input type="radio" name="tabs" id="tab1" class="css-tabs-input" checked>
    <label for="tab1" class="css-tabs-label">Tab 1</label>

    <input type="radio" name="tabs" id="tab2" class="css-tabs-input">
    <label for="tab2" class="css-tabs-label">Tab 2</label>
  </div>

  <input type="radio" name="tabs" id="tab1" checked style="display: none;">
  <div class="css-tabs-content">Content 1</div>

  <input type="radio" name="tabs" id="tab2" style="display: none;">
  <div class="css-tabs-content">Content 2</div>
</div>
```

### When to Use CSS vs JavaScript

**CSS-Only Advantages:**
- No JavaScript payload
- Works without JS enabled
- Simpler for basic interactions
- Better performance for simple toggles
- Easier to maintain

**JavaScript-Enhanced Advantages:**
- Complex state management
- Accessibility features (ARIA, focus management)
- Dynamic content loading
- Advanced interactions
- Better keyboard navigation
- Event handling and callbacks

### Progressive Enhancement Pattern

```javascript
// Start with CSS-only, enhance with JavaScript
class ProgressiveAccordion {
  constructor(container) {
    this.container = container;

    // Only enhance if JavaScript is available
    this.enhance();
  }

  enhance() {
    // Convert CSS-only checkboxes to buttons for better accessibility
    const inputs = this.container.querySelectorAll('.css-accordion-input');

    inputs.forEach((input, index) => {
      const label = input.nextElementSibling;
      const content = label.nextElementSibling;

      // Create button replacement
      const button = document.createElement('button');
      button.textContent = label.textContent;
      button.className = label.className.replace('label', 'button');
      button.setAttribute('aria-expanded', input.checked);
      button.setAttribute('aria-controls', `panel-${index}`);

      content.id = `panel-${index}`;
      content.setAttribute('role', 'region');

      // Replace label with button
      label.replaceWith(button);

      // Remove hidden input (no longer needed)
      input.remove();

      // Add click handler
      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isExpanded);
        content.classList.toggle('expanded');
      });
    });
  }
}

// Auto-enhance when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.css-accordion').forEach(el => {
      new ProgressiveAccordion(el);
    });
  });
} else {
  document.querySelectorAll('.css-accordion').forEach(el => {
    new ProgressiveAccordion(el);
  });
}
```

---

## Best Practices for Single-File Apps

### 1. Component Organization

```javascript
// Namespace your components
const App = {
  components: {},
  state: {},
  utils: {},

  registerComponent(name, component) {
    this.components[name] = component;
  },

  init() {
    // Initialize all components
    Object.values(this.components).forEach(Component => {
      if (typeof Component.init === 'function') {
        Component.init();
      }
    });
  }
};

// Register components
App.registerComponent('dropdown', HeadlessDropdown);
App.registerComponent('modal', HeadlessDialog);

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => App.init());
```

### 2. Size Optimization Techniques

```javascript
// Minification-friendly patterns
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const on = (el, ev, fn) => el.addEventListener(ev, fn);
const create = (tag, attrs = {}) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

// Use classList instead of className strings
element.classList.add('active');
element.classList.toggle('hidden');
element.classList.remove('disabled');

// Use dataset for data attributes
element.dataset.id = '123';
const id = element.dataset.id;

// Template literals for HTML (better minification)
const html = `<div class="card">${content}</div>`;
```

### 3. Lazy Initialization

```javascript
// Only initialize components when needed
class LazyComponent {
  static instances = new WeakMap();

  static init(element) {
    if (!this.instances.has(element)) {
      const instance = new this(element);
      this.instances.set(element, instance);
    }
    return this.instances.get(element);
  }
}

// Initialize on intersection (viewport entry)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const component = entry.target.dataset.component;
      App.components[component].init(entry.target);
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('[data-component]').forEach(el => {
  observer.observe(el);
});
```

### 4. Reusable Utility Functions

```javascript
const utils = {
  // Debounce expensive operations
  debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  },

  // Throttle high-frequency events
  throttle(fn, limit = 100) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Simple template engine
  template(str, data) {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
  },

  // Generate unique IDs
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Simple XSS protection
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
```

### 5. CSS Custom Properties for Theming

```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'Courier New', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1f2937;
    --color-text: #f9fafb;
  }
}
```

---

## Performance Checklist

- [ ] Use CSS containment for independent components
- [ ] Implement lazy loading for off-screen components
- [ ] Debounce/throttle expensive event handlers
- [ ] Use requestAnimationFrame for animations
- [ ] Minimize DOM queries (cache selectors)
- [ ] Use event delegation instead of multiple listeners
- [ ] Prefer CSS transitions over JavaScript animations
- [ ] Use IntersectionObserver for scroll-based interactions
- [ ] Bundle and minify CSS/JS
- [ ] Use CSS Custom Properties instead of inline styles
- [ ] Implement virtual scrolling for large lists
- [ ] Use Web Workers for heavy computations

---

## Conclusion

Building intelligent UI components for single-file web apps requires balancing functionality, accessibility, performance, and file size. Key takeaways:

1. **Start with semantic HTML** - Progressive enhancement works best
2. **Leverage modern CSS** - Container queries, custom properties, and grid
3. **Use Web Components** - For true encapsulation and reusability
4. **Prioritize accessibility** - ARIA, keyboard navigation, focus management
5. **Think headless** - Separate logic from presentation
6. **Optimize for size** - Every byte counts in single-file apps
7. **Progressive enhancement** - CSS-only base, JavaScript enhancements
8. **Component composition** - Build complex UIs from simple primitives

The examples in this guide demonstrate that you don't need heavy frameworks to build sophisticated, accessible, and performant user interfaces. With modern web standards and thoughtful architecture, single-file web apps can deliver rich user experiences while staying under 1MB.
