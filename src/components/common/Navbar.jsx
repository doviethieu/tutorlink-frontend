import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar({ setTuKhoa }) {
  const navigate = useNavigate();
  const [isHoveredCV, setIsHoveredCV] = useState(false);
  
  // MỞ NGĂN TỦ LẤY CHÌA KHÓA VÀ HỒ SƠ
  const token = localStorage.getItem('tutorlinkToken');
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null; 

  const handleDangXuat = () => {
    // ĐĂNG XUẤT THÌ TRẢ LẠI CHÌA KHÓA
    localStorage.removeItem('tutorlinkToken');
    localStorage.removeItem('tutorlinkUser');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#FAF7F0', color: '#1E293B', boxShadow: '0 4px 14px rgba(30,41,59,0.08)', borderBottom: '1px solid #E7DED2' }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', color: '#1E293B' }}>
        <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '1px' }}>🎓 Tutor<span style={{ color: '#C05A3E' }}>Link</span></h1>
      </Link>

      {/* Thanh Tìm Kiếm */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="🔍 Tìm môn học, tên gia sư..." 
          onChange={(e) => setTuKhoa(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '25px', border: '1px solid #E7DED2', width: '300px', outline: 'none', fontSize: '15px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        />
      </div>

      {/* Cụm nút bên phải */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

        {/* NÚT TRỢ GIÚP ADMIN (HIỆN CHO CẢ KHÁCH VÀ USER ĐÃ ĐĂNG NHẬP) */}
        <Link to="/support" style={{ textDecoration: 'none' }}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: 'transparent', 
            color: '#C05A3E', 
            border: '2px solid #C05A3E', 
            borderRadius: '25px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => { e.target.style.backgroundColor = '#C05A3E'; e.target.style.color = '#FAF7F0'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#C05A3E'; }}
          >
            📬 Trợ Giúp Admin
          </button>
        </Link>

        {/* HIỆN NGƯỜI DÙNG HOẶC NÚT ĐĂNG NHẬP */}
        {!token ? (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Nếu chưa đăng nhập, vẫn cho họ thấy nút đăng ký làm gia sư vãng lai */}
            <Link to="/tutor/register">
              <button style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: '#FAF7F0', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                🎓 Trở Thành Gia Sư
              </button>
            </Link>
            <Link to="/login">
              <button style={{ padding: '10px 20px', backgroundColor: '#C05A3E', color: '#FAF7F0', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                 Đăng nhập
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* HIỆN TÊN VÀ AVATAR CỦA USER */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=128`} 
                  alt="Avatar" 
                  style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{user.name}</span>
              </div>
            )}

            {/* Nút dành riêng cho Admin */}
            {user && user.role === 'admin' && (
              <Link to="/admin">
                <button style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: '#FAF7F0', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⚙️ Quản trị (Admin)
                </button>
              </Link>
            )}

            {/* 🔥 ĐÃ SỬA: Nút dành cho học viên muốn làm Gia sư - chuyển route sang /tutor/register */}
            {user && user.role !== 'admin' && (
              <Link to="/tutor/register">
                <button 
                  onMouseEnter={() => setIsHoveredCV(true)}
                  onMouseLeave={() => setIsHoveredCV(false)}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: isHoveredCV ? '#218838' : '#27ae60', 
                    color: '#FAF7F0', 
                    border: 'none', 
                    borderRadius: '25px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s ease',
                    boxShadow: isHoveredCV ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  🎓 Trở Thành Gia Sư
                </button>
              </Link>
            )}

            {/* Nút Đăng xuất */}
            <button onClick={handleDangXuat} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: '#FAF7F0', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
