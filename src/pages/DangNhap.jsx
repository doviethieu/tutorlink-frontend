import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// TÍCH HỢP HOOK ĐĂNG NHẬP GOOGLE CUSTOM CHO VITE
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

// 🔥 ĐÃ FIX: Xóa chuỗi ép cứng (Hardcode) bị sai chính tả. 
// Hệ thống bây giờ tự động nạp chuỗi chuẩn từ file .env của sếp qua Vite!
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function DangNhap() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); 
  const [step, setStep] = useState(1); 
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =========================================================
  // LUỒNG LƯU TOKEN ĐÔI + ĐỒNG BỘ HIỂN THỊ VỚI NAVBAR CỦA SẾP
  // =========================================================
  const saveLoginSession = (apiData) => {
    const { accessToken, refreshToken, user } = apiData;

    // 1. Lưu cặp token đôi bảo mật theo chuẩn thực tế của sếp
    localStorage.setItem('tutorlinkToken', accessToken); 
    localStorage.setItem('tutorlinkRefreshToken', refreshToken);

    // 2. Định dạng lại cấu trúc User một chút để tương thích với Navbar cũ của sếp
    const normalizedUser = {
      _id: user.id || user._id,
      name: user.fullName || user.name || 'Thành viên', 
      email: user.email,
      role: user.role || 'student', 
      picture: user.picture || user.avatarUrl
    };
    
    localStorage.setItem('tutorlinkUser', JSON.stringify(normalizedUser));

    alert(`🎉 Chào mừng trở lại, ${normalizedUser.name}!`);
    
    // 3. Phân quyền điều hướng: Admin sang Dashboard, Student/Tutor về Trang chủ
    if (normalizedUser.role === 'admin') {
      navigate('/dashboard'); 
    } else {
      navigate('/'); 
    }
    window.location.reload();
  };

  // =========================================================
  // XỬ LÝ LUỒNG GOOGLE: GỬI ACCESS_TOKEN ĐẾN ENDPOINT /google
  // =========================================================
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:8000/api/auth/google', {
          token: tokenResponse.access_token
        });

        if (response.data && response.data.status === 'success') {
          saveLoginSession(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Backend từ chối xác thực Token Google này sếp ơi!');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Xác thực tài khoản Google qua cửa sổ Popup thất bại!');
    }
  });

  // =========================================================
  // XỬ LÝ BƯỚC 1: GỬI EMAIL & MẬT KHẨU ĐỂ LẤY OTP
  // =========================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', { 
        email, 
        password 
      });

      if (response.data && response.data.requiresOTP) {
        setStep(2); 
      } else if (response.data && response.data.data?.accessToken) {
        saveLoginSession(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Sếp kiểm tra lại tài khoản mật khẩu nhé!');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // XỬ LÝ BƯỚC 2: GỬI MÃ OTP ĐỂ NHẬN TOKEN QUYỀU LỰC
  // =========================================================
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/verify-otp', {
        email,
        otp
      });

      if (response.data && response.data.status === 'success') {
        saveLoginSession(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn sếp ơi!');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthAlert = (platform) => {
    alert(`💡 Tính năng đăng nhập qua ${platform} đang được tối ưu!`);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <div style={styles.card}>
          
          <div style={{ marginBottom: '25px', textAlign: 'center' }}>
            <h1 style={styles.title}>
              {step === 1 ? 'Chào mừng trở lại.' : 'Xác thực bảo mật'}
            </h1>
            <p style={styles.subtitle}>
              {step === 1 
                ? 'Đăng nhập để tiếp tục đặt lịch và quản lý buổi học tại TutorLink.' 
                : `Hệ thống đã cấp mã OTP. Sếp vui lòng điền mã xác thực gửi đến ${email} để hoàn tất.`}
            </p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* BƯỚC 1: FORM TÀI KHOẢN & GOOGLE */}
          {step === 1 && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={styles.label}>Địa chỉ Email</label>
                <input 
                  type="email" 
                  placeholder="ban@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Mật khẩu</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.flexRow}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#bdc3c7' }}>
                  <input 
                    type="checkbox" 
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Ghi nhớ tôi
                </label>
                <Link to="/forgot-password" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                  Quên mật khẩu?
                </Link>
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
                {loading ? '⏳ Đang kiểm tra...' : 'Đăng nhập'}
              </button>

              <div style={styles.dividerContainer}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>HOẶC ĐĂNG NHẬP BẰNG</span>
              </div>

              {/* NÚT GOOGLE CUSTOM HOOK */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <button 
                  type="button" 
                  onClick={() => loginWithGoogle()} 
                  style={{...styles.buttonOAuth, backgroundColor: '#1a252f', color: 'white'}}
                >
                  {loading ? '⏳ Đang xử lý...' : 'Đăng nhập với Google'}
                </button>
                
                <button type="button" onClick={() => handleOAuthAlert('Facebook')} style={styles.buttonOAuth}>
                  Đăng nhập với Facebook
                </button>
              </div>
            </form>
          )}

          {/* BƯỚC 2: MÀN HÌNH NHẬP MÃ OTP */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={styles.label}>Nhập mã OTP (6 số)</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: 111111"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                  style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '20px', fontWeight: 'bold' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  ...styles.buttonPrimary,
                  backgroundColor: loading ? '#7f8c8d' : '#2ecc71',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Đang xác thực OTP...' : 'Xác nhận mã OTP'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ ...styles.buttonOAuth, backgroundColor: 'transparent', border: 'none', color: '#95a5a6' }}
              >
                ← Quay lại trang đăng nhập
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#95a5a6' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#27ae60', textDecoration: 'none', fontWeight: 'bold' }}>
              Tạo tài khoản miễn phí
            </Link>
          </p>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' },
  card: { backgroundColor: '#2c3e50', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid #34495e', color: 'white' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: '#bdc3c7', lineHeight: '1.5', margin: 0 },
  label: { display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#ecf0f1' },
  input: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #34495e', backgroundColor: '#1a252f', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  flexRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' },
  errorBox: { backgroundColor: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', color: '#e74c3c', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' },
  buttonPrimary: { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
  dividerContainer: { position: 'relative', textAlign: 'center', margin: '15px 0' },
  dividerLine: { position: 'absolute', top: '50%', left: 0, borderTop: '1px solid #34495e', width: '100%' },
  dividerText: { position: 'relative', backgroundColor: '#2c3e50', padding: '0 10px', fontSize: '12px', color: '#95a5a6', fontWeight: 'bold', zIndex: 2 },
  buttonOAuth: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', backgroundColor: '#1a252f', color: 'white', border: '1px solid #34495e', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }
};