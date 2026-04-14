import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DangNhap = () => {
  const navigate = useNavigate();
  // State để chuyển đổi: true là Đăng nhập, false là Đăng ký
  const [isLogin, setIsLogin] = useState(true); 
  
  // --- STATE MỚI CHO OTP EMAIL ---
  const [requiresOTP, setRequiresOTP] = useState(false); 
  const [otpToken, setOtpToken] = useState(''); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ BẰNG EMAIL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Gọi API Đăng nhập
        const res = await axios.post('http://localhost:8000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        // 🚨 MÁY NGHE LÉN Ở ĐÂY: In ra màn hình xem Backend gửi gì về
        console.log("KẾT QUẢ BACKEND TRẢ VỀ LÀ:", res.data);
        
        // Bắt đúng chữ requiresOTP từ Backend trả về
        if (res.data.requiresOTP) {
            setRequiresOTP(true); // Chuyển sang giao diện nhập OTP
            return; // Dừng hàm lại, không lưu token vội
        }

        // Nếu không yêu cầu OTP thì cho vào luôn (Dự phòng)
        localStorage.setItem('tutorlinkToken', res.data.token);
        if (res.data.user) localStorage.setItem('tutorlinkUser', JSON.stringify(res.data.user));
        
        alert('Chào mừng bạn đã quay lại!');
        navigate('/'); 
      } else {
        // Gọi API Đăng ký
        const res = await axios.post('http://localhost:8000/api/auth/register', formData);
        alert(res.data.message);
        setIsLogin(true); // Đăng ký xong tự nhảy về form đăng nhập
      }
    } catch (error) {
        console.log("LỖI TỪ BACKEND TRẢ VỀ LÀ:", error.response?.data);
        alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // --- XỬ LÝ XÁC NHẬN MÃ OTP (BƯỚC 2 CỦA ĐĂNG NHẬP) ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
        // Đổi link thành /verify-otp và gửi biến otp
        const res = await axios.post('http://localhost:8000/api/auth/verify-otp', { 
            email: formData.email, 
            otp: otpToken 
        });
        
        // Đúng mã 6 số thì mới cấp vé
        localStorage.setItem('tutorlinkToken', res.data.token);
        if (res.data.user) localStorage.setItem('tutorlinkUser', JSON.stringify(res.data.user));
        
        alert('Đăng nhập thành công!');
        navigate('/');
    } catch (error) {
        alert(error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
    }
  };

  // --- XỬ LÝ ĐĂNG NHẬP BẰNG GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      
      const res = await axios.post('http://localhost:8000/api/auth/google-login', { 
        token: googleToken 
      });
      
      localStorage.setItem('tutorlinkToken', res.data.token);
      if (res.data.user) localStorage.setItem('tutorlinkUser', JSON.stringify(res.data.user));
      
      alert('Đăng nhập Google thành công!');
      navigate('/'); 
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng nhập Google thất bại!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        
        {!requiresOTP ? (
            /* ========================================= */
            /* GIAO DIỆN CŨ: ĐĂNG NHẬP / ĐĂNG KÝ BÌNH THƯỜNG */
            /* ========================================= */
            <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                {isLogin ? 'Đăng Nhập TutorLink' : 'Đăng Ký Tài Khoản'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!isLogin && (
                    <input 
                    type="text" name="name" placeholder="Họ và tên..." 
                    value={formData.name} onChange={handleChange} required style={styles.input}
                    />
                )}
                <input 
                    type="email" name="email" placeholder="Email..." 
                    value={formData.email} onChange={handleChange} required style={styles.input}
                />
                <input 
                    type="password" name="password" placeholder="Mật khẩu..." 
                    value={formData.password} onChange={handleChange} required style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
                </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                <span 
                    onClick={() => setIsLogin(!isLogin)} 
                    style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </span>
                </p>

                <hr style={{ margin: '20px 0' }} />
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '15px' }}>Hoặc tiếp tục với</p>

                {/* Nút Google */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert('Đăng nhập Google thất bại')}
                    shape="pill"
                />
                </div>
            </>
        ) : (
            /* ========================================= */
            /* GIAO DIỆN MỚI: NHẬP MÃ 6 SỐ OTP QUA MAIL  */
            /* ========================================= */
            <>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Xác thực bảo mật</h2>
                <p style={{ textAlign: 'center', fontSize: '14px', color: '#555', marginBottom: '20px' }}>
                    Vui lòng kiểm tra hộp thư <b>{formData.email}</b> và nhập mã 6 số để tiếp tục.
                </p>

                <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="VD: 123456" 
                        maxLength="6"
                        value={otpToken} 
                        onChange={(e) => setOtpToken(e.target.value)} 
                        required 
                        style={{ ...styles.input, textAlign: 'center', fontSize: '20px', letterSpacing: '5px' }}
                    />
                    <button type="submit" style={styles.button}>
                        Xác nhận mã & Đăng nhập
                    </button>
                    <button 
                        type="button" 
                        onClick={() => {
                            setRequiresOTP(false); // Nút quay lại bước nhập pass
                            setOtpToken('');
                        }} 
                        style={{ ...styles.button, backgroundColor: '#6c757d' }}
                    >
                        Quay lại
                    </button>
                </form>
            </>
        )}

      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f9f9f9' },
  formCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', fontSize: '15px' },
  button: { padding: '12px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default DangNhap;