import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

// Hàm nối class CSS thủ công, không sợ lỗi thiếu file utils sếp nhé
const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================
// COMPONENT LABEL CHÍNH (Đã thêm children để hiển thị chữ)
// =========================================================
export const Label = React.forwardRef(({ className, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-semibold leading-none text-gray-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-100', 
      className
    )}
    {...props}
  >
    {children}
  </LabelPrimitive.Root>
));

Label.displayName = LabelPrimitive.Root.displayName;