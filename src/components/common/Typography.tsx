import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors, typography } from '../../constants/theme';

interface TextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  color?: string;
  numberOfLines?: number;
  align?: 'left' | 'center' | 'right';
}

export const DisplayText: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.display,
      { color: color || colors.light.textPrimary, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const Heading1: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.h1,
      { color: color || colors.light.textPrimary, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const Heading2: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.h2,
      { color: color || colors.light.textPrimary, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const Heading3: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.h3,
      { color: color || colors.light.textPrimary, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const BodyText: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.body,
      { color: color || colors.light.textSecondary, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const BodyMedium: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.bodyMedium,
      { color: color || colors.light.textPrimary, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const CaptionText: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.caption,
      { color: color || colors.light.textMuted, textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

export const TagText: React.FC<TextProps> = ({ children, style, color, numberOfLines, align }) => (
  <Text
    numberOfLines={numberOfLines}
    style={[
      styles.tag,
      { color: color || colors.primary[600], textAlign: align || 'left' },
      style,
    ]}
  >
    {children}
  </Text>
);

const styles = StyleSheet.create({
  display: {
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeights.display,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.6,
  },
  h1: {
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.semibold,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.semibold,
  },
  body: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    fontWeight: typography.weights.regular,
  },
  bodyMedium: {
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeights.base,
    fontWeight: typography.weights.medium,
  },
  caption: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.regular,
  },
  tag: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
