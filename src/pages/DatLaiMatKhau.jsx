import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function DatLaiMatKhau() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Mẹo lấy tham số ?token=... từ URL cực gọn bằng JS thuần trong React
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || '';

  // Quản lý trạng thái form dữ liệu
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Quản lý trạng thái giao diện UI
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Bộ đếm ngược tự động chuyển hướng về trang Đăng nhập sau 5 giây
  useEffect(() => {
    if (!done) return;
    
    const intervalId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [done]);

  useEffect(() => {
    if (done && countdown <= 0) {
      navigate('/login');
    }
  }, [done, countdown, navigate]);

  // 3. Xử lý khi nhấn nút gửi form đổi mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra nhanh điều kiện nghiệp vụ ở Client
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Mật khẩu mới chưa đạt yêu cầu (Tối thiểu 8 ký tự, gồm 1 chữ hoa và 1 số) sếp ơi!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp nhau rồi sếp ạ!');
      return;
    }

    setLoading(true);

    try {
      // Gọi API reset password đến Backend Node.js Express của TutorLink
      const response = await axios.post('http://localhost:8000/api/auth/reset-password', {
        token,
        password: newPassword
      });

      if (response.status === 200 || response.status === 201) {
        setDone(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đường link này đã hết hạn hoặc mã Token không chính xác. Sếp vui lòng yêu cầu gửi lại link mới nhé!');
    } finally {
      setLoading(false);
    }
  };

  // =============================================================
  // GIAO DIỆN 1: NẾU TRÊN URL KHÔNG CÓ TOKEN HOẶC TOKEN SAI BẢO MẬT
  // =============================================================
  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...styles.iconContainer, color: '#e74c3c' }}>🛡️</div>
          <h1 style={styles.title}>Mã Token không hợp lệ</h1>
          <p style={styles.subtitle}>
            Yêu cầu bảo mật không thành công. Sếp vui lòng nhấn vào đường link chính xác được gửi trong hộp thư email.
          </p>
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <button style={styles.buttonSecondary}>Yêu cầu gửi lại link mới</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // GIAO DIỆN 2: KHI ĐỔI MẬT KHẨU THÀNH CÔNG RỰC RỠ
  // =============================================================
  if (done) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...styles.iconContainer, color: '#27ae60' }}>🎉</div>
          <h1 style={styles.title}>Đổi mật khẩu thành công!</h1>
          <p style={styles.subtitle}>
            Tài khoản của sếp đã được cập nhật khoá bảo mật mới an toàn.
          </p>
          <p style={{ ...styles.subtitle, color: '#2ecc71', fontWeight: 'bold', marginTop: '10px' }}>
            🔄 Hệ thống tự động chuyển về trang Đăng nhập trong {countdown}s…
          </p>
          <div style={{ marginTop: '25px' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={styles.buttonPrimary}>Đăng nhập ngay lập tức</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // GIAO DIỆN MẶC ĐỊNH: FORM NHẬP HAI Ô MẬT KHẨU MỚI
  // =============================================================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ marginBottom: '25px' }}>
          <h1 style={styles.title}>Đặt lại mật khẩu</h1>
          <p style={styles.subtitle}>Vui lòng chọn mật khẩu mới có tính bảo mật cao để bảo vệ tài khoản TutorLink.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* Ô NHẬP MẬT KHẨU MỚI */}
          <div>
            <label style={styles.label}>Mật khẩu mới *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
            <p style={{ color: '#95a5a6', fontSize: '11px', marginTop: '4px' }}>📌 Ít nhất 8 ký tự, bao gồm 1 chữ viết hoa và 1 chữ số</p>
          </div>

          {/* Ô XÁC NHẬN MẬT KHẨU */}
          <div>
            <label style={styles.label}>Xác nhận mật khẩu mới *</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* NÚT SUBMIT */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.buttonPrimary,
              backgroundColor: loading ? '#7f8c8d' : '#3498db',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Đang ghi nhận mật khẩu mới...' : '✔️ Xác nhận đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// BỘ STYLE CSS INLINE SANG TRỌNG ĐỒNG BỘ MÀU TỐI VỚI DỰ ÁN
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
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '15px'
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 10px 0',
    color: '#fff'
  },
  subtitle: {
    fontSize: '14px',
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: '1.5',
    margin: 0
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#ecf0f1'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #34495e',
    backgroundColor: '#1a252f',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  errorBox: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    border: '1px solid #e74c3c',
    color: '#e74c3c',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  buttonPrimary: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)',
    cursor: 'pointer',
    marginTop: '10px'
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#ecf0f1',
    border: '2px solid #7f8c8d',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};