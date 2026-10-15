import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Button } from './Button';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Something went wrong while communicating with the server.',
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.status.error} />
      </View>
      <Text style={styles.title}>Connection Issue</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={styles.buttonWrapper}>
          <Button
            title="Try Again"
            onPress={onRetry}
            size="md"
            variant="outline"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.base,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.status.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.base,
    maxWidth: 280,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
});
