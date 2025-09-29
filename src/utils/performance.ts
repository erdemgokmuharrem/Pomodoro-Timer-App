// Performance utilities
import { InteractionManager } from 'react-native';

// Lazy loading utility
export const lazyLoad = <T extends any>(
  importFunc: () => Promise<{ default: T }>
): T => {
  return React.lazy(importFunc) as T;
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(`${label}_start`, Date.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}_start`);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.metrics.set(`${label}_duration`, duration);
    return duration;
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      if (key.includes('_duration')) {
        result[key.replace('_duration', '')] = value;
      }
    });
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Memory usage monitoring
export const getMemoryUsage = (): Promise<{
  used: number;
  total: number;
  percentage: number;
}> => {
  return new Promise((resolve) => {
    if (global.performance && global.performance.memory) {
      const memory = global.performance.memory;
      resolve({
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      });
    } else {
      resolve({ used: 0, total: 0, percentage: 0 });
    }
  });
};

// Interaction manager for heavy operations
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

// Image optimization
export const optimizeImage = (uri: string, width?: number, height?: number): string => {
  // In a real app, you would use a service like Cloudinary or similar
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', '80'); // Quality
  params.append('f', 'auto'); // Format
  
  return `${uri}?${params.toString()}`;
};

// Bundle analyzer helper
export const analyzeBundle = (): void => {
  if (__DEV__) {
    console.log('Bundle Analysis:');
    console.log('- React Native:', '~2.5MB');
    console.log('- Expo:', '~1.2MB');
    console.log('- Zustand:', '~15KB');
    console.log('- React Query:', '~25KB');
    console.log('- Navigation:', '~50KB');
    console.log('- Total estimated:', '~4MB');
  }
};
