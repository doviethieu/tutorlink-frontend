import { api, unwrap } from './api';

export const bookingService = {
  async list(params = {}) {
    const { data } = await api.get('/bookings', { params });
    return unwrap(data);
  },

  async listForTutor() {
    return this.list({ role: 'tutor' });
  },

  async listForStudent(params = {}) {
    return this.list(params);
  },

  async get(id) {
    const { data } = await api.get(`/bookings/${encodeURIComponent(id)}`);
    return unwrap(data);
  },

  async create(input) {
    const { data } = await api.post('/bookings', input);
    return unwrap(data);
  },

  async accept(id) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/accept`);
    return unwrap(data);
  },

  async reject(id, reason) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/reject`, { reason });
    return unwrap(data);
  },

  async cancel(id, reason) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/cancel`, { reason });
    return unwrap(data);
  },

  async complete(id) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/complete`);
    return unwrap(data);
  },

  async confirmCompletion(id) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/confirm-completion`);
    return unwrap(data);
  },

  async dispute(id, reason) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/dispute`, { reason });
    return unwrap(data);
  },

  async exportCsv() {
    const { data } = await api.get('/bookings/export.csv', { responseType: 'blob' });
    return data;
  },
};
