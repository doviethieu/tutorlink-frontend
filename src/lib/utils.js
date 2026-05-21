import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm hỗ trợ gộp các class Tailwind động và xử lý xung đột CSS một cách thông minh.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}