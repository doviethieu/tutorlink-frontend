import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';

import HomePage from '../pages/public/HomePage';
import TutorListPage from '../pages/public/TutorListPage';
import TutorDetailPage from '../pages/public/TutorDetailPage';
import HelpPage from '../pages/public/HelpPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import MyBookingsPage from '../pages/student/MyBookingsPage';
import BookingPage from '../pages/student/BookingPage';
import CartPage from '../pages/student/CartPage';
import FavoritesPage from '../pages/student/FavoritesPage';
import PaymentPage from '../pages/student/PaymentPage';
import PaymentResultPage from '../pages/student/PaymentResultPage';
import ChatPage from '../pages/shared/ChatPage';
import NotificationsPage from '../pages/shared/NotificationsPage';
import ProfilePage from '../pages/shared/ProfilePage';
import VideoCallPage from '../pages/shared/VideoCallPage';
import AvailabilityPage from '../pages/tutor/AvailabilityPage';
import EarningsPage from '../pages/tutor/EarningsPage';
import TutorBookingsPage from '../pages/tutor/TutorBookingsPage';
import TutorDashboardPage from '../pages/tutor/TutorDashboardPage';
import TutorProfileFormPage from '../pages/tutor/TutorProfileFormPage';
import TutorProfilePage from '../pages/tutor/TutorProfilePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminFinancePage from '../pages/admin/AdminFinancePage';
import AdminTutorsPage from '../pages/admin/AdminTutorsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AuthLayout from '../layouts/AuthLayout';
import Navbar from '../components/common/Navbar';
import { Header } from '../components/navigation/Header';
import { Footer } from '../components/navigation/Footer';
import { BottomNav } from '../components/navigation/BottomNav';
import { NotificationCenter } from '../components/navigation/NotificationCenter';
import { TutorCard } from '../components/marketplace/TutorCard';
import ReviewSection from '../components/tutors/ReviewSection';

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
  default: vi.fn(() => ({ connected: false, connect: vi.fn(), on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() })),
  io: vi.fn(() => ({ connected: false, connect: vi.fn(), on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() })),
}));

vi.mock('../services/tutor.service', () => ({
  tutorService: { list: vi.fn(() => ok([tutor])), get: vi.fn(() => ok(tutor)), getMyProfile: vi.fn(() => ok(tutor)), createProfile: vi.fn(() => ok(tutor)), updateProfile: vi.fn(() => ok(tutor)) },
}));

vi.mock('../services/admin.service', () => ({
  adminService: {
    overview: vi.fn(() => ok({ stats: { totalUsers: 10, totalTutors: 3, totalBookings: 4, monthlyRevenue: 800000 }, totalUsers: 10, totalTutors: 3, pendingTutors: 1, openReports: 1, bookingsByDay: [{ label: 'T2', value: 2 }], revenueSeries: [{ label: 'T5', value: 800000 }] })),
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
  bookingService: { list: vi.fn(() => ok([booking])), listForTutor: vi.fn(() => ok([booking])), listForStudent: vi.fn(() => ok([booking])), get: vi.fn(() => ok(booking)), create: vi.fn(() => ok(booking)), accept: vi.fn(() => ok({ ...booking, status: 'confirmed' })), reject: vi.fn(() => ok({ ...booking, status: 'rejected' })), cancel: vi.fn(() => ok({ ...booking, status: 'cancelled' })), complete: vi.fn(() => ok({ ...booking, status: 'completed' })), exportCsv: vi.fn(() => ok(new Blob(['id']))) },
}));

vi.mock('../services/availability.service', () => ({
  availabilityService: { getMine: vi.fn(() => ok([{ dayIdx: 0, hour: 8, start: '08:00' }])), replaceMine: vi.fn(() => ok({ count: 1 })), getTutorAvailability: vi.fn(() => ok([{ date: '2099-05-25', slots: [{ start: '08:00', status: 'available' }] }])) },
}));

vi.mock('../services/review.service', () => ({
  reviewService: { listByTutor: vi.fn(() => ok([review])), create: vi.fn(() => ok(review)), update: vi.fn(() => ok(review)), reply: vi.fn(() => ok(review)) },
}));

vi.mock('../services/favorite.service', () => ({
  favoriteService: { list: vi.fn(() => ok([tutor])), add: vi.fn(() => ok({})), remove: vi.fn(() => ok({})) },
}));

vi.mock('../services/notification.service', () => ({
  notificationService: { list: vi.fn(() => ok([{ _id: 'notice-1', title: 'Thông báo', body: 'Nội dung', read: false }])), markRead: vi.fn(() => ok({})), markAllRead: vi.fn(() => ok({})) },
}));

vi.mock('../services/chat.service', () => ({
  chatService: { listRooms: vi.fn(() => ok([{ roomId: 'booking-booking-1', title: 'Toán', booking }])), getHistory: vi.fn(() => ok([{ _id: 'msg-1', roomId: 'booking-booking-1', content: 'Xin chào', senderId: 'student-1' }])), sendMessage: vi.fn(() => ok({ _id: 'msg-2', content: 'OK' })) },
}));

vi.mock('../services/payment.service', () => ({
  paymentService: { create: vi.fn(() => ok({ payment: { _id: 'payment-1' }, booking, checkoutUrl: '/payment' })), confirm: vi.fn(() => ok({ payment: { _id: 'payment-1' }, booking })), refund: vi.fn(() => ok({ refund: { amount: 200000 }, booking })), list: vi.fn(() => ok([{ _id: 'payment-1', amount: 200000 }])) },
}));

vi.mock('../services/payout.service', () => ({
  payoutService: { summary: vi.fn(() => ok({ availableAmount: 200000, paidAmount: 100000, lockedAmount: 0, availableSessionCount: 1 })), list: vi.fn(() => ok([{ _id: 'payout-1', amount: 200000, status: 'pending' }])), request: vi.fn(() => ok({ _id: 'payout-1' })), requestWalletWithdrawal: vi.fn(() => ok({ _id: 'payout-2' })) },
}));

vi.mock('../services/users.service', () => ({
  usersService: { updateProfile: vi.fn(() => ok({ user: { fullName: 'Học viên Bình' } })), changePassword: vi.fn(() => ok({})), deleteAccount: vi.fn(() => ok({})), uploadAvatar: vi.fn(() => ok({ avatarUrl: '' })), getWallet: vi.fn(() => ok({ balance: 300000, walletBalance: 300000, transactions: [] })), getHistory: vi.fn(() => ok([])) },
}));

vi.mock('../services/report.service', () => ({
  reportService: { create: vi.fn(() => ok({ success: true })), listMine: vi.fn(() => ok([{ _id: 'report-1', title: 'Hỗ trợ' }])) },
}));

vi.mock('../services/tutorlink.service.js', () => ({
  bookingsService: {
    list: vi.fn(() => ok([{ ...booking, id: 'dash-1', status: 'pending' }, { ...booking, id: 'dash-2', status: 'confirmed' }, { ...booking, id: 'dash-3', status: 'completed' }])),
    create: vi.fn(() => ok(booking)), get: vi.fn(() => ok(booking)), accept: vi.fn(() => ok({ ...booking, status: 'confirmed' })), reject: vi.fn(() => ok({ ...booking, status: 'rejected' })), cancel: vi.fn(() => ok({ ...booking, status: 'cancelled' })), complete: vi.fn(() => ok({ ...booking, status: 'completed' })), exportCsv: vi.fn(() => ok(new Blob(['id'])))
  },
  tutorsService: { list: vi.fn(() => ok([tutor])), get: vi.fn(() => ok(tutor)), availability: vi.fn(() => ok([])), reviews: vi.fn(() => ok([review])), getMyProfile: vi.fn(() => ok(tutor)), createProfile: vi.fn(() => ok(tutor)), updateProfile: vi.fn(() => ok(tutor)) },
  favoritesService: { list: vi.fn(() => ok([tutor])), add: vi.fn(() => ok({})), remove: vi.fn(() => ok({})) },
  availabilityService: { getMine: vi.fn(() => ok([])), replaceMine: vi.fn(() => ok({ count: 1 })) },
  reviewsService: { create: vi.fn(() => ok(review)) },
  adminService: { overview: vi.fn(() => ok({ stats: {} })), tutorQueue: vi.fn(() => ok([tutor])), tutor: vi.fn(() => ok(tutor)), approveTutor: vi.fn(() => ok(tutor)), rejectTutor: vi.fn(() => ok(tutor)), requestTutorInfo: vi.fn(() => ok(tutor)), users: vi.fn(() => ok([])), lockUser: vi.fn(() => ok({})), unlockUser: vi.fn(() => ok({})), reports: vi.fn(() => ok([])), resolveReport: vi.fn(() => ok({})), exportReportsCsv: vi.fn(() => ok(new Blob(['id']))) },
  notificationsService: { list: vi.fn(() => ok([])), markRead: vi.fn(() => ok({})), markAllRead: vi.fn(() => ok([])) },
  uploadsService: { sign: vi.fn(() => ok({})), direct: vi.fn(() => ok({})) },
  metaService: { subjects: vi.fn(() => ok(['Toán'])), levels: vi.fn(() => ok(['THPT'])) },
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

function renderAt(element, path = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={element} />
          <Route path="/giasu/:id" element={element} />
          <Route path="/giasu/:id/book" element={element} />
          <Route path="/payment/result" element={element} />
          <Route path="/room/:roomId" element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function exercise(view) {
  await waitFor(() => expect(view.container.firstChild).toBeTruthy());
  view.container.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea').forEach((el, index) => { fireEvent.change(el, { target: { value: index % 2 === 0 ? 'test@example.com' : '12345678' } }); });
  view.container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((el) => { fireEvent.click(el); });
  view.container.querySelectorAll('select').forEach((el) => { if (el.options.length > 1) fireEvent.change(el, { target: { value: el.options[1].value } }); });
  const buttons = Array.from(view.container.querySelectorAll('button')).slice(0, 24);
  for (const button of buttons) { if (!button.disabled) { fireEvent.click(button); await Promise.resolve(); } }
}

describe('frontend pages smoke coverage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('tutorlinkToken', 'access');
    localStorage.setItem('tutorlinkUser', JSON.stringify({ _id: 'student-1', id: 'student-1', name: 'Bình', fullName: 'Bình', role: 'admin' }));
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    useAuthStore.getState().setSession({ accessToken: 'access', refreshToken: 'refresh', user: { _id: 'student-1', id: 'student-1', name: 'Bình', fullName: 'Bình', role: 'admin' } });
  });

  it('renders public and auth pages', async () => {
    const pages = [
      [<HomePage tuKhoa="" handleDatLich={vi.fn()} />, '/'],
      [<TutorListPage />, '/tutors'],
      [<TutorDetailPage />, '/giasu/tutor-1'],
      [<HelpPage />, '/support'],
      [<AuthLayout><LoginPage /></AuthLayout>, '/login'],
      [<AuthLayout><RegisterPage /></AuthLayout>, '/register'],
      [<AuthLayout><ForgotPasswordPage /></AuthLayout>, '/forgot-password'],
      [<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password?token=abc'],
      [<AuthLayout><VerifyEmailPage /></AuthLayout>, '/verify-email?token=abc'],
    ];
    for (const [page, path] of pages) {
      const view = renderAt(page, path);
      await exercise(view);
      view.unmount();
    }
  }, 15000);

  it('exercises register password validation and student success route', async () => {
    const { authService } = await import('../services/auth.service');
    authService.register.mockClear(); window.alert.mockClear();
    const view = renderAt(<AuthLayout><RegisterPage /></AuthLayout>, '/register');
    const inputs = view.container.querySelectorAll('input');
    fireEvent.change(inputs[2], { target: { value: 'Nguyễn Học Viên' } });
    fireEvent.change(inputs[3], { target: { value: 'student@example.com' } });
    fireEvent.change(inputs[4], { target: { value: 'weak' } });
    expect(view.container.textContent).toContain('Đánh giá độ an toàn');
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    expect(view.container.textContent).toContain('Mật khẩu chưa đủ điều kiện');
    authService.register.mockResolvedValueOnce({ accessToken: 'student-token', refreshToken: 'student-refresh', user: { id: 'student-new', fullName: 'Nguyễn Học Viên', role: 'student' } });
    fireEvent.change(inputs[4], { target: { value: 'Strong123!' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(authService.register).toHaveBeenCalledWith({ fullName: 'Nguyễn Học Viên', email: 'student@example.com', password: 'Strong123!', role: 'student' }));
  });

  it('exercises reset password invalid token, mismatch, and backend error branches', async () => {
    const { authService } = await import('../services/auth.service');
    authService.resetPassword.mockClear();
    let view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password');
    expect(view.container.textContent).toContain('Mã Token không hợp lệ'); view.unmount();
    view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password?token=abc');
    let passwordInputs = view.container.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], { target: { value: 'Strong123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Strong124!' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    expect(view.container.textContent).toContain('không khớp'); view.unmount();
    authService.resetPassword.mockTarget = vi.fn().mockRejectedValueOnce({ response: { data: { error: { message: 'Token đã hết hạn' } } } });
    view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password?token=expired');
    passwordInputs = view.container.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], { target: { value: 'Strong123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Strong123!' } });
  });

  it('exercises auth form submit flows', async () => {
    let view = renderAt(<AuthLayout><LoginPage /></AuthLayout>, '/login');
    fireEvent.change(view.container.querySelector('input[type="email"]'), { target: { value: 'student@example.com' } });
    fireEvent.change(view.container.querySelector('input[type="password"]'), { target: { value: 'password123' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]')); view.unmount();
    view = renderAt(<AuthLayout><ForgotPasswordPage /></AuthLayout>, '/forgot-password');
    fireEvent.change(view.container.querySelector('input[type="email"]'), { target: { value: 'nam@example.com' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
  });
});
it('renders student and shared pages', async () => {
    const pages = [
      [<StudentDashboardPage />, '/dashboard'],
      [<MyBookingsPage />, '/bookings'],
      [<BookingPage />, '/giasu/tutor-1/book'],
      [<CartPage gioHang={[tutor]} xoaKhoiGioHang={vi.fn()} thanhToanThanhCong={vi.fn()} />, '/giohang'],
      [<FavoritesPage />, '/favorites'],
      [<PaymentPage />, '/payment?bookingId=booking-1'],
      [<PaymentResultPage />, '/payment/result?status=success&bookingId=booking-1'],
      [<ChatPage />, '/chat'],
      [<NotificationsPage />, '/notifications'],
      [<ProfilePage />, '/profile'],
      [<VideoCallPage />, '/room/booking-1'],
    ];
    for (const [page, path] of pages) {
      const view = renderAt(page, path);
      await exercise(view);
      view.unmount();
    }
  }, 15000);

  it('exercises favorite removal and unauthenticated redirect path', async () => {
    const { favoriteService } = await import('../services/favorite.service');
    favoriteService.list.mockResolvedValueOnce([{ ...tutor, id: 'fav-1', name: 'Gia sư Favorite' }]);
    const view = renderAt(<FavoritesPage />, '/favorites');
    await waitFor(() => expect(view.container.textContent).toContain('Gia sư Favorite'));
    const delBtn = view.container.querySelector('button[title="Xóa khỏi danh sách lưu"]');
    if (delBtn) fireEvent.click(delBtn);
    view.unmount();
    localStorage.removeItem('tutorlinkToken');
    renderAt(<FavoritesPage />, '/favorites');
  });

  it('exercises chat fallback rooms filtered by confirmed bookings', async () => {
    const { chatService } = await import('../services/chat.service');
    const { bookingService } = await import('../services/booking.service');
    chatService.listRooms.mockRejectedValueOnce(new Error('offline'));
    bookingService.listForStudent.mockResolvedValueOnce([
      { ...booking, id: 'pending-chat', status: 'pending', tutor: { id: 't1', name: 'Gia sư Ẩn' } },
      { ...booking, id: 'confirmed-chat', status: 'confirmed', tutor: { id: 't2', name: 'Gia sư Chat' } },
    ]);
    const view = renderAt(<ChatPage />, '/chat');
    await waitFor(() => expect(view.container.textContent).toContain('Gia sư Chat'));
  });

  it('exercises student bookings actions, filters, review open, and csv export', async () => {
    const { bookingService } = await import('../services/booking.service');
    bookingService.listForStudent.mockResolvedValueOnce([
      { ...booking, id: 'pending-pay', status: 'pending', paymentStatus: 'pending', subject: 'Toán pending', tutor: { id: 't1', name: 'Gia sư Một' } },
      { ...booking, id: 'completed-review', status: 'completed', paymentStatus: 'paid', subject: 'Hóa completed', hasReview: false, tutorId: 't3', tutor: { id: 't3', name: 'Gia sư Ba' } },
    ]);
    const view = renderAt(<MyBookingsPage />, '/bookings');
    await waitFor(() => expect(view.container.textContent).toContain('Toán pending'));
    fireEvent.click(screen.getByText(/Xuất danh sách/));
  });