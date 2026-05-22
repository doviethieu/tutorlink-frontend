import { api, unwrap } from './api';

export const tutorService = {
  async list(params = {}) {
    const { data } = await api.get('/tutors', { params });
    return unwrap(data);
  },

  async get(id) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}`);
    return unwrap(data);
  },

  async getMyProfile() {
    const { data } = await api.get('/tutors/me/profile');
    return unwrap(data);
  },

  async createProfile(input) {
    const { data } = await api.post('/tutors/me/profile', input);
    return unwrap(data);
  },

  async updateProfile(input) {
    const { data } = await api.patch('/tutors/me/profile', input);
    return unwrap(data);
  },
};
