import * as React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[96px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
      'focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';