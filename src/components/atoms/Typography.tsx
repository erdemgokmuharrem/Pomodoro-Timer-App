import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
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
  const getVariantStyle = (): TextStyle => {
    const variantStyles = {
      h1: { fontSize: 32, lineHeight: 40, fontWeight: 'bold' },
      h2: { fontSize: 24, lineHeight: 32, fontWeight: 'bold' },
      h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
      h4: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
      body: { fontSize: 16, lineHeight: 24, fontWeight: 'normal' },
      caption: { fontSize: 14, lineHeight: 20, fontWeight: 'normal' },
      label: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
    };
    return variantStyles[variant];
  };

  const getColorStyle = (): TextStyle => {
    const colorStyles = {
      primary: { color: '#1E293B' },
      secondary: { color: '#64748B' },
      muted: { color: '#9CA3AF' },
      success: { color: '#10B981' },
      warning: { color: '#F59E0B' },
      error: { color: '#EF4444' },
    };
    return colorStyles[color];
  };

  const getWeightStyle = (): TextStyle => {
    const weightStyles = {
      normal: { fontWeight: 'normal' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: 'bold' },
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
    >
      {children}
    </Text>
  );
};

export default Typography;
