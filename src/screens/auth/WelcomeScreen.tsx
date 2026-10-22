import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.brandRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="images" size={19} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Moment</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>4-year circle</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.headline}>Keep the days{'\n'}you'll want back.</Text>
          <Text style={styles.subtext}>
          A shared memory book for the ordinary days, big milestones, and friends who made university yours.
          </Text>
        </View>

        <View style={styles.perksList}>
          <View style={styles.perkItem}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.perkText}>100% Private, invite-only university circles</Text>
          </View>
          <View style={styles.perkItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.perkText}>1 photo max per person each calendar day</Text>
          </View>
          <View style={styles.perkItem}>
            <Ionicons name="albums-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.perkText}>Yearly & semester graduation archives</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Button
          title="Create an Account"
          onPress={() => navigation.navigate('Register')}
          size="lg"
          variant="primary"
          style={styles.actionBtn}
        />
        <Button
          title="Sign In to Existing Group"
          onPress={() => navigation.navigate('Login')}
          size="lg"
          variant="outline"
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  badge: {
    backgroundColor: colors.light.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.primary[700],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroCard: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: colors.light.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    flex: 1,
  },
  headline: {
    fontFamily: typography.families.serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    color: colors.light.textSecondary,
    marginTop: spacing.md,
  },
  perksList: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  perkText: {
    fontSize: typography.sizes.base,
    color: colors.light.textSecondary,
    fontWeight: typography.weights.medium,
  },
  bottomSection: {
    paddingBottom: spacing.base,
    gap: spacing.md,
  },
  actionBtn: {
    borderRadius: radius.md,
  },
});
