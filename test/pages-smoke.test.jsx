import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';

const tutor = {
  _id: 'tutor-1',
  id: 'tutor-1',
  userId: 'user-tutor',
  name: 'Gia sư An',
  fullName: 'Gia sư An',
  full_name: 'Gia sư An',
  email: 'an@example.com',
  subject: 'Toán',
  subjects: ['Toán', 'Lý'],
  levels: ['THPT'],
  price: 200000,
  hourlyRate: 200000,
  status: 'approved',
  rating: 4.8,
  averageRating: 4.8,
  totalReviews: 12,
  review_count: 12,
  bio: 'Dạy Toán dễ hiểu',
  avatarUrl: '',
};

const booking = {
  _id: 'booking-1',
  id: 'booking-1',
  tutorId: 'tutor-1',
  tutorUserId: 'user-tutor',
  studentId: 'student-1',
  subject: 'Toán',
  date: '2099-05-25',
  startTime: '08:00',
  time: '08:00 - 09:00',
  duration: 1,
  amount: 200000,
  status: 'confirmed',
  paymentStatus: 'paid',
  escrowStatus: 'held',
  tutor,
  student: { id: 'student-1', name: 'Học viên Bình', email: 'binh@example.com' },
};

const review = {
  _id: 'review-1',
  id: 'review-1',
  rating: 5,
  body: 'Rất tốt',
  student: 'Học viên Bình',
  createdAt: '2026-05-25T00:00:00.000Z',
};

const ok = (data) => Promise.resolve(data);

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    connected: false,
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
  io: vi.fn(() => ({
    connected: false,
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../services/tutor.service', () => ({
  tutorService: {
    list: vi.fn(() => ok([tutor])),
    get: vi.fn(() => ok(tutor)),
    getMyProfile: vi.fn(() => ok(tutor)),
    createProfile: vi.fn(() => ok(tutor)),
    updateProfile: vi.fn(() => ok(tutor)),
  },
}));

vi.mock('../services/admin.service', () => ({
  adminService: {
    overview: vi.fn(() => ok({
      stats: { totalUsers: 10, totalTutors: 3, totalBookings: 4, monthlyRevenue: 800000 },
      totalUsers: 10,
      totalTutors: 3,
      pendingTutors: 1,
      openReports: 1,
      bookingsByDay: [{ label: 'T2', value: 2 }],
      revenueSeries: [{ label: 'T5', value: 800000 }],
    })),
    tutorQueue: vi.fn(() => ok([tutor])),
    tutor: vi.fn(() => ok(tutor)),
    approveTutor: vi.fn(() => ok(tutor)),
    rejectTutor: vi.fn(() => ok(tutor)),
    requestTutorInfo: vi.fn(() => ok(tutor)),
    suspendTutor: vi.fn(() => ok(tutor)),
    users: vi.fn(() => ok([{ _id: 'student-1', fullName: 'Học viên Bình', email: 'binh@example.com', role: 'student', isActive: true }])),
    lockUser: vi.fn(() => ok({})),
    unlockUser: vi.fn(() => ok({})),
    reports: vi.fn(() => ok([{ _id: 'report-1', title: 'Hỗ trợ', status: 'open' }])),
    resolveReport: vi.fn(() => ok({})),
    exportReportsCsv: vi.fn(() => ok(new Blob(['id,type']))),
    auditLogs: vi.fn(() => ok([{ _id: 'audit-1', action: 'login' }])),
    payments: vi.fn(() => ok([{ _id: 'payment-1', amount: 200000, status: 'succeeded' }])),
    payouts: vi.fn(() => ok([{ _id: 'payout-1', amount: 200000, status: 'pending' }])),
    updatePayout: vi.fn(() => ok({})),
    systemConfigs: vi.fn(() => ok([{ key: 'fee', value: 10 }])),
    updateSystemConfig: vi.fn(() => ok({})),
  },
}));

vi.mock('../services/booking.service', () => ({
  bookingService: {
    list: vi.fn(() => ok([booking])),
    listForTutor: vi.fn(() => ok([booking])),
    listForStudent: vi.fn(() => ok([booking])),
    get: vi.fn(() => ok(booking)),
    create: vi.fn(() => ok(booking)),
    accept: vi.fn(() => ok({ ...booking, status: 'confirmed' })),
    reject: vi.fn(() => ok({ ...booking, status: 'rejected' })),
    cancel: vi.fn(() => ok({ ...booking, status: 'cancelled' })),
    complete: vi.fn(() => ok({ ...booking, status: 'completed' })),
    exportCsv: vi.fn(() => ok(new Blob(['id']))),
  },
}));

vi.mock('../services/availability.service', () => ({
  availabilityService: {
    getMine: vi.fn(() => ok([{ dayIdx: 0, hour: 8, start: '08:00' }])),
    replaceMine: vi.fn(() => ok({ count: 1 })),
    getTutorAvailability: vi.fn(() => ok([{ date: '2099-05-25', slots: [{ start: '08:00', status: 'available' }] }])),
  },
}));

vi.mock('../services/review.service', () => ({
  reviewService: {
    listByTutor: vi.fn(() => ok([review])),
    create: vi.fn(() => ok(review)),
    update: vi.fn(() => ok(review)),
    reply: vi.fn(() => ok(review)),
  },
}));

vi.mock('../services/favorite.service', () => ({
  favoriteService: {
    list: vi.fn(() => ok([tutor])),
    add: vi.fn(() => ok({})),
    remove: vi.fn(() => ok({})),
  },
}));

vi.mock('../services/notification.service', () => ({
  notificationService: {
    list: vi.fn(() => ok([{ _id: 'notice-1', title: 'Thông báo', body: 'Nội dung', read: false }])),
    markRead: vi.fn(() => ok({})),
    markAllRead: vi.fn(() => ok({})),
  },
}));

vi.mock('../services/chat.service', () => ({
  chatService: {
    listRooms: vi.fn(() => ok([{ roomId: 'booking-booking-1', title: 'Toán', booking }])),
    getHistory: vi.fn(() => ok([{ _id: 'msg-1', roomId: 'booking-booking-1', content: 'Xin chào', senderId: 'student-1' }])),
    sendMessage: vi.fn(() => ok({ _id: 'msg-2', content: 'OK' })),
  },
}));

vi.mock('../services/payment.service', () => ({
  paymentService: {
    create: vi.fn(() => ok({ payment: { _id: 'payment-1' }, booking, checkoutUrl: '/payment' })),
    confirm: vi.fn(() => ok({ payment: { _id: 'payment-1' }, booking })),
    refund: vi.fn(() => ok({ refund: { amount: 200000 }, booking })),
    list: vi.fn(() => ok([{ _id: 'payment-1', amount: 200000 }])),
  },
}));

vi.mock('../services/payout.service', () => ({
  payoutService: {
    summary: vi.fn(() => ok({ availableAmount: 200000, paidAmount: 100000, lockedAmount: 0, availableSessionCount: 1 })),
    list: vi.fn(() => ok([{ _id: 'payout-1', amount: 200000, status: 'pending' }])),
    request: vi.fn(() => ok({ _id: 'payout-1' })),
    requestWalletWithdrawal: vi.fn(() => ok({ _id: 'payout-2' })),
  },
}));

vi.mock('../services/users.service', () => ({
  usersService: {
    updateProfile: vi.fn(() => ok({ user: { fullName: 'Học viên Bình' } })),
    changePassword: vi.fn(() => ok({})),
    deleteAccount: vi.fn(() => ok({})),
    uploadAvatar: vi.fn(() => ok({ avatarUrl: '' })),
    getWallet: vi.fn(() => ok({ balance: 300000, walletBalance: 300000, transactions: [] })),
    getHistory: vi.fn(() => ok([])),
  },
}));

vi.mock('../services/report.service', () => ({
  reportService: {
    create: vi.fn(() => ok({ success: true })),
    listMine: vi.fn(() => ok([{ _id: 'report-1', title: 'Hỗ trợ' }])),
  },
}));

vi.mock('../services/tutorlink.service.js', () => ({
  bookingsService: {
    list: vi.fn(() => ok([
      { ...booking, id: 'dash-1', status: 'pending' },
      { ...booking, id: 'dash-2', status: 'confirmed' },
      { ...booking, id: 'dash-3', status: 'completed' },
    ])),
    create: vi.fn(() => ok(booking)),
    get: vi.fn(() => ok(booking)),
    accept: vi.fn(() => ok({ ...booking, status: 'confirmed' })),
    reject: vi.fn(() => ok({ ...booking, status: 'rejected' })),
    cancel: vi.fn(() => ok({ ...booking, status: 'cancelled' })),
    complete: vi.fn(() => ok({ ...booking, status: 'completed' })),
    exportCsv: vi.fn(() => ok(new Blob(['id']))),
  },
  tutorsService: {
    list: vi.fn(() => ok([tutor])),
    get: vi.fn(() => ok(tutor)),
    availability: vi.fn(() => ok([])),
    reviews: vi.fn(() => ok([review])),
    getMyProfile: vi.fn(() => ok(tutor)),
    createProfile: vi.fn(() => ok(tutor)),
    updateProfile: vi.fn(() => ok(tutor)),
  },
  favoritesService: {
    list: vi.fn(() => ok([tutor])),
    add: vi.fn(() => ok({})),
    remove: vi.fn(() => ok({})),
  },
  availabilityService: {
    getMine: vi.fn(() => ok([])),
    replaceMine: vi.fn(() => ok({ count: 1 })),
  },
  reviewsService: {
    create: vi.fn(() => ok(review)),
  },
  adminService: {
    overview: vi.fn(() => ok({ stats: {} })),
    tutorQueue: vi.fn(() => ok([tutor])),
    tutor: vi.fn(() => ok(tutor)),
    approveTutor: vi.fn(() => ok(tutor)),
    rejectTutor: vi.fn(() => ok(tutor)),
    requestTutorInfo: vi.fn(() => ok(tutor)),
    users: vi.fn(() => ok([])),
    lockUser: vi.fn(() => ok({})),
    unlockUser: vi.fn(() => ok({})),
    reports: vi.fn(() => ok([])),
    resolveReport: vi.fn(() => ok({})),
    exportReportsCsv: vi.fn(() => ok(new Blob(['id']))),
  },
  notificationsService: {
    list: vi.fn(() => ok([])),
    markRead: vi.fn(() => ok({})),
    markAllRead: vi.fn(() => ok({})),
  },
  uploadsService: {
    sign: vi.fn(() => ok({})),
    direct: vi.fn(() => ok({})),
  },
  metaService: {
    subjects: vi.fn(() => ok(['Toán'])),
    levels: vi.fn(() => ok(['THPT'])),
  },
}));

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(() => ok({ accessToken: 'a', refreshToken: 'r', user: { id: 'student-1', fullName: 'Bình', role: 'student' } })),
    register: vi.fn(() => ok({ accessToken: 'a', refreshToken: 'r', user: { id: 'student-1', fullName: 'Bình', role: 'student' } })),
    forgotPassword: vi.fn(() => ok({ message: 'sent' })),
    resetPassword: vi.fn(() => ok({ message: 'done' })),
    verifyEmail: vi.fn(() => ok({ message: 'verified' })),
    verifyOtp: vi.fn(() => ok({ accessToken: 'a', refreshToken: 'r', user: { id: 'student-1', fullName: 'Bình', role: 'student' } })),
    loginWithGoogle: vi.fn(() => ok({ accessToken: 'a', refreshToken: 'r', user: { id: 'student-1', fullName: 'Bình', role: 'student' } })),
    getMe: vi.fn(() => ok({ user: { id: 'student-1', fullName: 'Bình', role: 'student' } })),
    changePassword: vi.fn(() => ok({ message: 'changed' })),
    logout: vi.fn(() => ok({})),
  },
}));  
