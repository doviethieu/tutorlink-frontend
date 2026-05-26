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
          <h3 style={{ color: '#1E293B', margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700' }}>Giỏ hàng của sếp đang trống trơn!</h3>
          <p style={{ color: '#5F6B7A', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.5' }}>Hãy lướt trang chủ để tìm kiếm và thêm những gia sư ưng ý nhất vào đây nhé.</p>
          <Link to="/" style={{ textDecoration: 'none' }}>
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
                  {(gs.price || 0).toLocaleString('vi-VN')} ₫<span style={{ fontSize: '13px', color: '#5F6B7A', fontWeight: 'normal' }}>/h</span>
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
            <h3 style={{ margin: 0, color: '#5F6B7A', fontSize: '15px', fontWeight: '700' }}>Tổng chi phí dự kiến (Tạm tính):</h3>
            <h2 style={{ margin: 0, color: '#10b981', fontSize: '24px', fontWeight: '900' }}>
              {tongTien.toLocaleString('vi-VN')} ₫<span style={{ fontSize: '14px', color: '#8A7D72', fontWeight: 'normal' }}>/giờ</span>
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

// --- 🛠️ BỘ STYLE CSS INLINE SLATE DARK-MODE PREMIUM ĐỒNG BỘ 100% ---
const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '850px',
    margin: '0 auto',
    color: '#1E293B',
    fontFamily: "'Inter', sans-serif"
  },
  mainTitle: {
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: '35px',
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  emptyCard: {
    textAlign: 'center',
    padding: '60px 30px',
    backgroundColor: '#FFFFFF',
    border: '1px dashed #E7DED2',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
  },
  backHomeBtn: {
    padding: '12px 24px',
    backgroundColor: '#C05A3E', // Đồng bộ Sky Blue tinh tế
    color: '#FAF7F0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(192, 90, 62, 0.2)'
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E7DED2',
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
    borderRadius: '12px', // Chuyển sang bo góc vuông hiện đại giống avatar trang chủ/favorites
    objectFit: 'cover',
    border: '1px solid #E7DED2',
    backgroundColor: '#FAF7F0'
  },
  tutorName: {
    margin: '0 0 6px 0',
    fontSize: '18px',
    color: '#1E293B',
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  tutorSubject: {
    margin: 0,
    color: '#5F6B7A',
    fontSize: '14px',
    fontWeight: '500'
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  itemPrice: {
    margin: 0,
    color: '#1E293B',
    fontSize: '18px',
    fontWeight: '700'
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    transition: 'all 0.2s'
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '35px',
    paddingTop: '25px',
    borderTop: '2px dashed #E7DED2'
  },
  checkoutBtn: {
    width: '100%',
    padding: '16px',
    marginTop: '30px',
    backgroundColor: '#C05A3E', // Đổi sang Sky Blue tương phản tốt, chữ tối trên nền sáng
    color: '#FAF7F0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(192, 90, 62, 0.2)'
  }
};

export default GioHang;