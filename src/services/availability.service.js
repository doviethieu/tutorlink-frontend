import { api, unwrap } from './api';

export const availabilityService = {
  async getMine() {
    const { data } = await api.get('/availability/me');
    return unwrap(data);
  },

  async replaceMine(input) {
    const { data } = await api.put('/availability/me', input);
    return unwrap(data);
  },

  async getTutorAvailability(tutorId, week) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(tutorId)}/availability`, {
      params: { week },
    });
    return unwrap(data);
  },
};
