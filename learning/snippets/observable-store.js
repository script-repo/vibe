/**
 * Observable Store Pattern
 *
 * A minimal reactive state management solution in ~20 lines.
 * Perfect for single-file apps that need reactive state without heavy frameworks.
 *
 * Features:
 * - Immutable state updates
 * - Subscribe/unsubscribe pattern
 * - Computed values support
 * - LocalStorage persistence
 *
 * Usage:
 *   const store = new Store({ count: 0 });
 *   store.subscribe(state => console.log(state));
 *   store.setState({ count: 1 });
 */

class Store {
  constructor(initialState = {}, options = {}) {
    this.state = initialState;
    this.listeners = [];
    this.computed = new Map();

    // Optional persistence
    if (options.persist) {
      this.storageKey = options.storageKey || 'app-state';
      this.loadFromStorage();
    }
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    // Immutable update
    const oldState = this.state;
    this.state = { ...this.state, ...updates };

    // Persist if enabled
    if (this.storageKey) {
      this.saveToStorage();
    }

    // Notify listeners
    this.notify(oldState);
  }

  subscribe(listener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notify(oldState) {
    this.listeners.forEach(listener => {
      try {
        listener(this.state, oldState);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // Computed values
  addComputed(name, fn) {
    this.computed.set(name, fn);
  }

  getComputed(name) {
    const fn = this.computed.get(name);
    return fn ? fn(this.state) : undefined;
  }

  // Persistence
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }
}

// ========================================
// Example Usage
// ========================================

/*
// Basic usage
const store = new Store({ count: 0, name: 'App' });

// Subscribe to changes
const unsubscribe = store.subscribe((state, oldState) => {
  console.log('State changed:', { old: oldState, new: state });
  document.getElementById('count').textContent = state.count;
});

// Update state
store.setState({ count: 1 });
store.setState({ count: store.getState().count + 1 });

// Unsubscribe
unsubscribe();

// With persistence
const persistentStore = new Store(
  { theme: 'light', user: null },
  { persist: true, storageKey: 'my-app' }
);

// With computed values
store.addComputed('doubleCount', (state) => state.count * 2);
console.log(store.getComputed('doubleCount')); // 4

// Multiple subscribers
store.subscribe(state => updateUI(state));
store.subscribe(state => logAnalytics(state));
store.subscribe(state => syncToServer(state));
*/

// ========================================
// Advanced: Store with Actions
// ========================================

class StoreWithActions extends Store {
  constructor(initialState, actions) {
    super(initialState);
    this.actions = {};

    // Bind actions to store
    Object.keys(actions).forEach(name => {
      this.actions[name] = (...args) => {
        const updates = actions[name](this.state, ...args);
        if (updates) {
          this.setState(updates);
        }
      };
    });
  }

  dispatch(action, ...args) {
    if (!this.actions[action]) {
      throw new Error(`Action ${action} not found`);
    }
    return this.actions[action](...args);
  }
}

/*
// Usage with actions
const counterStore = new StoreWithActions(
  { count: 0 },
  {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
    reset: () => ({ count: 0 }),
    add: (state, value) => ({ count: state.count + value })
  }
);

counterStore.dispatch('increment');
counterStore.dispatch('add', 5);
counterStore.dispatch('reset');
*/

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Store, StoreWithActions };
}
