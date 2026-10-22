import { Platform } from 'react-native';

const DEFAULT_DEV_HOST =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000';

const DEV_API_URL = `${DEFAULT_DEV_HOST}/api`;

const PRODUCTION_API_URL =
  'https://campuscapsule-backend.onrender.com/api';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? DEV_API_URL : PRODUCTION_API_URL);

export const APP_CONFIG = {
  appName: 'Moment',
  tagline: 'Your University Life, Preserved Daily',
  inviteScheme: 'campuscapsule://join/',
  maxMemoryDaysPast: 30,
  defaultPageLimit: 15,
};
