import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface AuthHeaderProps {
  activeScreen: 'Login' | 'Register';
  onLogin: () => void;
  onRegister: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  activeScreen,
  onLogin,
  onRegister,
}) => (
  <>
    <View style={styles.brandRow}>
      <View style={styles.brandMark}>
        <Ionicons name="school" size={17} color="#FFFFFF" />
      </View>
      <Text style={styles.brandName}>Moment</Text>
      <View style={styles.circleBadge}>
        <Text style={styles.circleBadgeText}>4-YR CIRCLE</Text>
      </View>
    </View>

    <View style={styles.archiveCard}>
      <View style={styles.archiveIcon}>
        <Ionicons name="images-outline" size={19} color={colors.light.textPrimary} />
      </View>
      <View style={styles.archiveCopy}>
        <Text style={styles.archiveTitle}>Your circle’s archive</Text>
        <Text style={styles.archiveSubtitle}>A place for the days you’ll want back.</Text>
      </View>
    </View>

    <View style={styles.modeSwitch}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ selected: activeScreen === 'Login' }}
        style={[styles.modeButton, activeScreen === 'Login' && styles.modeButtonActive]}
        onPress={onLogin}
      >
        <Text style={[styles.modeText, activeScreen === 'Login' && styles.modeTextActive]}>
          Sign In
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ selected: activeScreen === 'Register' }}
        style={[styles.modeButton, activeScreen === 'Register' && styles.modeButtonActive]}
        onPress={onRegister}
      >
        <Text style={[styles.modeText, activeScreen === 'Register' && styles.modeTextActive]}>
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  </>
);

const styles = StyleSheet.create({
  brandRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.textPrimary,
  },
  brandName: {
    flex: 1,
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  circleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    backgroundColor: colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  circleBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    letterSpacing: 0.25,
  },
  archiveCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  archiveIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveCopy: {
    flex: 1,
  },
  archiveTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
  },
  archiveSubtitle: {
    fontSize: 10,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  modeSwitch: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: 3,
    borderRadius: radius.round,
    backgroundColor: colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.light.borderSubtle,
  },
  modeButton: {
    flex: 1,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
  },
  modeButtonActive: {
    backgroundColor: colors.light.surface,
  },
  modeText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: colors.light.textMuted,
  },
  modeTextActive: {
    color: colors.light.textPrimary,
    fontWeight: typography.weights.bold,
  },
});
