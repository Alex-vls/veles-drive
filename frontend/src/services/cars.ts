import { api } from './api';
import { Car, CarImage, Review, PaginatedResponse } from './types';

export interface CarFilters {
  brand?: string;
  model?: string;
  year?: number;
  transmission?: string;
  fuel_type?: string;
  is_available?: boolean;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  min_mileage?: number;
  max_mileage?: number;
  ordering?: string;
  search?: string;
  page?: number;
}

export const carsService = {
  async getCars(params?: CarFilters): Promise<PaginatedResponse<Car>> {
    const response = await api.get('/api/cars/', { params });
    return response.data;
  },

  async getCar(id: number): Promise<Car> {
    const response = await api.get(`/api/cars/${id}/`);
    return response.data;
  },

  async createCar(data: FormData): Promise<Car> {
    const response = await api.post('/api/cars/create/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCar(id: number, data: FormData): Promise<Car> {
    const response = await api.put(`/api/cars/${id}/update/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCar(id: number): Promise<void> {
    await api.delete(`/api/cars/${id}/delete/`);
  },

  async getCarImages(carId: number): Promise<CarImage[]> {
    const response = await api.get<CarImage[]>(`/cars/${carId}/images/`);
    return response.data;
  },

  async uploadCarImage(carId: number, image: File): Promise<CarImage> {
    const formData = new FormData();
    formData.append('image', image);
    const response = await api.post<CarImage>(`/cars/${carId}/images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCarImage(carId: number, imageId: number): Promise<void> {
    await api.delete(`/cars/${carId}/images/${imageId}/`);
  },

  async toggleCarAvailability(carId: number): Promise<Car> {
    const response = await api.post<Car>(`/cars/${carId}/availability/`);
    return response.data;
  },

  async getCarReviews(carId: number, params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Review>> {
    const response = await api.get<PaginatedResponse<Review>>(
      `/cars/${carId}/reviews/`,
      { params }
    );
    return response.data;
  },

  async createCarReview(carId: number, data: {
    rating: number;
    comment: string;
  }): Promise<Review> {
    const response = await api.post<Review>(`/cars/${carId}/reviews/`, data);
    return response.data;
  },

  async updateCarReview(carId: number, reviewId: number, data: {
    rating?: number;
    comment?: string;
  }): Promise<Review> {
    const response = await api.patch<Review>(
      `/cars/${carId}/reviews/${reviewId}/`,
      data
    );
    return response.data;
  },

  async deleteCarReview(carId: number, reviewId: number): Promise<void> {
    await api.delete(`/cars/${carId}/reviews/${reviewId}/`);
  },
}; 