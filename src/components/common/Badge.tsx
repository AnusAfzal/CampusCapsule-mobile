import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

export type BadgeVariant = 'primary' | 'secondary' | 'neutral' | 'admin' | 'success' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'admin':
        return {
          bg: '#FEF3C7',
          text: '#92400E',
          border: '#FDE68A',
        };
      case 'primary':
        return {
          bg: colors.primary[50],
          text: colors.primary[700],
          border: colors.primary[200],
        };
      case 'secondary':
        return {
          bg: colors.secondary[50],
          text: colors.secondary[700],
          border: colors.secondary[200],
        };
      case 'success':
        return {
          bg: colors.status.successBg,
          text: colors.status.success,
          border: '#BBF7D0',
        };
      case 'warning':
        return {
          bg: colors.status.warningBg,
          text: colors.status.warning,
          border: '#FDE68A',
        };
      case 'neutral':
      default:
        return {
          bg: colors.light.surfaceSubtle,
          text: colors.light.textSecondary,
          border: colors.light.border,
        };
    }
  };

  const current = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: current.bg, borderColor: current.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: current.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.3,
  },
});
