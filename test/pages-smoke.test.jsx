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

function renderAt(element, path = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
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

  const textControls = view.container.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea');
  textControls.forEach((el, index) => {
    fireEvent.change(el, { target: { value: index % 2 === 0 ? 'test@example.com' : '12345678' } });
  });

  view.container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach((el) => {
    fireEvent.click(el);
  });

  view.container.querySelectorAll('select').forEach((el) => {
    if (el.options.length > 1) fireEvent.change(el, { target: { value: el.options[1].value } });
  });

  const buttons = Array.from(view.container.querySelectorAll('button')).slice(0, 24);
  for (const button of buttons) {
    if (!button.disabled) {
      fireEvent.click(button);
      await Promise.resolve();
    }
  }
}

describe('frontend pages smoke coverage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('tutorlinkToken', 'access');
    localStorage.setItem('tutorlinkUser', JSON.stringify({ _id: 'student-1', id: 'student-1', name: 'Bình', fullName: 'Bình', role: 'admin' }));
    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { _id: 'student-1', id: 'student-1', name: 'Bình', fullName: 'Bình', role: 'admin' },
    });
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

  it('renders tutor and admin pages', async () => {
    const pages = [
      [<AvailabilityPage />, '/tutor/availability'],
      [<EarningsPage />, '/tutor/earnings'],
      [<TutorBookingsPage />, '/tutor/bookings'],
      [<TutorDashboardPage />, '/tutor/panel'],
      [<TutorProfileFormPage />, '/tutor/register'],
      [<TutorProfilePage />, '/tutor/profile'],
      [<AdminDashboardPage allTutors={[tutor]} handleDuyet={vi.fn()} handleXoa={vi.fn()} />, '/admin'],
      [<AdminFinancePage />, '/admin/finance'],
      [<AdminTutorsPage />, '/admin/tutors/tutor-1'],
      [<AdminUsersPage />, '/admin/users'],
    ];

    for (const [page, path] of pages) {
      const view = renderAt(page, path);
      await exercise(view);
      view.unmount();
    }
  }, 15000);

  it('renders common navigation and domain components', async () => {
    renderAt(
      <>
        <Navbar setTuKhoa={vi.fn()} soLuongGioHang={2} />
        <Header />
        <Footer />
        <BottomNav />
        <NotificationCenter />
        <TutorCard tutor={{ ...tutor, verified: true, title: 'Chuyên Toán', reviews: 12, location: 'Hà Nội', format: 'online', sessions: 40, responseTime: '1h' }} />
        <ReviewSection tutorId="tutor-1" />
      </>,
    );
    await exercise({ container: document.body });
    await waitFor(() => expect(document.body.textContent).toContain('TutorLink'));
  });

  it('exercises profile tabs and wallet withdrawal form', async () => {
    const view = renderAt(<ProfilePage />, '/profile');
    await waitFor(() => expect(view.container.textContent).toContain('Quản lý tài khoản'));

    fireEvent.change(view.container.querySelector('input[type="text"]'), { target: { value: 'Bình Updated' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(view.container.textContent).toMatch(/Cập nhật|Mock/));

    fireEvent.click(screen.getByText(/Đổi mật khẩu/));
    const passwordInputs = view.container.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input) => fireEvent.change(input, { target: { value: 'password123' } }));
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(view.container.textContent).toContain('Đổi mật khẩu'));

    fireEvent.click(screen.getByText(/Ví & Rút tiền/));
    const numberInput = view.container.querySelector('input[type="number"]');
    fireEvent.change(numberInput, { target: { value: '100000' } });
    const walletInputs = Array.from(view.container.querySelectorAll('input')).filter((input) => !['number', 'file'].includes(input.type));
    walletInputs.forEach((input, index) => fireEvent.change(input, { target: { value: `bank-${index}` } }));
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());

    fireEvent.click(screen.getByText(/Lịch sử hoạt động/));
    expect(view.container.textContent).toContain('Lịch sử lớp học');
  });

  it('exercises tutor profile form validation, dynamic rows, and submit', async () => {
    localStorage.setItem('tutorlinkUser', JSON.stringify({ email: 'teacher@example.com', role: 'student', fullName: 'Teacher' }));
    const view = renderAt(<TutorProfileFormPage />, '/tutor/register');
    await waitFor(() => expect(view.container.textContent).toContain('Tạo CV Gia Sư'));

    fireEvent.click(screen.getByText(/GỬI DUYỆT/));
    expect(window.alert).toHaveBeenCalled();

    fireEvent.click(screen.getByText(/Thêm cơ sở học tập/));
    fireEvent.click(screen.getByText(/Thêm cột mốc kinh nghiệm/));

    const values = {
      name: 'Nguyễn Gia Sư',
      subject: 'Toán THPT',
      price: '200000',
      image: 'https://example.com/avatar.png',
      headline: 'Gia sư Toán THPT nhiều kinh nghiệm',
      location: 'Hà Nội',
      skills: 'IELTS, Mindmap',
      description: 'Tôi có phương pháp dạy học cá nhân hóa cho từng học viên và cam kết tiến bộ rõ ràng.',
      contactEmail: 'teacher@example.com',
      phone: '0912345678',
    };
    Object.entries(values).forEach(([name, value]) => {
      const field = view.container.querySelector(`[name="${name}"]`);
      if (field) fireEvent.change(field, { target: { value } });
    });
    fireEvent.change(view.container.querySelector('select[name="format"]'), { target: { value: 'online' } });

    const educationInputs = view.container.querySelectorAll('input[placeholder*="Trường"], input[placeholder*="Chuyên ngành"], input[placeholder*="Năm"]');
    educationInputs.forEach((input, index) => fireEvent.change(input, { target: { value: index % 3 === 2 ? '2025' : 'Đại học Demo' } }));
    const experienceInputs = view.container.querySelectorAll('input[placeholder*="Nơi làm việc"]');
    experienceInputs.forEach((input) => fireEvent.change(input, { target: { value: 'Trung tâm Demo' } }));
    const experienceTextareas = view.container.querySelectorAll('textarea[placeholder*="Mô tả cụ thể"]');
    experienceTextareas.forEach((input) => fireEvent.change(input, { target: { value: 'Dạy học sinh mất gốc và luyện thi.' } }));

    fireEvent.click(screen.getByText(/GỬI DUYỆT/));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('exercises admin users filters, lock action, and tutor moderation action', async () => {
    const view = renderAt(<AdminUsersPage />, '/admin/users');
    await waitFor(() => expect(view.container.textContent).toContain('Học viên Bình'), { timeout: 1200 });

    fireEvent.change(view.container.querySelector('input[type="text"]'), { target: { value: 'Bình' } });
    await waitFor(() => expect(view.container.textContent).toContain('Học viên Bình'), { timeout: 1200 });

    const lockButton = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Khóa'));
    fireEvent.click(lockButton);
    await waitFor(() => expect(window.alert).toHaveBeenCalled());

    fireEvent.click(screen.getByText(/Chờ duyệt hồ sơ/));
    await waitFor(() => expect(view.container.textContent).toMatch(/Gia sư An|Đăng ký dạy/), { timeout: 1200 });
    const approve = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Duyệt'));
    fireEvent.click(approve);
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('exercises tutor booking accept, reject, and complete actions', async () => {
    const { bookingService } = await import('../services/booking.service');
    bookingService.listForTutor.mockResolvedValueOnce([
      { ...booking, id: 'pending-1', _id: 'pending-1', status: 'pending', studentName: 'Bình', meetingUrl: '' },
      { ...booking, id: 'pending-2', _id: 'pending-2', status: 'pending', studentName: 'Bảo', meetingUrl: '' },
      { ...booking, id: 'confirmed-1', _id: 'confirmed-1', status: 'confirmed', studentName: 'An', meetingUrl: '/room/confirmed-1' },
      { ...booking, id: 'done-1', _id: 'done-1', status: 'completed', studentName: 'Chi' },
      { ...booking, id: 'reject-1', _id: 'reject-1', status: 'rejected', studentName: 'Dung' },
    ]);

    const view = renderAt(<TutorBookingsPage />, '/tutor/bookings');
    await waitFor(() => expect(view.container.textContent).toContain('pending-1'));

    const accept = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Chấp nhận'));
    fireEvent.click(accept);
    await waitFor(() => expect(window.alert).toHaveBeenCalled());

    const reject = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Từ chối'));
    fireEvent.click(reject);
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());

    const complete = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Hoàn thành'));
    fireEvent.click(complete);
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('exercises booking page validation and successful submit', async () => {
    const { bookingService } = await import('../services/booking.service');
    bookingService.create.mockClear();
    window.alert.mockClear();

    const view = renderAt(<BookingPage />, '/giasu/tutor-1/book?date=2099-05-25&slot=08:00');
    await waitFor(() => expect(view.container.textContent).toContain('Đặt lịch học'));
    await waitFor(() => expect(view.container.textContent).toContain('08:00'));

    fireEvent.click(screen.getByText('1.5 giờ'));
    fireEvent.click(screen.getByText(/Học trực tiếp/));
    fireEvent.change(view.container.querySelector('input[type="text"]'), { target: { value: 'Đại số lớp 12' } });
    fireEvent.change(view.container.querySelector('textarea'), { target: { value: 'Ôn tập chương hàm số và luyện đề.' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));

    await waitFor(() => expect(bookingService.create).toHaveBeenCalledWith({
      tutorId: 'tutor-1',
      date: '2099-05-25',
      startTime: '08:00',
      duration: 1.5,
      format: 'offline',
      subject: 'Đại số lớp 12',
      goal: 'Ôn tập chương hàm số và luyện đề.',
    }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Đã gửi yêu cầu'));

    localStorage.removeItem('tutorlinkToken');
    bookingService.create.mockClear();
    const noAuthView = renderAt(<BookingPage />, '/giasu/tutor-1/book?date=2099-05-25&slot=08:00');
    await waitFor(() => expect(noAuthView.container.textContent).toContain('Đặt lịch học'));
    fireEvent.click(noAuthView.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Bạn cần đăng nhập để đặt lịch học.'));
    expect(bookingService.create).not.toHaveBeenCalled();
  });

  it('exercises notification dropdown with unread items and mark all', async () => {
    const { notificationsService } = await import('../services/tutorlink.service.js');
    notificationsService.list.mockResolvedValueOnce([
      { id: 'n1', type: 'payment_succeeded', title: 'Thanh toán thành công', body: 'Tiền đã vào escrow', read: false, createdAt: '2026-05-25T08:00:00.000Z' },
      { id: 'n2', type: 'message_new', title: 'Tin nhắn mới', body: 'Gia sư đã phản hồi', read: true, createdAt: '2026-05-25T09:00:00.000Z' },
    ]);
    notificationsService.markAllRead.mockClear();

    const view = renderAt(<NotificationCenter />);
    await waitFor(() => expect(view.container.textContent).toContain('Thanh toán thành công'));
    expect(view.container.textContent).toContain('Tin nhắn mới');

    fireEvent.click(screen.getByText('Đánh dấu đã đọc'));
    await waitFor(() => expect(notificationsService.markAllRead).toHaveBeenCalled());
  });

  it('exercises admin dashboard quick moderation, report resolution, and csv export', async () => {
    const { adminService } = await import('../services/admin.service');
    adminService.overview.mockResolvedValueOnce({
      totalUsers: 12,
      pendingTutors: 2,
      openReports: 1,
      monthlyRevenue: 1200000,
      escrowHeld: 500000,
      pendingPayouts: 1,
      bookingsByDay: [{ label: 'T2', value: 3 }, { label: 'T3', value: 5 }],
      revenueSeries: [{ label: 'T4', value: 4 }, { label: 'T5', value: 6 }],
    });
    adminService.tutorQueue.mockResolvedValueOnce([
      { ...tutor, _id: 'pending-tutor', status: 'pending_review', headline: 'Luyện thi THPT' },
      { ...tutor, _id: 'approved-tutor', status: 'approved' },
    ]);
    adminService.reports.mockResolvedValueOnce([
      { _id: 'report-open', type: 'Complaint', target: 'booking-1', status: 'open', body: 'Gia sư đến muộn' },
    ]);
    adminService.approveTutor.mockClear();
    adminService.resolveReport.mockClear();
    adminService.exportReportsCsv.mockClear();

    const view = renderAt(<AdminDashboardPage />, '/admin');
    await waitFor(() => expect(view.container.textContent).toContain('Luyện thi THPT'));
    await waitFor(() => expect(view.container.textContent).toContain('Gia sư đến muộn'));

    fireEvent.click(screen.getByText('Duyệt nhanh'));
    await waitFor(() => expect(adminService.approveTutor).toHaveBeenCalledWith('pending-tutor', expect.any(String)));

    fireEvent.change(view.container.querySelector('textarea'), { target: { value: 'Đã nhắc nhở tài khoản vi phạm' } });
    fireEvent.click(screen.getByText(/Cảnh báo/));
    await waitFor(() => expect(adminService.resolveReport).toHaveBeenCalledWith('report-open', {
      resolution: 'Đã nhắc nhở tài khoản vi phạm',
      actionTaken: 'warn',
    }));

    fireEvent.click(screen.getByText(/Xuất Excel/));
    await waitFor(() => expect(adminService.exportReportsCsv).toHaveBeenCalled());
  });

  it('exercises help ticket form with authenticated submit and ticket history', async () => {
    const { reportService } = await import('../services/report.service');
    reportService.listMine.mockResolvedValueOnce([
      { _id: 'ticket-1', title: 'Thanh toán / Học phí', status: 'resolved', body: 'Đã hoàn ví', resolution: 'Đã xử lý' },
      { _id: 'ticket-2', topic: 'Khiếu nại / Tố cáo', status: 'dismissed', message: 'Không đủ bằng chứng' },
    ]);
    reportService.create.mockClear();
    window.alert.mockClear();

    const view = renderAt(<HelpPage />, '/support');
    await waitFor(() => expect(view.container.textContent).toContain('Đã hoàn ví'));

    fireEvent.change(view.container.querySelector('input[name="name"]'), { target: { value: 'Đỗ Việt Hiếu' } });
    fireEvent.change(view.container.querySelector('input[name="email"]'), { target: { value: 'hieu@example.com' } });
    fireEvent.change(view.container.querySelector('select[name="role"]'), { target: { value: 'Gia sư' } });
    fireEvent.change(view.container.querySelector('select[name="topic"]'), { target: { value: 'Khiếu nại / Tố cáo' } });
    fireEvent.change(view.container.querySelector('textarea[name="message"]'), { target: { value: 'Cần admin kiểm tra đơn học booking-1.' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));

    await waitFor(() => expect(reportService.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Đỗ Việt Hiếu',
      email: 'hieu@example.com',
      role: 'Gia sư',
      topic: 'Khiếu nại / Tố cáo',
      type: 'Complaint',
      body: 'Cần admin kiểm tra đơn học booking-1.',
    })));
    expect(window.alert).toHaveBeenCalled();
  });

  it('exercises help ticket unauthenticated guard', async () => {
    const { reportService } = await import('../services/report.service');
    localStorage.removeItem('tutorlinkToken');
    localStorage.removeItem('token');
    reportService.create.mockClear();
    window.alert.mockClear();

    const view = renderAt(<HelpPage />, '/support');
    await waitFor(() => expect(view.container.textContent).toContain('Bạn chưa có yêu cầu hỗ trợ nào'));

    fireEvent.change(view.container.querySelector('input[name="name"]'), { target: { value: 'Khách Demo' } });
    fireEvent.change(view.container.querySelector('input[name="email"]'), { target: { value: 'guest@example.com' } });
    fireEvent.change(view.container.querySelector('textarea[name="message"]'), { target: { value: 'Tôi cần hỗ trợ đăng nhập tài khoản.' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));

    expect(window.alert).toHaveBeenCalledWith('Bạn cần đăng nhập để gửi yêu cầu hỗ trợ.');
    expect(reportService.create).not.toHaveBeenCalled();
  });

  it('exercises favorite removal and unauthenticated redirect path', async () => {
    const { favoriteService } = await import('../services/favorite.service');
    favoriteService.list.mockResolvedValueOnce([{ ...tutor, id: 'fav-1', name: 'Gia sư Favorite', title: 'Luyện thi Toán' }]);
    favoriteService.remove.mockClear();
    window.alert.mockClear();

    const view = renderAt(<FavoritesPage />, '/favorites');
    await waitFor(() => expect(view.container.textContent).toContain('Gia sư Favorite'));
    fireEvent.click(view.container.querySelector('button[title="Xóa khỏi danh sách lưu"]'));
    await waitFor(() => expect(favoriteService.remove).toHaveBeenCalledWith('fav-1'));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Đã xóa'));

    view.unmount();
    localStorage.removeItem('tutorlinkToken');
    const noAuthView = renderAt(<FavoritesPage />, '/favorites');
    await waitFor(() => expect(noAuthView.container.firstChild).toBeTruthy());
  });

  it('exercises chat fallback rooms filtered by confirmed bookings', async () => {
    const { chatService } = await import('../services/chat.service');
    const { bookingService } = await import('../services/booking.service');
    chatService.listRooms.mockRejectedValueOnce(new Error('rooms api unavailable'));
    bookingService.listForStudent.mockResolvedValueOnce([
      { ...booking, id: 'pending-chat', _id: 'pending-chat', status: 'pending', tutor: { id: 't1', name: 'Gia sư Ẩn' } },
      { ...booking, id: 'confirmed-chat', _id: 'confirmed-chat', status: 'confirmed', tutor: { id: 't2', name: 'Gia sư Chat' }, meetingUrl: '/room/confirmed-chat' },
    ]);

    const view = renderAt(<ChatPage />, '/chat');
    await waitFor(() => expect(view.container.textContent).toContain('Gia sư Chat'));
    expect(view.container.textContent).not.toContain('Gia sư Ẩn');
    expect(view.container.querySelector('a[href="/room/confirmed-chat"]')).toBeTruthy();
  });

  it('exercises student bookings actions, filters, review open, and csv export', async () => {
    const { bookingService } = await import('../services/booking.service');
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    bookingService.listForStudent.mockResolvedValueOnce([
      { ...booking, id: 'pending-pay', _id: 'pending-pay', date: todayKey, status: 'pending', paymentStatus: 'pending', subject: 'Toán pending', amount: 180000, tutor: { id: 't1', name: 'Gia sư Một' } },
      { ...booking, id: 'confirmed-paid', _id: 'confirmed-paid', date: todayKey, status: 'confirmed', paymentStatus: 'paid', subject: 'Lý confirmed', meetingUrl: '/room/confirmed-paid', tutor: { id: 't2', name: 'Gia sư Hai' } },
      { ...booking, id: 'completed-review', _id: 'completed-review', date: todayKey, status: 'completed', paymentStatus: 'paid', subject: 'Hóa completed', hasReview: false, tutorId: 't3', tutor: { id: 't3', name: 'Gia sư Ba' } },
      { ...booking, id: 'completed-reviewed', _id: 'completed-reviewed', date: todayKey, status: 'completed', paymentStatus: 'paid', subject: 'Văn reviewed', hasReview: true, tutor: { id: 't4', name: 'Gia sư Bốn' } },
      { ...booking, id: 'cancelled-old', _id: 'cancelled-old', date: todayKey, status: 'cancelled', paymentStatus: 'refunded', subject: 'Anh cancelled', tutor: { id: 't5', name: 'Gia sư Năm' } },
    ]);
    bookingService.cancel.mockResolvedValueOnce({ status: 'cancelled', paymentStatus: 'refunded' });
    bookingService.exportCsv.mockClear();
    window.alert.mockClear();

    const view = renderAt(<MyBookingsPage />, '/bookings');
    await waitFor(() => expect(view.container.textContent).toContain('Toán pending'));
    expect(view.container.textContent).toContain('Đã hủy bỏ');

    fireEvent.change(view.container.querySelector('input[type="text"]'), { target: { value: 'completed' } });
    await waitFor(() => expect(view.container.textContent).toContain('Hóa completed'));
    fireEvent.change(view.container.querySelector('input[type="text"]'), { target: { value: '' } });

    fireEvent.click(screen.getByText(/Xuất danh sách/));
    await waitFor(() => expect(bookingService.exportCsv).toHaveBeenCalled());

    const payButton = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Thanh toán'));
    fireEvent.click(payButton);
    await Promise.resolve();

    const cancelButtons = Array.from(view.container.querySelectorAll('button')).filter((button) => button.textContent.includes('Hủy'));
    fireEvent.click(cancelButtons[0]);
    await waitFor(() => expect(bookingService.cancel).toHaveBeenCalledWith('pending-pay', 'Hủy từ giao diện học viên'));

    const reviewButton = Array.from(view.container.querySelectorAll('button')).find((button) => button.textContent.includes('Đánh giá') && !button.disabled);
    fireEvent.click(reviewButton);
    await waitFor(() => expect(view.container.textContent).toContain('Gia sư Ba'));
  });

  it('exercises tutor dashboard fallback data, hover states, and responsive resize', async () => {
    const { bookingsService } = await import('../services/tutorlink.service.js');
    bookingsService.list.mockRejectedValueOnce(new Error('offline demo'));

    const view = renderAt(<TutorDashboardPage />, '/tutor/panel');
    await waitFor(() => expect(view.container.textContent).toContain('BK-88291'));
    expect(view.container.textContent).toContain('Chờ duyệt');
    expect(view.container.textContent).toContain('Đã nhận');
    expect(view.container.textContent).toContain('Đã xong');

    const profileLink = screen.getByText(/Hồ sơ cá nhân/);
    const availabilityLink = screen.getByText(/Cài đặt lịch rảnh/);
    const configLink = screen.getByText(/Cấu hình thời gian rảnh/);
    [profileLink, availabilityLink, configLink].forEach((link) => {
      fireEvent.mouseOver(link);
      fireEvent.mouseOut(link);
    });

    window.innerWidth = 720;
    window.dispatchEvent(new Event('resize'));
    await waitFor(() => expect(view.container.textContent).toContain('Quản lý khung giờ trống'));
  });

  it('exercises tutor profile edit validation, valid save, and missing profile state', async () => {
    const { tutorService } = await import('../services/tutor.service');
    tutorService.getMyProfile.mockResolvedValueOnce({
      ...tutor,
      status: 'rejected',
      headline: 'Gia sư Toán luyện thi THPT',
      bio: 'Tôi xây dựng lộ trình học cá nhân hóa và theo sát từng điểm yếu của học viên.',
      location: 'Hà Nội',
      responseTime: '15 phút',
      format: 'flex',
      education: [{ school: 'Đại học Sư phạm', degree: 'Cử nhân Toán', years: 4, cert: 'Nghiệp vụ sư phạm' }],
      subjects: ['Toán 12', 'Đại số'],
      levels: ['THPT', 'Ôn thi đại học'],
      price: 220000,
    });
    tutorService.updateProfile.mockClear();
    window.alert.mockClear();

    const view = renderAt(<TutorProfilePage />, '/tutor/profile');
    await waitFor(() => expect(view.container.textContent).toContain('Bị từ chối'));

    const headline = view.container.querySelector('input[placeholder^="Ví dụ: Thủ khoa"]');
    fireEvent.change(headline, { target: { value: 'abc' } });
    fireEvent.click(screen.getByText(/Lưu & Xuất bản/));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('kiểm tra lại'));

    fireEvent.change(headline, { target: { value: 'Gia sư Toán THPT cam kết tiến bộ' } });
    fireEvent.change(view.container.querySelector('textarea'), { target: { value: 'Tôi có nhiều năm kinh nghiệm luyện thi và xây dựng bài học theo năng lực từng học viên.' } });
    fireEvent.change(view.container.querySelector('input[placeholder^="Ví dụ: Hà Nội"]'), { target: { value: 'Hà Nội - Cầu Giấy' } });
    fireEvent.change(view.container.querySelector('input[placeholder^="Ví dụ: Trong vòng"]'), { target: { value: 'Trong 10 phút' } });
    fireEvent.click(screen.getByText(/Trực tuyến/));
    fireEvent.change(view.container.querySelector('input[placeholder^="Ví dụ: Đại học"]'), { target: { value: 'Đại học Sư phạm Hà Nội' } });
    fireEvent.change(view.container.querySelector('input[placeholder^="Ví dụ: Cử nhân"]'), { target: { value: 'Cử nhân Toán học' } });
    fireEvent.change(view.container.querySelector('input[min="0"][max="50"]'), { target: { value: '5' } });
    fireEvent.change(view.container.querySelector('input[placeholder^="Phân tách các chứng chỉ"]'), { target: { value: 'Chứng chỉ nghiệp vụ sư phạm' } });
    const splitInputs = view.container.querySelectorAll('input[placeholder^="Phân tách bằng dấu phẩy"]');
    fireEvent.change(splitInputs[0], { target: { value: 'Toán 12, Đại số' } });
    fireEvent.change(splitInputs[1], { target: { value: 'THPT, Ôn thi đại học' } });
    fireEvent.change(view.container.querySelector('input[step="10000"]'), { target: { value: '250000' } });
    fireEvent.click(screen.getByText(/Lưu & Xuất bản/));

    await waitFor(() => expect(tutorService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      headline: 'Gia sư Toán THPT cam kết tiến bộ',
      format: 'online',
      subjects: ['Toán 12', 'Đại số'],
      levels: ['THPT', 'Ôn thi đại học'],
      price: 250000,
    })));

    view.unmount();
    tutorService.getMyProfile.mockResolvedValueOnce(null);
    const emptyView = renderAt(<TutorProfilePage />, '/tutor/profile');
    await waitFor(() => expect(emptyView.container.textContent).toContain('chưa khởi tạo hồ sơ gia sư'));
  });

  it('exercises register password validation and student success route', async () => {
    const { authService } = await import('../services/auth.service');
    authService.register.mockClear();
    window.alert.mockClear();

    const view = renderAt(<AuthLayout><RegisterPage /></AuthLayout>, '/register');
    const inputs = view.container.querySelectorAll('input');
    fireEvent.change(inputs[2], { target: { value: 'Nguyễn Học Viên' } });
    fireEvent.change(inputs[3], { target: { value: 'student@example.com' } });
    fireEvent.change(inputs[4], { target: { value: 'weak' } });
    expect(view.container.textContent).toContain('Đánh giá độ an toàn');
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    expect(view.container.textContent).toContain('Mật khẩu chưa đủ điều kiện');
    expect(authService.register).not.toHaveBeenCalled();

    authService.register.mockResolvedValueOnce({
      accessToken: 'student-token',
      refreshToken: 'student-refresh',
      
      user: { id: 'student-new', fullName: 'Nguyễn Học Viên', role: 'student' },
    });
    fireEvent.change(inputs[4], { target: { value: 'Strong123!' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Nguyễn Học Viên',
      email: 'student@example.com',
      password: 'Strong123!',
      role: 'student',
    }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Khởi tạo tài khoản'));
  });

  it('exercises reset password invalid token, mismatch, and backend error branches', async () => {
    const { authService } = await import('../services/auth.service');
    authService.resetPassword.mockClear();

    let view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password');
    expect(view.container.textContent).toContain('Mã Token không hợp lệ');
    view.unmount();

    view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password?token=abc');
    let passwordInputs = view.container.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], { target: { value: 'Strong123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Strong124!' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    expect(view.container.textContent).toContain('không khớp');
    expect(authService.resetPassword).not.toHaveBeenCalled();
    view.unmount();

    authService.resetPassword.mockRejectedValueOnce({
      response: { data: { error: { message: 'Token đã hết hạn' } } },
    });
    view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password?token=expired');
    passwordInputs = view.container.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], { target: { value: 'Strong123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Strong123!' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(view.container.textContent).toContain('Token đã hết hạn'));
  });

  it('exercises auth form submit flows', async () => {
    let view = renderAt(<AuthLayout><LoginPage /></AuthLayout>, '/login');
    fireEvent.change(view.container.querySelector('input[type="email"]'), { target: { value: 'student@example.com' } });
    fireEvent.change(view.container.querySelector('input[type="password"]'), { target: { value: 'password123' } });
    fireEvent.click(view.container.querySelector('input[type="checkbox"]'));
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    view.unmount();

    view = renderAt(<AuthLayout><RegisterPage /></AuthLayout>, '/register');
    const registerInputs = view.container.querySelectorAll('input');
    fireEvent.click(view.container.querySelector('input[value="tutor"]'));
    fireEvent.change(registerInputs[2], { target: { value: 'Nguyễn Hoàng Nam' } });
    fireEvent.change(registerInputs[3], { target: { value: 'nam@example.com' } });
    fireEvent.change(registerInputs[4], { target: { value: 'password123' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    view.unmount();

    view = renderAt(<AuthLayout><ForgotPasswordPage /></AuthLayout>, '/forgot-password');
    fireEvent.change(view.container.querySelector('input[type="email"]'), { target: { value: 'nam@example.com' } });
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(view.container.textContent).toMatch(/gửi|email|mail/i));
    view.unmount();

    view = renderAt(<AuthLayout><ResetPasswordPage /></AuthLayout>, '/reset-password?token=abc');
    const resetInputs = view.container.querySelectorAll('input[type="password"]');
    resetInputs.forEach((input) => fireEvent.change(input, { target: { value: 'password123' } }));
    fireEvent.click(view.container.querySelector('button[type="submit"]'));
    await waitFor(() => expect(view.container.textContent).toMatch(/thành công|mật khẩu/i));
  });
});

