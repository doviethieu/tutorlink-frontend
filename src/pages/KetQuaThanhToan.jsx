import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function KetQuaThanhToan() {
  const location = useLocation();

  // --- LOGIC ĐỌC QUERY PARAMETERS TỪ URL ---
  const queryParams = new URLSearchParams(location.search);
  
  // Mặc định nếu không truyền gì lên URL, em sẽ để là 'success' và mã 'BK-MOCK123' cho sếp dễ test
  const status = queryParams.get('status') ?? 'success';
  const bookingId = queryParams.get('bookingId') ?? 'BK-MOCK123';
  
  const isSuccess = status === 'success';

  return (
    <div style={styles.container}>
      {/* Hiệu ứng phát sáng mờ ảo ở góc (edm-glow) */}
      <div style={styles.glowEffect} />

      <div style={styles.card}>
        {/* ICON TRẠNG THÁI (Đắp màu theo kết quả Thành công/Thất bại) */}
        <div style={{
          ...styles.iconWrapper,
          backgroundColor: isSuccess ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
          color: isSuccess ? '#2ecc71' : '#e74c3c'
        }}>
          {isSuccess ? '✓' : '✕'}
        </div>

        {/* NỘI DUNG THÔNG BÁO CHÍNH */}
        <div style={styles.textCenter}>
          <h1 style={styles.mainTitle}>
            {isSuccess ? 'Đã gửi yêu cầu đặt lịch.' : 'Yêu cầu chưa hoàn tất.'}
          </h1>
          <p style={styles.subtitle}>
            {isSuccess
              ? 'Booking của bạn đã được tạo. Gia sư sẽ xác nhận trong thời gian sớm nhất.'
              : 'Yêu cầu đặt lịch chưa hoàn tất. Vui lòng kiểm tra lại lịch học hoặc thử đặt lịch khác.'}
          </p>
        </div>

        {/* BẢNG CHI TIẾT TÓM TẮT ĐƠN HÀNG */}
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Mã booking</span>
            <span style={{ ...styles.infoValue, fontFamily: 'monospace', letterSpacing: '1px' }}>{bookingId}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Trạng thái</span>
            <span style={{ 
              ...styles.infoValue, 
              color: isSuccess ? '#2ecc71' : '#e67e22',
              fontWeight: 'bold'
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

// --- HỆ THỐNG CSS INLINE DARK MODE CHUẨN CHỈ ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif'
  },
  glowEffect: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(52,152,219,0.15) 0%, rgba(0,0,0,0) 70%)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '440px',
    padding: '40px 30px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  iconWrapper: {
    width: '76px',
    height: '76px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    margin: '0 auto',
    fontWeight: 'bold'
  },
  textCenter: {
    textAlign: 'center'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.5'
  },
  infoBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  infoLabel: {
    color: '#94a3b8'
  },
  infoValue: {
    color: '#fff',
    fontWeight: '600'
  },
  btnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '6px'
  },
  btnOutline: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid #475569',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#3498db',
    border: 'none',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  }
};