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

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = useAuthStore((state) => state.login);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      await loginUser(data);

      navigation.getParent()?.navigate('MainTabs', {
        screen: 'Home',
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header
        title="Create Account"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScreenContainer scrollable>
        <View style={styles.formContent}>
          <Text style={styles.title}>Join CampusCapsule</Text>

          <Text style={styles.subtitle}>
            Create your profile to start creating and sharing daily moments
            with your circle.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="Alex Johnson"
            autoCapitalize="words"
            value={name}
            onChangeText={(val) => {
              setName(val);
              setError(null);
            }}
          />

          <Input
            label="Email Address"
            placeholder="alex@university.edu"
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
            placeholder="At least 6 characters"
            isPassword
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              setError(null);
            }}
            helperText="Make it secure to safeguard your private group memories."
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?{' '}</Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
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