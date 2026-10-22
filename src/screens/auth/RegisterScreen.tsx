import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AuthHeader } from '../../components/layout/AuthHeader';
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
    <ScreenContainer scrollable contentContainerStyle={styles.formContent}>
      <AuthHeader
        activeScreen="Register"
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      <View style={styles.form}>
        <Text style={styles.title}>Join Moment</Text>
        <Text style={styles.subtitle}>Start archiving daily moments for your 4-year circle.</Text>

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
          dense
          onChangeText={(val) => {
            setName(val);
            setError(null);
          }}
        />

        <Input
          label="Student Email"
          placeholder="student@university.edu"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          dense
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
          dense
          onChangeText={(val) => {
            setPassword(val);
            setError(null);
          }}
        />

        <Button
          title="Create Account  →"
          onPress={handleRegister}
          loading={loading}
          size="md"
          style={styles.submitBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  formContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  form: {
    paddingTop: spacing.xxl,
  },
  title: {
    fontFamily: typography.families.serif,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: typography.weights.bold,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 15,
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
    marginTop: spacing.xs,
    minHeight: 42,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.light.border,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textSecondary,
  },
  linkText: {
    fontSize: typography.sizes.xs,
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
    textDecorationLine: 'underline',
  },
});