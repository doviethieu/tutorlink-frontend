import { api, unwrap } from '../lib/api';

export const reportService = {
  create(payload) {
    return api.post('/support', payload).then((res) => res.data);
  },

  listMine() {
    return api.get('/support/me').then((res) => unwrap(res.data));
  },
};
