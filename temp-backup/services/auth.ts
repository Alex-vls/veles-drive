import api from './api';
import { AuthResponse, User } from './types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/token/', {
      email,
      password,
    });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<User> {
    const response = await api.post<User>('/users/register/', {
      username,
      email,
      password,
    });
    return response.data;
  },

  async refreshToken(refresh: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/users/token/refresh/', {
      refresh,
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile/');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/users/profile/', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  async resetPassword(email: string): Promise<void> {
    await api.post('/users/reset-password/', { email });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/users/verify-email/', { token });
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },
}; 