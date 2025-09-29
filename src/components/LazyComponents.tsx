import React, { Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { lazyLoad } from '../utils/performance';

// Lazy loaded components
export const LazyTaskModal = lazyLoad(() => import('./molecules/TaskModal'));
export const LazyStatisticsScreen = lazyLoad(() => import('../screens/StatisticsScreen'));
export const LazySettingsScreen = lazyLoad(() => import('../screens/SettingsScreen'));
export const LazyExportModal = lazyLoad(() => import('./molecules/ExportModal'));
export const LazySoundSelectionModal = lazyLoad(() => import('./molecules/SoundSelectionModal'));
export const LazyInterruptionModal = lazyLoad(() => import('./molecules/InterruptionModal'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  }}>
    <ActivityIndicator size="large" color="#3B82F6" />
  </View>
);

// HOC for lazy loading with suspense
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Preload components for better UX
export const preloadComponents = (): void => {
  // Preload critical components
  import('./molecules/TaskModal');
  import('./molecules/SoundSelectionModal');
  import('./molecules/InterruptionModal');
};

// Component chunking strategy
export const ComponentChunks = {
  // Critical components (loaded immediately)
  critical: [
    'Button',
    'Typography',
    'Card',
    'TimerScreen',
    'DashboardScreen',
  ],
  
  // Secondary components (lazy loaded)
  secondary: [
    'TaskModal',
    'StatisticsScreen',
    'SettingsScreen',
    'ExportModal',
  ],
  
  // Optional components (loaded on demand)
  optional: [
    'SoundSelectionModal',
    'InterruptionModal',
    'AutoRescheduleModal',
    'BreakGuideModal',
  ],
};
