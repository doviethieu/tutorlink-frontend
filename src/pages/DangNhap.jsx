import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DangNhap = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin ? { email, password } : { email, password, role };

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role); 
          // Cập nhật lại giao diện Navbar (cách đơn giản nhất lúc này)
          window.dispatchEvent(new Event("storage")); 
          alert(`✅ Đăng nhập thành công với vai trò: ${data.role}`);
          navigate('/dashboard'); 
        } else {
          alert('🎉 Đăng ký thành công! Hãy đăng nhập nhé.');
          setIsLogin(true);
        }
      } else {
        alert(`❌ Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' }}>
        <h2>{isLogin ? '🔑 Đăng Nhập' : '📝 Đăng Ký'}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
          
          {!isLogin && (
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold' }}>
              <option value="student">👨‍🎓 Tôi là Học Viên</option>
              <option value="tutor">👨‍🏫 Tôi là Gia Sư</option>
            </select>
          )}

          <button type="submit" style={{ padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            {isLogin ? 'Vào Hệ Thống' : 'Đăng Ký Ngay'}
          </button>
        </form>

        <p style={{ marginTop: '20px', cursor: 'pointer', color: '#3498db', textDecoration: 'underline' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Chưa có tài khoản? Đăng ký ngay!' : 'Đã có tài khoản? Quay lại đăng nhập'}
        </p>
      </div>
    </div>
  );
};

export default DangNhap;