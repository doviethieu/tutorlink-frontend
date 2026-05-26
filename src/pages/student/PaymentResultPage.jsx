import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function KetQuaThanhToan() {
  const location = useLocation();

  // --- LOGIC ĐỌC QUERY PARAMETERS TỪ URL ---
  const queryParams = new URLSearchParams(location.search);
  
  // Cơ chế Fallback mặc định hỗ trợ sếp test luồng giao diện độc lập siêu mượt
  const status = queryParams.get('status') ?? 'success';
  const bookingId = queryParams.get('bookingId') ?? 'BK-MOCK123';
  
  const isSuccess = status === 'success';

  return (
    <div style={styles.container}>
      {/* Hiệu ứng phát sáng mờ ảo ở góc (edm-glow) được căn chỉnh lại tâm phát sáng */}
      <div style={styles.glowEffect} />

      <div style={styles.card}>
        {/* ICON TRẠNG THÁI (Đắp màu theo kết quả Thành công/Thất bại chuẩn Tailwind) */}
        <div style={{
          ...styles.iconWrapper,
          backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          color: isSuccess ? '#10b981' : '#f87171',
          border: isSuccess ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          {isSuccess ? '✓' : '✕'}
        </div>

        {/* NỘI DUNG THÔNG BÁO CHÍNH */}
        <div style={styles.textCenter}>
          <h1 style={styles.mainTitle}>
            {isSuccess ? 'Đã gửi yêu cầu đặt lịch thành công!' : 'Yêu cầu chưa hoàn tất.'}
          </h1>
          <p style={styles.subtitle}>
            {isSuccess
              ? 'Booking của sếp đã được khởi tạo trên hệ thống. Gia sư sẽ xác nhận trong thời gian sớm nhất.'
              : 'Yêu cầu đặt lịch chưa hoàn tất. Vui lòng kiểm tra lại số dư tài khoản hoặc thử lại sau.'}
          </p>
        </div>

        {/* BẢNG CHI TIẾT TÓM TẮT ĐƠN HÀNG */}
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Mã booking</span>
            <span style={{ ...styles.infoValue, fontFamily: 'monospace', letterSpacing: '1px', color: '#C05A3E' }}>{bookingId}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Trạng thái</span>
            <span style={{ 
              ...styles.infoValue, 
              color: isSuccess ? '#10b981' : '#fbbf24',
              fontWeight: '700'
            }}>
              {isSuccess ? 'Chờ xác nhận' : 'Chưa hoàn tất'}
            </span>
          </div>
        </div>

        {/* KHỐI ĐIỀU HƯỚNG DỰA TRÊN KẾT QUẢ */}
        <div style={styles.btnGrid}>
          {isSuccess ? (
            <>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <button style={styles.btnOutline}>Tìm gia sư khác</button>
              </Link>
              <Link to="/bookings" style={{ textDecoration: 'none' }}>
                <button style={styles.btnPrimary}>Xem lịch học</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/giohang" style={{ textDecoration: 'none' }}>
                <button style={styles.btnOutline}>Quay lại giỏ</button>
              </Link>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <button style={styles.btnPrimary}>Đặt lịch khác</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 🛠️ HỆ THỐNG CSS INLINE PRESET DARK SLATE PREMIUM MƯỚT MẮT ---
const styles = {
  container: {
    backgroundColor: '#FAF7F0',
    minHeight: '100vh', // Nâng cấp từ 85vh lên 100vh để chống hụt chân giao diện
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif"
  },
  glowEffect: {
    position: 'absolute',
    top: '-15%',
    right: '-15%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(192, 90, 62, 0.12) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    borderRadius: '24px', // Tăng độ bo góc cho thêm phần mềm mại
    width: '100%',
    maxWidth: '440px',
    padding: '40px 32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '26px'
  },
  iconWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto',
    fontWeight: '800'
  },
  textCenter: {
    textAlign: 'center'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E293B',
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14.5px',
    color: '#5F6B7A',
    margin: 0,
    lineHeight: '1.6'
  },
  infoBox: {
    backgroundColor: 'rgba(250, 247, 240, 0.6)',
    border: '1px solid #E7DED2',
    borderRadius: '14px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  infoLabel: {
    color: '#5F6B7A',
    fontWeight: '500'
  },
  infoValue: {
    color: '#1E293B',
    fontWeight: '700'
  },
  btnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginTop: '6px'
  },
  btnOutline: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid #7C6F64',
    color: '#1E293B',
    padding: '12.5px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#C05A3E', // Đồng bộ Sky Blue cao cấp
    border: 'none',
    color: '#FAF7F0', // Chữ màu tối trên nền sáng tạo tương phản cực mạnh
    padding: '12.5px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(192, 90, 62, 0.2)'
  }
};