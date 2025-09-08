import api from './api';
import { Notification, PaginatedResponse } from './types';

export const notificationsService = {
  async getNotifications(params?: {
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications/', { params });
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count/');
    return response.data.count;
  },

  async markAsRead(id: number): Promise<Notification> {
    const response = await api.post<Notification>(`/notifications/${id}/mark-as-read/`);
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-as-read/');
  },

  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}/`);
  },

  async deleteAllNotifications(): Promise<void> {
    await api.delete('/notifications/');
  },
}; 