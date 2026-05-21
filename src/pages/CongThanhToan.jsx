import React from 'react';
import { Link } from 'react-router-dom';

export default function CongThanhToan() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* ICON LỊCH HỌC CÁCH ĐIỆU */}
        <div style={styles.iconWrapper}>
          📅
        </div>

        {/* NỘI DUNG CHÍNH */}
        <div style={styles.textCenter}>
          <h1 style={styles.mainTitle}>Thanh toán chưa được bật</h1>
          <p style={styles.subtitle}>
            Hệ thống hiện tại sẽ tự động tạo yêu cầu đặt lịch và chờ gia sư xác nhận trước. 
            Luồng thanh toán trực tuyến (API Gateway) hiện không nằm trong phạm vi xử lý của phiên làm việc này.
          </p>
        </div>

        {/* CỤM NÚT ĐIỀU HƯỚNG NHANH */}
        <div style={styles.btnGrid}>
          <Link to="/bookings" style={{ textDecoration: 'none' }}>
            <button style={styles.btnOutline}>Xem lịch học</button>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={styles.btnPrimary}>Tìm gia sư</button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE CAO CẤP ĐỒNG BỘ DARK-MODE ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    padding: '40px 30px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    color: '#3498db',
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  textCenter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  mainTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.6'
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
    fontSize: '14px'
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
    fontSize: '14px'
  }
};