import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { asArray, formatVnd, shortDate } from '../lib/format';
import { cn } from '../lib/utils';
import { getErrorMessage, unwrap } from '../lib/api';
import { useAuthStore } from '../stores/auth-store';
import { Avatar, getInitials } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { FormField } from '../components/ui/Form-field';
import { SimpleBars } from '../components/common/SimpleBars';
import { SimpleLine } from '../components/common/SimpleLine';
import { StatusBadge } from '../components/marketplace/StatusBadge';
import { ReviewDialog } from '../components/common/ReviewDialog';
import ChatBox from '../components/chat/ChatBox';
import { api } from '../lib/api';

describe('core helpers', () => {
  it('formats money, dates, arrays, and classes', () => {
    expect(formatVnd(200000)).toContain('200.000');
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray({ data: ['a'] })).toEqual(['a']);
    expect(asArray({ items: ['b'] })).toEqual(['b']);
    expect(asArray({ results: ['c'] })).toEqual(['c']);
    expect(asArray(null)).toEqual([]);
    expect(shortDate('2026-05-25T00:00:00.000Z')).toMatch(/2026|25/);
    expect(shortDate('bad-date')).toBe('bad-date');
    expect(shortDate()).toBe('');
    expect(cn('p-2', false && 'hidden', 'p-4')).toContain('p-4');
  });

  it('unwraps API envelopes and extracts error messages', () => {
    expect(unwrap({ success: true, data: { ok: true } })).toEqual({ ok: true });
    expect(() => unwrap({ success: false, error: { message: 'Lỗi backend' } })).toThrow('Lỗi backend');
    expect(unwrap({ raw: true })).toEqual({ raw: true });
    expect(getErrorMessage({ response: { data: { error: { message: 'Sai token' } } } })).toBe('Sai token');
    expect(getErrorMessage(new Error('Custom'))).toBe('Custom');
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clear();
  });

  it('stores session, updates tokens, user, and clears state', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: { id: 'u1', role: 'student' },
    });
    expect(useAuthStore.getState().accessToken).toBe('access-1');

    useAuthStore.getState().setTokens('access-2');
    expect(useAuthStore.getState().accessToken).toBe('access-2');
    expect(useAuthStore.getState().refreshToken).toBe('refresh-1');

    useAuthStore.getState().setUser({ id: 'u2', role: 'admin' });
    expect(useAuthStore.getState().user.role).toBe('admin');

    useAuthStore.getState().clear();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('shared UI components', () => {
  it('renders avatar, button, card primitives and form controls', () => {
    expect(getInitials('Do Viet Hieu')).toBe('DH');
    expect(getInitials('Hieu')).toBe('HI');
    expect(getInitials()).toBe('?');

    render(
      <MemoryRouter>
        <Avatar name="Do Viet Hieu" size="lg" />
        <Avatar />
        <Badge variant="success">Đã duyệt</Badge>
        <Button loading>Gửi</Button>
        <Card>
          <CardHeader>
            <CardTitle>Tiêu đề</CardTitle>
            <CardDescription>Mô tả</CardDescription>
          </CardHeader>
          <CardContent>Nội dung</CardContent>
          <CardFooter>Chân trang</CardFooter>
        </Card>
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="email" />
        <Textarea placeholder="ghi chú" />
        <FormField label="Họ tên" error="Bắt buộc">
          <Input />
        </FormField>
      </MemoryRouter>,
    );

    expect(screen.getByText('Gửi')).toBeDisabled();
    expect(screen.getByText('Tiêu đề')).toBeInTheDocument();
    expect(screen.getByText('Bắt buộc')).toBeInTheDocument();
  });

  it('renders charts and status badges with empty and populated data', () => {
    const { container, rerender } = render(
      <>
        <SimpleBars data={[]} />
        <SimpleLine data={[]} />
        <StatusBadge status="pending" />
      </>,
    );
    expect(screen.getByText(/Chưa có dữ liệu thống kê/)).toBeInTheDocument();
    expect(screen.getByText(/Chưa có dữ liệu đường xu hướng/)).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();

    rerender(
      <>
        <SimpleBars data={[{ label: 'T2', value: 2 }, { label: 'T3', value: 5 }]} />
        <SimpleLine data={[{ label: 'T2', value: 2 }, { label: 'T3', value: 5 }]} formatValue={(v) => `${v} buổi`} />
        <StatusBadge status="approved" />
      </>,
    );
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
    expect(container.querySelectorAll('svg').length).toBe(2);
  });

  it('renders review dialog validation and submit states', async () => {
    const onClose = vi.fn();
    const onReviewSuccess = vi.fn();
    const { reviewService } = await import('../services/review.service');
    vi.spyOn(reviewService, 'create').mockResolvedValue({ id: 'review-1' });

    const { rerender } = render(
      <ReviewDialog
        open={false}
        onClose={onClose}
        tutorName="Gia sư An"
        subject="Toán"
        bookingId="booking-1"
        tutorId="tutor-1"
      />,
    );
    expect(screen.queryByText('Đánh giá buổi học')).not.toBeInTheDocument();

    rerender(
      <ReviewDialog
        open
        onClose={onClose}
        tutorName="Gia sư An"
        subject="Toán"
        bookingId="booking-1"
        tutorId="tutor-1"
        onReviewSuccess={onReviewSuccess}
      />,
    );
    fireEvent.click(screen.getByText('Gửi đánh giá'));
    expect(window.alert).toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole('button')[3]);
    fireEvent.change(screen.getByLabelText('Nhận xét chi tiết'), { target: { value: 'Rất tốt' } });
    fireEvent.click(screen.getByText('Gửi đánh giá'));
    await waitFor(() => expect(onReviewSuccess).toHaveBeenCalled());
  });

  it('loads chat history and sends messages from ChatBox', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: { success: true, data: [{ _id: 'm1', emailGui: 'me@example.com', nguoiGui: 'Me', noiDung: 'Cũ', thoiGian: '08:00' }] },
    });
    vi.spyOn(api, 'post').mockResolvedValue({
      data: { success: true, data: { _id: 'm2', emailGui: 'me@example.com', nguoiGui: 'Me', noiDung: 'Tin mới', thoiGian: '08:01' } },
    });

    const { rerender } = render(
      <MemoryRouter>
        <ChatBox />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Chọn một người/)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ChatBox
          idTuUrl="room-1"
          currentUser={{ _id: 'me', email: 'me@example.com', name: 'Me' }}
          nguoiDangChat={{ _id: 'you', email: 'you@example.com', name: 'Bạn học' }}
        />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Cũ')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Nhập tin nhắn...'), { target: { value: 'Tin mới' } });
    fireEvent.keyDown(screen.getByPlaceholderText('Nhập tin nhắn...'), { key: 'Enter' });
    await waitFor(() => expect(screen.getByText('Tin mới')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Vào lớp ngay/));
    expect(window.open).toHaveBeenCalled();
  });
});
