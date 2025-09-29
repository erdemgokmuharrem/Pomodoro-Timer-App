import React, { createContext, useContext, useEffect, useState } from 'react';
import { ModuleRegistry, ModuleLoader, ModuleCommunication } from './modules';

interface ModuleContextType {
  registry: ModuleRegistry;
  loader: ModuleLoader;
  communication: ModuleCommunication;
  loadedModules: Set<string>;
  loadingModules: Set<string>;
  error: string | null;
}

const ModuleContext = createContext<ModuleContextType | null>(null);

interface ModuleProviderProps {
  children: React.ReactNode;
  modules?: string[];
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ 
  children, 
  modules = ['pomodoro', 'tasks', 'statistics', 'gamification'] 
}) => {
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set());
  const [loadingModules, setLoadingModules] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Initialize module system
  const { registry, loader, communication } = React.useMemo(() => {
    const { registry, loader, communication } = initializeModules();
    return { registry, loader, communication };
  }, []);

  // Load modules on mount
  useEffect(() => {
    const loadModules = async () => {
      try {
        setError(null);
        
        for (const moduleName of modules) {
          setLoadingModules(prev => new Set(prev).add(moduleName));
          
          try {
            await loader.loadModule(moduleName);
            setLoadedModules(prev => new Set(prev).add(moduleName));
          } catch (err) {
            console.error(`Failed to load module ${moduleName}:`, err);
            setError(`Failed to load module ${moduleName}`);
          } finally {
            setLoadingModules(prev => {
              const newSet = new Set(prev);
              newSet.delete(moduleName);
              return newSet;
            });
          }
        }
      } catch (err) {
        setError('Failed to initialize modules');
        console.error('Module loading error:', err);
      }
    };

    loadModules();
  }, [modules, loader]);

  const contextValue: ModuleContextType = {
    registry,
    loader,
    communication,
    loadedModules,
    loadingModules,
    error,
  };

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
};

// Hook for module communication
export const useModuleCommunication = () => {
  const { communication } = useModules();

  const sendMessage = React.useCallback((
    from: string,
    to: string,
    type: string,
    payload: any
  ) => {
    communication.sendMessage(from, to, type, payload);
  }, [communication]);

  const subscribe = React.useCallback((
    moduleName: string,
    callback: (message: any) => void
  ) => {
    return communication.subscribe(moduleName, callback);
  }, [communication]);

  return { sendMessage, subscribe };
};

// Hook for module loading status
export const useModuleStatus = (moduleName: string) => {
  const { loadedModules, loadingModules, error } = useModules();

  return {
    isLoaded: loadedModules.has(moduleName),
    isLoading: loadingModules.has(moduleName),
    hasError: !!error,
    error,
  };
};

// Hook for lazy module loading
export const useLazyModule = (moduleName: string) => {
  const { loader } = useModules();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModule = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loader.loadModule(moduleName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [loader, moduleName]);

  return {
    loadModule,
    isLoading,
    error,
  };
};
