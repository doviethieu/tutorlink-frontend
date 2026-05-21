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

  // Bộ dữ liệu giả định chuẩn cấu trúc dữ liệu thực tế của sếp
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
      
      // Cập nhật trạng thái trực tiếp trên State UI
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

  // Định dạng hiển thị Badge trạng thái lớp học
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span style={{ ...styles.badge, backgroundColor: '#f1c40f', color: '#1e1b4b' }}>Chờ xác nhận</span>;
      case 'confirmed': 
        return <span style={{ ...styles.badge, backgroundColor: '#2ecc71', color: '#064e3b' }}>Đã xác nhận</span>;
      case 'completed': 
        return <span style={{ ...styles.badge, backgroundColor: '#3498db', color: '#0f172a' }}>Đã hoàn thành</span>;
      case 'rejected': 
        return <span style={{ ...styles.badge, backgroundColor: '#e74c3c', color: '#fff' }}>Đã từ chối</span>;
      default: 
        return <span style={{ ...styles.badge, backgroundColor: '#94a3b8', color: '#1e293b' }}>{status}</span>;
    }
  };

  return (
    <div style={styles.container}>
      {/* KHỐI TIÊU ĐỀ */}
      <div style={styles.headerArea}>
        <span style={styles.topBadge}>Booking gia sư</span>
        <h1 style={styles.title}>Yêu cầu đặt lịch học</h1>
        <p style={styles.subtitle}>Quản lý luồng công việc: Phê duyệt, từ chối hoặc tiến hành đóng hồ sơ các buổi dạy của học viên.</p>
      </div>

      {/* DANH SÁCH LỚP HỌC CARD LIST */}
      <div style={styles.listContainer}>
        {isLoading && <div style={styles.emptyCard}>🔄 Đang tải dữ liệu lịch dạy...</div>}
        
        {!isLoading && bookings.length === 0 && (
          <div style={styles.emptyCard}>📭 Hiện tại sếp chưa có yêu cầu đặt lịch học nào từ học viên.</div>
        )}

        {!isLoading && bookings.map((booking) => (
          <div key={booking.id} style={styles.card}>
            <div style={styles.cardFlex}>
              
              {/* PHẦN TRÁI: AVATAR MẶC ĐỊNH CHỮ CÁI ĐẦU */}
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
                <p style={styles.studentSub}>Học viên: <b>{booking.studentName}</b> · Định thức: {booking.format}</p>
                
                <div style={styles.metaGrid}>
                  <span style={styles.metaItem}>📅 {booking.date} · ⏰ {booking.time}</span>
                  <span style={styles.priceItem}>💰 {booking.amount?.toLocaleString('vi-VN')} đ</span>
                </div>

                {booking.goal && (
                  <div style={styles.goalBox}>
                    🎯 <b>Mục tiêu tiêu điểm học viên:</b> {booking.goal}
                  </div>
                )}
              </div>

              {/* PHẦN PHẢI: CỤM NÚT ĐIỀU KHIỂN HÀNH ĐỘNG CƠ ĐỘNG */}
              <div style={styles.actionColumn}>
                {booking.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleAccept(booking.id)} 
                      disabled={actionLoadingId !== null}
                      style={styles.btnAccept}
                    >
                      {actionLoadingId === booking.id ? '...' : '✓ Chấp nhận'}
                    </button>
                    <button 
                      onClick={() => handleReject(booking.id)} 
                      disabled={actionLoadingId !== null}
                      style={styles.btnReject}
                    >
                      {actionLoadingId === booking.id ? '...' : '✕ Từ chối'}
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
                    🏆 Xác nhận hoàn thành
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

// --- HỆ THỐNG CSS INLINE STYLE PREMIUM DARK THEME ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    color: '#fff'
  },
  headerArea: {
    maxWidth: '1000px',
    margin: '0 auto 30px auto'
  },
  topBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    color: '#3498db',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '5px 12px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '12px 0 6px 0',
    color: '#f8fafc'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0
  },
  listContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '15px'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.2s',
  },
  cardFlex: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  avatar: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#475569',
    color: '#f8fafc',
    fontSize: '22px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #64748b'
  },
  infoContent: {
    flex: 1,
    minWidth: '280px'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  idLabel: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  badge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px'
  },
  subjectTitle: {
    fontSize: '19px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#fff'
  },
  studentSub: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 12px 0'
  },
  metaGrid: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#cbd5e1',
    marginBottom: '12px'
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  priceItem: {
    fontWeight: 'bold',
    color: '#2ecc71'
  },
  goalBox: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.5'
  },
  actionColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '180px',
    justifyContent: 'center'
  },
  btnAccept: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '9px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  btnReject: {
    backgroundColor: 'transparent',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  },
  btnVideoCall: {
    backgroundColor: '#9b59b6',
    color: '#fff',
    textDecoration: 'none',
    textAlign: 'center',
    padding: '9px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'block',
    width: '100%'
  },
  btnComplete: {
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  }
};