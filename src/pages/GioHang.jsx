import { Link } from 'react-router-dom';

// Nhận 2 công tắc từ App.jsx truyền xuống
function GioHang({ gioHang, xoaKhoiGioHang, thanhToanThanhCong }) {
  const tongTien = gioHang.reduce((tong, gs) => tong + gs.price, 0);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
        🛒 Giỏ hàng của Bạn
      </h2>

      {gioHang.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '15px' }}>
          <h3 style={{ color: '#7f8c8d' }}>Giỏ hàng đang trống trơn! 💨</h3>
          <Link to="/">
            <button style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
              Quay lại chọn gia sư
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
          {gioHang.map((gs, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={gs.image} alt={gs.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{gs.name}</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Môn: {gs.subject}</p>
                </div>
              </div>

              {/* CỤM BÊN PHẢI: Chứa Giá tiền và Nút Xóa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <h4 style={{ margin: 0, color: '#e74c3c' }}>{gs.price.toLocaleString()}đ/h</h4>
                
                {/* NÚT XÓA! */}
                <button 
                  onClick={() => xoaKhoiGioHang(gs._id)}
                  style={{ backgroundColor: '#ff7675', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ❌ Xóa
                </button>
              </div>

            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '2px dashed #ccc' }}>
            <h3 style={{ margin: 0 }}>Tổng cộng:</h3>
            <h2 style={{ margin: 0, color: '#e74c3c' }}>{tongTien.toLocaleString()}đ/h</h2>
          </div>

          {/* BẬT NÚT THANH TOÁN */}
          <button 
            onClick={thanhToanThanhCong}
            style={{ width: '100%', padding: '15px', marginTop: '30px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
            💳 Thanh toán & Chốt lịch
          </button>
        </div>
      )}
    </div>
  );
}

export default GioHang;