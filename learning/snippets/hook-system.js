/**
 * WordPress-Style Hook System
 *
 * Dual hook system with Actions (execute code) and Filters (modify data).
 * Enables plugin ecosystem without tight coupling.
 *
 * Features:
 * - Actions: Execute callbacks at specific points
 * - Filters: Transform data through chain
 * - Priority-based execution
 * - Safe error handling
 * - Dynamic registration/removal
 *
 * Usage:
 *   const hooks = new HookSystem();
 *   hooks.addAction('init', () => console.log('Initialized'));
 *   hooks.doAction('init');
 */

class HookSystem {
  constructor() {
    this.actions = new Map();
    this.filters = new Map();
  }

  // ========================================
  // ACTIONS: Execute without return
  // ========================================

  /**
   * Register an action callback
   * @param {string} name - Action name
   * @param {function} callback - Function to execute
   * @param {number} priority - Execution priority (lower = earlier)
   */
  addAction(name, callback, priority = 10) {
    if (!this.actions.has(name)) {
      this.actions.set(name, []);
    }

    this.actions.get(name).push({ callback, priority });

    // Sort by priority
    this.actions.get(name).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove an action callback
   */
  removeAction(name, callback) {
    if (!this.actions.has(name)) {
      return false;
    }

    const callbacks = this.actions.get(name);
    const index = callbacks.findIndex(item => item.callback === callback);

    if (index > -1) {
      callbacks.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Execute all callbacks for an action
   * @param {string} name - Action name
   * @param {...any} args - Arguments to pass to callbacks
   */
  doAction(name, ...args) {
    const callbacks = this.actions.get(name) || [];

    for (const { callback } of callbacks) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Action '${name}' callback error:`, error);
        // Continue executing other callbacks
      }
    }
  }

  /**
   * Check if action has callbacks
   */
  hasAction(name) {
    return this.actions.has(name) && this.actions.get(name).length > 0;
  }

  // ========================================
  // FILTERS: Transform and return data
  // ========================================

  /**
   * Register a filter callback
   * @param {string} name - Filter name
   * @param {function} callback - Transformation function
   * @param {number} priority - Execution priority (lower = earlier)
   */
  addFilter(name, callback, priority = 10) {
    if (!this.filters.has(name)) {
      this.filters.set(name, []);
    }

    this.filters.get(name).push({ callback, priority });

    // Sort by priority
    this.filters.get(name).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a filter callback
   */
  removeFilter(name, callback) {
    if (!this.filters.has(name)) {
      return false;
    }

    const callbacks = this.filters.get(name);
    const index = callbacks.findIndex(item => item.callback === callback);

    if (index > -1) {
      callbacks.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Apply all filter callbacks to a value
   * @param {string} name - Filter name
   * @param {any} value - Initial value
   * @param {...any} args - Additional arguments
   * @returns {any} - Transformed value
   */
  applyFilters(name, value, ...args) {
    const callbacks = this.filters.get(name) || [];
    let result = value;

    for (const { callback } of callbacks) {
      try {
        result = callback(result, ...args);
      } catch (error) {
        console.error(`Filter '${name}' callback error:`, error);
        // Return previous value on error
      }
    }

    return result;
  }

  /**
   * Check if filter has callbacks
   */
  hasFilter(name) {
    return this.filters.has(name) && this.filters.get(name).length > 0;
  }

  // ========================================
  // Utilities
  // ========================================

  /**
   * Clear all hooks
   */
  clear() {
    this.actions.clear();
    this.filters.clear();
  }

  /**
   * Clear specific hook type
   */
  clearActions(name) {
    if (name) {
      this.actions.delete(name);
    } else {
      this.actions.clear();
    }
  }

  clearFilters(name) {
    if (name) {
      this.filters.delete(name);
    } else {
      this.filters.clear();
    }
  }

  /**
   * Get hook statistics
   */
  getStats() {
    return {
      actions: Array.from(this.actions.entries()).map(([name, callbacks]) => ({
        name,
        count: callbacks.length
      })),
      filters: Array.from(this.filters.entries()).map(([name, callbacks]) => ({
        name,
        count: callbacks.length
      }))
    };
  }
}

// ========================================
// Example Usage
// ========================================

/*
const hooks = new HookSystem();

// ACTIONS EXAMPLE
// ----------------

// Add action callbacks with different priorities
hooks.addAction('app_init', () => {
  console.log('Initializing app...');
}, 5);

hooks.addAction('app_init', () => {
  console.log('Loading configuration...');
}, 10);

hooks.addAction('app_init', () => {
  console.log('Starting services...');
}, 15);

// Execute all callbacks in priority order
hooks.doAction('app_init');
// Output:
// Initializing app...
// Loading configuration...
// Starting services...

// User login action with arguments
hooks.addAction('user_login', (user) => {
  console.log(`User ${user.name} logged in`);
});

hooks.addAction('user_login', (user) => {
  trackEvent('login', { userId: user.id });
});

hooks.doAction('user_login', { id: 123, name: 'Alice' });

// FILTERS EXAMPLE
// ---------------

// Transform post title through multiple filters
hooks.addFilter('post_title', (title) => {
  return title.trim();
}, 5);

hooks.addFilter('post_title', (title) => {
  return title.toUpperCase();
}, 10);

hooks.addFilter('post_title', (title) => {
  return `📝 ${title}`;
}, 15);

const title = hooks.applyFilters('post_title', '  hello world  ');
console.log(title); // "📝 HELLO WORLD"

// Filter with additional arguments
hooks.addFilter('product_price', (price, discount) => {
  return price * (1 - discount);
});

hooks.addFilter('product_price', (price, discount) => {
  return Math.round(price * 100) / 100; // Round to 2 decimals
});

const finalPrice = hooks.applyFilters('product_price', 99.99, 0.1);
console.log(finalPrice); // 89.99

// PLUGIN INTEGRATION EXAMPLE
// ---------------------------

// Plugin 1: Analytics
hooks.addAction('page_view', (page) => {
  analytics.track('pageview', { page });
});

// Plugin 2: Logger
hooks.addAction('page_view', (page) => {
  console.log('Page viewed:', page);
});

// Plugin 3: Notifications
hooks.addFilter('notification_message', (msg) => {
  return `🔔 ${msg}`;
});

// App code
hooks.doAction('page_view', '/home');
const msg = hooks.applyFilters('notification_message', 'New message');

// REMOVE HOOKS EXAMPLE
// ---------------------

const myCallback = () => console.log('Called');
hooks.addAction('test', myCallback);
hooks.removeAction('test', myCallback);

// STATS EXAMPLE
// -------------

console.log(hooks.getStats());
// {
//   actions: [
//     { name: 'app_init', count: 3 },
//     { name: 'user_login', count: 2 }
//   ],
//   filters: [
//     { name: 'post_title', count: 3 },
//     { name: 'product_price', count: 2 }
//   ]
// }
*/

// ========================================
// Global Hook System (Singleton)
// ========================================

// Create global instance for use across app
const createGlobalHooks = () => {
  if (typeof window !== 'undefined' && !window.__hooks__) {
    window.__hooks__ = new HookSystem();
  }
  return typeof window !== 'undefined' ? window.__hooks__ : new HookSystem();
};

/*
// Usage
const hooks = createGlobalHooks();

// Now any plugin can use the same hook system
// plugin1.js
hooks.addAction('init', () => console.log('Plugin 1 loaded'));

// plugin2.js
hooks.addAction('init', () => console.log('Plugin 2 loaded'));

// main.js
hooks.doAction('init');
*/

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HookSystem, createGlobalHooks };
}
