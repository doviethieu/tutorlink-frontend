import { api, unwrap } from './api';

export const adminService = {
  async overview() {
    const { data } = await api.get('/admin/stats/overview');
    return unwrap(data);
  },

  async tutorQueue(params = {}) {
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
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/request-info`, { message });
    return unwrap(data);
  },

  async suspendTutor(id, reason) {
    const { data } = await api.patch(`/admin/tutors/${encodeURIComponent(id)}/suspend`, { reason });
    return unwrap(data);
  },

  async users(params = {}) {
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

  async reports(params = {}) {
    const { data } = await api.get('/admin/reports', { params });
    return unwrap(data);
  },

  async resolveReport(id, input) {
    const { data } = await api.patch(`/admin/reports/${encodeURIComponent(id)}/resolve`, input);
    return unwrap(data);
  },

  async hideReview(id, reason) {
    const { data } = await api.patch(`/admin/reviews/${encodeURIComponent(id)}/hide`, { reason });
    return unwrap(data);
  },

  async auditLogs(params = {}) {
    const { data } = await api.get('/admin/audit-logs', { params });
    return unwrap(data);
  },

  async payments(params = {}) {
    const { data } = await api.get('/admin/payments', { params });
    return unwrap(data);
  },

  async payouts(params = {}) {
    const { data } = await api.get('/admin/payouts', { params });
    return unwrap(data);
  },

  async updatePayout(id, input) {
    const { data } = await api.patch(`/admin/payouts/${encodeURIComponent(id)}`, input);
    return unwrap(data);
  },

  async systemConfigs() {
    const { data } = await api.get('/admin/system-configs');
    return unwrap(data);
  },

  async updateSystemConfig(key, input) {
    const { data } = await api.patch(`/admin/system-configs/${encodeURIComponent(key)}`, input);
    return unwrap(data);
  },

  async exportReportsCsv() {
    const { data } = await api.get('/admin/reports/export.csv', { responseType: 'blob' });
    return data;
  },
};
