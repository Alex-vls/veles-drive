import { api } from './api';
import { User, Car, Review, PaginatedResponse } from './types';

export interface UserFilters {
  search?: string;
  ordering?: string;
  page?: number;
}

export const usersService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/api/users/profile/');
    return response.data;
  },

  async updateProfile(data: FormData): Promise<User> {
    const response = await api.patch('/api/users/profile/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async changePassword(data: {
    old_password: string;
    new_password: string;
  }): Promise<void> {
    await api.post('/api/users/change-password/', data);
  },

  async getFavoriteCars(params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Car>> {
    const response = await api.get('/api/users/favorite-cars/', { params });
    return response.data;
  },

  async addFavoriteCar(carId: number): Promise<void> {
    await api.post(`/api/users/favorite-cars/${carId}/`);
  },

  async removeFavoriteCar(carId: number): Promise<void> {
    await api.delete(`/api/users/favorite-cars/${carId}/`);
  },

  async getViewHistory(params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Car>> {
    const response = await api.get('/api/users/view-history/', { params });
    return response.data;
  },

  async clearViewHistory(): Promise<void> {
    await api.delete('/api/users/view-history/');
  },

  async getUserReviews(params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Review>> {
    const response = await api.get('/api/users/reviews/', { params });
    return response.data;
  },

  async getUserCompanies(params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Company>> {
    const response = await api.get('/api/users/companies/', { params });
    return response.data;
  },
}; 