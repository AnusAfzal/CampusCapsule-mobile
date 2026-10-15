import { create } from 'zustand';
import { User } from '../types/models';
import { tokenStorage, refreshTokenStorage, request } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isRestoring: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;

  login: (userData: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  }) => Promise<void>;

  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isRestoring: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: async ({ user, tokens }) => {
    await tokenStorage.setToken(tokens.accessToken);
    await refreshTokenStorage.setToken(tokens.refreshToken);

    set({
      user,
      token: tokens.accessToken,
      isRestoring: false,
    });
  },

  logout: async () => {
    try {
      // Send the refresh token so the backend can revoke it before clearing locally
      const refreshToken = await refreshTokenStorage.getToken();
      await request('/auth/logout', {
        method: 'POST',
        body: refreshToken ? { refreshToken } : undefined,
      }).catch(() => {});
    } finally {
      await tokenStorage.removeToken();
      await refreshTokenStorage.removeToken();

      set({
        user: null,
        token: null,
        isRestoring: false,
      });
    }
  },

  restoreSession: async () => {
    set({ isRestoring: true });

    try {
      const token = await tokenStorage.getToken();

      if (!token) {
        set({
          user: null,
          token: null,
          isRestoring: false,
        });
        return;
      }

      const data = await request<{ user: User }>('/auth/me');

      set({
        user: data.user,
        token,
        isRestoring: false,
      });
    } catch {
      await tokenStorage.removeToken();
      await refreshTokenStorage.removeToken();

      set({
        user: null,
        token: null,
        isRestoring: false,
      });
    }
  },
}));