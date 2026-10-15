
/**
 * CampusCapsule Design System
 *
 * Philosophy: Warm collegiate archival aesthetic.
 * Focus is on shared human moments and photos,
 * avoiding generic AI/SaaS gradients and over-rounded bubbly components.
 */

import { Dimensions, PixelRatio } from 'react-native';

export const colors = {
  // Brand Forest Green (Figma primary)
  primary: {
    50: '#F2F6F0',
    100: '#E4EDE1',
    200: '#CADBC5',
    300: '#ABC3A4',
    400: '#6E9364',
    500: '#3F6338',
    600: '#34532D',
    700: '#294323',
    800: '#20341B',
    900: '#172613',
  },

  // Warm Terracotta / Apricot Accent (Figma secondary)
  secondary: {
    50: '#FDF4F0',
    100: '#FAE6DD',
    200: '#F5CBB9',
    300: '#EEAB91',
    400: '#E5835F',
    500: '#E06A42',
    600: '#C7542E',
    700: '#A73F1D',
    800: '#873014',
    900: '#6E240D',
  },

  // Light Mode (Figma warm porcelain ivory canvas & crisp cards)
  light: {
    background: '#F9F6F0',
    surface: '#FFFFFF',
    surfaceSubtle: '#F3EFE7',
    surfaceElevated: '#FFFFFF',
    border: '#E8E2D6',
    borderSubtle: '#F0ECE4',
    textPrimary: '#1E241C',
    textSecondary: '#565F52',
    textMuted: '#7E877A',
    textInverse: '#FFFFFF',
    overlay: 'rgba(22, 28, 20, 0.45)',
  },

  // Dark Mode
  dark: {
    background: '#151914',
    surface: '#1D221C',
    surfaceSubtle: '#262D25',
    surfaceElevated: '#2E362C',
    border: '#384236',
    borderSubtle: '#2C352A',
    textPrimary: '#F4F6F3',
    textSecondary: '#ACB5A9',
    textMuted: '#818C7E',
    textInverse: '#151914',
    overlay: 'rgba(0, 0, 0, 0.70)',
  },

  // Semantic colors
  status: {
    success: '#2E7D32',
    successBg: '#E8F5E9',
    warning: '#D97706',
    warningBg: '#FEF3C7',
    error: '#D32F2F',
    errorBg: '#FFEBEE',
    info: '#0284C7',
    infoBg: '#E0F2FE',
  },

  milestone: '#E06A42',
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 30,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeights: {
    xs: 16,
    sm: 18,
    base: 22,
    md: 24,
    lg: 26,
    xl: 28,
    xxl: 32,
    display: 38,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
  epic: 56,
};

export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  round: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  subtle: {
    shadowColor: '#1A2418',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  card: {
    shadowColor: '#1A2418',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  floating: {
    shadowColor: '#1A2418',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 5,
  },
};

/**
 * Responsive helpers
 *
 * These values are based on the device width rather than
 * assuming one particular Android screen size.
 */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

export const device = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,

  isSmall: SCREEN_WIDTH < 360,
  isMedium: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 600,
  isLarge: SCREEN_WIDTH >= 600,
};

/**
 * Scale values moderately.
 *
 * We don't want the UI to become excessively large
 * on tablets or very small on compact phones.
 */
export const responsive = {
  width: (percentage: number) =>
    Math.round((SCREEN_WIDTH * percentage) / 100),

  height: (percentage: number) =>
    Math.round((SCREEN_HEIGHT * percentage) / 100),

  fontSize: (size: number) => {
    const scale = SCREEN_WIDTH / 375;

    const scaled = size * scale;

    return Math.round(
      PixelRatio.roundToNearestPixel(
        Math.max(size * 0.9, Math.min(scaled, size * 1.15))
      )
    );
  },

  spacing: (size: number) => {
    const scale = SCREEN_WIDTH / 375;

    return Math.round(
      PixelRatio.roundToNearestPixel(
        Math.max(size * 0.85, Math.min(size * scale, size * 1.15))
      )
    );
  },
};

/**
 * Common horizontal screen padding.
 */
export const layout = {
  screenPadding: device.isSmall ? 16 : 20,
  screenPaddingLarge: device.isSmall ? 20 : 24,

  maxContentWidth: 600,

  buttonHeight: device.isSmall ? 48 : 52,
  inputHeight: device.isSmall ? 48 : 52,

  minTouchTarget: 44,
};
