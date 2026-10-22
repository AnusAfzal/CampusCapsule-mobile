import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'images-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={colors.primary[500]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <View style={styles.buttonWrapper}>
          <Button
            title={actionTitle}
            onPress={onAction}
            size="md"
            variant="primary"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    marginVertical: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  title: {
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.base,
    maxWidth: 300,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
});
