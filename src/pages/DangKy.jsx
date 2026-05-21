import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DangKy() {
  const navigate = useNavigate();

  // Khởi tạo State lưu trữ form dữ liệu
  const [role, setRole] = useState('student'); // 'student' hoặc 'tutor'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Các state xử lý trạng thái UI
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm tính toán độ mạnh mật khẩu (Giữ nguyên thuật toán của Edumatch)
  useEffect(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  // Cấu hình nhãn và màu sắc cho thanh đo mật khẩu
  const strengthLabels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = ['#e74c3c', '#f39c12', '#3498db', '#27ae60'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra nhanh điều kiện mật khẩu ở Client trước khi gửi đi
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Mật khẩu chưa đủ điều kiện (Cần ít nhất 8 ký tự, 1 chữ in hoa và 1 số) sếp ơi!');
      return;
    }

    setLoading(true);

    try {
      // Gọi API đăng ký đến Backend Node.js Express của TutorLink
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        name: fullName, // Đổi từ fullName sang name cho khớp chuẩn Model Backend cũ của sếp
        email,
        password,
        role
      });

      if (response.data) {
        const { token, user } = response.data;
        
        // Lưu phiên đăng nhập luôn để người dùng không phải đăng nhập lại
        localStorage.setItem('tutorlinkToken', token);
        localStorage.setItem('tutorlinkUser', JSON.stringify(user));

        alert('🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.');
        
        // Điều hướng thông minh: Nếu là Gia sư thì dẫn sang trang tạo hồ sơ CV
        if (user.role === 'tutor' || role === 'tutor') {
          navigate('/tao-cv');
        } else {
          navigate('/dashboard');
        }
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email này có thể đã được sử dụng rồi sếp ạ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Tiêu đề */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h1 style={styles.title}>Tạo tài khoản TutorLink</h1>
          <p style={styles.subtitle}>Mất chưa đến 1 phút để kết nối học viên và gia sư.</p>
        </div>

        {/* Form đăng ký chính */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          {/* CHỌN VAI TRÒ (DẠY HOẶC HỌC) */}
          <div>
            <label style={styles.label}>Bạn tham gia với vai trò *</label>
            <div style={styles.gridRoles}>
              
              {/* Box Học viên */}
              <label style={{
                ...styles.roleBox,
                borderColor: role === 'student' ? '#3498db' : '#34495e',
                backgroundColor: role === 'student' ? 'rgba(52, 152, 219, 0.1)' : '#1a252f'
              }}>
                <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} style={{ display: 'none' }} />
                <span style={{ fontSize: '20px' }}>🎓</span>
                <p style={styles.roleTitle}>Tôi muốn học</p>
                <p style={styles.roleDesc}>Đặt lịch với gia sư phù hợp, học trực tuyến.</p>
              </label>

              {/* Box Gia sư */}
              <label style={{
                ...styles.roleBox,
                borderColor: role === 'tutor' ? '#27ae60' : '#34495e',
                backgroundColor: role === 'tutor' ? 'rgba(39, 174, 96, 0.1)' : '#1a252f'
              }}>
                <input type="radio" name="role" value="tutor" checked={role === 'tutor'} onChange={() => setRole('tutor')} style={{ display: 'none' }} />
                <span style={{ fontSize: '20px' }}>📝</span>
                <p style={styles.roleTitle}>Tôi muốn dạy</p>
                <p style={styles.roleDesc}>Tạo hồ sơ, nhận lớp và quản lý buổi học.</p>
              </label>

            </div>
          </div>

          {/* NHẬP TÊN */}
          <div>
            <label style={styles.label}>Họ và tên *</label>
            <input type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={styles.input} />
          </div>

          {/* NHẬP EMAIL */}
          <div>
            <label style={styles.label}>Địa chỉ Email *</label>
            <input type="email" placeholder="ban@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
          </div>

          {/* NHẬP MẬT KHẨU & ĐO ĐỘ MẠNH */}
          <div>
            <label style={styles.label}>Mật khẩu *</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
            <p style={{ color: '#95a5a6', fontSize: '11px', marginTop: '4px' }}>📌 Yêu cầu: Ít nhất 8 ký tự, 1 chữ in hoa và 1 chữ số</p>
            
            {/* Thanh tiến trình đo độ mạnh mật khẩu */}
            {password.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <span 
                      key={i} 
                      style={{
                        height: '4px', flex: 1, borderRadius: '4px', transition: 'all 0.3s',
                        backgroundColor: strength >= i ? strengthColors[strength - 1] : '#34495e'
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '11px', color: '#bdc3c7', marginTop: '5px', fontWeight: 'bold' }}>
                  Độ mạnh: <span style={{ color: strengthColors[Math.max(0, strength - 1)] }}>{strengthLabels[Math.max(0, strength - 1)] || 'Yếu'}</span>
                </p>
              </div>
            )}
          </div>

          {/* NÚT SUBMIT */}
          <button type="submit" disabled={loading} style={{ ...styles.buttonPrimary, backgroundColor: loading ? '#7f8c8d' : '#27ae60', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Đang khởi tạo tài khoản...' : '🚀 Tạo tài khoản miễn phí'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#95a5a6', margin: '5px 0 0 0', lineHeight: '1.4' }}>
            Bằng việc đăng ký, bạn đồng ý với <span style={styles.linkFake}>Điều khoản dịch vụ</span> và <span style={styles.linkFake}>Chính sách bảo mật</span> của chúng tôi.
          </p>
        </form>

        {/* CHUYỂN HƯỚNG SANG ĐĂNG NHẬP */}
        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#95a5a6' }}>
          Đã có tài khoản rồi?{' '}
          <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
            Đăng nhập ngay
          </Link>
        </p>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// BỘ CSS INLINE SANG TRỌNG ĐỒNG BỘ GIAO DIỆN HỆ THỐNG
// -------------------------------------------------------------
const styles = {
  container: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    minHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: '#2c3e50',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '1px solid #34495e',
    color: 'white'
  },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' },
  subtitle: { fontSize: '14px', color: '#bdc3c7', lineHeight: '1.5', margin: 0 },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#ecf0f1' },
  input: {
    width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #34495e',
    backgroundColor: '#1a252f', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  },
  gridRoles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  roleBox: {
    display: 'flex', flexDirection: 'column', padding: '15px', borderRadius: '12px',
    border: '2px solid', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box'
  },
  roleTitle: { fontSize: '14px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#fff' },
  roleDesc: { fontSize: '11px', color: '#bdc3c7', margin: 0, lineHeight: '1.4' },
  errorBox: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c',
    color: '#e74c3c', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold'
  },
  buttonPrimary: {
    width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(46, 204, 113, 0.2)', marginTop: '10px'
  },
  linkFake: { color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }
};