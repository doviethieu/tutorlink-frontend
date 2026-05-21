import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth.service';

// Gọi trực tiếp các component UI đã viết hoa chuẩn đét của sếp
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationCenter } from './notification-center'; // Giữ nguyên theo cấu trúc của sếp

const navItems = [
  { href: '/tutors', tutorHref: '/tutors', label: 'Tìm gia sư', icon: Search, roles: ['student', 'tutor', 'admin'] },
  { href: '/bookings', tutorHref: '/tutor/bookings', label: 'Lịch học', icon: CalendarDays, roles: ['student', 'tutor', 'admin'] },
  { href: '/tutor/dashboard', tutorHref: '/tutor/dashboard', label: 'Gia sư', icon: BookOpenCheck, roles: ['tutor', 'admin'] },
  { href: '/admin', tutorHref: '/admin', label: 'Quản trị', icon: ShieldCheck, roles: ['admin'] },
];

const roleLabels = {
  student: 'Học sinh',
  tutor: 'Gia sư',
  admin: 'Quản trị',
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Header() {
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // logout luôn thành công ở phía client để tránh kẹt session
    }
    clear();
    toast.success('Đã đăng xuất');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        
        {/* Logo Thương Hiệu EduMatch */}
        <Link
          to="/"
          className="group flex items-center gap-3 text-lg font-semibold tracking-tight"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition group-hover:bg-blue-700">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-bold text-gray-900 dark:text-gray-100">
            Edu<span className="text-blue-600 dark:text-blue-400">Match</span>
          </span>
        </Link>

        {/* Thanh Điều Hướng Menu Chính (Desktop) */}
        <nav className="hidden items-center gap-1 rounded-full border border-gray-200 bg-gray-50/70 p-1 md:flex dark:border-gray-800 dark:bg-gray-900/70">
          <Link
            to="/dashboard"
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
              pathname === '/dashboard' && 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100',
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Bảng điều khiển
          </Link>
          
          {navItems
            .filter((item) => !user || item.roles.includes(user.role))
            .map(({ href, tutorHref, label, icon: Icon }) => {
              const resolvedHref = (user?.role === 'tutor' || user?.role === 'admin') ? tutorHref : href;
              return (
                <Link
                  key={href}
                  to={resolvedHref}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-gray-500 transition hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                    pathname?.startsWith(resolvedHref) && 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
        </nav>

        {/* Khu vực góc phải: Thông báo & Menu Tài khoản */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationCenter />
              
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white pl-1.5 pr-3 transition shadow-sm hover:border-blue-500/30 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    <Avatar name={user.fullName} size="sm" />
                    <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">
                      {user.fullName.split(' ').slice(-1)[0]}
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:inline" />
                  </button>
                </DropdownMenu.Trigger>
                
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={10}
                    className="z-50 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 animate-in fade-in-50 slide-in-from-top-1 duration-200"
                  >
                    <div className="border-b border-gray-100 dark:border-gray-800 p-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        {roleLabels[user.role]}
                      </span>
                    </div>
                    
                    <div className="p-1.5">
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none transition hover:bg-gray-50 dark:hover:bg-gray-900 focus:bg-gray-50 dark:focus:bg-gray-900"
                        >
                          <UserIcon className="h-4 w-4" /> Hồ sơ
                        </Link>
                      </DropdownMenu.Item>
                      
                      {user.role === 'tutor' && (
                        <DropdownMenu.Item asChild>
                          <Link
                            to="/tutor/profile"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none transition hover:bg-gray-50 dark:hover:bg-gray-900 focus:bg-gray-50 dark:focus:bg-gray-900"
                          >
                            <Sparkles className="h-4 w-4" /> Hồ sơ gia sư
                          </Link>
                        </DropdownMenu.Item>
                      )}
                      
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none transition hover:bg-gray-50 dark:hover:bg-gray-900 focus:bg-gray-50 dark:focus:bg-gray-900"
                        >
                          <Settings className="h-4 w-4" /> Yêu thích
                        </Link>
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
                      
                      <DropdownMenu.Item
                        onSelect={handleLogout}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none transition hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </DropdownMenu.Item>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition sm:inline"
              >
                Đăng nhập
              </Link>
              <Button asChild size="sm">
                <Link to="/register">Bắt đầu</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}