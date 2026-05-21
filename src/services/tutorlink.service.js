import { api, unwrap } from '@/lib/api';

// =========================================================
// 1. GIA SƯ SERVICE (TUTORS) - TUTORLINK SYSTEM
// =========================================================
export const tutorsService = {
  async list(params) {
    const { data } = await api.get('/tutors', { params });
    return unwrap(data);
  },

  async get(id) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}`);
    return unwrap(data);
  },

  async availability(id, week) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}/availability`, {
      params: { week },
    });
    return unwrap(data);
  },

  async reviews(id, params) {
    const { data } = await api.get(`/tutors/${encodeURIComponent(id)}/reviews`, { params });
    return unwrap(data);
  },

  async getMyProfile() {
    const { data } = await api.get('/tutors/me/profile');
    return unwrap(data);
  },

  async createProfile(input) {
    const { data } = await api.post('/tutors/me/profile', input);
    return unwrap(data);
  },

  async updateProfile(input) {
    const { data } = await api.patch('/tutors/me/profile', input);
    return unwrap(data);
  },
};

// =========================================================
// 2. GIA SƯ YÊU THÍCH SERVICE (FAVORITES)
// =========================================================
export const favoritesService = {
  async list() {
    const { data } = await api.get('/favorites');
    return unwrap(data);
  },

  async add(tutorId) {
    const { data } = await api.post(`/favorites/${encodeURIComponent(tutorId)}`);
    return unwrap(data);
  },

  async remove(tutorId) {
    await api.delete(`/favorites/${encodeURIComponent(tutorId)}`);
  },
};

// =========================================================
// 3. LỊCH TRỐNG GIA SƯ SERVICE (AVAILABILITY)
// =========================================================
export const availabilityService = {
  async getMine(week) {
    const { data } = await api.get('/availability/me', { params: { week } });
    return unwrap(data);
  },

  async replaceMine(input) {
    const { data } = await api.put('/availability/me', input);
    return unwrap(data);
  },
};

// =========================================================
// 4. ĐẶT LỊCH HỌC SERVICE (BOOKINGS)
// =========================================================
export const bookingsService = {
  async list(params) {
    const { data } = await api.get('/bookings', { params });
    return unwrap(data);
  },

  async create(input) {
    const { data } = await api.post('/bookings', input);
    return unwrap(data);
  },

  async get(id) {
    const { data } = await api.get(`/bookings/${encodeURIComponent(id)}`);
    return unwrap(data);
  },

  async accept(id) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/accept`);
    return unwrap(data);
  },

  async reject(id, reason) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/reject`, { reason });
    return unwrap(data);
  },

  async cancel(id, reason) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/cancel`, { reason });
    return unwrap(data);
  },

  async complete(id) {
    const { data } = await api.patch(`/bookings/${encodeURIComponent(id)}/complete`);
    return unwrap(data);
  },

  async exportCsv() {
    const { data } = await api.get('/bookings/export.csv', { responseType: 'blob' });
    return data;
  },
};

// =========================================================
// 5. ĐÁNH GIÁ SERVICE (REVIEWS)
// =========================================================
export const reviewsService = {
  async create(input) {
    const { data } = await api.post('/reviews', input);
    return unwrap(data);
  },
};

// =========================================================
// 6. HỆ THỐNG QUẢN TRỊ ADMIN SERVICE
// =========================================================
export const adminService = {
  async overview() {
    const { data } = await api.get('/admin/stats/overview');
    return unwrap(data);
  },

  async tutorQueue(params) {
    const { data } = await api.get('/admin/tutors/queue', { params });
    return unwrap(data);
  },

  async tutor(id) {
    const { data } = await api.get(`/admin/tutors/${encodeURIComponent(id)}`);
    return unwrap(data);
  },

  async approveTutor(id, note) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/approve`, { note });
    return unwrap(data);
  },

  async rejectTutor(id, reason) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/reject`, { reason });
    return unwrap(data);
  },

  async requestTutorInfo(id, message) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/request-info`, {
      message,
    });
    return unwrap(data);
  },

  async users(params) {
    const { data } = await api.get('/admin/users', { params });
    return unwrap(data);
  },

  async lockUser(id) {
    const { data } = await api.patch(`/admin/users/${encodeURIComponent(id)}/lock`);
    return unwrap(data);
  },

  async unlockUser(id) {
    const { data } = await api.patch(`/admin/users/${encodeURIComponent(id)}/unlock`);
    return unwrap(data);
  },

  async reports(params) {
    const { data } = await api.get('/admin/reports', { params });
    return unwrap(data);
  },

  async resolveReport(id, input) {
    const { data } = await api.patch(`/admin/reports/${encodeURIComponent(id)}/resolve`, input);
    return unwrap(data);
  },

  async exportReportsCsv() {
    const { data } = await api.get('/admin/reports/export.csv', { responseType: 'blob' });
    return data;
  },
};

// =========================================================
// 7. TRUNG TÂM THÔNG BÁO SERVICE (NOTIFICATIONS)
// =========================================================
export const notificationsService = {
  async list(params) {
    const { data } = await api.get('/notifications', { params });
    return unwrap(data);
  },

  async markRead(id) {
    const { data } = await api.patch(`/notifications/${encodeURIComponent(id)}/read`);
    return unwrap(data);
  },

  async markAllRead() {
    const { data } = await api.patch('/notifications/read-all');
    return unwrap(data);
  },
};

// =========================================================
// 8. TẢI LÊN TÀI LIỆU SERVICE (UPLOADS)
// =========================================================
export const uploadsService = {
  async sign(input) {
    const { data } = await api.post('/uploads/sign', input);
    return unwrap(data);
  },

  async direct(key, file) {
    const { data } = await api.put(`/uploads/direct/${encodeURIComponent(key)}`, file, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    return unwrap(data);
  },
};

// =========================================================
// 9. DANH MỤC HỆ THỐNG SERVICE (METADATA)
// =========================================================
export const metaService = {
  async subjects() {
    const { data } = await api.get('/meta/subjects');
    return unwrap(data);
  },

  async levels() {
    const { data } = await api.get('/meta/levels');
    return unwrap(data);
  },
};