import { api, unwrap } from './api';

export const chatService = {
  async listRooms() {
    const { data } = await api.get('/chat/rooms');
    return unwrap(data);
  },

  async getHistory(roomId) {
    const { data } = await api.get(`/chat/messages/${encodeURIComponent(roomId)}`);
    return unwrap(data);
  },

  async sendMessage(input) {
    const { data } = await api.post('/chat/messages', input);
    return unwrap(data);
  },
};
