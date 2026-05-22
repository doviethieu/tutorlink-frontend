import { api, unwrap } from '../lib/api';

export const paymentService = {
  create(bookingId, gateway = 'sandbox') {
    return api.post('/payments', { bookingId, gateway }).then((res) => unwrap(res.data));
  },

  confirm(input) {
    return api.post('/payments/confirm', input).then((res) => unwrap(res.data));
  },

  refund(input) {
    return api.post('/payments/refund', input).then((res) => unwrap(res.data));
  },

  list(params = {}) {
    return api.get('/payments', { params }).then((res) => unwrap(res.data));
  },
};
