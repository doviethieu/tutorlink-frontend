import { api, unwrap } from './api';

export const videoService = {
  async createToken(roomId) {
    const { data } = await api.post('/video/token', { roomId });
    return unwrap(data);
  },
};
