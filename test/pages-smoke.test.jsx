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