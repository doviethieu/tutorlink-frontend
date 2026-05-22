import { api, unwrap } from '@/lib/api';

export const usersService = {
  // ── Cập nhật thông tin Profile cá nhân ──────────────────────────────────
  async updateProfile(input) {
    const { data } = await api.patch('/users/me', input);
    return unwrap(data);
  },

  // ── Thay đổi mật khẩu tài khoản ─────────────────────────────────────────
  async changePassword(input) {
    const { data } = await api.patch('/users/me/password', input);
    return unwrap(data);
  },

  // ── Xóa tài khoản vĩnh viễn ─────────────────────────────────────────────
  async deleteAccount() {
    const { data } = await api.delete('/users/me');
    return unwrap(data);
  },

  // ── Tải ảnh đại diện lên hệ thống (Multipart Form Data) ─────────────────
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(data);
  },

  async getWallet() {
    const { data } = await api.get('/users/me/wallet');
    return unwrap(data);
  },

  async depositWallet(amount) {
    const { data } = await api.post('/users/me/wallet/deposit', { amount });
    return unwrap(data);
  },

  async getHistory() {
    return [];
  },
};
