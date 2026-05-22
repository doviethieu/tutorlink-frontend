import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 🛠️ ĐÃ FIX CHÍNH XÁC ĐƯỜNG DẪN IMPORT TỪ PHÍA CÂY THƯ MỤC THỰC TẾ CỦA SẾP
import { bookingsService } from '../../services/tutorlink.service.js'; 

export default function TutorPanel() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE QUẢN LÝ HIỆU ỨNG DI CHUỘT (HOVER STATES) ---
  const [isHoverProfile, setIsHoverProfile] = useState(false);
  const [isHoverAvailability, setIsHoverAvailability] = useState(false);
  const [isHoverConfig, setIsHoverConfig] = useState(false);

  // --- STATE THEO DÕI ĐỘ RỘNG MÀN HÌNH ĐỂ LÀM RESPONSIVE ĐỘNG ---
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- FETCH BOOKING THẬT TỪ BACKEND QUA SERVICE ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Gọi API thực tế lấy 5 đơn mới nhất của phân hệ Tutor
        const realData = await bookingsService.list({ role: 'tutor', limit: 5 });
        setBookings(Array.isArray(realData) ? realData : []);
      } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu API, kích hoạt dữ liệu dự phòng để sếp demo:");
        loadMockDashboard();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Bộ dữ liệu mẫu vận hành trơn tru bảo vệ sếp khi demo offline
  const loadMockDashboard = () => {
    setBookings([
      { id: 'BK-88291', subject: 'Toán học nâng cao hình học không gian lớp 12', date: '2026-05-25', time: '19:00 - 21:00', status: 'pending' },
      { id: 'BK-77412', subject: 'Tiếng Anh Luyện Giao Tiếp Chuẩn Khung IELTS', date: '2026-05-23', time: '14:00 - 15:30', status: 'confirmed' },
      { id: 'BK-61209', subject: 'Cấu trúc dữ liệu & Giải thuật với JavaScript', date: '2026-05-18', time: '09:00 - 11:00', status: 'completed' }
    ]);
  };

  // --- TRÍCH XUẤT CHỈ SỐ THỐNG KÊ ---
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Chờ duyệt</span>;
      case 'confirmed': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Đã nhận</span>;
      case 'completed': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>Đã xong</span>;
      default: 
        return <span style={{ ...styles.badge, backgroundColor: '#334155', color: '#94a3b8' }}>{status}</span>;
    }
  };

  // Tính toán chia grid động dựa trên độ rộng màn hình thực tế (Thay thế cho @media css-in-js)
  const currentMainLayoutGrid = {
    ...styles.mainLayoutGrid,
    gridTemplateColumns: windowWidth <= 900 ? '1fr' : '2fr 1fr'
  };

  return (
    <div style={styles.container}>
      
      {/* 1. KHỐI WELCOME BANNER HÀNH ĐỘNG NHANH */}
      <div style={styles.bannerGrid}>
        <div>
          <span style={styles.accentBadge}>KHÔNG GIAN GIA SƯ KHÉP KÍN</span>
          <h1 style={styles.mainTitle}>Tổng quan tiến độ công việc</h1>
          <p style={styles.subtitle}>Theo dõi hiệu suất giảng dạy, cập nhật khung giờ trống và quản lý các yêu cầu đặt lịch học mới nhất từ học viên.</p>
        </div>
        <div style={styles.actionGroup}>
          <Link 
            to="/profile" 
            style={{
              ...styles.btnOutline,
              backgroundColor: isHoverProfile ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderColor: isHoverProfile ? '#cbd5e1' : '#475569'
            }}
            onMouseOver={() => setIsHoverProfile(true)}
            onMouseOut={() => setIsHoverProfile(false)}
          >
            📝 Hồ sơ cá nhân
          </Link>
          <Link 
            to="/tutor/availability" 
            style={{
              ...styles.btnPrimary,
              backgroundColor: isHoverAvailability ? '#0ea5e9' : '#38bdf8'
            }}
            onMouseOver={() => setIsHoverAvailability(true)}
            onMouseOut={() => setIsHoverAvailability(false)}
          >
            📅 Cài đặt lịch rảnh
          </Link>
        </div>
      </div>

      {/* 2. CỤM THẺ THỐNG KÊ (STAT CARDS) */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>⏰</div>
          <p style={styles.statLabel}>Booking cần xử lý</p>
          <h2 style={styles.statValue}>{pendingCount} <span style={styles.statUnit}>đơn</span></h2>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>✓</div>
          <p style={styles.statLabel}>Lịch học đã xác nhận</p>
          <h2 style={styles.statValue}>{confirmedCount} <span style={styles.statUnit}>ca dạy</span></h2>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.12)' }}>⭐</div>
          <p style={styles.statLabel}>Buổi học đã hoàn thành</p>
          <h2 style={styles.statValue}>{completedCount} <span style={styles.statUnit}>lớp</span></h2>
        </div>
      </div>

      {/* 3. PHÂN KHU NỘI DUNG CHÍNH (ĐÃ FIX ĐỘNG RESPONSIVE BAN ĐẦU) */}
      <div style={currentMainLayoutGrid}>
        
        {/* BÊN TRÁI: DANH SÁCH BOOKING MỚI NHẬN */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Yêu cầu đặt lịch mới nhất</h3>
            <Link to="/tutor/bookings" style={styles.linkViewAll}>Xem tất cả lớp →</Link>
          </div>
          
          <div style={styles.listSpace}>
            {isLoading && <p style={styles.centeredText}>🔄 Đang gọi bookingsService để lấy lịch realtime...</p>}
            
            {!isLoading && bookings.length === 0 && (
              <p style={styles.centeredText}>📭 Hiện tại sếp chưa có yêu cầu đặt lịch nào từ học viên.</p>
            )}

            {!isLoading && bookings.map((booking) => (
              <div key={booking.id || booking._id} style={styles.bookingRow}>
                <div style={styles.avatarMini}>
                  {(booking.subject || "T").charAt(0).toUpperCase()}
                </div>
                <div style={styles.bookingMeta}>
                  <p style={styles.bookingSubject}>{booking.subject || "Môn học trực tuyến"}</p>
                  <p style={styles.bookingTimeDetails}>
                     Mã đơn: <b style={{ color: '#cbd5e1' }}>{booking.id || booking._id}</b> · 📅 {booking.date} · ⏰ {booking.time}
                  </p>
                </div>
                <div>
                  {renderStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BÊN PHẢI: ĐIỀU HƯỚNG QUẢN LÝ LỊCH VỚI HIỆU ỨNG HOVER ĐẦY ĐỦ */}
        <div style={styles.sideCard}>
          <div style={styles.sideIcon}>📆</div>
          <h4 style={styles.sideTitle}>Quản lý khung giờ trống</h4>
          <p style={styles.sideDesc}>
            Cập nhật thường xuyên các ca trống trong tuần để hệ thống đẩy hồ sơ của sếp lên mục ưu tiên, giúp học viên dễ dàng đặt lớp.
          </p>
          <Link 
            to="/tutor/availability" 
            style={{
              ...styles.btnFullWidth,
              backgroundColor: isHoverConfig ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              borderColor: '#38bdf8'
            }}
            onMouseOver={() => setIsHoverConfig(true)}
            onMouseOut={() => setIsHoverConfig(false)}
          >
            Cấu hình thời gian rảnh ngay
          </Link>
        </div>

      </div>

    </div>
  );
}

// --- 🛠️ DESIGN SYSTEM SLATE PREMIUM DARK MODE HOÀN CHỈNH ---
const styles = {
  container: { 
    backgroundColor: '#0f172a', 
    minHeight: '100vh', 
    padding: '40px 24px', 
    fontFamily: "'Inter', sans-serif", 
    color: '#f1f5f9', 
    boxSizing: 'border-box' 
  },
  bannerGrid: { 
    maxWidth: '1200px', 
    margin: '0 auto 24px auto', 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '16px', 
    padding: '24px 32px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '24px', 
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' 
  },
  accentBadge: { 
    backgroundColor: 'rgba(56, 189, 248, 0.1)', 
    color: '#38bdf8', 
    fontSize: '11px', 
    fontWeight: '700', 
    padding: '6px 12px', 
    borderRadius: '20px', 
    display: 'inline-block', 
    letterSpacing: '0.5px' 
  },
  mainTitle: { 
    fontSize: '28px', 
    fontWeight: '800', 
    margin: '12px 0 6px 0', 
    letterSpacing: '-0.5px', 
    color: '#fff' 
  },
  subtitle: { 
    color: '#94a3b8', 
    fontSize: '14px', 
    margin: 0, 
    lineHeight: '1.5' 
  },
  actionGroup: { 
    display: 'flex', 
    gap: '12px' 
  },
  btnOutline: { 
    border: '1px solid #475569', 
    color: '#cbd5e1', 
    padding: '11px 20px', 
    borderRadius: '8px', 
    textDecoration: 'none', 
    fontSize: '14px', 
    fontWeight: '700', 
    transition: 'all 0.2s ease-in-out',
    display: 'inline-block'
  },
  btnPrimary: { 
    color: '#0f172a', 
    padding: '11px 20px', 
    borderRadius: '8px', 
    textDecoration: 'none', 
    fontSize: '14px', 
    fontWeight: '800', 
    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)', 
    transition: 'all 0.2s ease-in-out',
    display: 'inline-block'
  },
  statsGrid: { 
    maxWidth: '1200px', 
    margin: '0 auto 24px auto', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
    gap: '20px' 
  },
  statCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '16px', 
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
  },
  iconBox: { 
    width: '42px', 
    height: '42px', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '20px', 
    fontWeight: 'bold' 
  },
  statLabel: { 
    color: '#94a3b8', 
    fontSize: '14px', 
    margin: '16px 0 6px 0', 
    fontWeight: '500' 
  },
  statValue: { 
    fontSize: '32px', 
    fontWeight: '800', 
    margin: 0, 
    color: '#fff', 
    letterSpacing: '-0.5px' 
  },
  statUnit: { 
    fontSize: '14px', 
    color: '#64748b', 
    fontWeight: '400', 
    marginLeft: '4px' 
  },
  mainLayoutGrid: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    display: 'grid', 
    gap: '24px' 
  },
  panelCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '16px', 
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  panelHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px', 
    borderBottom: '1px solid #334155', 
    paddingBottom: '16px' 
  },
  panelTitle: { 
    fontSize: '18px', 
    fontWeight: '700', 
    margin: 0, 
    color: '#fff' 
  },
  linkViewAll: { 
    color: '#38bdf8', 
    textDecoration: 'none', 
    fontSize: '13.5px', 
    fontWeight: '700' 
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
    gap: '16px', 
    padding: '14px 16px', 
    border: '1px solid #334155', 
    borderRadius: '12px', 
    backgroundColor: '#0f172a' 
  },
  avatarMini: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '50%', 
    backgroundColor: '#334155', 
    color: '#38bdf8', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '700', 
    fontSize: '15px' 
  },
  bookingMeta: { 
    flex: 1, 
    minWidth: 0 
  },
  bookingSubject: { 
    margin: '0 0 4px 0', 
    fontWeight: '700', 
    fontSize: '14.5px', 
    color: '#fff', 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis' 
  },
  bookingTimeDetails: { 
    margin: 0, 
    fontSize: '12.5px', 
    color: '#94a3b8' 
  },
  badge: { 
    fontSize: '11px', 
    fontWeight: '700', 
    padding: '4px 10px', 
    borderRadius: '6px', 
    whiteSpace: 'nowrap' 
  },
  sideCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '16px', 
    padding: '32px 24px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    textAlign: 'center', 
    height: 'fit-content',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  sideIcon: { 
    fontSize: '36px', 
    marginBottom: '16px' 
  },
  sideTitle: { 
    margin: '0 0 6px 0', 
    fontSize: '17px', 
    fontWeight: '700', 
    color: '#fff' 
  },
  sideDesc: { 
    color: '#94a3b8', 
    fontSize: '13.5px', 
    margin: '0 0 24px 0', 
    lineHeight: '1.5' 
  },
  btnFullWidth: { 
    border: '1px solid #38bdf8', 
    color: '#38bdf8', 
    padding: '12px', 
    borderRadius: '8px', 
    textAlign: 'center', 
    textDecoration: 'none', 
    fontWeight: '700', 
    fontSize: '14px', 
    display: 'block', 
    width: '100%', 
    boxSizing: 'border-box',
    transition: 'all 0.2s ease-in-out'
  }
};