import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =========================================================
// KHO LƯU TRỮ TRẠNG THÁI XÁC THỰC (AUTH STORE - TUTORLINK)
// =========================================================
export const useAuthStore = create(
  persist(
    (set) => ({
      // ── TRẠNG THÁI BAN ĐẦU (STATES) ──────────────────────────────────────
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false, // Đánh dấu khi trạng thái từ localStorage đã nạp xong vào App

      // ── CÁC HÀM THAO TÁC CẬP NHẬT (ACTIONS) ──────────────────────────────
      
      // Lưu toàn bộ phiên đăng nhập khi Login/Register thành công
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),

      // Cập nhật riêng cặp Token (Hay dùng trong interceptor tự động refresh token)
      setTokens: (accessToken, refreshToken) =>
        set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken })),

      // Cập nhật lại thông tin cá nhân của User (Khi sửa profile, đổi avatar,...)
      setUser: (user) => set({ user }),

      // Đăng xuất - Xóa sạch bách dữ liệu phiên làm việc
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      // Tên Key lưu trữ dưới LocalStorage - Đã đổi sang thương hiệu TutorLink chuẩn bài!
      name: 'tutorlink-auth',
      
      // Callback kích hoạt ngay khi Zustand nạp lại dữ liệu cũ từ LocalStorage lên Store thành công
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);