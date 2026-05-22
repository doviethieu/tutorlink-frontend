import { api, unwrap } from './api';

export const reviewService = {
  async listByTutor(tutorId, params = {}) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(tutorId)}/reviews`, { params });
    return unwrap(data);
  },

  async create(input) {
    const { data } = await api.post('/reviews', input);
    return unwrap(data);
  },

  async update(id, input) {
    const { data } = await api.patch(`/reviews/${encodeURIComponent(id)}`, input);
    return unwrap(data);
  },

  async reply(id, body) {
    const { data } = await api.post(`/reviews/${encodeURIComponent(id)}/reply`, { body });
    return unwrap(data);
  },
};
