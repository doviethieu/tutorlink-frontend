import { api, unwrap } from './api';

export const favoriteService = {
  async list() {
    const { data } = await api.get('/favorites');
    return unwrap(data);
  },

  async add(tutorId) {
    const { data } = await api.post(`/favorites/${encodeURIComponent(tutorId)}`);
    return unwrap(data);
  },

  async remove(tutorId) {
    const { data } = await api.delete(`/favorites/${encodeURIComponent(tutorId)}`);
    return unwrap(data);
  },
};
