import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  isPassword = false,
  containerStyle,
  style,
  multiline = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          props.editable === false && styles.inputDisabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          {...props}
          multiline={multiline}
          placeholderTextColor={colors.light.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(event) => {
            setIsFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            props.onBlur?.(event);
          }}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            style,
          ]}
        />

        {isPassword && !multiline && (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
          >
            <Ionicons
              name={
                showPassword
                  ? 'eye-off-outline'
                  : 'eye-outline'
              }
              size={20}
              color={colors.light.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.base,
  },

  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },

  inputContainer: {
    width: '100%',
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderWidth: 1.5,
    borderColor: colors.light.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },

  inputContainerMultiline: {
    alignItems: 'stretch',
    minHeight: 120,
    paddingVertical: spacing.sm,
  },

  inputFocused: {
    borderColor: colors.primary[500],
    backgroundColor: colors.light.surface,
  },

  inputError: {
    borderColor: colors.status.error,
  },
  inputDisabled: {
    backgroundColor: colors.light.surfaceSubtle,
  },

  leftIconContainer: {
    marginRight: spacing.sm,
    alignSelf: 'center',
  },

  input: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    color: colors.light.textPrimary,
    paddingVertical: 0,
  },

  multilineInput: {
    minHeight: 96,
    height: 'auto',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    textAlignVertical: 'top',
  },

  rightIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    alignSelf: 'center',
  },

  errorText: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },

  helperText: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    color: colors.light.textMuted,
    marginTop: spacing.xs,
  },
});