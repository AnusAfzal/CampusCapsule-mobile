import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Header } from '../../components/layout/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, typography } from '../../constants/theme';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      await loginUser(data);

      navigation.getParent()?.navigate('MainTabs', {
        screen: 'Home',
      });
    } catch (err: any) {
      setError(
        err.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header
        title="Sign In"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScreenContainer scrollable>
        <View style={styles.formContent}>
          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Enter your details to reconnect with your friend group.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email Address"
            placeholder="student@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              setError(null);
            }}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setError(null);
            }}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Don't have an account yet?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.replace('Register')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  formContent: {
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.light.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.base,
  },
  errorBox: {
    backgroundColor: colors.status.errorBg,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.status.error,
    borderLeftWidth: 3,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.base,
    color: colors.light.textSecondary,
  },
  linkText: {
    fontSize: typography.sizes.base,
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
  },
});