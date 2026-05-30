import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/booking.service';
import { ReviewDialog } from '../../components/common/ReviewDialog';

export default function LichHocHocVien() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedReviewTarget, setSelectedReviewTarget] = useState(null);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.listForStudent({ role: 'student' });
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Không tải được lịch học:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const handleOpenReview = (booking) => {
    if (booking.hasReview) {
      alert('Buổi học này đã được đánh giá rồi.');
      return;
    }

    setSelectedReviewTarget({
      id: booking._id || booking.id,
      tutorId: booking.tutorId,
      tutorName: booking.tutor?.name || 'Gia sư',
      subject: booking.subject
    });
    setIsReviewOpen(true);
  };

  const handleGoToPayment = (booking) => {
    navigate('/payment', {
      state: {
        bookingInfo: booking,
        totalAmount: booking.amount || 0,
        tutorName: booking.tutor?.name || 'Gia sư hệ thống',
      },
    });
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // --- XOÁ VÀ LỌC DỮ LIỆU THEO TỪ KHÓA TÌM KIẾM ---
  const filteredBookings = useMemo(() => {
    return safeBookings.filter(b => 
      (b.id && b.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.subject && b.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [safeBookings, searchQuery]);

  // --- PHÂN NHÓM LỊCH HỌC THEO NGÀY ---
  const bookingsByDate = useMemo(() => {
    const map = new Map();
    filteredBookings.forEach((booking) => {
      const key = booking.date;
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    });
    return map;
  }, [filteredBookings]);

  const agendaDays = useMemo(() => {
    return Array.from(bookingsByDate, ([dateKey, items]) => ({ dateKey, items }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [bookingsByDate]);

  const selectedBookings = bookingsByDate.get(selectedDate) ?? [];

  // --- TÍNH TOÁN SỐ LIỆU ĐẾM NHANH (STATISTICS) ---
  const upcomingCount = safeBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length;
  const completedCount = safeBookings.filter(b => b.status === 'completed').length;
  const cancelledCount = safeBookings.filter(b => b.status === 'cancelled').length;

  // --- HÀM HỦY LỊCH HỌC ---
  const handleCancelBooking = async (id) => {
    if (!window.confirm("Sếp có chắc chắn muốn hủy lịch học này không?")) return;
    try {
      const cancelledBooking = await bookingService.cancel(id, 'Hủy từ giao diện học viên');
      alert(
        cancelledBooking?.paymentStatus === 'refunded' || cancelledBooking?.paymentStatus === 'partially_refunded'
          ? '✔️ Đã hủy lịch thành công. Tiền hoàn đã được cộng vào ví TutorLink.'
          : '✔️ Đã hủy lịch thành công!'
      );
      setBookings(safeBookings.map(b => (b._id || b.id) === id ? { ...b, ...cancelledBooking } : b));
    } catch (err) {
      alert('Không hủy được lịch học, sếp vui lòng kiểm tra lại backend!');
    }
  };

  const handleConfirmCompletion = async (id) => {
    if (!window.confirm('Xác nhận bạn đã học xong buổi này? Sau khi xác nhận, tiền escrow sẽ được cộng vào ví gia sư.')) return;
    try {
      const updated = await bookingService.confirmCompletion(id);
      setBookings(safeBookings.map(b => (b._id || b.id) === id ? { ...b, ...updated } : b));
      alert('Đã xác nhận hoàn thành buổi học. Bạn có thể đánh giá gia sư.');
    } catch (err) {
      alert(err?.response?.data?.error?.message || 'Không xác nhận được buổi học.');
    }
  };

  const handleDisputeCompletion = async (id) => {
    const reason = window.prompt('Nhập lý do khiếu nại buổi học này:');
    if (!reason) return;

    try {
      const updated = await bookingService.dispute(id, reason);
      setBookings(safeBookings.map(b => (b._id || b.id) === id ? { ...b, ...updated } : b));
      alert('Đã gửi khiếu nại. Escrow sẽ tiếp tục được giữ để admin xử lý.');
    } catch (err) {
      alert(err?.response?.data?.error?.message || 'Không gửi được khiếu nại.');
    }
  };

  // --- HÀM XUẤT CSV ---
  const handleExportCsv = async () => {
    try {
      const blob = await bookingService.exportCsv();
      const url = URL.createObjectURL(blob);
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
        <button onClick={handleExportCsv} style={styles.btnCsv}>📥 Xuất danh sách (CSV)</button>
      </div>

      {/* THANH TÌM KIẾM THEO MÔN HỌC HOẶC MÃ ĐƠN */}
      <div style={styles.searchBox}>
        <span style={{ marginRight: '10px', fontSize: '16px', color: '#5F6B7A' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh theo mã booking hoặc tiêu đề môn học..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {safeBookings.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={{ margin: '0 0 16px 0', fontSize: '15px' }}>📅 Sếp chưa có lịch đặt học nào trên hệ thống TutorLink.</p>
          <button onClick={() => navigate('/')} style={styles.btnNavigate}>Tìm gia sư ngay</button>
        </div>
      ) : (
        <div style={styles.layoutGrid}>
          
          {/* CỘT TRÁI: THỜI KHÓA BIỂU DẠNG TIẾN TRÌNH (AGENDA LIST) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.agendaHeader}>
              <div>
                <p style={{ margin: 0, color: '#5F6B7A', fontSize: '13px', fontWeight: '500' }}>Kế hoạch học tập</p>
                <h2 style={{ margin: '4px 0 0 0', color: '#1E293B', fontSize: '20px', fontWeight: '700' }}>{filteredBookings.length} buổi học được tìm thấy</h2>
              </div>
              <button onClick={() => setSelectedDate(toDateKey(new Date()))} style={styles.btnToday}>Hôm nay</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      border: isSelected ? '1px solid #C05A3E' : '1px solid #E7DED2',
                      backgroundColor: isSelected ? 'rgba(192, 90, 62, 0.05)' : '#FFFFFF'
                    }}
                  >
                    <div style={styles.dateBadgeColumn}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5F6B7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {dayObj.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                      <span style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', lineHeight: '1.2' }}>{dayObj.getDate()}</span>
                      {isToday && <span style={styles.todayMiniBadge}>Hiện tại</span>}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {items.map((booking) => (
                        <div key={booking.id} style={styles.innerBookingCard}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '15px' }}>{booking.subject}</span>
                              <span style={renderStatusStyle(booking.status)}>{translateStatus(booking.status)}</span>
                            </div>
                            <p style={{ margin: '6px 0 0 0', color: '#5F6B7A', fontSize: '13px' }}>
                              ⏱️ {booking.time} &nbsp;·&nbsp; 👤 {booking.tutor?.name || 'Gia sư'}
                            </p>
                          </div>
                          {/* 🛠️ ĐÃ SỬA: Thanh tẩy ký tự lạ '尊' bọc giáp an toàn cho thuộc tính CSS */}
                          <span style={{ fontWeight: '700', color: '#10b981', fontSize: '15px' }}>{(booking.amount || 0).toLocaleString('vi-VN')} ₫</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PHẦN TIMELINE CHI TIẾT CỦA NGÀY ĐANG CHỌN */}
            <div style={styles.timelineContainer}>
              <h3 style={{ margin: 0, color: '#1E293B', fontSize: '16px', fontWeight: '700' }}>📍 Tiến trình ngày chọn: <span style={{ color: '#C05A3E' }}>{selectedDate}</span></h3>
              {selectedBookings.length === 0 ? (
                <p style={{ color: '#5F6B7A', fontSize: '13.5px', margin: '12px 0 0 0' }}>Không có lịch học nào được sắp xếp trong ngày này.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                  {selectedBookings.map((booking) => (
                    <div key={booking.id} style={styles.timelineItem}>
                      <span style={{ color: '#C05A3E', fontWeight: '700', fontSize: '14px', minWidth: '90px' }}>{booking.time}</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#1E293B', fontSize: '14.5px', fontWeight: '700' }}>{booking.subject}</h4>
                        <p style={{ margin: '3px 0 0 0', color: '#5F6B7A', fontSize: '12.5px' }}>Gia sư phụ trách: {booking.tutor?.name}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {booking.meetingUrl && ['confirmed', 'completed'].includes(booking.status) && (
                          <a href={booking.meetingUrl} target="_blank" rel="noreferrer" style={styles.btnLinkAction}>Vào lớp</a>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button onClick={() => handleCancelBooking(booking.id)} style={styles.btnDangerMini}>Hủy</button>
                        )}
                        {booking.paymentStatus !== 'paid' && ['pending', 'confirmed'].includes(booking.status) && (
                          <button onClick={() => handleGoToPayment(booking)} style={styles.btnPayMini}>Thanh toán</button>
                        )}
                        {booking.status === 'completion_pending' && (
                          <>
                            <button onClick={() => handleConfirmCompletion(booking.id)} style={styles.btnConfirmMini}>Xác nhận đã học</button>
                            <button onClick={() => handleDisputeCompletion(booking.id)} style={styles.btnDangerMini}>Khiếu nại</button>
                          </>
                        )}
                        {booking.status === 'completed' && (
                          booking.hasReview ? (
                            <button type="button" disabled style={styles.btnReviewedMini}>Đã đánh giá</button>
                          ) : (
                            <button onClick={() => handleOpenReview(booking)} style={styles.btnReviewMini}>
                              <span style={styles.reviewStar}>⭐</span> Đánh giá
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG SỐ LIỆU & CHI TIẾT PHỤ (ASIDE) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.statsRow}>
              <div style={styles.miniStatCard}><p style={styles.statNum}>{upcomingCount}</p><p style={styles.statTxt}>Sắp học</p></div>
              <div style={styles.miniStatCard}><p style={styles.statNum}>{completedCount}</p><p style={styles.statTxt}>Đã học</p></div>
              <div style={styles.miniStatCard}><p style={styles.statNum}>{cancelledCount}</p><p style={styles.statTxt}>Đã hủy</p></div>
            </div>

            <div style={styles.asideMainCard}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1E293B', fontSize: '15px', fontWeight: '700' }}>📋 Tiêu điểm hệ thống</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(selectedBookings.length ? selectedBookings : safeBookings.slice(0, 3)).map((booking) => (
                  <div key={booking.id} style={styles.asideItemCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={styles.asideIdBadge}>{booking.id}</span>
                      <span style={renderStatusStyle(booking.status)}>{translateStatus(booking.status)}</span>
                    </div>
                    <h5 style={{ margin: '0 0 4px 0', color: '#1E293B', fontSize: '14px', fontWeight: '700' }}>{booking.subject}</h5>
                    <p style={{ margin: 0, color: '#5F6B7A', fontSize: '12.5px' }}>Gia sư: {booking.tutor?.name}</p>
                    <p style={{ margin: '6px 0 0 0', color: '#1E293B', fontSize: '12.5px' }}>💻 Hình thức: {booking.format || 'Trực tuyến'}</p>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {booking.meetingUrl && <a href={booking.meetingUrl} target="_blank" rel="noreferrer" style={{ ...styles.btnLinkAction, flex: 1, textAlign: 'center' }}>Vào lớp</a>}
                      {['pending', 'confirmed'].includes(booking.status) && <button onClick={() => handleCancelBooking(booking.id)} style={{ ...styles.btnDangerMini, flex: 1 }}>Hủy lịch</button>}
                      {booking.paymentStatus !== 'paid' && ['pending', 'confirmed'].includes(booking.status) && (
                        <button onClick={() => handleGoToPayment(booking)} style={{ ...styles.btnPayMini, flex: 1 }}>Thanh toán</button>
                      )}
                      {booking.status === 'completion_pending' && (
                        <>
                          <button onClick={() => handleConfirmCompletion(booking.id)} style={{ ...styles.btnConfirmMini, flex: 1 }}>Xác nhận đã học</button>
                          <button onClick={() => handleDisputeCompletion(booking.id)} style={{ ...styles.btnDangerMini, flex: 1 }}>Khiếu nại</button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        booking.hasReview ? (
                          <button type="button" disabled style={{ ...styles.btnReviewedMini, flex: 1 }}>Đã đánh giá</button>
                        ) : (
                          <button onClick={() => handleOpenReview(booking)} style={{ ...styles.btnReviewMini, flex: 1 }}>
                            <span style={styles.reviewStar}>⭐</span> Đánh giá
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* POPUP DIALOG REVIEW ĐÁNH GIÁ CHẤT LƯỢNG GIA SƯ */}
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
          onReviewSuccess={(review) => {
            setBookings((items) => items.map((booking) => (
              (booking._id || booking.id) === selectedReviewTarget.id
                ? { ...booking, hasReview: true, review }
                : booking
            )));
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
  if (!dateKey) return new Date();
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// --- BIẾN ĐỔI CHUỖI STRING TRẠNG THÁI SANG TIẾNG VIỆT ---
function translateStatus(status) {
  switch (status) {
    case 'confirmed': return 'Đã xác nhận';
    case 'pending': return 'Chờ phản hồi';
    case 'completion_pending': return 'Chờ bạn xác nhận';
    case 'completed': return 'Đã hoàn thành';
    case 'disputed': return 'Đang khiếu nại';
    case 'cancelled': return 'Đã hủy bỏ';
    default: return status;
  }
}

// --- HÀM ĐỔI MÀU BADGE TRẠNG THÁI LINH HOẠT CHUẨN PREMIUM ---
function renderStatusStyle(status) {
  const base = { fontSize: '11px', padding: '3px 9px', borderRadius: '6px', fontWeight: '700' };
  if (status === 'confirmed') return { ...base, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
  if (status === 'pending') return { ...base, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
  if (status === 'completion_pending') return { ...base, backgroundColor: 'rgba(251, 191, 36, 0.16)', color: '#b45309', border: '1px solid rgba(251, 191, 36, 0.35)' };
  if (status === 'disputed') return { ...base, backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' };
  if (status === 'cancelled') return { ...base, backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' };
  // 🛠️ ĐÃ THÊM: Đồng bộ màu sắc lục bảo quý tộc cho trạng thái Hoàn thành lớp học
  if (status === 'completed') return { ...base, backgroundColor: 'rgba(192, 90, 62, 0.12)', color: '#C05A3E', border: '1px solid rgba(192, 90, 62, 0.2)' };
  return { ...base, backgroundColor: '#E7DED2', color: '#1E293B' };
}

// --- 🛠️ HỆ THỐNG CSS INLINE PRESET DARK SLATE PREMIUM MƯỚT MẮT ---
const styles = {
  container: { backgroundColor: '#FAF7F0', minHeight: '100vh', padding: '40px 4%', color: '#1E293B', fontFamily: "'Inter', sans-serif" },
  heroCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '28px 32px', borderRadius: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  accentBadge: { backgroundColor: 'rgba(192, 90, 62, 0.12)', color: '#C05A3E', padding: '5px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(192, 90, 62, 0.2)' },
  mainTitle: { fontSize: '28px', fontWeight: '800', color: '#1E293B', margin: '12px 0 6px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#5F6B7A', margin: 0, lineHeight: '1.5' },
  btnCsv: { backgroundColor: 'transparent', border: '1px solid #7C6F64', color: '#1E293B', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '12px 18px', borderRadius: '10px', marginBottom: '24px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#1E293B', width: '100%', outline: 'none', fontSize: '14.5px' },
  emptyCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '50px 20px', borderRadius: '16px', textAlign: 'center', color: '#5F6B7A' },
  btnNavigate: { backgroundColor: '#C05A3E', color: '#FAF7F0', border: 'none', padding: '11px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '15px', transition: 'all 0.2s' },
  layoutGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' },
  agendaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '18px 24px', borderRadius: '14px 14px 0 0', borderBottom: '1px solid #E7DED2' },
  btnToday: { backgroundColor: 'transparent', border: '1px solid #7C6F64', color: '#1E293B', padding: '6px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '600' },
  agendaRow: { display: 'grid', gridTemplateColumns: '85px 1fr', gap: '18px', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease' },
  dateBadgeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E7DED2', paddingRight: '12px' },
  todayMiniBadge: { backgroundColor: '#C05A3E', color: '#FAF7F0', fontSize: '9px', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', marginTop: '6px', textTransform: 'uppercase' },
  innerBookingCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(250, 247, 240, 0.4)', border: '1px solid #E7DED2', padding: '14px', borderRadius: '10px' },
  timelineContainer: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '22px', borderRadius: '14px', marginTop: '12px' },
  timelineItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', borderRadius: '10px' },
  btnLinkAction: { backgroundColor: '#a855f7', color: '#1E293B', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)' },
  btnDangerMini: { backgroundColor: 'transparent', border: '1px solid #f87171', color: '#f87171', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '600' },
  btnPayMini: { backgroundColor: '#10b981', color: '#1E293B', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '700' },
  btnConfirmMini: { backgroundColor: '#C05A3E', color: '#FFFFFF', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '700' },
  btnReviewMini: { backgroundColor: '#FFFFFF', color: '#1E293B', border: '1px solid rgba(251, 191, 36, 0.45)', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer', fontWeight: '700' },
  reviewStar: { color: '#FBBF24', marginRight: 4 },
  btnReviewedMini: { backgroundColor: '#E7DED2', color: '#5F6B7A', border: '1px solid #7C6F64', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', cursor: 'not-allowed', fontWeight: '700' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  miniStatCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '10px', padding: '14px', textAlign: 'center' },
  statNum: { fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0 },
  statTxt: { fontSize: '11.5px', color: '#5F6B7A', margin: '4px 0 0 0', fontWeight: '500' },
  asideMainCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '24px', borderRadius: '14px' },
  asideItemCard: { backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', padding: '14px', borderRadius: '10px' },
  asideIdBadge: { color: '#C05A3E', fontSize: '11px', fontFamily: 'monospace', fontWeight: '600' }
};
