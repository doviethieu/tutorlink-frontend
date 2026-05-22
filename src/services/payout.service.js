import { api, unwrap } from '../lib/api';

export const payoutService = {
  summary() {
    return api.get('/payouts/summary').then((res) => unwrap(res.data));
  },

  list() {
    return api.get('/payouts').then((res) => unwrap(res.data));
  },

  request(payload) {
    return api.post('/payouts', payload).then((res) => unwrap(res.data));
  },

  requestWalletWithdrawal(payload) {
    return api.post('/payouts/wallet', payload).then((res) => unwrap(res.data));
  },
};
