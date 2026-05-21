import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ReviewDialog } from '../components/ReviewDialog'; // 🔥 ĐÃ TÍCH HỢP: Gọi hộp thoại đánh giá Premium mới

export default function LichHocHocVien() {
  const navigate = useNavigate();

  // --- STATES QUẢN LÝ DỮ LIỆU ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  
  // 🔥 STATE ĐÓNG/MỞ MODAL REVIEW ĐỒNG BỘ THEO COMPONENT MỚI
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedReviewTarget, setSelectedReviewTarget] = useState(null);

  // --- FETCH DỮ LIỆU LỊCH HỌC TỪ BACKEND ---
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('tutorlinkToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Kiểm tra quyền: Nếu là gia sư hoặc admin thì chuyển hướng sang khu vực riêng
      const userRes = await axios.get('http://localhost:8000/api/auth/me', { headers });
      if (userRes.data?.role === 'tutor' || userRes.data?.role === 'admin') {
        navigate('/tutor/bookings');
        return;
      }

      const res = await axios.get('http://localhost:8000/api/bookings', { headers });
      if (res.data) setBookings(res.data);
    } catch (err) {
      console.error("Lỗi đồng bộ API lịch học, hệ thống kích hoạt Mock Data để sếp test:");
      
      // MOCK DATA ĐỂ SẾP TEST ĐẦY ĐỦ TRẠNG THÁI GIAO DIỆN
      const todayStr = toDateKey(new Date());
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = toDateKey(tomorrow);

      setBookings([
        { id: 'BK-9921', subject: 'Toán Cao Cấp A1', date: todayStr, time: '08:00 - 10:00', status: 'confirmed', amount: 300000, tutorId: 'gs1', tutor: { name: 'Thầy Trần Hùng', avatarUrl: '' }, format: 'Online (Zoom)', meetingUrl: 'https://zoom.us' },
        { id: 'BK-5512', subject: 'Tiếng Anh Giao Tiếp', date: todayStr, time: '14:30 - 16:30', status: 'pending', amount: 250000, tutorId: 'gs2', tutor: { name: 'Cô Sarah Nguyễn', avatarUrl: '' }, format: 'Online (Google Meet)', meetingUrl: '' },
        { id: 'BK-1102', subject: 'Lập trình ReactJS', date: tomorrowStr, time: '19:00 - 21:00', status: 'completed', amount: 400000, tutorId: 'gs3', tutor: { name: 'Anh Minh Lê', avatarUrl: '' }, format: 'Online (Discord)', meetingUrl: 'https://discord.gg' },
        { id: 'BK-3344', subject: 'Vật Lý Đại Cương', date: '2026-05-15', status: 'cancelled', amount: 200000, tutorId: 'gs1', tutor: { name: 'Thầy Trần Hùng', avatarUrl: '' }, format: 'Online', time: '10:00 - 12:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  // --- HÀM MỞ HỘP THOẠI ĐÁNH GIÁ ĐÚNG CHUẨN ĐƯỜNG LINK ---
  const handleOpenReview = (booking) => {
    setSelectedReviewTarget({
      id: booking.id,
      tutorId: booking.tutorId,
      tutorName: booking.tutor?.name || 'Gia sư',
      subject: booking.subject
    });
    setIsReviewOpen(true);
  };

  // --- XOÁ VÀ LỌC DỮ LIỆU THEO TỪ KHÓA TÌM KIẾM ---
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  // --- PHÂN NHÓM LỊCH HỌC THEO NGÀY ---
  const bookingsByDate = useMemo(() => {
    const map = new Map();
    filteredBookings.forEach((booking) => {
      const key = booking.date;
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list.sort((a, b) => a.time.localeCompare(b.time)));
    });
    return map;
  }, [filteredBookings]);

  const agendaDays = useMemo(() => {
    return Array.from(bookingsByDate, ([dateKey, items]) => ({ dateKey, items }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [bookingsByDate]);

  const selectedBookings = bookingsByDate.get(selectedDate) ?? [];

  // --- TÍNH TOÁN SỐ LIỆU ĐẾM NHANH (STATISTICS) ---
  const upcomingCount = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  // --- HÀM HỦY LỊCH HỌC ---
  const handleCancelBooking = async (id) => {
    if (!window.confirm("Sếp có chắc chắn muốn hủy lịch học này không?")) return;
    try {
      const token = localStorage.getItem('tutorlinkToken');
      await axios.post(`http://localhost:8000/api/bookings/${id}/cancel`, { reason: 'Hủy từ giao diện học viên' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✔️ Đã hủy lịch thành công!');
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert('Không hủy được lịch học, sếp vui lòng kiểm tra lại backend!');
    }
  };

  // --- HÀM XUẤT CSV ---
  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('tutorlinkToken');
      const res = await axios.get('http://localhost:8000/api/bookings/export-csv', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bookings.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Xuất dữ liệu CSV thất bại!');
    }
  };

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>⏳ Đang tải lịch trình học tập của sếp...</div>;
  }

  return (
    <div style={styles.container}>
      {/* KHUNG HERO KHỞI ĐẦU TRANG */}
      <div style={styles.heroCard}>
        <div>
          <span style={styles.accentBadge}>Học viên</span>
          <h1 style={styles.mainTitle}>Lịch học của bạn</h1>
          <p style={styles.subtitle}>Theo dõi yêu cầu đặt lịch, lịch đã xác nhận và buổi học đã hoàn thành tại đây.</p>
        </div>
        <button onClick={handleExportCsv} style={styles.btnCsv}>📥 Xuất CSV</button>
      </div>

      {/* THANH TÌM KIẾM THEO MÔN HỌC HOẶC MÃ ĐƠN */}
      <div style={styles.searchBox}>
        <span style={{ marginRight: '8px' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Tìm theo mã booking hoặc môn học..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {bookings.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>📅 Sếp chưa có lịch đặt học nào trên hệ thống.</p>
          <button onClick={() => navigate('/')} style={styles.btnNavigate}>Tìm gia sư ngay</button>
        </div>
      ) : (
        <div style={styles.layoutGrid}>
          
          {/* CỘT TRÁI: THỜI KHÓA BIỂU DẠNG TIẾN TRÌNH (AGENDA LIST) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.agendaHeader}>
              <div>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Kế hoạch học tập</p>
                <h2 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '20px' }}>{filteredBookings.length} lịch học phù hợp</h2>
              </div>
              <button onClick={() => setSelectedDate(toDateKey(new Date()))} style={styles.btnToday}>Hôm nay</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {agendaDays.map(({ dateKey, items }) => {
                const dayObj = parseDateKey(dateKey);
                const isSelected = selectedDate === dateKey;
                const isToday = dateKey === toDateKey(new Date());

                return (
                  <div 
                    key={dateKey} 
                    onClick={() => setSelectedDate(dateKey)}
                    style={{
                      ...styles.agendaRow,
                      border: isSelected ? '1px solid #3498db' : '1px solid #334155',
                      backgroundColor: isSelected ? 'rgba(52, 152, 219, 0.08)' : '#1e293b'
                    }}
                  >
                    <div style={styles.dateBadgeColumn}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>
                        {dayObj.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                      <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{dayObj.getDate()}</span>
                      {isToday && <span style={styles.todayMiniBadge}>Hôm nay</span>}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map((booking) => (
                        <div key={booking.id} style={styles.innerBookingCard}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 'bold', color: '#fff' }}>{booking.subject}</span>
                              <span style={renderStatusStyle(booking.status)}>{booking.status}</span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '13px' }}>
                              ⏱️ {booking.time} · 👤 {booking.tutor?.name || 'Gia sư'}
                            </p>
                          </div>
                          <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{booking.amount.toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PHẦN TIMELINE CHI TIẾT CỦA NGÀY ĐANG CHỌN */}
            <div style={styles.timelineContainer}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>📍 Tiến trình ngày: {selectedDate}</h3>
              {selectedBookings.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '10px 0 0 0' }}>Không có lịch học trong ngày này sếp nhé.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {selectedBookings.map((booking) => (
                    <div key={booking.id} style={styles.timelineItem}>
                      <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '14px' }}>{booking.time}</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>{booking.subject}</h4>
                        <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>Gia sư: {booking.tutor?.name}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {booking.meetingUrl && ['confirmed', 'completed'].includes(booking.status) && (
                          <a href={booking.meetingUrl} target="_blank" rel="noreferrer" style={styles.btnLinkAction}>Vào lớp</a>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button onClick={() => handleCancelBooking(booking.id)} style={styles.btnDangerMini}>Hủy</button>
                        )}
                        {booking.status === 'completed' && (
                          <button onClick={() => handleOpenReview(booking)} style={styles.btnReviewMini}>⭐ Đánh giá</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG SỐ LIỆU & CHI TIẾT PHỤ (ASIDE) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={styles.statsRow}>
              <div style={styles.miniStatCard}><p style={styles.statNum}>{upcomingCount}</p><p style={styles.statTxt}>Sắp học</p></div>
              <div style={styles.miniStatCard}><p style={styles.statNum}>{completedCount}</p><p style={styles.statTxt}>Đã xong</p></div>
              <div style={styles.miniStatCard}><p style={styles.statNum}>{cancelledCount}</p><p style={styles.statTxt}>Đã hủy</p></div>
            </div>

            <div style={styles.asideMainCard}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '15px' }}>📋 Danh sách thu gọn</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(selectedBookings.length ? selectedBookings : bookings.slice(0, 3)).map((booking) => (
                  <div key={booking.id} style={styles.asideItemCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={styles.asideIdBadge}>{booking.id}</span>
                      <span style={renderStatusStyle(booking.status)}>{booking.status}</span>
                    </div>
                    <h5 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '14px' }}>{booking.subject}</h5>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Gia sư: {booking.tutor?.name}</p>
                    <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '12px' }}>💻 Hình thức: {booking.format || 'Online'}</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {booking.meetingUrl && <a href={booking.meetingUrl} target="_blank" rel="noreferrer" style={{ ...styles.btnLinkAction, flex: 1, textAlign: 'center' }}>Vào lớp</a>}
                      {['pending', 'confirmed'].includes(booking.status) && <button onClick={() => handleCancelBooking(booking.id)} style={{ ...styles.btnDangerMini, flex: 1 }}>Hủy lịch</button>}
                      {booking.status === 'completed' && <button onClick={() => handleOpenReview(booking)} style={{ ...styles.btnReviewMini, flex: 1 }}>⭐ Đánh giá</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔥 KÍCH HOẠT DIALOG POPUP ĐÁNH GIÁ CHẤT LƯỢNG GIA SƯ (MỚI TÍCH HỢP) */}
      {/* ========================================================================= */}
      {selectedReviewTarget && (
        <ReviewDialog
          open={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
            setSelectedReviewTarget(null);
          }}
          tutorName={selectedReviewTarget.tutorName}
          subject={selectedReviewTarget.subject}
          bookingId={selectedReviewTarget.id}
          tutorId={selectedReviewTarget.tutorId}
          onReviewSuccess={() => {
            // Tự động load lại danh sách lịch học sau khi sếp đánh giá thành công để đồng bộ giao diện
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}

// --- HELPER QUY ĐỔI NGÀY THÁNG ĐỂ ĐỒNG BỘ ĐỊNH DẠNG ---
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// --- HÀM ĐỔI MÀU BADGE TRẠNG THÁI LINH HOẠT ---
function renderStatusStyle(status) {
  const base = { fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' };
  if (status === 'confirmed') return { ...base, backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71' };
  if (status === 'pending') return { ...base, backgroundColor: 'rgba(230, 126, 34, 0.2)', color: '#e67e22' };
  if (status === 'cancelled') return { ...base, backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c' };
  return { ...base, backgroundColor: '#34495e', color: '#cbd5e1' };
}

// --- HỆ THỐNG CSS INLINE DARK MODE CAO CẤP ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '30px 4%',
    color: '#e2e8f0',
    fontFamily: 'Arial, sans-serif'
  },
  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  accentBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    color: '#3498db',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  mainTitle: { fontSize: '26px', fontWeight: 'bold', color: '#fff', margin: '10px 0 4px 0' },
  subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  btnCsv: { backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '14px' },
  emptyCard: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' },
  btnNavigate: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' },
  layoutGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' },
  agendaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #334155' },
  btnToday: { backgroundColor: 'transparent', border: '1px solid #475569', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  agendaRow: { display: 'grid', gridTemplateColumns: '80px 1fr', gap: '15px', padding: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease' },
  dateBadgeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #334155', paddingRight: '10px' },
  todayMiniBadge: { backgroundColor: '#fff', color: '#000', fontSize: '9px', fontWeight: 'bold', padding: '2px 4px', borderRadius: '4px', marginTop: '4px' },
  innerBookingCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155', padding: '12px', borderRadius: '8px' },
  timelineContainer: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '10px', marginTop: '10px' },
  timelineItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' },
  btnLinkAction: { backgroundColor: '#3498db', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' },
  btnDangerMini: { backgroundColor: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  btnReviewMini: { backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  miniStatCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  statNum: { fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: 0 },
  statTxt: { fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' },
  asideMainCard: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '10px' },
  asideItemCard: { backgroundColor: '#0f172a', border: '1px solid #334155', padding: '12px', borderRadius: '8px' },
  asideIdBadge: { color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }
};