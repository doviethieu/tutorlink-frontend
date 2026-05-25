import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth-store';

export default function DangKy() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // Khởi tạo State lưu trữ form dữ liệu
  const [role, setRole] = useState('student'); // 'student' hoặc 'tutor'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Các state xử lý trạng thái UI
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm tính toán độ mạnh mật khẩu 
  useEffect(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  // ĐỒNG BỘ MÀU SẮC THEO TÔNG NEON HIỆN ĐẠI
  const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = ['#ef4444', '#f59e0b', '#38bdf8', '#10b981'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra nhanh điều kiện mật khẩu ở Client trước khi gửi đi
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Mật khẩu chưa đủ điều kiện (Cần ít nhất 8 ký tự, 1 chữ in hoa và 1 số) bạn ơi!');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({
        fullName,
        email,
        password,
        role
      });

      if (data) {
        const { accessToken, refreshToken, user } = data;
        
        localStorage.setItem('tutorlinkToken', accessToken);
        localStorage.setItem('tutorlinkRefreshToken', refreshToken);
        localStorage.setItem('tutorlinkUser', JSON.stringify(user));
        setSession({ accessToken, refreshToken, user });

        alert('🎉 Khởi tạo tài khoản TutorLink thành công!');
        
        if (user?.role === 'tutor' || role === 'tutor') {
          navigate('/tutor/register');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Đăng ký thất bại. Email này có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Tiêu đề */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={styles.title}>Tạo tài khoản TutorLink</h1>
          <p style={styles.subtitle}>Mất chưa đến 1 phút để kết nối học viên và gia sư chuyên nghiệp.</p>
        </div>

        {/* Form đăng ký chính */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* CHỌN VAI TRÒ (DẠY HOẶC HỌC) */}
          <div>
            <label style={styles.label}>Bạn tham gia với vai trò *</label>
            <div style={styles.gridRoles}>
              
              {/* Box Học viên */}
              <label style={{
                ...styles.roleBox,
                borderColor: role === 'student' ? '#38bdf8' : '#334155',
                backgroundColor: role === 'student' ? 'rgba(56, 189, 248, 0.1)' : '#0f172a'
              }}>
                <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} style={{ display: 'none' }} />
                <span style={{ fontSize: '24px' }}>🎓</span>
                <p style={{ ...styles.roleTitle, color: role === 'student' ? '#38bdf8' : '#fff' }}>Tôi muốn học</p>
                <p style={styles.roleDesc}>Đặt lịch với gia sư phù hợp, học trực tuyến tương tác cao.</p>
              </label>

              {/* Box Gia sư */}
              <label style={{
                ...styles.roleBox,
                borderColor: role === 'tutor' ? '#f97316' : '#334155',
                backgroundColor: role === 'tutor' ? 'rgba(249, 115, 22, 0.1)' : '#0f172a'
              }}>
                <input type="radio" name="role" value="tutor" checked={role === 'tutor'} onChange={() => setRole('tutor')} style={{ display: 'none' }} />
                <span style={{ fontSize: '24px' }}>📝</span>
                <p style={{ ...styles.roleTitle, color: role === 'tutor' ? '#f97316' : '#fff' }}>Tôi muốn dạy</p>
                <p style={styles.roleDesc}>Tạo hồ sơ CV Joboko, nhận lớp học và bùng nổ thu nhập.</p>
              </label>

            </div>
          </div>

          {/* NHẬP TÊN */}
          <div>
            <label style={styles.label}>Họ và tên *</label>
            <input type="text" placeholder="Ví dụ: Nguyễn Hoàng Nam" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={styles.input} />
          </div>

          {/* NHẬP EMAIL */}
          <div>
            <label style={styles.label}>Địa chỉ Email *</label>
            <input type="email" placeholder="name@tutorlink.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          </div>

          {/* NHẬP MẬT KHẨU & ĐO ĐỘ MẠNH */}
          <div>
            <label style={styles.label}>Mật khẩu bảo mật *</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>📌 Quy định mật mật an toàn: Ít nhất 8 ký tự, 1 chữ in hoa và 1 chữ số</p>
            
            {/* Thanh tiến trình đo độ mạnh mật khẩu */}
            {password.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <span 
                      key={i} 
                      style={{
                        height: '5px', flex: 1, borderRadius: '4px', transition: 'all 0.3s',
                        backgroundColor: strength >= i ? strengthColors[strength - 1] : '#334155'
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontWeight: '500' }}>
                  Đánh giá độ an toàn: <span style={{ color: strengthColors[Math.max(0, strength - 1)], fontWeight: '700' }}>{strengthLabels[Math.max(0, strength - 1)] || 'Yếu'}</span>
                </p>
              </div>
            )}
          </div>

          {/* NÚT SUBMIT ĐỒNG BỘ NEON EMERALD GREEN */}
          <button type="submit" disabled={loading} style={{ ...styles.buttonPrimary, backgroundColor: loading ? '#475569' : '#10b981', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Đang khởi tạo tài khoản hệ thống...' : '🚀 Tạo tài khoản miễn phí ngay'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', margin: '5px 0 0 0', lineHeight: '1.5' }}>
            Bằng việc đăng ký, bạn đồng ý với <span style={styles.linkFake}>Điều khoản dịch vụ</span> và <span style={styles.linkFake}>Chính sách bảo mật</span> của TutorLink.
          </p>
        </form>

        {/* CHUYỂN HƯỚNG SANG ĐĂNG NHẬP */}
        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#94a3b8' }}>
          Đã có tài khoản đối tác?{' '}
          <Link to="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 'bold' }}>
            Đăng nhập ngay
          </Link>
        </p>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 🛠️ ĐÃ FIX ĐỒNG BỘ TOÀN DIỆN CARD DARK-MODE THEO HỆ THỐNG
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
    maxWidth: '490px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    border: '1px solid #334155',
    color: '#f1f5f9'
  },
  title: { fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.5', margin: 0 },
  label: { display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#e2e8f0' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155',
    backgroundColor: '#0f172a', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: '0.2s'
  },
  gridRoles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  roleBox: {
    display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '10px',
    border: '2px solid', cursor: 'pointer', transition: 'all 0.25s', boxSizing: 'border-box'
  },
  roleTitle: { fontSize: '15px', fontWeight: '700', margin: '10px 0 4px 0' },
  roleDesc: { fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
    color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold'
  },
  buttonPrimary: {
    width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)', marginTop: '10px',
    transition: '0.2s'
  },
  linkFake: { color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }
};
