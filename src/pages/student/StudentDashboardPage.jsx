import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { bookingService } from '../../services/booking.service';
import { favoriteService } from '../../services/favorite.service';

export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATES QUẢN LÝ DỮ LIỆU THẬT ---
  const [me, setMe] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- TRUY XUẤT DỮ LIỆU TỪ HỆ THỐNG API THẬT ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('tutorlinkToken');
        
        // Nếu không có token bảo mật thì đẩy ngay ra trang đăng nhập
        if (!token) {
          navigate('/login');
          return;
        }

        const [userRes, bookingsRes, favoritesRes] = await Promise.all([
          authService.getMe(),
          bookingService.listForStudent({ role: 'student', limit: 5 }),
          favoriteService.list()
        ]);

        // 1. Đồng bộ thông tin cá nhân của sếp
        setMe(userRes?.user || userRes);
        
        // 2. Đồng bộ lịch đặt chỗ thật (Xử lý map dữ liệu từ Mongo sang bảng hiển thị)
        if (bookingsRes) {
          const rawBookings = bookingsRes;
          const cleanBookings = (Array.isArray(rawBookings) ? rawBookings : []).map(bk => ({
            _id: bk._id,
            id: bk.bookingId || bk._id?.substring(0, 7).toUpperCase() || 'BK-N/A', 
            subject: bk.subject || bk.className || bk.classId?.subject || 'Môn học chưa phân loại',
            date: bk.date || (bk.startTime ? new Date(bk.startTime).toLocaleDateString('vi-VN') : 'Chưa xếp lịch'),
            status: bk.status === 'Chấp nhận' || bk.status === 'Paid' ? 'confirmed' : bk.status === 'Từ chối' ? 'failed' : bk.status === 'Hoàn thành' ? 'completed' : bk.status,
            amount: bk.amount || bk.totalPrice || 0
          }));
          setBookings(cleanBookings);
        }
        
        // 3. Đồng bộ danh sách gia sư yêu thích thật từ DB
        if (favoritesRes) {
          const rawFavorites = favoritesRes;
          const cleanFavorites = (Array.isArray(rawFavorites) ? rawFavorites : []).map(fv => ({
            _id: fv._id || fv.tutorId?._id,
            name: fv.name || fv.tutor?.name || fv.tutorId?.name || 'Gia sư hệ thống',
            title: fv.title || fv.tutor?.headline || fv.tutorId?.bio || fv.tutorId?.specialization || 'Gia sư TutorLink',
            avatarUrl: fv.avatarUrl || fv.tutor?.avatarUrl || fv.tutorId?.avatar || ''
          }));
          setFavorites(cleanFavorites);
        }

      } catch (error) {
        console.error("🔴 Lỗi nạp dữ liệu thật từ Server:", error.message);
        setMe(null);
        setBookings([]);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // --- LOGIC TÍNH TOÁN CÁC CHỈ SỐ THỐNG KÊ (KPI) THẬT ---
  const upcomingCount = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    return safeBookings.filter((item) => item && ['pending', 'confirmed'].includes(item.status)).length;
  }, [bookings]);

  const totalHocPhi = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    return safeBookings.reduce((sum, item) => sum + ((item && item.amount) ?? 0), 0);
  }, [bookings]);

  // Lấy chính xác tên gọi cuối cùng từ trường dữ liệu thật
  const tenGoi = me?.fullName ? me.fullName.split(' ').pop() : (me?.name ? me.name.split(' ').pop() : 'sếp');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E293B' }}>⏳ Đang đồng bộ hóa dữ liệu trung tâm...</p>
          <p style={{ fontSize: '14px', color: '#8A7D72', marginTop: '6px' }}>Hệ thống đang quét luồng dữ liệu thực tế từ Database.</p>
        </div>
      </div>
    );
  }

  const renderBookings = Array.isArray(bookings) ? bookings : [];
  const renderFavorites = Array.isArray(favorites) ? favorites : [];

  return (
    <div style={styles.container}>
      
      {/* KHUNG KHỞI ĐỘNG HERO WELCOME */}
      <div style={styles.heroCard}>
        <div>
          <span style={styles.accentBadge}>Tổng quan thực tế</span>
          <h1 style={styles.mainTitle}>Xin chào, {tenGoi} 👋</h1>
          <p style={styles.subtitle}>Lịch học, gia sư yêu thích và các yêu cầu đặt lịch gần đây của sếp trên hệ thống.</p>
        </div>
        <Link to="/tutors" style={{ textDecoration: 'none' }}>
          <button style={styles.btnSearch}>🔍 Tìm gia sư ngay</button>
        </Link>
      </div>

      {/* BỘ BA THẺ THỐNG KÊ CHỬ SỐ (STATISTICS GRID) */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconWrap, color: '#C05A3E', backgroundColor: 'rgba(192, 90, 62, 0.1)' }}>📅</div>
          <p style={styles.statLabel}>Buổi học sắp tới</p>
          <p style={styles.statValue}>{upcomingCount}</p>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.iconWrap, color: '#FBBF24', backgroundColor: 'rgba(251, 191, 36, 0.14)' }}>⭐</div>
          <p style={styles.statLabel}>Gia sư yêu thích</p>
          <p style={styles.statValue}>{renderFavorites.length}</p>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.iconWrap, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>💳</div>
          <p style={styles.statLabel}>Tổng học phí thực tế</p>
          <p style={styles.statValue}>{totalHocPhi.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>

      {/* BỐ CỤC CHÍNH: BẢNG LỊCH HỌC BÊN TRÁI & GIA SƯ ĐÃ LƯU BÊN PHẢI */}
      <div style={styles.mainLayout}>
        
        {/* KHỐI TRÁI: DANH SÁCH ĐẶT CHỖ THẬT */}
        <div style={styles.contentCard}>
          <h2 style={styles.cardTitle}>📅 Lịch Đặt Chỗ Gần Đây</h2>
          {renderBookings.length === 0 ? (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>ℹ️ Chưa có lịch đặt chỗ nào được ghi nhận từ tài khoản này.</p>
              <p style={{ color: '#8A7D72', fontSize: '13px', margin: '5px 0 0 0' }}>Sếp hãy thử bấm "Tìm gia sư ngay" để tạo đơn đặt lịch thật nhé!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '15px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Mã đơn</th>
                    <th style={styles.th}>Môn học</th>
                    <th style={styles.th}>Ngày học</th>
                    <th style={styles.th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {renderBookings.map((booking) => (
                    <tr key={booking._id || booking.id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 'bold', color: '#C05A3E' }}>{booking.id}</td>
                      <td style={styles.td}>{booking.subject}</td>
                      <td style={styles.td}>{booking.date}</td>
                      <td style={styles.td}>
                        <span style={renderStatusStyle(booking.status)}>
                          {booking.status === 'confirmed' ? 'Đã duyệt' : booking.status === 'pending' ? 'Chờ xử lý' : booking.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* KHỐI PHẢI: DANH SÁCH GIA SƯ YÊU THÍCH THẬT */}
        <div style={styles.contentCard}>
          <h2 style={styles.cardTitle}>💖 Gia sư đã lưu tâm đắc</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {renderFavorites.slice(0, 4).map((tutor) => (
              <Link key={tutor._id || tutor.id} to={`/giasu/${tutor._id || tutor.id}`} style={styles.tutorRowLink}>
                <div style={styles.avatarFake}>{tutor.name ? tutor.name.charAt(0).toUpperCase() : 'U'}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={styles.tutorName}>{tutor.name}</p>
                  <p style={styles.tutorTitle}>{tutor.title}</p>
                </div>
              </Link>
            ))}
            {renderFavorites.length === 0 && (
              <p style={styles.emptyText}>Sếp chưa nhấn lưu yêu thích gia sư nào trên hệ thống.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- HÀM TỰ ĐỘNG ĐỔI MÀU BADGE TRẠNG THÁI (Đồng bộ bảng màu hệ thống) ---
function renderStatusStyle(status) {
  const base = { fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block' };
  if (status === 'confirmed') return { ...base, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
  if (status === 'pending') return { ...base, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
  if (status === 'completed') return { ...base, backgroundColor: 'rgba(192, 90, 62, 0.15)', color: '#C05A3E' };
  return { ...base, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
}

// --- 🛠️ BỘ CSS INLINE ĐỒNG BỘ DARK SLATE TOÀN DIỆN THỜI THƯỢNG ---
const styles = {
  container: { 
    backgroundColor: '#FAF7F0', 
    minHeight: '100vh',
    padding: '40px 6%', 
    color: '#1E293B', 
    fontFamily: "'Inter', sans-serif" 
  },
  loadingContainer: {
    backgroundColor: '#FAF7F0', 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif" 
  },
  heroCard: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    border: '1px solid #E7DED2', 
    padding: '30px', 
    borderRadius: '16px', 
    marginBottom: '30px', 
    flexWrap: 'wrap', 
    gap: '20px' 
  },
  accentBadge: { 
    backgroundColor: 'rgba(16, 185, 129, 0.15)', 
    color: '#10b981', 
    padding: '5px 12px', 
    borderRadius: '6px', 
    fontSize: '11px', 
    fontWeight: 'bold', 
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  mainTitle: { fontSize: '30px', fontWeight: '800', color: '#1E293B', margin: '12px 0 6px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#5F6B7A', margin: 0 },
  btnSearch: { 
    backgroundColor: '#C05A3E', 
    color: '#FAF7F0', 
    border: 'none', 
    padding: '12px 24px', 
    borderRadius: '8px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    fontSize: '14px', 
    transition: '0.2s',
    boxShadow: '0 4px 14px rgba(192, 90, 62, 0.2)'
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
    gap: '25px', 
    marginBottom: '35px' 
  },
  statCard: { 
    backgroundColor: '#FFFFFF', 
    border: '1px solid #E7DED2', 
    borderRadius: '14px', 
    padding: '24px' 
  },
  iconWrap: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  statLabel: { fontSize: '13.5px', color: '#5F6B7A', margin: '16px 0 4px 0', fontWeight: '600' },
  statValue: { fontSize: '28px', fontWeight: '900', color: '#1E293B', margin: 0 },
  
  // 🛠️ ĐÃ SỬA: Bố cục Grid tự động xuống hàng cực mượt trên Mobile thay cho đoạn innerWidth cũ
  mainLayout: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
    gap: '25px', 
    alignItems: 'start' 
  },
  contentCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '14px', padding: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1E293B', margin: 0 },
  emptyContainer: { textAlign: 'center', padding: '40px 10px' },
  emptyText: { color: '#5F6B7A', fontSize: '14px', margin: 0, fontStyle: 'italic' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  thRow: { borderBottom: '1px solid #E7DED2' },
  th: { color: '#5F6B7A', fontSize: '12px', textTransform: 'uppercase', padding: '12px', textAlign: 'left', fontWeight: 'bold', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #FAF7F0', transition: '0.2s' },
  td: { padding: '14px 12px', color: '#1E293B', fontSize: '14px' },
  tutorRowLink: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    padding: '12px', 
    borderRadius: '10px', 
    border: '1px solid #E7DED2', 
    backgroundColor: '#FAF7F0', 
    textDecoration: 'none',
    transition: '0.2s'
  },
  avatarFake: { 
    width: '40px', 
    height: '40px', 
    borderRadius: '8px', 
    backgroundColor: 'rgba(192, 90, 62, 0.15)', 
    color: '#C05A3E', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '800', 
    fontSize: '16px' 
  },
  tutorName: { margin: 0, color: '#1E293B', fontWeight: '700', fontSize: '14px' },
  tutorTitle: { margin: '4px 0 0 0', color: '#5F6B7A', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
};
