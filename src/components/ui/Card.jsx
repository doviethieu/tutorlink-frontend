import * as React from 'react';

// Hàm nối class CSS thủ công
const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================
// 1. Khung Card lớn bên ngoài (Đã thêm children)
// =========================================================
export const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

// =========================================================
// 2. Phần đầu của Card (Đã thêm children)
// =========================================================
export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props}>
    {children}
  </div>
);

// =========================================================
// 3. Tiêu đề của Card (Đã thêm children)
// =========================================================
export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100', className)} {...props}>
    {children}
  </h3>
);

// =========================================================
// 4. Mô tả ngắn trong Card (Đã thêm children)
// =========================================================
export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('text-sm leading-6 text-gray-500 dark:text-gray-400', className)} {...props}>
    {children}
  </p>
);

// =========================================================
// 5. Thân Card - Nơi chứa nội dung chính (Đã thêm children)
// =========================================================
export const CardContent = ({ className, children, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

// =========================================================
// 6. Chân Card - Nơi chứa các nút bấm hành động (Đã thêm children)
// =========================================================
export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
    {children}
  </div>
);