import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { restoreSession, user, isRestoring } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await restoreSession();
    };
    init();
  }, []);

  useEffect(() => {
    if (!isRestoring) {
      if (user) {
        navigation.replace('MainTabs', { screen: 'Home' });
      } else {
        navigation.replace('Auth', { screen: 'Welcome' });
      }
    }
  }, [isRestoring, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Ionicons name="school-outline" size={32} color={colors.light.surface} />
      </View>
      <Text style={styles.brandTitle}>Moment</Text>
      <Text style={styles.brandSubtitle}>A daily archive for your circle</Text>
      <ActivityIndicator
        size="small"
        color={colors.primary[500]}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  brandTitle: {
    fontFamily: typography.families.serif,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.light.textMuted,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
  spinner: {
    marginTop: spacing.xxl,
  },
});
