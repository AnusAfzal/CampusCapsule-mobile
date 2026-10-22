
import { Dimensions, PixelRatio } from 'react-native';

export const colors = {
  primary: {
    50: '#F5F3EF',
    100: '#EAE7E1',
    200: '#D8D4CC',
    300: '#B8B4AC',
    400: '#77736D',
    500: '#111111',
    600: '#242424',
    700: '#191919',
    800: '#111111',
    900: '#090909',
  },

  secondary: {
    50: '#F7F5F1',
    100: '#EEEAE3',
    200: '#DED9D0',
    300: '#C5BFB5',
    400: '#969087',
    500: '#65615B',
    600: '#4F4B45',
    700: '#3B3833',
    800: '#292724',
    900: '#171615',
  },

  light: {
    background: '#FAF8F4',
    surface: '#FFFFFF',
    surfaceSubtle: '#F4F1EB',
    surfaceElevated: '#FFFFFF',
    border: '#E5E1D9',
    borderSubtle: '#EEEAE3',
    textPrimary: '#111111',
    textSecondary: '#5B5853',
    textMuted: '#85817A',
    textInverse: '#FFFFFF',
    overlay: 'rgba(17, 17, 17, 0.48)',
  },

  dark: {
    background: '#151515',
    surface: '#202020',
    surfaceSubtle: '#292929',
    surfaceElevated: '#2E2E2E',
    border: '#3C3C3C',
    borderSubtle: '#303030',
    textPrimary: '#F5F5F5',
    textSecondary: '#B7B7B7',
    textMuted: '#898989',
    textInverse: '#151515',
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

  milestone: '#111111',
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

  families: {
    sans: 'sans-serif',
    serif: 'serif',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
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
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.025,
    shadowRadius: 3,
    elevation: 0,
  },

  card: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 1,
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
