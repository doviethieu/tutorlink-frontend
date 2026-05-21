import * as React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarCheck, MessageCircle, Wallet } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Đã đổi tên thương hiệu sang tutorlink.service đồng bộ chuẩn chỉnh rồi sếp nhé!
import { notificationsService } from '@/services/tutorlink.service';
import { asArray as ensureArray, shortDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const iconMap = {
  booking: CalendarCheck,
  message: MessageCircle,
  wallet: Wallet,
};

// Đảo hàm bốc Icon lên trên đầu để tránh lỗi sử dụng trước khi khai báo
function pickIcon(type) {
  const t = type || '';
  if (t.includes('payment') || t.includes('payout')) return 'wallet';
  if (t.includes('message') || t.includes('review')) return 'message';
  return 'booking';
}

// =========================================================
// COMPONENT TRUNG TÂM THÔNG BÁO CHÍNH (TUTORLINK REBRAND)
// =========================================================
export function NotificationCenter() {
  const queryClient = useQueryClient();

  // Gọi API lấy danh sách thông báo qua React Query
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.list({ page: 1 }),
  });

  const items = ensureArray(data).slice(0, 8);
  const unread = items.filter((n) => !n.read).length;

  // Lệnh Mutation đánh dấu đọc toàn bộ thông báo nhanh
  const markAll = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-blue-500/30 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white animate-pulse">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 animate-in fade-in-50 slide-in-from-top-1 duration-200"
        >
          {/* Header của Popup */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Thông báo</p>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Đánh dấu đã đọc
            </button>
          </div>

          {/* Danh sách thông báo cuộn nội dung */}
          <div className="max-h-96 overflow-auto py-1">
            {isLoading && (
              <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">Đang tải…</p>
            )}
            {!isLoading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Chưa có thông báo
              </p>
            )}
            
            {items.map((n) => {
              const Icon = iconMap[pickIcon(n.type)] || CalendarCheck;
              return (
                <DropdownMenu.Item asChild key={n.id}>
                  <Link
                    to="/bookings"
                    className={cn(
                      'flex gap-3 px-4 py-3 text-sm outline-none transition focus:bg-gray-50 dark:focus:bg-gray-900',
                      !n.read && 'bg-blue-50/40 dark:bg-blue-950/20',
                    )}
                  >
                    {/* Icon đại diện theo danh mục */}
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    
                    {/* Nội dung text thông báo */}
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-gray-900 dark:text-gray-100', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{n.body}</p>
                      <p className="mt-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                        {shortDate(n.createdAt)}
                      </p>
                    </div>
                    {/* Dấu chấm tròn báo chưa đọc */}
                    {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />}
                  </Link>
                </DropdownMenu.Item>
              );
            })}
          </div>

          {/* Footer xem tất cả */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 text-center">
            <Link to="/dashboard" className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
              Xem tất cả thông báo
            </Link>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}