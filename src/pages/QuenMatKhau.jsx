import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function QuenMatKhau() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm validate email bằng Regex thuần, không cần cài thư viện Zod
  const validateEmail = (inputEmail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Email không đúng định dạng sếp ơi!');
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
      // Kịch bản của Edumatch: Lỗi hay không vẫn báo thành công để bảo mật thông tin Email hệ thống
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
            Nếu email <span style={{ color: '#3498db', fontWeight: 'bold' }}>{email}</span> tồn tại trong hệ thống TutorLink, chúng tôi đã gửi một liên kết đặt lại mật khẩu vào đó.
          </p>
          <p style={{ ...styles.subtitle, color: '#e74c3c', fontSize: '13px', marginTop: '5px' }}>
            ⚠️ Liên kết này sẽ hết hạn sau 1 giờ.
          </p>
          
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={styles.buttonSecondary}>← Quay lại đăng nhập</button>
            </Link>
            <button 
              onClick={() => { setSubmitted(false); setEmail(''); }} 
              style={styles.linkButton}
            >
              Không nhận được email? <span style={{ color: '#3498db', fontWeight: 'bold' }}>Gửi lại</span>
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
        <div style={{ marginBottom: '25px' }}>
          <h1 style={styles.title}>Quên mật khẩu?</h1>
          <p style={styles.subtitle}>Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu trong vài phút.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Địa chỉ Email *</label>
            <input 
              type="email" 
              placeholder="nhap-email-cua-ban@gmail.com"
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
              backgroundColor: loading ? '#7f8c8d' : '#3498db',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Đang gửi link...' : '🚀 Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#95a5a6', textDecoration: 'none', fontWeight: 'bold' }}>
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// BỘ STYLE CSS INLINE KHỚP GIAO DIỆN LUXURY CỦA TUTORLINK
// -------------------------------------------------------------
const styles = {
  container: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    minHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
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
    fontSize: '50px',
    textAlign: 'center',
    marginBottom: '20px'
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
    marginBottom: '8px',
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
  errorText: {
    color: '#e74c3c',
    fontSize: '13px',
    margin: '5px 0 0 0',
    fontWeight: 'bold'
  },
  buttonPrimary: {
    width: '100%',
    padding: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
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
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#bdc3c7',
    cursor: 'pointer',
    fontSize: '14px'
  }
};