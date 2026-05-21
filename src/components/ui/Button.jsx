import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

// Định nghĩa các kiểu nút bấm (Màu sắc, kích cỡ) bằng CVA
const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
        outline:
          'border border-blue-600/40 bg-white text-blue-600 shadow-sm hover:border-blue-600 hover:bg-blue-50 dark:bg-gray-950 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-950/20',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        ghost: 
          'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
        link: 
          'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
        invert:
          'bg-gray-900 text-white hover:bg-gray-800 shadow-md dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-11 px-5',
        lg: 'h-14 px-7 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================
// COMPONENT BUTTON CHÍNH (Đã tối ưu cấu trúc hiển thị Loading)
// =========================================================
export const Button = React.forwardRef(
  ({ className, variant, size, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {/* Tách biệt hẳn SVG xoay ra ngoài để không làm vỡ cấu trúc layout flex 
          của icon + chữ sếp truyền vào từ bên ngoài
        */}
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
          </svg>
        )}
        {children}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };