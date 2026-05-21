import * as React from 'react';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700',
        accent: 'bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-900',
        warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900',
        danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-900',
        info: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:ring-sky-900',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Badge({ className, tone, children, ...props }) {
  return (
    <span 
      className={cn(badgeVariants({ tone }), className)} 
      {...props} 
    >
      {children}
    </span>
  );
}

export { badgeVariants };