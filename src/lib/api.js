import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

// Đổi sang cú pháp đọc biến môi trường của Vite sếp nhé
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Tự động đính kèm Access Token ───────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || localStorage.getItem('tutorlinkToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Tự động Refresh Token khi gặp lỗi 401 ──────────
let isRefreshing = false;
let pendingQueue = [];

function processQueue(token) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    
    // Nếu gặp lỗi 401 (Hết hạn phiên) và request chưa từng chạy lại (retry)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      // Nếu không có Refresh Token thì xóa sạch session và đá ra ngoài
      if (!refreshToken) {
        useAuthStore.getState().clear();
        return Promise.reject(error);
      }

      // Nếu đang có một request khác đi xin token mới, xếp hàng đợi vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((newToken) => {
            if (!newToken) return reject(error);
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // Gọi API âm thầm xin cặp Token mới
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const newAccess = data?.data?.accessToken;
        const newRefresh = data?.data?.refreshToken;
        
        if (!newAccess) throw error;
        
        // Cập nhật lại kho lưu trữ (Store)
        useAuthStore.getState().setTokens(newAccess, newRefresh);
        
        // Giải phóng hàng đợi và chạy tiếp request hiện tại
        processQueue(newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        processQueue(null);
        useAuthStore.getState().clear();
        
        // Chuyển hướng về trang đăng nhập nếu refresh thất bại hoàn toàn
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// Helper: Bóc tách lớp vỏ gói dữ liệu ApiResponse của Backend
export function unwrap(payload) {
  if (payload && typeof payload === 'object' && 'success' in payload) {
    if (payload.success) return payload.data;
    throw new Error(payload.error?.message || 'Yêu cầu thất bại');
  }
  return payload;
}

// Helper: Tự bóc tách chuỗi thông báo lỗi trả về từ Axios / Backend
export function getErrorMessage(error, fallback = 'Yêu cầu thất bại') {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const backendMessage = error.response?.data?.error?.message ?? error.response?.data?.message;
    if (backendMessage) return backendMessage;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
