import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Thêm import authService chuẩn từ thư mục của sếp
import { authService } from '../../services/auth.service'; 

export default function XacMinhEmail() {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || '';

  const [state, setState] = useState(token ? 'loading' : 'error');
  const [error, setError] = useState(token ? '' : 'Mã Token xác thực không tồn tại trên đường dẫn URL.');

  useEffect(() => {
    if (!token) return;

    // GỌI QUA SERVICE ĐỒNG BỘ ĐÃ ĐƯỢC UNWRAP DỮ LIỆU SẠCH
    authService.verifyEmail(token)
      .then((data) => {
        console.log("Xác thực email thành công thông qua service:", data);
        setState('success');
      })
      .catch((err) => {
        console.error("Lỗi xác thực hệ thống:", err);
        setState('error');
        setError(err.response?.data?.error?.message || err.message || 'Không thể xác minh email.');
      });
  }, [token]);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>
        {/* ⏳ TRẠNG THÁI 1: ĐANG THẨM ĐỊNH (LOADING) */}
        {state === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.spinner}></div>
            <h1 style={styles.title}>Đang xác minh dữ liệu...</h1>
            <p style={styles.subtitle}>Hệ thống đang kiểm tra mã token bảo mật thông qua authService, sếp vui lòng đợi trong giây lát!</p>
          </div>
        )}

        {/* 🎉 TRẠNG THÁI 2: KÍCH HOẠT THÀNH CÔNG (SUCCESS) */}
        {state === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.iconContainer, color: '#10b981' }}>✔️</div>
            <h1 style={styles.title}>Xác thực thành công!</h1>
            <p style={styles.subtitle}>Tài khoản TutorLink của sếp đã được kích hoạt chính thức trên hệ thống mã hóa 2026.</p>
            <div style={{ marginTop: '28px' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={styles.buttonPrimary}>Vào bảng điều khiển</button>
              </Link>
            </div>
          </div>
        )}

        {/* ⚠️ TRẠNG THÁI 3: XÁC MINH THẤT BẠI (ERROR) */}
        {state === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.iconContainer, color: '#f87171' }}>❌</div>
            <h1 style={{ ...styles.title, color: '#f87171' }}>Xác minh thất bại</h1>
            <p style={styles.errorAlertBox}>⚠️ {error}</p>
            <div style={{ marginTop: '28px' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={styles.buttonSecondary}>Quay lại trang đăng nhập</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 🛠️ DESIGN SYSTEM SLATE PREMIUM DARK MODE ---
const styles = {
  container: {
    backgroundColor: '#FAF7F0',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    border: '1px solid #E7DED2',
    color: '#1E293B',
    boxSizing: 'border-box'
  },
  iconContainer: { fontSize: '56px', marginBottom: '16px', lineHeight: 1 },
  title: { fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: '#1E293B', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#5F6B7A', lineHeight: '1.6', margin: 0 },
  errorAlertBox: {
    fontSize: '13.5px',
    color: '#fca5a5',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginTop: '16px',
    lineHeight: '1.5'
  },
  buttonPrimary: {
    width: '100%',
    padding: '13px 20px',
    backgroundColor: '#C05A3E',
    color: '#FAF7F0',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14.5px',
    fontWeight: '800',
    boxShadow: '0 4px 14px rgba(192, 90, 62, 0.2)',
    cursor: 'pointer'
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#1E293B',
    border: '1px solid #7C6F64',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  spinner: {
    width: '46px',
    height: '46px',
    border: '4px solid #E7DED2',
    borderTop: '4px solid #C05A3E',
    borderRadius: '50%',
    margin: '0 auto 24px auto',
    animation: 'spin 0.8s linear infinite',
  }
};
