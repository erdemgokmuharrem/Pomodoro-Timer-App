import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { TypographyVariant, TypographyColor, TypographyWeight, TypographyAlign } from '../../types';

interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  style?: TextStyle;
  numberOfLines?: number;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  style,
  numberOfLines,
}) => {
  const { theme } = useTheme();

  const getVariantStyle = (): TextStyle => {
    const variantStyles = {
      h1: { 
        fontSize: theme.typography.fontSizes.xxxl, 
        lineHeight: theme.typography.fontSizes.xxxl * 1.25, 
        fontWeight: theme.typography.fontWeights.bold 
      },
      h2: { 
        fontSize: theme.typography.fontSizes.xxl, 
        lineHeight: theme.typography.fontSizes.xxl * 1.33, 
        fontWeight: theme.typography.fontWeights.bold 
      },
      h3: { 
        fontSize: theme.typography.fontSizes.xl, 
        lineHeight: theme.typography.fontSizes.xl * 1.4, 
        fontWeight: theme.typography.fontWeights.semibold 
      },
      h4: { 
        fontSize: theme.typography.fontSizes.lg, 
        lineHeight: theme.typography.fontSizes.lg * 1.33, 
        fontWeight: theme.typography.fontWeights.semibold 
      },
      body: { 
        fontSize: theme.typography.fontSizes.md, 
        lineHeight: theme.typography.fontSizes.md * 1.5, 
        fontWeight: theme.typography.fontWeights.normal 
      },
      caption: { 
        fontSize: theme.typography.fontSizes.sm, 
        lineHeight: theme.typography.fontSizes.sm * 1.43, 
        fontWeight: theme.typography.fontWeights.normal 
      },
      label: { 
        fontSize: theme.typography.fontSizes.xs, 
        lineHeight: theme.typography.fontSizes.xs * 1.33, 
        fontWeight: theme.typography.fontWeights.medium 
      },
    };
    return variantStyles[variant];
  };

  const getColorStyle = (): TextStyle => {
    const colorStyles = {
      primary: { color: theme.colors.text.primary },
      secondary: { color: theme.colors.text.secondary },
      muted: { color: theme.colors.text.muted },
      success: { color: theme.colors.success },
      warning: { color: theme.colors.warning },
      error: { color: theme.colors.error },
    };
    return colorStyles[color];
  };

  const getWeightStyle = (): TextStyle => {
    const weightStyles = {
      normal: { fontWeight: theme.typography.fontWeights.normal },
      medium: { fontWeight: theme.typography.fontWeights.medium },
      semibold: { fontWeight: theme.typography.fontWeights.semibold },
      bold: { fontWeight: theme.typography.fontWeights.bold },
    };
    return weightStyles[weight];
  };

  const getAlignStyle = (): TextStyle => {
    return { textAlign: align };
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        getColorStyle(),
        getWeightStyle(),
        getAlignStyle(),
        style,
      ]}
      numberOfLines={numberOfLines}
      accessibilityRole="text"
      accessibilityLabel={typeof children === 'string' ? children : undefined}
    >
      {children}
    </Text>
  );
};

export default Typography;
