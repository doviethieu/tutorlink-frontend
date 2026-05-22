import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LichDayGiaSu() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // --- FETCH DANH SÁCH BOOKING CỦA GIA SƯ ---
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (!token) {
        loadMockBookings();
        return;
      }

      // Gọi API lấy danh sách đặt lịch với vai trò gia sư
      const res = await axios.get('http://localhost:8000/api/bookings?role=tutor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi tải danh sách lớp học, dùng tạm mock data vận hành:");
      loadMockBookings();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Bộ dữ liệu giả định chuẩn cấu trúc dữ liệu thực tế năm 2026
  const loadMockBookings = () => {
    setBookings([
      {
        id: 'BK-88291',
        subject: 'Toán học nâng cao đại số lớp 12',
        studentName: 'Trần Minh Quân',
        format: 'Online (Video Call)',
        date: '2026-05-25',
        time: '19:00 - 21:00',
        amount: 350000,
        goal: 'Em muốn ôn tập kỹ phần khảo sát hàm số để chuẩn bị thi THPT Quốc Gia.',
        status: 'pending',
        meetingUrl: null
      },
      {
        id: 'BK-77412',
        subject: 'Tiếng Anh Giao Tiếp Chuẩn Bản Xứ',
        studentName: 'Lê Thùy Dương',
        format: 'Online (Video Call)',
        date: '2026-05-23',
        time: '14:00 - 15:30',
        amount: 400000,
        goal: 'Luyện phản xạ nghe nói cấp tốc phục vụ phỏng vấn doanh nghiệp nước ngoài.',
        status: 'confirmed',
        meetingUrl: '/room/room-tutorlink-xyz-999'
      },
      {
        id: 'BK-61209',
        subject: 'Lập trình JavaScript từ số 0',
        studentName: 'Nguyễn Hoàng Long',
        format: 'Online (Video Call)',
        date: '2026-05-18',
        time: '09:00 - 11:00',
        amount: 500000,
        goal: 'Học cơ bản về DOM và mảng để chuẩn bị làm dự án ReactJS.',
        status: 'completed',
        meetingUrl: null
      }
    ]);
  };

  // --- HÀM 1: CHẤP NHẬN ĐẶT LỊCH ---
  const handleAccept = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (token) {
        await axios.post(`http://localhost:8000/api/bookings/${id}/accept`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed', meetingUrl: `/room/${id}` } : b));
      alert("🎉 Đã tiếp nhận lớp học thành công! Hệ thống đã tự động cấp phòng học trực tuyến.");
    } catch (error) {
      alert("Không thể chấp nhận booking này, sếp vui lòng thử lại!");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HÀM 2: TỪ CHỐI ĐẶT LỊCH ---
  const handleReject = async (id) => {
    if (!window.confirm("Sếp có chắc chắn muốn từ chối yêu cầu dạy buổi học này không?")) return;
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (token) {
        await axios.post(`http://localhost:8000/api/bookings/${id}/reject`, { reason: 'Gia sư bận lịch đột xuất' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
      alert("❌ Đã hủy bỏ và từ chối yêu cầu đặt lịch học.");
    } catch (error) {
      alert("Thao tác từ chối thất bại!");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HÀM 3: HOÀN THÀNH LỚP HỌC ---
  const handleComplete = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (token) {
        await axios.post(`http://localhost:8000/api/bookings/${id}/complete`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
      alert("🏆 Chúc mừng sếp đã hoàn thành xuất sắc buổi dạy! Doanh thu đã được cộng vào ví.");
    } catch (error) {
      alert("Lỗi xác nhận hoàn thành lớp học!");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Định dạng hiển thị Badge trạng thái lớp học bán trong suốt mượt mà
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.25)' }}>⏳ Chờ xác nhận</span>;
      case 'confirmed': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>✓ Đã xác nhận</span>;
      case 'completed': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>🏆 Đã hoàn thành</span>;
      case 'rejected': 
        return <span style={{ ...styles.badge, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>✕ Đã từ chối</span>;
      default: 
        return <span style={{ ...styles.badge, backgroundColor: '#334155', color: '#cbd5e1' }}>{status}</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* KHỐI TIÊU ĐỀ */}
      <div style={styles.headerArea}>
        <span style={styles.topBadge}>Quản lý lịch trình</span>
        <h1 style={styles.title}>Yêu cầu đặt lịch học</h1>
        <p style={styles.subtitle}>Cổng tương tác công việc của gia sư: Phê duyệt, điều phối lớp học trực tuyến và nghiệm thu bài dạy.</p>
      </div>

      {/* DANH SÁCH LỚP HỌC CARD LIST */}
      <div style={styles.listContainer}>
        {isLoading && <div style={styles.emptyCard}>🔄 Hệ thống đang tải danh sách lịch dạy...</div>}
        
        {!isLoading && bookings.length === 0 && (
          <div style={styles.emptyCard}>📭 Hiện tại sếp chưa có yêu cầu đặt lịch học nào từ học viên.</div>
        )}

        {!isLoading && bookings.map((booking) => (
          <div key={booking.id} style={styles.card}>
            <div style={styles.cardFlex}>
              
              {/* PHẦN TRÁI: AVATAR BO GÓC SANG XỊN */}
              <div style={styles.avatar}>
                {booking.studentName ? booking.studentName.charAt(0).toUpperCase() : 'S'}
              </div>

              {/* PHẦN GIỮA: THÔNG TIN CHI TIẾT LỚP HỌC */}
              <div style={styles.infoContent}>
                <div style={styles.badgeRow}>
                  <span style={styles.idLabel}>{booking.id}</span>
                  {renderStatusBadge(booking.status)}
                </div>
                
                <h3 style={styles.subjectTitle}>{booking.subject}</h3>
                <p style={styles.studentSub}>Học viên: <b style={{ color: '#f1f5f9' }}>{booking.studentName}</b> · Hình thức: {booking.format}</p>
                
                <div style={styles.metaGrid}>
                  <span style={styles.metaItem}>📅 {booking.date} &nbsp;·&nbsp; ⏰ {booking.time}</span>
                  <span style={styles.priceItem}>💰 {booking.amount?.toLocaleString('vi-VN')} ₫</span>
                </div>

                {booking.goal && (
                  <div style={styles.goalBox}>
                    <span style={{ color: '#38bdf8', fontWeight: '700' }}>🎯 Tiêu điểm học viên:</span> {booking.goal}
                  </div>
                )}
              </div>

              {/* PHẦN PHẢI: CỤM NÚT ĐIỀU KHIỂN HÀNH ĐỘNG HỢP HỢP XU HƯỚNG */}
              <div style={styles.actionColumn}>
                {booking.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleAccept(booking.id)} 
                      disabled={actionLoadingId !== null}
                      style={styles.btnAccept}
                    >
                      {actionLoadingId === booking.id ? '⏳' : '✓ Chấp nhận'}
                    </button>
                    <button 
                      onClick={() => handleReject(booking.id)} 
                      disabled={actionLoadingId !== null}
                      style={styles.btnReject}
                    >
                      {actionLoadingId === booking.id ? '⏳' : '✕ Từ chối'}
                    </button>
                  </>
                )}

                {booking.meetingUrl && booking.status === 'confirmed' && (
                  <a href={booking.meetingUrl} style={styles.btnVideoCall}>
                    📹 Vào lớp học trực tuyến
                  </a>
                )}

                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleComplete(booking.id)} 
                    disabled={actionLoadingId !== null}
                    style={styles.btnComplete}
                  >
                    🏆 Hoàn thành lớp dạy
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 🛠️ HỆ THỐNG CSS INLINE PRESET DARK SLATE PREMIUM ĐỒNG BỘ ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif",
    color: '#cbd5e1'
  },
  headerArea: {
    maxWidth: '1000px',
    margin: '0 auto 35px auto'
  },
  topBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '20px',
    display: 'inline-block',
    border: '1px solid rgba(56, 189, 248, 0.2)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '14px 0 8px 0',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14.5px',
    lineHeight: '1.6',
    margin: 0
  },
  listContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '15px'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s'
  },
  cardFlex: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '12px', // Đồng bộ bo góc vuông mềm như avatar toàn hệ thống
    backgroundColor: '#334155',
    color: '#38bdf8',
    fontSize: '20px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #475569'
  },
  infoContent: {
    flex: 1,
    minWidth: '280px'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  idLabel: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #334155'
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  subjectTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 6px 0',
    color: '#fff',
    letterSpacing: '-0.3px'
  },
  studentSub: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 14px 0'
  },
  metaGrid: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    color: '#cbd5e1',
    marginBottom: '14px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#94a3b8'
  },
  priceItem: {
    fontWeight: '700',
    color: '#10b981' // Đưa về Emerald thanh lịch
  },
  goalBox: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '14px 18px',
    fontSize: '13.5px',
    color: '#cbd5e1',
    lineHeight: '1.6'
  },
  actionColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '190px',
    justifyContent: 'center'
  },
  btnAccept: {
    backgroundColor: '#10b981', // Emerald hiện đại tương phản cao
    color: '#0f172a',
    border: 'none',
    padding: '11px 14px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
  },
  btnReject: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s'
  },
  btnVideoCall: {
    backgroundColor: '#a855f7', // Nâng cấp lên Violet Neon công nghệ đỉnh cao
    color: '#fff',
    textDecoration: 'none',
    textAlign: 'center',
    padding: '11px 14px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    display: 'block',
    width: '100%',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
    transition: 'all 0.2s'
  },
  btnComplete: {
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s'
  }
};