/**
 * Plugin Registry Pattern
 *
 * A central registry for managing plugins with validation, lifecycle hooks,
 * and priority-based execution. Enables WordPress-level extensibility.
 *
 * Features:
 * - Plugin validation
 * - Priority-based loading
 * - Lifecycle management (init, enable, disable, destroy)
 * - Graceful error handling
 * - Dependency injection
 *
 * Usage:
 *   const registry = new PluginRegistry();
 *   registry.register('myPlugin', myPluginObject, 10);
 *   await registry.initAll();
 */

class PluginRegistry {
  constructor(context = {}) {
    this.plugins = new Map();
    this.context = context;
    this.initialized = false;
  }

  /**
   * Register a plugin
   * @param {string} name - Unique plugin name
   * @param {object} plugin - Plugin object with init() method
   * @param {number} priority - Loading priority (lower = earlier)
   */
  register(name, plugin, priority = 10) {
    if (this.plugins.has(name)) {
      console.warn(`Plugin ${name} already registered`);
      return false;
    }

    if (!this.validate(plugin)) {
      throw new Error(`Invalid plugin ${name}: must have init() method`);
    }

    this.plugins.set(name, {
      plugin,
      priority,
      enabled: false,
      initialized: false
    });

    return true;
  }

  /**
   * Validate plugin interface
   */
  validate(plugin) {
    return (
      plugin &&
      typeof plugin === 'object' &&
      typeof plugin.init === 'function'
    );
  }

  /**
   * Initialize all plugins in priority order
   */
  async initAll() {
    const sorted = this.getSortedPlugins();

    for (const { name, entry } of sorted) {
      try {
        await this.initPlugin(name, entry);
      } catch (error) {
        console.error(`Plugin ${name} failed to initialize:`, error);
        // Continue with other plugins
      }
    }

    this.initialized = true;
  }

  /**
   * Initialize single plugin
   */
  async initPlugin(name, entry) {
    if (entry.initialized) {
      return;
    }

    console.log(`Initializing plugin: ${name}`);

    // Call init with context
    await entry.plugin.init(this.context);

    entry.initialized = true;
    entry.enabled = true;
  }

  /**
   * Get plugins sorted by priority
   */
  getSortedPlugins() {
    return Array.from(this.plugins.entries())
      .map(([name, entry]) => ({ name, entry }))
      .sort((a, b) => a.entry.priority - b.entry.priority);
  }

  /**
   * Enable a plugin
   */
  async enable(name) {
    const entry = this.plugins.get(name);
    if (!entry) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (!entry.initialized) {
      await this.initPlugin(name, entry);
    }

    if (entry.plugin.enable) {
      await entry.plugin.enable(this.context);
    }

    entry.enabled = true;
  }

  /**
   * Disable a plugin
   */
  async disable(name) {
    const entry = this.plugins.get(name);
    if (!entry) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (entry.plugin.disable) {
      await entry.plugin.disable(this.context);
    }

    entry.enabled = false;
  }

  /**
   * Destroy a plugin
   */
  async destroy(name) {
    const entry = this.plugins.get(name);
    if (!entry) {
      return;
    }

    if (entry.plugin.destroy) {
      await entry.plugin.destroy(this.context);
    }

    this.plugins.delete(name);
  }

  /**
   * Get plugin by name
   */
  get(name) {
    return this.plugins.get(name)?.plugin;
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(name) {
    return this.plugins.get(name)?.enabled || false;
  }

  /**
   * Get all enabled plugins
   */
  getEnabled() {
    return Array.from(this.plugins.entries())
      .filter(([_, entry]) => entry.enabled)
      .map(([name, entry]) => ({ name, plugin: entry.plugin }));
  }
}

// ========================================
// Example Usage
// ========================================

/*
// Define plugins
const analyticsPlugin = {
  async init(context) {
    console.log('Analytics initialized');
    context.track = (event) => console.log('Track:', event);
  },

  enable() {
    console.log('Analytics enabled');
  },

  disable() {
    console.log('Analytics disabled');
  }
};

const themePlugin = {
  async init(context) {
    console.log('Theme initialized');
    context.setTheme = (theme) => {
      document.body.className = theme;
    };
  }
};

const notificationsPlugin = {
  async init(context) {
    console.log('Notifications initialized');
    context.notify = (msg) => {
      const toast = document.createElement('div');
      toast.textContent = msg;
      toast.className = 'toast';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    };
  }
};

// Create registry with shared context
const context = { app: 'MyApp' };
const registry = new PluginRegistry(context);

// Register plugins with priorities
registry.register('analytics', analyticsPlugin, 5);   // Load first
registry.register('theme', themePlugin, 10);          // Load second
registry.register('notifications', notificationsPlugin, 15); // Load last

// Initialize all
await registry.initAll();

// Use plugin functionality via context
context.track('page_view');
context.setTheme('dark');
context.notify('Welcome!');

// Manage plugins
await registry.disable('analytics');
await registry.enable('analytics');
*/

// ========================================
// Advanced: Plugin with Dependencies
// ========================================

class PluginRegistryWithDeps extends PluginRegistry {
  register(name, plugin, priority = 10, dependencies = []) {
    super.register(name, plugin, priority);

    const entry = this.plugins.get(name);
    entry.dependencies = dependencies;
  }

  async initAll() {
    const sorted = this.getSortedPlugins();
    const initialized = new Set();

    for (const { name, entry } of sorted) {
      await this.initWithDeps(name, entry, initialized);
    }

    this.initialized = true;
  }

  async initWithDeps(name, entry, initialized) {
    if (initialized.has(name)) {
      return;
    }

    // Initialize dependencies first
    for (const depName of entry.dependencies || []) {
      const depEntry = this.plugins.get(depName);
      if (!depEntry) {
        throw new Error(`Dependency ${depName} not found for ${name}`);
      }
      await this.initWithDeps(depName, depEntry, initialized);
    }

    // Initialize plugin
    try {
      await this.initPlugin(name, entry);
      initialized.add(name);
    } catch (error) {
      console.error(`Plugin ${name} failed:`, error);
    }
  }
}

/*
// Usage with dependencies
const registry = new PluginRegistryWithDeps();

registry.register('logger', loggerPlugin, 5);
registry.register('api', apiPlugin, 10, ['logger']); // Depends on logger
registry.register('ui', uiPlugin, 15, ['api']);      // Depends on api

await registry.initAll();
// Order: logger -> api -> ui
*/

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PluginRegistry, PluginRegistryWithDeps };
}
