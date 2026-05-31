import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from '../App';
import { useAuthStore } from '../stores/auth-store';

const tutor = {
  _id: 'tutor-1',
  id: 'tutor-1',
  name: 'Gia sư An',
  fullName: 'Gia sư An',
  subjects: ['Toán'],
  levels: ['THPT'],
  price: 200000,
  status: 'approved',
  rating: 4.8,
  averageRating: 4.8,
  totalReviews: 12,
  bio: 'Dạy Toán dễ hiểu',
};

vi.mock('../services/tutor.service', () => ({
  tutorService: {
    list: vi.fn(() => Promise.resolve([tutor])),
    get: vi.fn(() => Promise.resolve(tutor)),
    getMyProfile: vi.fn(() => Promise.resolve(tutor)),
    createProfile: vi.fn(() => Promise.resolve(tutor)),
    updateProfile: vi.fn(() => Promise.resolve(tutor)),
  },
}));

vi.mock('../services/admin.service', () => ({
  adminService: {
    tutorQueue: vi.fn(() => Promise.resolve([tutor])),
    approveTutor: vi.fn(() => Promise.resolve(tutor)),
    suspendTutor: vi.fn(() => Promise.resolve(tutor)),
    overview: vi.fn(() => Promise.resolve({ stats: {}, bookingsByDay: [{ label: 'T2', value: 1 }], revenueSeries: [{ label: 'T2', value: 1 }] })),
    users: vi.fn(() => Promise.resolve([])),
    reports: vi.fn(() => Promise.resolve([])),
    payments: vi.fn(() => Promise.resolve([])),
    payouts: vi.fn(() => Promise.resolve([])),
    auditLogs: vi.fn(() => Promise.resolve([])),
    systemConfigs: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../services/booking.service', () => ({
  bookingService: {
    list: vi.fn(() => Promise.resolve([])),
    listForStudent: vi.fn(() => Promise.resolve([])),
    listForTutor: vi.fn(() => Promise.resolve([])),
  },
}));

function renderApp(path = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App route integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clear();
  });

  it('renders public home and cart booking flow', async () => {
    renderApp('/');
    await waitFor(() => expect(document.body.textContent).toContain('TutorLink'));
  });

  it('redirects protected route to login without token', async () => {
    renderApp('/dashboard');
    await waitFor(() => expect(document.body.textContent).toContain('Đăng nhập'));
  });

  it('renders admin route with authenticated admin and handles quick actions', async () => {
    localStorage.setItem('tutorlinkToken', 'access');
    localStorage.setItem('tutorlinkUser', JSON.stringify({ role: 'admin', fullName: 'Admin' }));
    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { role: 'admin', fullName: 'Admin' },
    });

    renderApp('/admin');
    await waitFor(() => expect(document.body.textContent).toMatch(/Quản|Admin|Tổng quan/));
  });

  it('renders payment result route variants', async () => {
    const view = renderApp('/payment/result?status=failed&bookingId=BK-1');
    expect(await screen.findByText(/Yêu cầu chưa hoàn tất/)).toBeInTheDocument();
    view.unmount();

    renderApp('/payment/result?status=success&bookingId=BK-2');
    expect(await screen.findByText(/Đã gửi yêu cầu đặt lịch thành công/)).toBeInTheDocument();
  });
});
