import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function TutorPanel() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- FETCH BOOKING ĐỂ TÍNH TOÁN THỐNG KÊ ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) {
          loadMockDashboard();
          return;
        }

        // Gọi API lấy tối đa 5 booking mới nhất của gia sư này
        const res = await axios.get('http://localhost:8000/api/bookings?role=tutor&limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Lỗi fetch dữ liệu Dashboard, hệ thống kích hoạt Mock data dự phòng:");
        loadMockDashboard();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Bộ dữ liệu mẫu vận hành khi không có mạng hoặc chưa kết nối API
  const loadMockDashboard = () => {
    setBookings([
      { id: 'BK-88291', subject: 'Toán học nâng cao đại số lớp 12', date: '2026-05-25', time: '19:00 - 21:00', status: 'pending' },
      { id: 'BK-77412', subject: 'Tiếng Anh Giao Tiếp Chuẩn Bản Xứ', date: '2026-05-23', time: '14:00 - 15:30', status: 'confirmed' },
      { id: 'BK-61209', subject: 'Lập trình JavaScript từ số 0', date: '2026-05-18', time: '09:00 - 11:00', status: 'completed' }
    ]);
  };

  // --- TRÍCH XUẤT CÁC CHỈ SỐ THỐNG KÊ TỪ MẢNG DỮ LIỆU ---
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  // Hàm hiển thị nhanh Badge trạng thái cho danh sách
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span style={{ ...styles.badge, backgroundColor: '#f1c40f', color: '#1e1b4b' }}>Chờ duyệt</span>;
      case 'confirmed': return <span style={{ ...styles.badge, backgroundColor: '#2ecc71', color: '#064e3b' }}>Đã nhận</span>;
      case 'completed': return <span style={{ ...styles.badge, backgroundColor: '#3498db', color: '#0f172a' }}>Đã xong</span>;
      default: return <span style={{ ...styles.badge, backgroundColor: '#64748b', color: '#fff' }}>{status}</span>;
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 1. KHỐI WELCOME BANNER HÀNH ĐỘNG NHANH */}
      <div style={styles.bannerGrid}>
        <div>
          <span style={styles.accentBadge}>Không gian gia sư</span>
          <h1 style={styles.mainTitle}>Tổng quan công việc</h1>
          <p style={styles.subtitle}>Theo dõi hiệu suất dạy học, lịch trình trống và các yêu cầu đặt lịch mới nhất từ học viên.</p>
        </div>
        <div style={styles.actionGroup}>
          <Link to="/profile" style={styles.btnOutline}>📝 Hồ sơ cá nhân</Link>
          <Link to="/tutor/availability" style={styles.btnPrimary}>📅 Cài đặt lịch rảnh</Link>
        </div>
      </div>

      {/* 2. CỤM THẺ THỐNG KÊ (STAT CARDS) */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#f1c40f', backgroundColor: 'rgba(241, 196, 15, 0.1)' }}>⏰</div>
          <p style={styles.statLabel}>Booking cần xử lý</p>
          <h2 style={styles.statValue}>{pendingCount}</h2>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)' }}>✓</div>
          <p style={styles.statLabel}>Lịch đã xác nhận</p>
          <h2 style={styles.statValue}>{confirmedCount}</h2>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>⭐</div>
          <p style={styles.statLabel}>Buổi đã hoàn thành</p>
          <h2 style={styles.statValue}>{completedCount}</h2>
        </div>
      </div>

      {/* 3. PHÂN KHU NỘI DUNG CHÍNH (GRID LỚN) */}
      <div style={styles.mainLayoutGrid}>
        
        {/* BÊN TRÁI: DANH SÁCH BOOKING MỚI NHẤT */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Booking mới nhận</h3>
            <Link to="/tutor/bookings" style={styles.linkViewAll}>Xem tất cả →</Link>
          </div>
          
          <div style={styles.listSpace}>
            {isLoading && <p style={styles.centeredText}>🔄 Đang đồng bộ lịch học...</p>}
            
            {!isLoading && bookings.length === 0 && (
              <p style={styles.centeredText}>📭 Chưa có yêu cầu đặt lịch nào trong thời gian này.</p>
            )}

            {!isLoading && bookings.map((booking) => (
              <div key={booking.id} style={styles.bookingRow}>
                <div style={styles.avatarMini}>
                  {booking.subject.charAt(0).toUpperCase()}
                </div>
                <div style={styles.bookingMeta}>
                  <p style={styles.bookingSubject}>{booking.subject}</p>
                  <p style={styles.bookingTimeDetails}>
                    {booking.id} · 📅 {booking.date} · ⏰ {booking.time}
                  </p>
                </div>
                <div>
                  {renderStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BÊN PHẢI: ĐIỀU HƯỚNG QUẢN LÝ LỊCH NHANH */}
        <div style={{ ...styles.panelCard, justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📆</div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>Quản lý khung giờ trống</h4>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.4' }}>
            Cập nhật thường xuyên các khung giờ rảnh trong tuần để học viên có thể tìm thấy và đặt lịch học với bạn một cách chủ động.
          </p>
          <Link to="/tutor/availability" style={styles.btnFullWidth}>
            Cấu hình thời gian rảnh
          </Link>
        </div>

      </div>

    </div>
  );
}

// --- HỆ THỐNG PHONG CÁCH ĐỒNG BỘ DARK MODE ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    color: '#fff'
  },
  bannerGrid: {
    maxWidth: '1200px',
    margin: '0 auto 24px auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '20px'
  },
  accentBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    color: '#3498db',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  mainTitle: {
    fontSize: '26px',
    fontWeight: 'bold',
    margin: '10px 0 6px 0'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.4'
  },
  actionGroup: {
    display: 'flex',
    gap: '12px'
  },
  btnOutline: {
    border: '1px solid #475569',
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  btnPrimary: {
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  statsGrid: {
    maxWidth: '1200px',
    margin: '0 auto 24px auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px'
  },
  iconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: '16px 0 4px 0'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: '#f8fafc'
  },
  mainLayoutGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
    onClick: 'wrap',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr'
    }
  },
  panelCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px'
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0
  },
  linkViewAll: {
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  listSpace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  centeredText: {
    textAlign: 'center',
    color: '#64748b',
    padding: '30px 0',
    fontSize: '14px'
  },
  bookingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px',
    border: '1px solid #334155',
    borderRadius: '8px',
    backgroundColor: '#0f172a'
  },
  avatarMini: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#475569',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  bookingMeta: {
    flex: 1,
    minWidth: 0
  },
  bookingSubject: {
    margin: '0 0 2px 0',
    fontWeight: 'bold',
    fontSize: '15px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  bookingTimeDetails: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  },
  badge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap'
  },
  btnFullWidth: {
    backgroundColor: 'transparent',
    border: '1px solid #3498db',
    color: '#3498db',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'block',
    transition: 'background 0.2s'
  }
};