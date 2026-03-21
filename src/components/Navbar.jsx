import { Link, useNavigate } from 'react-router-dom';

function Navbar({ setTuKhoa, soLuongGioHang }) {
  const navigate = useNavigate();
  
  // 1. SỬA LẠI TÊN CHÌA KHÓA CHO KHỚP 100% VỚI FILE ĐĂNG NHẬP
  const token = localStorage.getItem('tutorlinkToken');
  
  // 2. MỞ KÉT SẮT LẤY THÔNG TIN TÀI KHOẢN (ĐỂ HIỆN TÊN + ẢNH)
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null; 

  const role = localStorage.getItem('role');

  const handleDangXuat = () => {
    // 3. ĐĂNG XUẤT THÌ PHẢI XÓA ĐÚNG TÊN CHÌA KHÓA
    localStorage.removeItem('tutorlinkToken');
    localStorage.removeItem('tutorlinkUser');
    localStorage.removeItem('role');
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
        
        {/* Nút Giỏ Hàng */}
        <Link to="/giohang" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ position: 'relative', cursor: 'pointer', fontSize: '24px' }}>
            🛒
            {soLuongGioHang > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px', backgroundColor: '#e74c3c',
                color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold'
              }}>
                {soLuongGioHang}
              </span>
            )}
          </div>
        </Link>

        {/* ========================================= */}
        {/* HIỆN NGƯỜI DÙNG HOẶC NÚT ĐĂNG NHẬP (ĐÃ SỬA LẠI) */}
        {/* ========================================= */}
        {!token ? (
          <Link to="/login">
            <button style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
              Đăng nhập
            </button>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* 4. HIỆN TÊN VÀ AVATAR CỦA USER KHI ĐĂNG NHẬP THÀNH CÔNG */}
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

            {role === 'admin' && (
              <Link to="/dashboard">
                <button style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⚙️ Quản trị (CEO)
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