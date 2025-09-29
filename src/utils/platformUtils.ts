// Cross-platform utilities and optimizations
import { Platform, Dimensions, PixelRatio } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export interface PlatformConfig {
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  platformVersion: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isTablet: boolean;
  isSmallScreen: boolean;
  isLargeScreen: boolean;
}

export interface ResponsiveConfig {
  breakpoints: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    scale: number;
    lineHeight: number;
  };
}

export class PlatformUtils {
  private static instance: PlatformUtils;
  private config: PlatformConfig;
  private responsiveConfig: ResponsiveConfig;

  private constructor() {
    const { width, height } = Dimensions.get('window');
    
    this.config = {
      isIOS: Platform.OS === 'ios',
      isAndroid: Platform.OS === 'android',
      isWeb: Platform.OS === 'web',
      platformVersion: Platform.Version.toString(),
      screenWidth: width,
      screenHeight: height,
      pixelRatio: PixelRatio.get(),
      isTablet: this.isTabletDevice(width, height),
      isSmallScreen: width < 375,
      isLargeScreen: width > 768,
    };

    this.responsiveConfig = {
      breakpoints: {
        small: 375,
        medium: 768,
        large: 1024,
        xlarge: 1200,
      },
      spacing: {
        xs: this.getResponsiveSpacing(4),
        sm: this.getResponsiveSpacing(8),
        md: this.getResponsiveSpacing(16),
        lg: this.getResponsiveSpacing(24),
        xl: this.getResponsiveSpacing(32),
        xxl: this.getResponsiveSpacing(48),
      },
      typography: {
        scale: this.getTypographyScale(),
        lineHeight: this.getLineHeight(),
      },
    };
  }

  static getInstance(): PlatformUtils {
    if (!PlatformUtils.instance) {
      PlatformUtils.instance = new PlatformUtils();
    }
    return PlatformUtils.instance;
  }

  // Get platform configuration
  getConfig(): PlatformConfig {
    return this.config;
  }

  // Get responsive configuration
  getResponsiveConfig(): ResponsiveConfig {
    return this.responsiveConfig;
  }

  // Check if device is tablet
  private isTabletDevice(width: number, height: number): boolean {
    const aspectRatio = height / width;
    const pixelDensity = PixelRatio.get();
    
    return (
      (Math.min(width, height) >= 600) ||
      (pixelDensity < 2 && Math.min(width, height) >= 500) ||
      (aspectRatio <= 1.6 && Math.min(width, height) >= 500)
    );
  }

  // Get responsive spacing based on screen size
  private getResponsiveSpacing(baseSpacing: number): number {
    const { screenWidth } = this.config;
    
    if (screenWidth < 375) {
      return baseSpacing * 0.8; // Small screens
    } else if (screenWidth > 768) {
      return baseSpacing * 1.2; // Large screens
    }
    
    return baseSpacing;
  }

  // Get typography scale based on platform
  private getTypographyScale(): number {
    if (this.config.isIOS) {
      return this.config.isTablet ? 1.1 : 1.0;
    } else if (this.config.isAndroid) {
      return this.config.isTablet ? 1.05 : 0.95;
    }
    
    return 1.0; // Web
  }

  // Get line height multiplier
  private getLineHeight(): number {
    if (this.config.isIOS) {
      return 1.2;
    } else if (this.config.isAndroid) {
      return 1.3;
    }
    
    return 1.25; // Web
  }

  // Get responsive font size
  getResponsiveFontSize(baseSize: number): number {
    const scale = this.responsiveConfig.typography.scale;
    const { screenWidth } = this.config;
    
    let responsiveSize = baseSize * scale;
    
    // Adjust for screen size
    if (screenWidth < 375) {
      responsiveSize *= 0.9;
    } else if (screenWidth > 768) {
      responsiveSize *= 1.1;
    }
    
    return Math.round(responsiveSize);
  }

  // Get responsive spacing by key
  getResponsiveSpacingByKey(size: keyof ResponsiveConfig['spacing']): number {
    return this.responsiveConfig.spacing[size];
  }

  // Get breakpoint
  getBreakpoint(): 'small' | 'medium' | 'large' | 'xlarge' {
    const { screenWidth } = this.config;
    const { breakpoints } = this.responsiveConfig;
    
    if (screenWidth >= breakpoints.xlarge) return 'xlarge';
    if (screenWidth >= breakpoints.large) return 'large';
    if (screenWidth >= breakpoints.medium) return 'medium';
    return 'small';
  }

  // Check if current breakpoint matches
  isBreakpoint(breakpoint: keyof ResponsiveConfig['breakpoints']): boolean {
    const currentBreakpoint = this.getBreakpoint();
    const breakpointOrder = ['small', 'medium', 'large', 'xlarge'];
    
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    
    return currentIndex >= targetIndex;
  }

  // Get platform-specific styles
  getPlatformStyles(baseStyles: any): any {
    const platformStyles = { ...baseStyles };
    
    if (this.config.isIOS) {
      // iOS-specific adjustments
      if (platformStyles.shadowColor) {
        platformStyles.shadowOffset = { width: 0, height: 2 };
        platformStyles.shadowOpacity = 0.1;
        platformStyles.shadowRadius = 4;
      }
    } else if (this.config.isAndroid) {
      // Android-specific adjustments
      if (platformStyles.shadowColor) {
        platformStyles.elevation = 4;
        delete platformStyles.shadowOffset;
        delete platformStyles.shadowOpacity;
        delete platformStyles.shadowRadius;
      }
    }
    
    return platformStyles;
  }

  // Get safe area insets
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    // This would typically use react-native-safe-area-context
    // For now, return default values
    return {
      top: this.config.isIOS ? 44 : 24,
      bottom: this.config.isIOS ? 34 : 0,
      left: 0,
      right: 0,
    };
  }

  // Get keyboard behavior
  getKeyboardBehavior(): 'padding' | 'height' | 'position' {
    if (this.config.isIOS) {
      return 'padding';
    } else if (this.config.isAndroid) {
      return 'height';
    }
    
    return 'padding'; // Web
  }

  // Get haptic feedback settings
  getHapticSettings(): { enabled: boolean; intensity: 'light' | 'medium' | 'heavy' } {
    return {
      enabled: this.config.isIOS || (this.config.isAndroid && this.config.platformVersion >= '10'),
      intensity: this.config.isIOS ? 'medium' : 'light',
    };
  }

  // Get status bar style
  getStatusBarStyle(): 'light' | 'dark' | 'auto' {
    if (this.config.isIOS) {
      return 'dark';
    } else if (this.config.isAndroid) {
      return 'light';
    }
    
    return 'auto'; // Web
  }

  // Get navigation style
  getNavigationStyle(): {
    headerStyle: any;
    headerTitleStyle: any;
    tabBarStyle: any;
  } {
    const baseHeaderStyle = {
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    };

    const baseHeaderTitleStyle = {
      fontSize: this.getResponsiveFontSize(18),
      fontWeight: '600',
      color: '#1E293B',
    };

    const baseTabBarStyle = {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 0,
      elevation: 8,
      shadowOpacity: 0.1,
    };

    if (this.config.isIOS) {
      return {
        headerStyle: {
          ...baseHeaderStyle,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 2,
        },
        headerTitleStyle: baseHeaderTitleStyle,
        tabBarStyle: {
          ...baseTabBarStyle,
          shadowOffset: { width: 0, height: -1 },
          shadowRadius: 4,
        },
      };
    } else if (this.config.isAndroid) {
      return {
        headerStyle: {
          ...baseHeaderStyle,
          elevation: 4,
        },
        headerTitleStyle: baseHeaderTitleStyle,
        tabBarStyle: {
          ...baseTabBarStyle,
          elevation: 8,
        },
      };
    }

    return {
      headerStyle: baseHeaderStyle,
      headerTitleStyle: baseHeaderTitleStyle,
      tabBarStyle: baseTabBarStyle,
    };
  }

  // Get performance optimizations
  getPerformanceOptimizations(): {
    enableHermes: boolean;
    enableFlipper: boolean;
    enableNewArchitecture: boolean;
    memoryOptimization: boolean;
  } {
    return {
      enableHermes: this.config.isAndroid,
      enableFlipper: __DEV__ && this.config.isIOS,
      enableNewArchitecture: false, // Enable when stable
      memoryOptimization: true,
    };
  }

  // Get platform-specific error handling
  getErrorHandling(): {
    showErrorBoundary: boolean;
    enableCrashReporting: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  } {
    return {
      showErrorBoundary: true,
      enableCrashReporting: !__DEV__,
      logLevel: __DEV__ ? 'debug' : 'error',
    };
  }
}

// Export singleton instance
export const platformUtils = PlatformUtils.getInstance();

// Responsive hook
export const useResponsive = () => {
  const config = platformUtils.getConfig();
  const responsiveConfig = platformUtils.getResponsiveConfig();
  
  return {
    ...config,
    ...responsiveConfig,
    isBreakpoint: platformUtils.isBreakpoint.bind(platformUtils),
    getResponsiveFontSize: platformUtils.getResponsiveFontSize.bind(platformUtils),
    getResponsiveSpacing: platformUtils.getResponsiveSpacingByKey.bind(platformUtils),
    getPlatformStyles: platformUtils.getPlatformStyles.bind(platformUtils),
  };
};
