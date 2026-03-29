import { Link, useNavigate } from 'react-router-dom';

function Navbar({ setTuKhoa }) {
  const navigate = useNavigate();
  
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
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#2c3e50', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '1px' }}>🎓 Tutor<span style={{ color: '#3498db' }}>Link</span></h1>
      </Link>

      {/* Thanh Tìm Kiếm */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="🔍 Tìm môn học, tên gia sư..." 
          onChange={(e) => setTuKhoa(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '25px', border: 'none', width: '300px', outline: 'none', fontSize: '15px' }}
        />
      </div>

      {/* Cụm nút bên phải */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

        {/* HIỆN NGƯỜI DÙNG HOẶC NÚT ĐĂNG NHẬP */}
        {!token ? (
          <Link to="/login">
            <button style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
               Đăng nhập
            </button>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* HIỆN TÊN VÀ AVATAR CỦA USER */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={user.picture || 'https://i.pravatar.cc/150'} 
                  alt="Avatar" 
                  style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{user.name}</span>
              </div>
            )}

            {/* Nút dành riêng cho Admin (ĐÃ XÓA DUPLICATE) */}
            {user && user.role === 'admin' && (
              <Link to="/dashboard">
                <button style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⚙️ Quản trị (Admin)
                </button>
              </Link>
            )}

            {/* Nút dành cho Khách hàng (Học viên muốn làm Gia sư) */}
            {user && user.role !== 'admin' && (
              <Link to="/dashboard">
                <button style={{ padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🎓 Trở thành Gia Sư
                </button>
              </Link>
            )}

            {/* Nút Đăng xuất */}
            <button onClick={handleDangXuat} style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;