import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './src/components/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
import { cleanupThemeStore } from './src/store/useThemeStore';
import './src/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  useEffect(() => {
    // Cleanup function for theme store
    return () => {
      cleanupThemeStore();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
