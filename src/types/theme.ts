// Theme tip tanımları
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
    pomodoro: {
      red: string;
      green: string;
      yellow: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    fontWeights: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
}

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

// Component style props
export interface StyleProps {
  style?: any;
  theme?: Theme;
}

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type ButtonSize = 'small' | 'medium' | 'large';

// Typography variants
export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';

export type TypographyColor = 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';

export type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export type TypographyAlign = 'left' | 'center' | 'right';
