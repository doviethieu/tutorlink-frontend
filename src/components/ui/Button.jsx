import * as React from 'react';
import { cva } from 'class-variance-authority';

// Định nghĩa các kiểu nút bấm (Màu sắc, kích cỡ) bằng CVA
const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C05A3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#C05A3E] text-[#FAF7F0] shadow-sm hover:bg-[#A94730] dark:bg-[#C05A3E] dark:hover:bg-[#A94730]',
        outline:
          'border border-[#C05A3E]/40 bg-white text-[#C05A3E] shadow-sm hover:border-[#C05A3E] hover:bg-[#FAF7F0] dark:bg-white dark:text-[#C05A3E] dark:border-[#C05A3E]/40 dark:hover:bg-[#FAF7F0]',
        secondary:
          'bg-[#FAF7F0] text-[#1E293B] hover:bg-[#E7DED2] dark:bg-[#FAF7F0] dark:text-[#1E293B] dark:hover:bg-[#E7DED2]',
        ghost: 
          'text-[#1E293B]/70 hover:bg-[#FAF7F0] hover:text-[#1E293B] dark:text-[#1E293B]/70 dark:hover:bg-[#FAF7F0] dark:hover:text-[#1E293B]',
        link: 
          'text-[#C05A3E] underline-offset-4 hover:underline dark:text-[#C05A3E]',
        destructive:
          'bg-red-600 text-[#FAF7F0] shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
        invert:
          'bg-gray-900 text-[#FAF7F0] hover:bg-gray-800 shadow-md dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
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
    if (asChild) {
      const child = React.Children.toArray(children).find(React.isValidElement);
      if (child) {
        return React.cloneElement(child, {
          ref,
          className: cn(buttonVariants({ variant, size }), child.props.className, className),
          ...props,
        });
      }
    }

    const Comp = 'button';
    
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
