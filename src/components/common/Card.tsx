import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.light.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.light.borderSubtle,
          ...shadows.card,
        };
      case 'outlined':
        return {
          backgroundColor: colors.light.surface,
          borderWidth: 1.5,
          borderColor: colors.light.border,
        };
      case 'subtle':
        return {
          backgroundColor: colors.light.surfaceSubtle,
          borderWidth: 1,
          borderColor: colors.light.borderSubtle,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.light.surface,
          borderWidth: 1,
          borderColor: colors.light.borderSubtle,
        };
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: spacing.sm };
      case 'lg':
        return { padding: spacing.xl };
      case 'md':
      default:
        return { padding: spacing.base };
    }
  };

  return (
    <View style={[styles.base, getVariantStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
