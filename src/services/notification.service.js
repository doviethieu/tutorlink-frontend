import { api, unwrap } from './api';

export const notificationService = {
  async list(params = {}) {
    const { data } = await api.get('/notifications', { params });
    return unwrap(data);
  },

  async markRead(id) {
    const { data } = await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return unwrap(data);
  },

  async markAllRead() {
    const { data } = await api.patch('/notifications/read-all');
    return unwrap(data);
  },
};
