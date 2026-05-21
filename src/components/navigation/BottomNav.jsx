import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Heart, LayoutDashboard, Search, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const items = [
  { href: '/tutors', label: 'Khám phá', icon: Search },
  { href: '/bookings', tutorHref: '/tutor/bookings', label: 'Lịch học', icon: CalendarDays },
  { href: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { href: '/favorites', label: 'Yêu thích', icon: Heart },
  { href: '/profile', label: 'Tôi', icon: User },
];

const cn = (...classes) => classes.filter(Boolean).join(' ');

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Lấy thông tin user từ store (Zustand hoặc Redux tuỳ sếp cấu hình)
  const { user } = useAuthStore();
  
  // Nếu chưa đăng nhập thì ẩn luôn thanh điều hướng dưới mobile
  if (!user) return null;

  return (
    <>
      {/* Khung đệm (Spacer) để nội dung trang không bị thanh điều hướng che mất */}
      <div className="h-16 md:hidden" aria-hidden="true" />
      
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 md:hidden">
        <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
          {items.map(({ href, tutorHref, label, icon: Icon }) => {
            // Xác định đường dẫn dựa trên vai trò của user (học viên hay gia sư/admin)
            const resolvedHref = tutorHref && (user.role === 'tutor' || user.role === 'admin') ? tutorHref : href;
            
            // Logic kiểm tra xem tab này có đang được chọn hay không
            const active = pathname === resolvedHref || pathname?.startsWith(resolvedHref + '/');
            
            return (
              <li key={href}>
                <Link
                  to={resolvedHref}
                  className={cn(
                    'flex min-w-[60px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition',
                    active
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                  )}
                >
                  <Icon 
                    className={cn(
                      'h-5 w-5 transition-transform group-active:scale-95', 
                      active && 'text-blue-600 dark:text-blue-400 fill-blue-500/10'
                    )} 
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}