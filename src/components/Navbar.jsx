import { Link, useNavigate } from 'react-router-dom';

function Navbar({ setTuKhoa, soLuongGioHang }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleDangXuat = () => {
    localStorage.removeItem('token');
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
        
        {/* ========================================= */}
        {/* Đã được bọc Link để bấm vào bay sang trang Giỏ Hàng */}
        {/* ========================================= */}
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

        {/* Nút Đăng nhập / Quản trị */}
        {!token ? (
          <Link to="/login">
            <button style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
              Đăng nhập
            </button>
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {role === 'admin' && (
              <Link to="/dashboard">
                <button style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⚙️ Quản trị (CEO)
                </button>
              </Link>
            )}
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