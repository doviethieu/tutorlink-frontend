import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, GraduationCap, Mail, Search, ShieldCheck } from 'lucide-react';

const links = [
  { href: '/tutors', label: 'Tìm gia sư', icon: Search },
  { href: '/bookings', label: 'Lịch học', icon: CalendarDays },
  { href: '/profile', label: 'Hồ sơ', icon: ShieldCheck },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-colors">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        
        {/* Khối giới thiệu thương hiệu */}
        <div>
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-bold text-gray-900 dark:text-gray-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>Edu<span className="text-blue-600 dark:text-blue-400">Match</span></span>
          </Link>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Nền tảng kết nối học sinh với gia sư đã xác thực, đặt lịch theo từng buổi và theo dõi tiến độ học tập minh bạch.
          </p>
        </div>

        {/* Khối liên kết điều hướng và thông tin liên hệ */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nhóm điều hướng nhanh */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Điều hướng</p>
            <div className="mt-3 grid gap-2">
              {links.map(({ href, label, icon: Icon }) => (
                <Link 
                  key={href} 
                  to={href} 
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Nhóm thông tin liên hệ */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Liên hệ</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              support@edumatch.vn
            </p>
          </div>
        </div>
      </div>

      {/* Bản quyền dưới chân trang */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        © 2026 EduMatch. Xây dựng cho học tập linh hoạt.
      </div>
    </footer>
  );
}