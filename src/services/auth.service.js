import { api, unwrap } from '@/lib/api';

export const authService = {
  // ── Đăng ký tài khoản mới ──────────────────────────────────────────────
  async register(input) {
    const { data } = await api.post('/auth/register', input);
    return unwrap(data);
  },

  // ── Đăng nhập hệ thống ─────────────────────────────────────────────────
  async login(input) {
    const { data } = await api.post('/auth/login', input);
    return unwrap(data);
  },

  // ── Đăng xuất tài khoản ────────────────────────────────────────────────
  async logout() {
    await api.post('/auth/logout');
  },

  // ── Yêu cầu gửi mail quên mật khẩu ──────────────────────────────────────
  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return unwrap(data);
  },

  // ── Đặt lại mật khẩu mới qua Token ──────────────────────────────────────
  async resetPassword(token, newPassword) {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return unwrap(data);
  },

  // ── Xác thực địa chỉ Email ─────────────────────────────────────────────
  async verifyEmail(token) {
    const { data } = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return unwrap(data);
  },

  // ── Lấy thông tin chi tiết của User đang đăng nhập ──────────────────────
  async getMe() {
    const { data } = await api.get('/users/me');
    return unwrap(data);
  },
};