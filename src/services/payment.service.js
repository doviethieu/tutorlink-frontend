import { api, unwrap } from './api';

export const paymentService = {
  async list(params = {}) {
    const { data } = await api.get('/payments', { params });
    return unwrap(data);
  },

  async create(bookingId, method = 'bank_transfer') {
    const { data } = await api.post('/payments', { bookingId, method });
    return unwrap(data);
  },

  async confirm(input) {
    const { data } = await api.post('/payments/confirm', input);
    return unwrap(data);
  },

  async refund(input) {
    const { data } = await api.post('/payments/refund', input);
    return unwrap(data);
  },
};
