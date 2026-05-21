import * as React from 'react';

// Hàm nối class CSS thủ công, chạy mù không sợ thiếu file utils sếp nhé
const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================
// COMPONENT INPUT CHÍNH (Đã tối ưu viền Focus mượt mà)
// =========================================================
export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
      // Khi nhấn chọn (Focus), dùng ring trực tiếp, bỏ ring-offset để tránh bị vệt trắng ở dark mode
      'focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Đồng bộ mượt mà với Dark Mode
      'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';