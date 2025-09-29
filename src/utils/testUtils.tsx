import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../components/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Test theme provider
const TestThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

// Test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = createTestQueryClient();
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TestThemeProvider>
          {children}
        </TestThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock data generators
export const mockTask = (overrides = {}) => ({
  id: 'test-task-1',
  title: 'Test Task',
  description: 'Test Description',
  estimatedPomodoros: 2,
  completedPomodoros: 0,
  priority: 'medium' as const,
  tags: ['test'],
  isCompleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockPomodoroSession = (overrides = {}) => ({
  id: 'test-session-1',
  taskId: 'test-task-1',
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: new Date('2024-01-01T10:25:00Z'),
  duration: 25,
  isCompleted: true,
  isBreak: false,
  interruptions: 0,
  interruptionList: [],
  ...overrides,
});

export const mockUserStats = (overrides = {}) => ({
  level: 5,
  xp: 1250,
  totalXp: 5000,
  currentStreak: 7,
  longestStreak: 15,
  totalPomodoros: 50,
  totalTasks: 25,
  totalFocusTime: 1250,
  badges: [],
  achievements: [],
  lastActiveDate: new Date().toDateString(),
  ...overrides,
});

// Test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

export const mockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

// Store testing utilities
export const createMockStore = (initialState = {}) => ({
  getState: jest.fn(() => initialState),
  setState: jest.fn(),
  subscribe: jest.fn(),
  destroy: jest.fn(),
});

// Performance testing utilities
export const measureRenderTime = async (component: React.ReactElement) => {
  const start = performance.now();
  const { unmount } = customRender(component);
  const end = performance.now();
  unmount();
  
  return end - start;
};

// Memory testing utilities
export const getMemoryUsage = () => {
  if (global.performance && global.performance.memory) {
    return global.performance.memory;
  }
  return null;
};

// Accessibility testing utilities
export const getAccessibilityTree = (container: any) => {
  const tree: any[] = [];
  
  const traverse = (node: any) => {
    if (node.props && node.props.accessibilityLabel) {
      tree.push({
        role: node.props.accessibilityRole,
        label: node.props.accessibilityLabel,
        hint: node.props.accessibilityHint,
        state: node.props.accessibilityState,
      });
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  
  traverse(container);
  return tree;
};

// Export custom render
export * from '@testing-library/react-native';
export { customRender as render };
