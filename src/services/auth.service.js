// 🛠️ ĐÃ SỬA: Chuyển sang đường dẫn tương đối từ src/services lùi về src/lib để triệt tiêu lỗi import-analysis của Vite
import { api, unwrap } from '../lib/api';

export const authService = {
  // ── 1. Đăng ký tài khoản mới ──────────────────────────────────────────────
  // 🚨 LƯU Ý: Đối tượng 'input' truyền từ Form đăng ký lên bắt buộc phải chứa trường 'fullName'
  // chứ không được đặt là 'name' để khớp 100% với User Schema ở Backend sếp nhé.
  async register(input) {
    const { data } = await api.post('/auth/register', input);
    return unwrap(data);
  },

  // ── 2. Đăng nhập bước 1: Kiểm tra tài khoản & Gửi OTP ──────────────────────
  async login(input) {
    const { data } = await api.post('/auth/login', input);
    return unwrap(data); // Trả về thông báo thành công và trạng thái chờ nhập OTP
  },

  // ── 🔥 THÊM MỚI BƯỚC 2: Xác thực mã OTP để nhận Token bảo mật ──────────────
  // Hàm này sẽ hứng email và mã code OTP học viên gõ trên giao diện gửi lên Backend
  async verifyOtp(email, otpCode) {
    const { data } = await api.post('/auth/verify-otp', { email, otp: otpCode });
    return unwrap(data); // Trả về cặp AccessToken và RefreshToken chuẩn chỉnh
  },

  // ── 🔥 THÊM MỚI: Đăng nhập nhanh bằng Google ──────────────────────────────
  async loginWithGoogle(googleToken) {
    const { data } = await api.post('/auth/google', { token: googleToken });
    return unwrap(data);
  },

  // ── 3. Đăng xuất tài khoản ────────────────────────────────────────────────
  async logout() {
    // Backend bắt buộc đi qua middleware protect nên request này sẽ tự động 
    // mang theo AccessToken đính ở Header để đưa vào danh sách cấm tokenBlacklist
    await api.post('/auth/logout');
  },

  // ── 4. Lấy thông tin chi tiết của User đang đăng nhập (Check Auth) ─────────
  async getMe() {
    // 🛠️ ĐÃ SỬA: Đổi từ '/users/me' sang '/auth/me' cho khớp khít 100% với Router Backend đã bọc giáp
    const { data } = await api.get('/auth/me');
    return unwrap(data);
  },

  // ── 5. Yêu cầu gửi mail quên mật khẩu ──────────────────────────────────────
  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return unwrap(data);
  },

  // ── 6. Đặt lại mật khẩu mới qua Token ──────────────────────────────────────
  async resetPassword(token, newPassword) {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return unwrap(data);
  },

  // ── 7. Xác thực địa chỉ Email ─────────────────────────────────────────────
  async verifyEmail(token) {
    const { data } = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return unwrap(data);
  },
};