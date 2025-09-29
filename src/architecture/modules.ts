// Micro-frontend module definitions
export interface ModuleConfig {
  name: string;
  version: string;
  entry: string;
  dependencies: string[];
  shared: string[];
  routes: ModuleRoute[];
  permissions: string[];
}

export interface ModuleRoute {
  path: string;
  component: string;
  exact?: boolean;
  permissions?: string[];
}

// Core modules
export const CORE_MODULES = {
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  THEME: 'theme',
  STORAGE: 'storage',
} as const;

// Feature modules
export const FEATURE_MODULES = {
  POMODORO: 'pomodoro',
  TASKS: 'tasks',
  STATISTICS: 'statistics',
  GAMIFICATION: 'gamification',
  SETTINGS: 'settings',
  EXPORT: 'export',
  NOTIFICATIONS: 'notifications',
  SOUND: 'sound',
} as const;

// Module registry
export class ModuleRegistry {
  private modules: Map<string, ModuleConfig> = new Map();
  private loadedModules: Set<string> = new Set();

  register(module: ModuleConfig): void {
    this.modules.set(module.name, module);
  }

  getModule(name: string): ModuleConfig | undefined {
    return this.modules.get(name);
  }

  getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }

  isLoaded(name: string): boolean {
    return this.loadedModules.has(name);
  }

  markAsLoaded(name: string): void {
    this.loadedModules.add(name);
  }

  getDependencies(name: string): string[] {
    const module = this.getModule(name);
    return module?.dependencies || [];
  }

  canLoad(name: string): boolean {
    const dependencies = this.getDependencies(name);
    return dependencies.every(dep => this.isLoaded(dep));
  }
}

// Module loader
export class ModuleLoader {
  private registry: ModuleRegistry;

  constructor(registry: ModuleRegistry) {
    this.registry = registry;
  }

  async loadModule(name: string): Promise<ModuleConfig> {
    const module = this.registry.getModule(name);
    if (!module) {
      throw new Error(`Module ${name} not found`);
    }

    if (this.registry.isLoaded(name)) {
      return module;
    }

    if (!this.registry.canLoad(name)) {
      throw new Error(`Dependencies not met for module ${name}`);
    }

    try {
      // In a real implementation, this would load the module dynamically
      await this.loadModuleBundle(module);
      this.registry.markAsLoaded(name);
      return module;
    } catch (error) {
      throw new Error(`Failed to load module ${name}: ${error}`);
    }
  }

  private async loadModuleBundle(module: ModuleConfig): Promise<void> {
    // Simulate module loading
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Module ${module.name} loaded successfully`);
        resolve();
      }, 100);
    });
  }

  async loadAllModules(): Promise<void> {
    const modules = this.registry.getAllModules();
    const loadPromises = modules.map(module => this.loadModule(module.name));
    await Promise.all(loadPromises);
  }
}

// Module communication
export interface ModuleMessage {
  type: string;
  payload: any;
  source: string;
  target?: string;
  timestamp: number;
}

export class ModuleCommunication {
  private listeners: Map<string, Set<(message: ModuleMessage) => void>> =
    new Map();

  subscribe(
    moduleName: string,
    callback: (message: ModuleMessage) => void
  ): () => void {
    if (!this.listeners.has(moduleName)) {
      this.listeners.set(moduleName, new Set());
    }

    this.listeners.get(moduleName)!.add(callback);

    return () => {
      this.listeners.get(moduleName)?.delete(callback);
    };
  }

  publish(message: ModuleMessage): void {
    const targetListeners = this.listeners.get(message.target || 'all');
    if (targetListeners) {
      targetListeners.forEach(callback => callback(message));
    }
  }

  sendMessage(from: string, to: string, type: string, payload: any): void {
    const message: ModuleMessage = {
      type,
      payload,
      source: from,
      target: to,
      timestamp: Date.now(),
    };

    this.publish(message);
  }
}

// Module configuration
export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    name: 'pomodoro',
    version: '1.0.0',
    entry: './src/modules/pomodoro/index.ts',
    dependencies: ['theme', 'storage'],
    shared: ['react', 'react-native'],
    routes: [
      { path: '/timer', component: 'TimerScreen' },
      { path: '/dashboard', component: 'DashboardScreen' },
    ],
    permissions: ['timer:read', 'timer:write'],
  },
  {
    name: 'tasks',
    version: '1.0.0',
    entry: './src/modules/tasks/index.ts',
    dependencies: ['storage'],
    shared: ['react', 'react-native'],
    routes: [{ path: '/tasks', component: 'TasksScreen' }],
    permissions: ['tasks:read', 'tasks:write'],
  },
  {
    name: 'statistics',
    version: '1.0.0',
    entry: './src/modules/statistics/index.ts',
    dependencies: ['storage'],
    shared: ['react', 'react-native'],
    routes: [{ path: '/statistics', component: 'StatisticsScreen' }],
    permissions: ['statistics:read'],
  },
  {
    name: 'gamification',
    version: '1.0.0',
    entry: './src/modules/gamification/index.ts',
    dependencies: ['storage'],
    shared: ['react', 'react-native'],
    routes: [],
    permissions: ['gamification:read', 'gamification:write'],
  },
];

// Initialize module system
export const initializeModules = (): {
  registry: ModuleRegistry;
  loader: ModuleLoader;
  communication: ModuleCommunication;
} => {
  const registry = new ModuleRegistry();
  const loader = new ModuleLoader(registry);
  const communication = new ModuleCommunication();

  // Register all modules
  MODULE_CONFIGS.forEach(config => {
    registry.register(config);
  });

  return { registry, loader, communication };
};
