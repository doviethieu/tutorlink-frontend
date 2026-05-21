import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

// =========================================================
// COMPONENT AUTHGUARD: NGƯỜI GÁC CỔNG BẢO MẬT
// =========================================================
export function AuthGuard({ children, roles }) {
  const navigate = useNavigate();
  const { user, accessToken, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Nếu store chưa đồng bộ xong dữ liệu từ LocalStorage/Cookie thì chưa làm gì cả
    if (!hasHydrated) return;

    // Nếu không có token hoặc không có user -> đá về trang đăng nhập
    if (!accessToken || !user) {
      navigate('/login', { replace: true });
    }
  }, [hasHydrated, accessToken, user, navigate]);

  // 1. Trạng thái đang tải dữ liệu xác thực
  if (!hasHydrated || !accessToken || !user) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500 py-10 text-sm font-medium">
        Đang tải…
      </div>
    );
  }

  // 2. Trạng thái sai quyền (Ví dụ: Giáo viên đòi vào trang Học sinh)
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Bạn không có quyền truy cập trang này
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {roles.includes('student') 
            ? 'Tính năng này chỉ dành cho học sinh.' 
            : 'Tài khoản của bạn không có quyền thực hiện thao tác này.'}
        </p>
      </div>
    );
  }

  // 3. Hợp lệ hoàn toàn -> Cho phép hiển thị nội dung bên trong
  return <>{children}</>;
}