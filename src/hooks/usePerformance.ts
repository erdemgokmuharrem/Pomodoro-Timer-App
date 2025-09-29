import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle, PerformanceMonitor } from '../utils/performance';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  useEffect(() => {
    monitor.startTiming(componentName);
    return () => {
      const duration = monitor.endTiming(componentName);
      if (__DEV__) {
        console.log(`${componentName} render time: ${duration}ms`);
      }
    };
  }, [componentName]);
};

// Debounced callback hook
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );
  
  return debouncedCallback as T;
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  );
  
  return throttledCallback as T;
};

// Memoized expensive calculations
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (
  itemHeight: number,
  containerHeight: number,
  totalItems: number
) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      totalItems
    );
    
    return {
      startIndex,
      endIndex,
      visibleCount: endIndex - startIndex,
    };
  }, [scrollOffset, itemHeight, containerHeight, totalItems]);
  
  const handleScroll = useThrottledCallback((offset: number) => {
    setScrollOffset(offset);
  }, 16); // 60fps
  
  return {
    visibleItems,
    handleScroll,
    totalHeight: totalItems * itemHeight,
  };
};

// Memory usage monitoring hook
export const useMemoryUsage = (interval: number = 5000) => {
  const [memoryUsage, setMemoryUsage] = useState({
    used: 0,
    total: 0,
    percentage: 0,
  });
  
  useEffect(() => {
    const updateMemoryUsage = async () => {
      try {
        const usage = await getMemoryUsage();
        setMemoryUsage(usage);
      } catch (error) {
        console.error('Failed to get memory usage:', error);
      }
    };
    
    updateMemoryUsage();
    const intervalId = setInterval(updateMemoryUsage, interval);
    
    return () => clearInterval(intervalId);
  }, [interval]);
  
  return memoryUsage;
};

// Component render optimization
export const useRenderOptimization = <T extends object>(
  props: T,
  shouldUpdate: (prev: T, next: T) => boolean = (prev, next) => prev !== next
) => {
  const prevProps = useRef<T>();
  const shouldRender = useRef(true);
  
  if (prevProps.current && shouldUpdate(prevProps.current, props)) {
    shouldRender.current = true;
  } else if (prevProps.current) {
    shouldRender.current = false;
  }
  
  prevProps.current = props;
  
  return shouldRender.current;
};

// Image loading optimization
export const useImageOptimization = (uri: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const optimizedUri = useMemo(() => {
    if (!uri) return uri;
    
    const params = new URLSearchParams();
    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    if (options?.quality) params.append('q', options.quality.toString());
    params.append('f', 'auto');
    
    return `${uri}?${params.toString()}`;
  }, [uri, options]);
  
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);
  
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setError(error.message || 'Failed to load image');
  }, []);
  
  return {
    optimizedUri,
    isLoading,
    error,
    handleLoad,
    handleError,
  };
};

// Bundle size monitoring
export const useBundleSize = () => {
  const [bundleSize, setBundleSize] = useState({
    total: 0,
    components: {} as Record<string, number>,
  });
  
  useEffect(() => {
    if (__DEV__) {
      // Simulate bundle size analysis
      const mockBundleSize = {
        total: 4.2, // MB
        components: {
          'Button': 0.001,
          'Typography': 0.002,
          'TimerScreen': 0.05,
          'DashboardScreen': 0.08,
          'TaskModal': 0.03,
          'StatisticsScreen': 0.12,
        },
      };
      
      setBundleSize(mockBundleSize);
    }
  }, []);
  
  return bundleSize;
};
