import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function QuenMatKhau() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm validate email bằng Regex thuần tối ưu hiệu năng cho Client
  const validateEmail = (inputEmail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Email không đúng định dạng rồi sếp ơi!');
      return;
    }

    setLoading(true);

    try {
      // Gọi lên đúng API Auth backend Node.js Express của TutorLink
      const response = await axios.post('http://localhost:8000/api/auth/forgot-password', { email });
      
      if (response.status === 200 || response.status === 201) {
        setSubmitted(true);
      }
    } catch (err) {
      // Kịch bản bảo mật đỉnh cao: Lỗi hay không vẫn báo thành công để tránh lộ Email người dùng
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // GIAO DIỆN 1: KHI ĐÃ GỬI LINK THÀNH CÔNG
  // -------------------------------------------------------------
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconContainer}>📬</div>
          <h1 style={styles.title}>Kiểm tra hộp thư!</h1>
          <p style={styles.subtitle}>
            Nếu địa chỉ email <span style={{ color: '#38bdf8', fontWeight: '700' }}>{email}</span> tồn tại trên TutorLink, một liên kết đặt lại mật khẩu đã được gửi đi thành công.
          </p>
          
          <div style={styles.warningContainer}>
            <p style={styles.warningText}>
              ⚠️ Lưu ý: Vì lý do bảo mật, liên kết này sẽ tự động hết hạn sau 1 giờ.
            </p>
          </div>
          
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={styles.buttonSecondary}>← Quay lại trang đăng nhập</button>
            </Link>
            <button 
              onClick={() => { setSubmitted(false); setEmail(''); }} 
              style={styles.linkButton}
            >
              Chưa nhận được email? <span style={{ color: '#38bdf8', fontWeight: '700' }}>Gửi lại yêu cầu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GIAO DIỆN 2: FORM NHẬP EMAIL BAN ĐẦU
  // -------------------------------------------------------------
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={styles.title}>Quên mật khẩu?</h1>
          <p style={styles.subtitle}>Nhập email tài khoản của sếp, hệ thống sẽ gửi một liên kết đặt lại mật khẩu bảo mật trong giây lát.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Địa chỉ Email đăng ký *</label>
            <input 
              type="email" 
              placeholder="ten-tai-khoan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={styles.input}
            />
            {error && <p style={styles.errorText}>{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.buttonPrimary,
              backgroundColor: loading ? '#334155' : '#38bdf8',
              color: loading ? '#64748b' : '#0f172a',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(56, 189, 248, 0.2)'
            }}
          >
            {loading ? '⏳ Đang truyền tải dữ liệu...' : '🚀 Gửi liên kết đặt lại mật khẩu'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', marginBottom: 0 }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '700', fontSize: '14px', transition: 'color 0.2s' }}>
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 🛠️ HỆ THỐNG PRESET CSS INLINE LUXURY ĐỒNG BỘ SLATE PREMIUM 
// -------------------------------------------------------------
const styles = {
  container: {
    backgroundColor: '#0f172a', // Đưa về nền tối mượt mà đồng bộ với Profile/LichRanh
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '24px',
    boxSizing: 'border-box'
  },
  card: {
    backgroundColor: '#1e293b', // Chuyển từ màu cổ vịt cũ về Deep Slate sang trọng
    borderRadius: '16px',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    border: '1px solid #334155',
    color: '#cbd5e1',
    boxSizing: 'border-box'
  },
  iconContainer: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))'
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
    lineHeight: '1.6',
    margin: 0
  },
  warningContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginTop: '16px'
  },
  warningText: {
    color: '#f87171',
    fontSize: '13px',
    margin: 0,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: '1.4'
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontWeight: '700',
    fontSize: '13px',
    color: '#cbd5e1',
    letterSpacing: '0.3px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '14.5px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  errorText: {
    color: '#f87171',
    fontSize: '13px',
    margin: '4px 0 0 0',
    fontWeight: '600'
  },
  buttonPrimary: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14.5px',
    fontWeight: '700',
    transition: 'all 0.2s',
    outline: 'none'
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '13.5px',
    fontWeight: '500',
    padding: 0,
    marginTop: '6px'
  }
};