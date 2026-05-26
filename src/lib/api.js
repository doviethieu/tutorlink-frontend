import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tutorlinkToken') || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('tutorlinkToken');
      localStorage.removeItem('tutorlinkRefreshToken');
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  },
);

export function unwrap(payload) {
  if (payload?.success === false) {
    throw new Error(getErrorMessage({ response: { data: payload } }));
  }

  if (payload?.success === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  return payload;
}

export function getErrorMessage(error, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data;

  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.message === 'string') return data.message;
  if (typeof error?.message === 'string') return error.message;

  return fallback;
}
