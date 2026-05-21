import React from 'react';
import { Link } from 'react-router-dom';

// Nhận 3 công tắc từ App.jsx truyền xuống
function GioHang({ gioHang, xoaKhoiGioHang, thanhToanThanhCong }) {
  // Tính tổng tiền toàn bộ giỏ hàng
  const tongTien = gioHang.reduce((tong, gs) => tong + (gs.price || 0), 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.mainTitle}>
        🛒 Giỏ Hàng Đặt Lịch Gia Sư
      </h2>

      {gioHang.length === 0 ? (
        /* TRẠNG THÁI GIỎ HÀNG TRỐNG TRƠN */
        <div style={styles.emptyCard}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>💨</div>
          <h3 style={{ color: '#94a3b8', margin: '0 0 10px 0' }}>Giỏ hàng của sếp đang trống trơn!</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' }}>Hãy lướt trang chủ để tìm kiếm và thêm những gia sư ưng ý nhất vào đây nhé.</p>
          <Link to="/">
            <button style={styles.backHomeBtn}>
              ✨ Khám phá danh sách gia sư ngay
            </button>
          </Link>
        </div>
      ) : (
        /* CÓ SẢN PHẨM TRONG GIỎ */
        <div style={styles.cartCard}>
          {gioHang.map((gs, index) => (
            <div key={gs._id || index} style={styles.cartItem}>
              
              {/* BÊN TRÁI: ẢNH ĐẠI DIỆN VÀ THÔNG TIN MÔN HỌC */}
              <div style={styles.itemInfo}>
                <img 
                  src={gs.avatarUrl || gs.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={gs.name} 
                  style={styles.avatar} 
                />
                <div>
                  <h4 style={styles.tutorName}>{gs.name}</h4>
                  <p style={styles.tutorSubject}>📚 Môn giảng dạy: {gs.subject}</p>
                </div>
              </div>

              {/* BÊN PHẢI: GIÁ TIỀN VÀ HÀNH ĐỘNG XÓA */}
              <div style={styles.itemActions}>
                <h4 style={styles.itemPrice}>
                  {(gs.price || 0).toLocaleString('vi-VN')} ₫<span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}>/h</span>
                </h4>
                
                <button 
                  onClick={() => xoaKhoiGioHang(gs._id)}
                  style={styles.deleteBtn}
                  title="Xóa gia sư này khỏi giỏ"
                >
                  ❌ Xóa
                </button>
              </div>

            </div>
          ))}

          {/* KHỐI TỔNG TIỀN */}
          <div style={styles.totalSection}>
            <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>Tổng chi phí dự kiến (Tạm tính):</h3>
            <h2 style={{ margin: 0, color: '#3498db', fontSize: '24px', fontWeight: 'bold' }}>
              {tongTien.toLocaleString('vi-VN')} ₫<span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>/giờ</span>
            </h2>
          </div>

          {/* NÚT KÍCH HOẠT THANH TOÁN */}
          <button 
            onClick={thanhToanThanhCong}
            style={styles.checkoutBtn}
          >
            💳 Tiến hành Thanh toán & Chốt lịch học
          </button>
        </div>
      )}
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE ĐỒNG BỘ DARK MODE HIỆN ĐẠI ---
const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '850px',
    margin: '0 auto',
    color: '#fff'
  },
  mainTitle: {
    textAlign: 'center',
    color: '#f1f5f9',
    marginBottom: '35px',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 30px',
    backgroundColor: '#1e293b',
    border: '1px dashed #334155',
    borderRadius: '16px'
  },
  backHomeBtn: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: '#white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
  },
  cartCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #334155',
    paddingBottom: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #334155',
    backgroundColor: '#0f172a'
  },
  tutorName: {
    margin: '0 0 6px 0',
    fontSize: '18px',
    color: '#f8fafc',
    fontWeight: 'bold'
  },
  tutorSubject: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '14px'
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  itemPrice: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
    transition: 'all 0.2s'
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '35px',
    paddingTop: '25px',
    borderTop: '2px dashed #334155'
  },
  checkoutBtn: {
    width: '100%',
    padding: '16px',
    marginTop: '30px',
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '17px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(46, 204, 113, 0.3)'
  }
};

export default GioHang;