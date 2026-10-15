import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';

const TOKEN_KEY = 'campuscapsule_jwt_token';
const REFRESH_TOKEN_KEY = 'campuscapsule_refresh_token';

// Safe secure storage helper with memory fallback for non-native runtimes
let memoryToken: string | null = null;

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return memoryToken;
    }

    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return memoryToken;
    }
  },

  async setToken(token: string): Promise<void> {
    memoryToken = token;

    if (Platform.OS !== 'web') {
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } catch (err) {
        console.warn('SecureStore error saving token:', err);
      }
    }
  },

  async removeToken(): Promise<void> {
    memoryToken = null;

    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch (err) {
        console.warn('SecureStore error deleting token:', err);
      }
    }
  },
};

// In-memory fallback for refresh token (SecureStore is always preferred on native)
let memoryRefreshToken: string | null = null;

export const refreshTokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return memoryRefreshToken;
    }

    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return memoryRefreshToken;
    }
  },

  async setToken(token: string): Promise<void> {
    memoryRefreshToken = token;

    if (Platform.OS !== 'web') {
      try {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      } catch (err) {
        console.warn('SecureStore error saving refresh token:', err);
      }
    }
  },

  async removeToken(): Promise<void> {
    memoryRefreshToken = null;

    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } catch (err) {
        console.warn('SecureStore error deleting refresh token:', err);
      }
    }
  },
};

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(
    message: string,
    statusCode: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
}

/**
 * Single-flight mutex for the refresh-token exchange.
 *
 * If multiple requests fail with TOKEN_EXPIRED simultaneously, only one
 * refresh call is made. All other callers wait on the same promise and
 * then retry with the new access token, preventing refresh-token rotation
 * conflicts.
 */
let refreshingPromise: Promise<boolean> | null = null;

/**
 * Attempts to exchange the stored refresh token for a new token pair.
 * Returns true on success, false on failure.
 * On failure, clears both stored tokens so the auth flow handles re-login.
 *
 * NOTE: Does NOT import from authStore to avoid circular dependencies.
 * The authStore must observe token changes via its own restoreSession / login.
 */
const performTokenRefresh = async (): Promise<boolean> => {
  try {
    const refreshToken = await refreshTokenStorage.getToken();
    if (!refreshToken) {
      return false;
    }

    const url = `${API_BASE_URL}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok || !json?.data?.tokens) {
      // Refresh failed — clear credentials so the app forces re-login
      await tokenStorage.removeToken();
      await refreshTokenStorage.removeToken();
      return false;
    }

    const { accessToken, refreshToken: newRefreshToken } = json.data.tokens;

    await tokenStorage.setToken(accessToken);
    await refreshTokenStorage.setToken(newRefreshToken);

    return true;
  } catch {
    await tokenStorage.removeToken();
    await refreshTokenStorage.removeToken();
    return false;
  }
};

/**
 * Executes a single HTTP request. Does not handle token refresh.
 */
const executeRequest = async (
  endpoint: string,
  options: RequestOptions
): Promise<Response> => {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
  } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const isFormData =
    typeof FormData !== 'undefined' &&
    body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  /**
   * For normal JSON requests, explicitly set JSON content type.
   *
   * For FormData requests, DO NOT set Content-Type manually.
   * Fetch/React Native will automatically add:
   *
   * multipart/form-data; boundary=...
   *
   * The boundary is required by Multer on the backend.
   */
  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await tokenStorage.getToken();

    if (token) {
      requestHeaders['Authorization'] =
        `Bearer ${token}`;
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    if (isFormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  return fetch(url, fetchOptions);
};

export const request = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { auth = true } = options;

  try {
    let response = await executeRequest(endpoint, options);
    let json = await response.json().catch(() => null);

    // On TOKEN_EXPIRED 401, attempt a single token refresh then retry.
    // Only for authenticated requests. Skip if this is itself the refresh call.
    const isTokenExpired =
      !response.ok &&
      response.status === 401 &&
      json?.data?.code === 'TOKEN_EXPIRED';

    if (auth && isTokenExpired) {
      // Coalesce concurrent refresh attempts into one promise
      if (!refreshingPromise) {
        refreshingPromise = performTokenRefresh().finally(() => {
          refreshingPromise = null;
        });
      }

      const refreshed = await refreshingPromise;

      if (refreshed) {
        // Retry the original request once with the new access token
        response = await executeRequest(endpoint, options);
        json = await response.json().catch(() => null);
      } else {
        // Refresh failed — credentials have been cleared; throw the original 401
        throw new ApiError(
          json?.error ||
            'Your session has expired. Please log in again.',
          401,
          json?.data
        );
      }
    }

    if (!response.ok) {
      const errorMessage =
        json?.error ||
        json?.message ||
        `Network request failed with status ${response.status}`;

      throw new ApiError(
        errorMessage,
        response.status,
        json?.data
      );
    }

    // Return the payload from standard
    // { success: true, data: ... }
    return json?.data !== undefined
      ? json.data
      : json;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or server unreachable
    throw new ApiError(
      error.message ||
        'Unable to connect to CampusCapsule servers. Please check your internet connection.',
      0
    );
  }
};
