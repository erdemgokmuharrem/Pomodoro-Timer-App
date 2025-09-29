import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useResponsive } from '../utils/platformUtils';

interface ResponsiveComponentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  breakpoint?: 'small' | 'medium' | 'large' | 'xlarge';
  hideOnBreakpoint?: 'small' | 'medium' | 'large' | 'xlarge';
  showOnBreakpoint?: 'small' | 'medium' | 'large' | 'xlarge';
}

export const ResponsiveComponent: React.FC<ResponsiveComponentProps> = ({
  children,
  style,
  textStyle,
  breakpoint,
  hideOnBreakpoint,
  showOnBreakpoint,
}) => {
  const responsive = useResponsive();
  
  // Check visibility based on breakpoint
  const shouldShow = () => {
    if (hideOnBreakpoint && responsive.isBreakpoint(hideOnBreakpoint)) {
      return false;
    }
    if (showOnBreakpoint && !responsive.isBreakpoint(showOnBreakpoint)) {
      return false;
    }
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  // Get responsive styles
  const responsiveStyle = responsive.getPlatformStyles(style || {});
  const responsiveTextStyle = textStyle ? responsive.getPlatformStyles(textStyle) : {};

  return (
    <View style={[styles.container, responsiveStyle]}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'Text') {
          return React.cloneElement(child, {
            style: [child.props.style, responsiveTextStyle],
          });
        }
        return child;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  style,
  size = 'md',
  weight = 'normal',
  color,
  align = 'left',
  numberOfLines,
}) => {
  const responsive = useResponsive();
  
  const getFontSize = () => {
    const sizeMap = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    };
    
    return responsive.getResponsiveFontSize(sizeMap[size]);
  };

  const getFontWeight = () => {
    const weightMap = {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    };
    
    return weightMap[weight];
  };

  const responsiveStyle: TextStyle = {
    fontSize: getFontSize(),
    fontWeight: getFontWeight(),
    color: color || '#1E293B',
    textAlign: align,
    lineHeight: getFontSize() * responsive.typography.lineHeight,
  };

  return (
    <ResponsiveComponent textStyle={[responsiveStyle, style]}>
      {children}
    </ResponsiveComponent>
  );
};

// Responsive Button Component
interface ResponsiveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const responsive = useResponsive();
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: responsive.getResponsiveSpacing('sm'),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: responsive.getResponsiveSpacing('sm'),
        paddingVertical: responsive.getResponsiveSpacing('xs'),
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: responsive.getResponsiveSpacing('md'),
        paddingVertical: responsive.getResponsiveSpacing('sm'),
        minHeight: 44,
      },
      large: {
        paddingHorizontal: responsive.getResponsiveSpacing('lg'),
        paddingVertical: responsive.getResponsiveSpacing('md'),
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? '#9CA3AF' : '#3B82F6',
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? '#9CA3AF' : '#3B82F6',
      },
      danger: {
        backgroundColor: disabled ? '#9CA3AF' : '#EF4444',
        borderWidth: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    return responsive.getPlatformStyles({
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...style,
    });
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles = {
      small: { fontSize: responsive.getResponsiveFontSize(14) },
      medium: { fontSize: responsive.getResponsiveFontSize(16) },
      large: { fontSize: responsive.getResponsiveFontSize(18) },
    };

    const variantStyles = {
      primary: { color: 'white' },
      secondary: { color: disabled ? '#9CA3AF' : '#3B82F6' },
      danger: { color: 'white' },
      ghost: { color: disabled ? '#9CA3AF' : '#3B82F6' },
    };

    return responsive.getPlatformStyles({
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    });
  };

  return (
    <ResponsiveComponent style={getButtonStyle()}>
      <ResponsiveText style={getTextStyle()}>
        {loading ? 'Yükleniyor...' : title}
      </ResponsiveText>
    </ResponsiveComponent>
  );
};
