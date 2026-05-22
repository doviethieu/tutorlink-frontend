import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function DatLaiMatKhau() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Lấy tham số ?token=... từ URL cực gọn bằng JS thuần trong React
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
          <div style={{ ...styles.iconContainer, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>🛡️</div>
          <h1 style={styles.title}>Mã Token không hợp lệ</h1>
          <p style={styles.subtitle}>
            Yêu cầu bảo mật không thành công. Sếp vui lòng nhấn vào đường link chính xác được gửi trong hộp thư email.
          </p>
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none', width: '100%' }}>
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
          <div style={{ ...styles.iconContainer, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>🎉</div>
          <h1 style={styles.title}>Đổi mật khẩu thành công!</h1>
          <p style={styles.subtitle}>
            Tài khoản của sếp đã được cập nhật khoá bảo mật mới an toàn.
          </p>
          <p style={{ ...styles.subtitle, color: '#10b981', fontWeight: 'bold', marginTop: '15px' }}>
            🔄 Tự động chuyển về trang Đăng nhập trong {countdown}s…
          </p>
          <div style={{ marginTop: '25px' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{ ...styles.buttonPrimary, backgroundColor: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)' }}>
                Đăng nhập ngay lập tức
              </button>
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
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={styles.title}>Đặt lại mật khẩu</h1>
          <p style={styles.subtitle}>Vui lòng chọn mật khẩu mới có tính bảo mật cao để bảo vệ tài khoản TutorLink của sếp.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px', lineHeight: '1.4' }}>
              📌 Yêu cầu: Ít nhất 8 ký tự, bao gồm 1 chữ viết hoa và 1 chữ số.
            </p>
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
              backgroundColor: loading ? '#475569' : '#38bdf8',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(56, 189, 248, 0.2)',
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
// 🛠️ HỆ THỐNG CSS INLINE CAO CẤP CHUẨN SLATE DARK-MODE ĐỒNG BỘ 100%
// -------------------------------------------------------------
const styles = {
  container: {
    background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '40px 30px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    border: '1px solid #334155',
    color: '#f1f5f9'
  },
  iconContainer: {
    fontSize: '32px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    textAlign: 'center',
    margin: '0 0 10px 0',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: '1.5',
    margin: 0
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '700',
    fontSize: '14px',
    color: '#e2e8f0'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: '0.2s'
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 'bold'
  },
  buttonPrimary: {
    width: '100%',
    padding: '14px',
    color: '#0f172a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: '0.2s'
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#e2e8f0',
    border: '1px solid #475569',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: '0.2s'
  }
};