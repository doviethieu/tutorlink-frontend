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

vi.mock('../services/availability.service', () => ({
  availabilityService: {
    getMine: vi.fn(() => ok([{ dayIdx: 0, hour: 8, start: '08:00' }])),
    replaceMine: vi.fn(() => ok({ count: 1 })),
    getTutorAvailability: vi.fn(() => ok([{ date: '2099-05-25', slots: [{ start: '08:00', status: 'available' }] }])),
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

vi.mock('../services/chat.service', () => ({
  chatService: {
    listRooms: vi.fn(() => ok([{ roomId: 'booking-booking-1', title: 'Toán', booking }])),
    getHistory: vi.fn(() => ok([{ _id: 'msg-1', roomId: 'booking-booking-1', content: 'Xin chào', senderId: 'student-1' }])),
    sendMessage: vi.fn(() => ok({ _id: 'msg-2', content: 'OK' })),
  },
}));