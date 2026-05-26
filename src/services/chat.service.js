import { api, unwrap } from './api';

export const chatService = {
  async listRooms(params = {}) {
    const { data } = await api.get('/chat/rooms', { params });
    return unwrap(data);
  },

  async getHistory(roomId, params = {}) {
    const { data } = await api.get(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, { params });
    return unwrap(data);
  },

  async sendMessage(input) {
    const roomId = input.roomId || input.idTuUrl || input.room;
    const payload = {
      content: input.content || input.noiDung || input.message,
      receiverId: input.receiverId,
      bookingId: input.bookingId,
    };

    const { data } = await api.post(`/chat/rooms/${encodeURIComponent(roomId)}/messages`, payload);
    return unwrap(data);
  },
};
