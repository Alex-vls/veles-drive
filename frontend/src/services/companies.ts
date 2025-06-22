import { api } from './api';
import { Company, Review, PaginatedResponse } from './types';

export interface CompanyFilters {
  name?: string;
  city?: string;
  is_verified?: boolean;
  ordering?: string;
  search?: string;
  page?: number;
}

export const companiesService = {
  async getCompanies(params?: CompanyFilters): Promise<PaginatedResponse<Company>> {
    const response = await api.get('/api/companies/', { params });
    return response.data;
  },

  async getCompany(id: number): Promise<Company> {
    const response = await api.get(`/api/companies/${id}/`);
    return response.data;
  },

  async createCompany(data: FormData): Promise<Company> {
    const response = await api.post('/api/companies/create/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCompany(id: number, data: FormData): Promise<Company> {
    const response = await api.put(`/api/companies/${id}/update/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCompany(id: number): Promise<void> {
    await api.delete(`/api/companies/${id}/delete/`);
  },

  async verifyCompany(id: number): Promise<Company> {
    const response = await api.post(`/api/companies/${id}/verify/`);
    return response.data;
  },

  async getCompanyCars(id: number, params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Car>> {
    const response = await api.get(`/api/companies/${id}/cars/`, { params });
    return response.data;
  },

  async getCompanyReviews(id: number, params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Review>> {
    const response = await api.get(`/api/companies/${id}/reviews/`, { params });
    return response.data;
  },

  async createCompanyReview(id: number, data: {
    rating: number;
    comment: string;
  }): Promise<Review> {
    const response = await api.post(`/api/companies/${id}/reviews/`, data);
    return response.data;
  },

  async updateCompanyReview(id: number, reviewId: number, data: {
    rating?: number;
    comment?: string;
  }): Promise<Review> {
    const response = await api.patch(
      `/api/companies/${id}/reviews/${reviewId}/`,
      data
    );
    return response.data;
  },

  async deleteCompanyReview(id: number, reviewId: number): Promise<void> {
    await api.delete(`/api/companies/${id}/reviews/${reviewId}/`);
  },
}; 