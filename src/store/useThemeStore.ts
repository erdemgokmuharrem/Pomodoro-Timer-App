import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Appearance } from 'react-native';
import { Theme, ThemeMode, lightTheme, darkTheme } from '../constants/theme';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  getSystemTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      theme: lightTheme,

      setMode: (mode: ThemeMode) => {
        const systemTheme = get().getSystemTheme();
        const theme = mode === 'system' 
          ? (systemTheme === 'dark' ? darkTheme : lightTheme)
          : mode === 'dark' 
          ? darkTheme 
          : lightTheme;

        set({ mode, theme });
      },

      toggleTheme: () => {
        const currentMode = get().mode;
        const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
        get().setMode(newMode);
      },

      getSystemTheme: () => {
        return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

// Listen to system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  const store = useThemeStore.getState();
  if (store.mode === 'system') {
    store.setMode('system');
  }
});
