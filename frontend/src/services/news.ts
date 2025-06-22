import api from './api';
import { News, Article, PaginatedResponse } from './types';

export const newsService = {
  async getNews(params?: {
    page?: number;
    search?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<News>> {
    const response = await api.get<PaginatedResponse<News>>('/news/', { params });
    return response.data;
  },

  async getNewsItem(id: number): Promise<News> {
    const response = await api.get<News>(`/news/${id}/`);
    return response.data;
  },

  async createNews(data: Partial<News>): Promise<News> {
    const response = await api.post<News>('/news/', data);
    return response.data;
  },

  async updateNews(id: number, data: Partial<News>): Promise<News> {
    const response = await api.patch<News>(`/news/${id}/`, data);
    return response.data;
  },

  async deleteNews(id: number): Promise<void> {
    await api.delete(`/news/${id}/`);
  },

  async getArticles(params?: {
    page?: number;
    search?: string;
    ordering?: string;
    is_premium?: boolean;
  }): Promise<PaginatedResponse<Article>> {
    const response = await api.get<PaginatedResponse<Article>>('/articles/', { params });
    return response.data;
  },

  async getArticle(id: number): Promise<Article> {
    const response = await api.get<Article>(`/articles/${id}/`);
    return response.data;
  },

  async createArticle(data: Partial<Article>): Promise<Article> {
    const response = await api.post<Article>('/articles/', data);
    return response.data;
  },

  async updateArticle(id: number, data: Partial<Article>): Promise<Article> {
    const response = await api.patch<Article>(`/articles/${id}/`, data);
    return response.data;
  },

  async deleteArticle(id: number): Promise<void> {
    await api.delete(`/articles/${id}/`);
  },
}; 