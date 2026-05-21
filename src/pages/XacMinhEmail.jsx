import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function XacMinhEmail() {
  const location = useLocation();

  // 1. Tự động lấy tham số ?token=... từ link email gửi về
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || '';

  // 2. State quản lý 3 trạng thái: 'loading' | 'success' | 'error'
  const [state, setState] = useState(token ? 'loading' : 'error');
  const [error, setError] = useState(token ? '' : 'Mã Token xác thực không tồn tại.');

  useEffect(() => {
    // Nếu không có token trên link thì dừng lại, giữ nguyên trạng thái error
    if (!token) return;

    // Tự động gọi API kích hoạt tài khoản lên Backend Node.js Express của TutorLink
    axios.get(`http://localhost:8000/api/auth/verify-email?token=${token}`)
      .then(() => {
        setState('success');
      })
      .catch((err) => {
        setState('error');
        setError(err.response?.data?.message || 'Đường link xác nhận đã hết hạn hoặc mã Token không hợp lệ.');
      });
  }, [token]);

  return (
    <div style={styles.container}>
      {/* 🔥 FIX TRIỆT ĐỂ: Nhúng keyframe an toàn tuyệt đối bằng thẻ style của React */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.card}>

        {/* ⏳ TRẠNG THÁI 1: ĐANG XỬ LÝ (LOADING) */}
        {state === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.spinner}></div>
            <h1 style={styles.title}>Đang xác minh Email...</h1>
            <p style={styles.subtitle}>TutorLink đang kiểm tra mã xác thực của sếp, quá trình này chỉ mất vài giây thôi!</p>
          </div>
        )}

        {/* 🎉 TRẠNG THÁI 2: XÁC MINH THÀNH CÔNG (SUCCESS) */}
        {state === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.iconContainer, color: '#27ae60' }}>✔️</div>
            <h1 style={styles.title}>Xác minh thành công!</h1>
            <p style={styles.subtitle}>Tài khoản của sếp đã được kích hoạt chính thức. Giờ đây sếp có thể sử dụng toàn bộ tính năng trên hệ thống.</p>
            <div style={{ marginTop: '25px' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={styles.buttonPrimary}>Vào bảng điều khiển</button>
              </Link>
            </div>
          </div>
        )}

        {/* ⚠️ TRẠNG THÁI 3: XÁC MINH THẤT BẠI (ERROR) */}
        {state === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.iconContainer, color: '#e74c3c' }}>❌</div>
            <h1 style={{ ...styles.title, color: '#ef4444' }}>Xác minh thất bại</h1>
            <p style={{ ...styles.subtitle, color: '#fca5a5', backgroundColor: 'rgba(231,76,60,0.1)', padding: '10px', borderRadius: '10px', marginTop: '10px' }}>
              ⚠️ {error}
            </p>
            <div style={{ marginTop: '25px' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={styles.buttonSecondary}>Quay lại đăng nhập</button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// BỘ STYLE CSS INLINE DARK-MODE SANG TRỌNG ĐỒNG BỘ CẢ DỰ ÁN
// -------------------------------------------------------------
const styles = {
  container: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    minHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: '#2c3e50',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '1px solid #34495e',
    color: 'white'
  },
  iconContainer: {
    fontSize: '52px',
    marginBottom: '15px'
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    color: '#fff'
  },
  subtitle: {
    fontSize: '14px',
    color: '#bdc3c7',
    lineHeight: '1.6',
    margin: 0
  },
  buttonPrimary: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.2)',
    cursor: 'pointer'
  },
  buttonSecondary: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#ecf0f1',
    border: '2px solid #7f8c8d',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #34495e',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    margin: '0 auto 20px auto',
    animation: 'spin 1s linear infinite', // Vẫn ăn hiệu ứng bình thường sếp nhé
  }
};