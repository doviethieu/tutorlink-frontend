import * as React from 'react';
// Import đồng bộ theo alias đường dẫn tuyệt đối cho an toàn sếp nhé
import { Label } from '@/components/ui/Label'; 

const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================
// COMPONENT FORMFIELD CHÍNH (Đã sửa logic truyền label)
// =========================================================
export function FormField({ 
  label, 
  htmlFor, 
  error, 
  hint, 
  required, 
  children, 
  className 
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Chỉ hiển thị thẻ Label nếu sếp có truyền prop label vào */}
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </Label>
      )}
      
      {/* Ô Input hoặc Textarea sếp thả từ bên ngoài vào */}
      {children}
      
      {/* Khu vực hiển thị thông báo lỗi hoặc text gợi ý */}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}