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
    <ScreenContainer scrollable contentContainerStyle={styles.formContent}>
      <AuthHeader
        activeScreen="Login"
        onLogin={() => navigation.navigate('Login')}
        onRegister={() => navigation.navigate('Register')}
      />

      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Re-connect with your friend circle’s daily feed.</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="University Email"
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
          placeholder="••••••••"
          isPassword
          value={password}
          dense
          onChangeText={(val) => {
            setPassword(val);
            setError(null);
          }}
        />

        <Button
          title="Sign In to Circle  →"
          onPress={handleLogin}
          loading={loading}
          size="md"
          style={styles.submitBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don’t have an account yet? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Create Account</Text>
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