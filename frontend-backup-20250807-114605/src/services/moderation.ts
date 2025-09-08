import { api } from './api';
import { ModerationLog, ModerationStatus, PaginatedResponse } from './types';

export const moderationService = {
  async getModerationLogs(params?: {
    status?: ModerationStatus;
    content_type?: string;
    page?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<ModerationLog>> {
    const response = await api.get('/api/moderation/', { params });
    return response.data;
  },

  async getPendingCount(): Promise<number> {
    const response = await api.get('/api/moderation/pending_count/');
    return response.data.count;
  },

  async moderate(id: number, action: { status: ModerationStatus; comment?: string }): Promise<ModerationLog> {
    const response = await api.post(`/api/moderation/${id}/moderate/`, action);
    return response.data;
  }
}; 