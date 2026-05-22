import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth-store';
// TÍCH HỢP HOOK ĐĂNG NHẬP GOOGLE CUSTOM CHO VITE
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

// 🔥 Hệ thống tự động nạp chuỗi chuẩn từ file .env của sếp qua Vite!
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function DangNhap() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
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
    setSession({ accessToken, refreshToken, user: normalizedUser });

    alert(`🎉 Chào mừng sếp trở lại với TutorLink, ${normalizedUser.name}!`);
    
    if (normalizedUser.role === 'admin') {
      navigate('/admin'); 
    } else if (normalizedUser.role === 'tutor') {
      navigate('/tutor/panel'); 
    } else {
      navigate('/dashboard'); 
    }
  };

  // =========================================================
  // XỬ LÝ LUỒNG GOOGLE: GỬI ACCESS_TOKEN ĐẾN ENDPOINT /google
  // =========================================================
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const data = await authService.loginWithGoogle(tokenResponse.access_token);
        saveLoginSession(data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Backend từ chối xác thực Token Google này.');
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
      const data = await authService.login({ email, password });
      saveLoginSession(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Đăng nhập thất bại. Kiểm tra lại tài khoản mật khẩu.');
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
      const data = await authService.verifyOtp(email, otp);
      saveLoginSession(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthAlert = (platform) => {
    alert(`💡 Tính năng đăng nhập qua ${platform} đang được đội ngũ tối ưu hóa!`);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={styles.container}>
        <div style={styles.card}>
          
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h1 style={styles.title}>
              {step === 1 ? 'Chào mừng trở lại' : 'Xác thực bảo mật'}
            </h1>
            <p style={styles.subtitle}>
              {step === 1 
                ? 'Đăng nhập để tiếp tục đặt lịch và quản lý buổi học tại TutorLink.' 
                : `Hệ thống bảo mật cao cấp. Sếp điền mã xác thực đã gửi đến ${email}.`}
            </p>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* BƯỚC 1: FORM TÀI KHOẢN & GOOGLE */}
          {step === 1 && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={styles.label}>Địa chỉ Email</label>
                <input 
                  type="email" 
                  placeholder="name@tutorlink.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Mật khẩu tài khoản</label>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', color: '#94a3b8' }}>
                  <input 
                    type="checkbox" 
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Ghi nhớ phiên đăng nhập
                </label>
                <Link to="/forgot-password" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '13.5px', fontWeight: '700' }}>
                  Quên mật khẩu?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  ...styles.buttonPrimary,
                  backgroundColor: loading ? '#475569' : '#38bdf8',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(56, 189, 248, 0.2)'
                }}
              >
                {loading ? '⏳ Đang kiểm tra dữ liệu...' : 'Đăng nhập hệ thống'}
              </button>

              <div style={styles.dividerContainer}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>HOẶC PHƯƠNG THỨC KHÁC</span>
              </div>

              {/* NÚT GOOGLE & FACEBOOK ĐỒNG BỘ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <button 
                  type="button" 
                  onClick={() => loginWithGoogle()} 
                  style={styles.buttonOAuth}
                >
                  <span style={{ marginRight: '10px', fontSize: '16px' }}>🌐</span>
                  {loading ? '⏳ Đang xử lý OAuth...' : 'Đăng nhập nhanh với Google'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => handleOAuthAlert('Facebook')} 
                  style={{ ...styles.buttonOAuth, border: '1px solid #1e293b', backgroundColor: '#1e293b' }}
                >
                  <span style={{ marginRight: '10px', fontSize: '16px' }}>📘</span>
                  Liên kết tài khoản Facebook
                </button>
              </div>
            </form>
          )}

          {/* BƯỚC 2: MÀN HÌNH NHẬP MÃ OTP 2FA */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={styles.label}>Nhập mã xác thực OTP (6 số)</label>
                <input 
                  type="text" 
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                  style={{ ...styles.input, textAlign: 'center', letterSpacing: '6px', fontSize: '22px', fontWeight: '900', color: '#10b981' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  ...styles.buttonPrimary,
                  backgroundColor: loading ? '#475569' : '#10b981',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.2)'
                }}
              >
                {loading ? '⏳ Đang xác thực OTP...' : 'Xác nhận mã bảo mật'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ ...styles.buttonOAuth, backgroundColor: 'transparent', border: 'none', color: '#94a3b8' }}
              >
                ← Quay lại trang điền mật khẩu
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#94a3b8' }}>
            Sếp chưa có tài khoản đối tác?{' '}
            <Link to="/register" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 'bold' }}>
              Tạo tài khoản miễn phí
            </Link>
          </p>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

// -------------------------------------------------------------
// 🛠️ HỆ THỐNG CSS INLINE CAO CẤP CHUẨN SLATE DARK-MODE
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
    maxWidth: '460px', 
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
    border: '1px solid #334155', 
    color: '#f1f5f9' 
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.5', margin: 0 },
  label: { display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#e2e8f0' },
  input: { 
    width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', 
    backgroundColor: '#0f172a', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    transition: '0.2s'
  },
  flexRow: { display: 'flex', justifycontent: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' },
  errorBox: { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', 
    color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 'bold' 
  },
  buttonPrimary: { 
    width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '8px', 
    fontSize: '15px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer', transition: '0.2s' 
  },
  dividerContainer: { position: 'relative', textAlign: 'center', margin: '20px 0' },
  dividerLine: { position: 'absolute', top: '50%', left: 0, borderTop: '1px solid #334155', width: '100%' },
  dividerText: { position: 'relative', backgroundColor: '#1e293b', padding: '0 12px', fontSize: '11px', color: '#64748b', fontWeight: '800', letterSpacing: '0.5px', zIndex: 2 },
  buttonOAuth: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', 
    backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', borderRadius: '8px', 
    fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' 
  }
};
