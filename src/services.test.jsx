import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../lib/api';
import { adminService } from '../services/admin.service';
import { authService } from '../services/auth.service';
import { availabilityService } from '../services/availability.service';
import { bookingService } from '../services/booking.service';
import { chatService } from '../services/chat.service';
import { favoriteService } from '../services/favorite.service';
import { notificationService } from '../services/notification.service';
import { paymentService } from '../services/payment.service';
import { payoutService } from '../services/payout.service';
import { reportService } from '../services/report.service';
import { reviewService } from '../services/review.service';
import { tutorService } from '../services/tutor.service';
import { usersService } from '../services/users.service';
import {
  adminService as legacyAdmin,
  availabilityService as legacyAvailability,
  bookingsService,
  favoritesService,
  metaService,
  notificationsService,
  reviewsService,
  tutorsService,
  uploadsService,
} from '../services/tutorlink.service';

function ok(data = { id: 'ok' }) {
  return Promise.resolve({ data: { success: true, data } });
}

describe('API services', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, 'get').mockImplementation(() => ok());
    vi.spyOn(api, 'post').mockImplementation(() => ok());
    vi.spyOn(api, 'patch').mockImplementation(() => ok());
    vi.spyOn(api, 'put').mockImplementation(() => ok());
    vi.spyOn(api, 'delete').mockImplementation(() => ok());
  });

  it('covers auth service endpoints', async () => {
    await authService.register({ fullName: 'A' });
    await authService.login({ email: 'a@example.com' });
    await authService.verifyOtp('a@example.com', '123456');
    await authService.loginWithGoogle('google');
    await authService.logout();
    await authService.getMe();
    await authService.forgotPassword('a@example.com');
    await authService.resetPassword('token', 'password123');
    await authService.verifyEmail('token value');
    expect(api.post).toHaveBeenCalledWith('/auth/google', { token: 'google' });
  });

  it('covers admin, tutor, availability, booking and communication services', async () => {
    await adminService.overview();
    await adminService.tutorQueue({ status: 'all' });
    await adminService.tutor('tutor 1');
    await adminService.approveTutor('tutor 1', 'ok');
    await adminService.rejectTutor('tutor 1', 'no');
    await adminService.requestTutorInfo('tutor 1', 'more');
    await adminService.suspendTutor('tutor 1', 'stop');
    await adminService.users({ role: 'student' });
    await adminService.lockUser('user 1');
    await adminService.unlockUser('user 1');
    await adminService.reports({ status: 'open' });
    await adminService.resolveReport('report 1', { status: 'resolved' });
    await adminService.hideReview('review 1', 'bad');
    await adminService.auditLogs();
    await adminService.payments();
    await adminService.payouts();
    await adminService.updatePayout('payout 1', { status: 'paid' });
    await adminService.systemConfigs();
    await adminService.updateSystemConfig('fee', { value: 10 });
    await adminService.exportReportsCsv();

    await tutorService.list({ q: 'Toán' });
    await tutorService.get('tutor 1');
    await tutorService.getMyProfile();
    await tutorService.createProfile({ bio: 'bio' });
    await tutorService.updateProfile({ bio: 'new' });

    await availabilityService.getMine();
    await availabilityService.replaceMine({ slots: [] });
    await availabilityService.getTutorAvailability('tutor 1', '2026-05-25');

    await bookingService.list({ status: 'pending' });
    await bookingService.listForTutor();
    await bookingService.listForStudent({ role: 'student' });
    await bookingService.get('booking 1');
    await bookingService.create({ tutorId: 'tutor' });
    await bookingService.accept('booking 1');
    await bookingService.reject('booking 1', 'busy');
    await bookingService.cancel('booking 1', 'change');
    await bookingService.complete('booking 1');
    await bookingService.exportCsv();

    await chatService.listRooms();
    await chatService.getHistory('room 1');
    await chatService.sendMessage({ roomId: 'room 1', content: 'hi' });
    await favoriteService.list();
    await favoriteService.add('tutor 1');
    await favoriteService.remove('tutor 1');
    await notificationService.list();
    await notificationService.markRead('notice 1');
    await notificationService.markAllRead();
    expect(api.get).toHaveBeenCalledWith('/admin/reports/export.csv', { responseType: 'blob' });
  });

  it('covers payment, payout, report, review, user and legacy tutorlink services', async () => {
    await paymentService.create('booking 1', 'qr');
    await paymentService.confirm({ bookingId: 'booking 1' });
    await paymentService.refund({ bookingId: 'booking 1' });
    await paymentService.list();

    await payoutService.summary();
    await payoutService.list();
    await payoutService.request({ amount: 100000 });
    await payoutService.requestWalletWithdrawal({ amount: 100000 });

    await reportService.create({ title: 'Help' });
    await reportService.listMine();

    await reviewService.listByTutor('tutor 1');
    await reviewService.create({ rating: 5 });
    await reviewService.update('review 1', { rating: 4 });
    await reviewService.reply('review 1', 'thanks');

    await usersService.updateProfile({ fullName: 'A' });
    await usersService.changePassword({ currentPassword: 'a' });
    await usersService.deleteAccount();
    await usersService.uploadAvatar(new File(['x'], 'avatar.png'));
    await usersService.getWallet();
    expect(await usersService.getHistory()).toEqual([]);

    await tutorsService.list();
    await tutorsService.get('tutor 1');
    await tutorsService.availability('tutor 1', '2026-05-25');
    await tutorsService.reviews('tutor 1');
    await tutorsService.getMyProfile();
    await tutorsService.createProfile({});
    await tutorsService.updateProfile({});
    await favoritesService.list();
    await favoritesService.add('tutor 1');
    await favoritesService.remove('tutor 1');
    await legacyAvailability.getMine('2026-05-25');
    await legacyAvailability.replaceMine({ slots: [] });
    await bookingsService.list();
    await bookingsService.create({});
    await bookingsService.get('booking 1');
    await bookingsService.accept('booking 1');
    await bookingsService.reject('booking 1', 'busy');
    await bookingsService.cancel('booking 1', 'change');
    await bookingsService.complete('booking 1');
    await bookingsService.exportCsv();
    await reviewsService.create({});
    await legacyAdmin.overview();
    await legacyAdmin.tutorQueue();
    await legacyAdmin.tutor('tutor 1');
    await legacyAdmin.approveTutor('tutor 1', 'ok');
    await legacyAdmin.rejectTutor('tutor 1', 'no');
    await legacyAdmin.requestTutorInfo('tutor 1', 'more');
    await legacyAdmin.users();
    await legacyAdmin.lockUser('user 1');
    await legacyAdmin.unlockUser('user 1');
    await legacyAdmin.reports();
    await legacyAdmin.resolveReport('report 1', {});
    await legacyAdmin.exportReportsCsv();
    await notificationsService.list();
    await notificationsService.markRead('notice 1');
    await notificationsService.markAllRead();
    await uploadsService.sign({ fileName: 'a.png' });
    await uploadsService.direct('a/b.png', new Blob(['x']));
    await metaService.subjects();
    await metaService.levels();
    expect(api.put).toHaveBeenCalled();
  });
});
