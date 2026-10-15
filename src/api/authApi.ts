import { request } from './client';
import { User } from '../types/models';

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  async register(params: { name: string; email: string; password: string; profileImage?: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: params,
      auth: false,
    });
  },

  async login(params: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: params,
      auth: false,
    });
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async logout(refreshToken?: string): Promise<void> {
    return request<void>('/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : undefined,
    });
  },
};
