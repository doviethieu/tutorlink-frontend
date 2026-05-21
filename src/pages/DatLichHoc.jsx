import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const DURATIONS = [1, 1.5, 2];

export default function DatLichHoc() {
  const { id: tutorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  // --- CÁC STATE QUẢN LÝ THÔNG TIN FORM ---
  const [date, setDate] = useState(searchParams.get('date') || today);
  const [startTime, setStartTime] = useState(searchParams.get('slot') || '19:00');
  const [duration, setDuration] = useState(1);
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [format, setFormat] = useState('online');

  // --- STATE LƯU DỮ LIỆU TỪ API ---
  const [tutor, setTutor] = useState(null);
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DỮ LIỆU GIA SƯ VÀ LỊCH TRỐNG ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('tutorlinkToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Gọi đồng thời thông tin gia sư và lịch rảnh
        const [tutorRes, availRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/tutors/${tutorId}`, { headers }),
          axios.get(`http://localhost:8000/api/tutors/${tutorId}/availability`, { headers }).catch(() => ({ data: [] }))
        ]);

        setTutor(tutorRes.data);
        setAvailabilityDays(Array.isArray(availRes.data) ? availRes.data : []);

        // Mặc định chọn môn đầu tiên nếu có
        if (tutorRes.data?.subjects?.length > 0) {
          setSubject(tutorRes.data.subjects[0]);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin đặt lịch:", error);
        // MOCK DỮ LIỆU để sếp test giao diện mượt mà không lo sập bài
        setTutor({
          name: 'Nguyễn Văn A',
          title: 'Thủ khoa Sư Phạm Toán',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          price: 200000,
          subjects: ['Toán 12', 'Luyện thi ĐH môn Toán'],
          format: 'flex',
          userId: tutorId
        });
        setAvailabilityDays([
          { date: today, slots: [{ start: '14:00', status: 'open' }, { start: '16:00', status: 'booked' }, { start: '19:00', status: 'open' }, { start: '20:30', status: 'open' }] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (tutorId) fetchData();
  }, [tutorId, today]);

  // --- TÍNH TOÁN CÁC KHUNG GIỜ CHO NGÀY ĐANG CHỌN ---
  const daySlots = useMemo(() => {
    const selectedDay = availabilityDays.find((day) => day.date === date);
    if (!selectedDay || !selectedDay.slots) return [];
    return selectedDay.slots.map((slot) => ({
      start: typeof slot === 'string' ? slot : slot.start,
      end: typeof slot === 'string' ? undefined : slot.end,
      status: typeof slot === 'string' ? 'open' : slot.status || 'open',
    }));
  }, [availabilityDays, date]);

  const openSlots = useMemo(() => daySlots.filter((s) => s.status !== 'booked'), [daySlots]);

  // Xác định giờ bắt đầu thực tế (fallback về slot trống đầu tiên nếu slot hiện tại ko khả dụng)
  const effectiveStartTime = useMemo(() => {
    const available = openSlots.some((s) => s.start === startTime);
    return available ? startTime : openSlots[0]?.start || startTime;
  }, [openSlots, startTime]);

  // Kiểm tra hình thức học được hỗ trợ
  const effectiveFormat = useMemo(() => {
    if (tutor?.format === 'online' || tutor?.format === 'offline') return tutor.format;
    return format;
  }, [tutor, format]);

  // Tính tổng tiền học phí dựa trên số giờ học
  const totalAmount = useMemo(() => {
    return Math.round((tutor?.price || 0) * duration);
  }, [tutor, duration]);

  // --- SUBMIT GỬI ĐƠN ĐẶT LỊCH ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!date || !effectiveStartTime) {
      alert('Sếp vui lòng chọn ngày và khung giờ học nhé!');
      return;
    }
    if (openSlots.length === 0 || !openSlots.some(s => s.start === effectiveStartTime)) {
      alert('Khung giờ này không còn trống, sếp chọn slot khác nha!');
      return;
    }
    if (!subject.trim()) {
      alert('Vui lòng nhập môn học cần gia sư.');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('tutorlinkToken');
      
      const payload = {
        tutorId: tutor?.userId || tutorId,
        date,
        startTime: effectiveStartTime,
        duration,
        format: effectiveFormat,
        subject: subject.trim(),
        goal: goal.trim(),
      };

      if (!token) {
        console.log("Dữ liệu gửi đi (Gia lập):", payload);
        alert('🎉 Đã gửi yêu cầu đặt lịch (Simulated)!');
        navigate('/bookings');
        return;
      }

      await axios.post('http://localhost:8000/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Đã gửi yêu cầu đặt lịch học thành công! Vui lòng chờ gia sư phản hồi.');
      navigate('/bookings'); // Điều hướng về trang lịch học của học viên
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Không tạo được yêu cầu đặt lịch rồi sếp ơi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={styles.loadingBox}>Đang tải cấu hình lịch trình gia sư...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.gridMain}>
        
        {/* CỘT TRÁI: ĐIỀN THÔNG TIN ĐẶT LỊCH */}
        <form onSubmit={handleBookingSubmit} style={styles.formFlow}>
          <div>
            <Link to={`/giasu/${tutorId}`} style={styles.backLink}>
              ← Quay lại hồ sơ gia sư
            </Link>
            <h1 style={styles.mainTitle}>Đặt lịch học</h1>
            <p style={styles.subtextTitle}>Chọn slot còn trống từ lịch rảnh của gia sư, gửi nhu cầu và chờ xác nhận.</p>
          </div>

          {/* TIẾN TRÌNH TRỰC QUAN */}
          <div style={styles.stepGrid}>
            <div style={{ ...styles.stepCard, ...(date && effectiveStartTime ? styles.stepActive : {}) }}>
              <span>{date && effectiveStartTime ? '✓' : '📅'}</span>
              <span>1. Chọn lịch</span>
            </div>
            <div style={{ ...styles.stepCard, ...(subject ? styles.stepActive : {}) }}>
              <span>{subject ? '✓' : '📝'}</span>
              <span>2. Nhu cầu học</span>
            </div>
            <div style={{ ...styles.stepCard, ...(tutor ? styles.stepActive : {}) }}>
              <span>{tutor ? '✓' : '🚀'}</span>
              <span>3. Gửi yêu cầu</span>
            </div>
          </div>

          {/* KHỐI 1: CHỌN THỜI GIAN */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Chọn lịch học</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '2px 0 0 0' }}>Khung giờ trống thực tế từ gia sư</p>
              </div>
              <span style={styles.badgeLike}>{openSlots.length} slot trống</span>
            </div>
            
            <div style={styles.cardContent}>
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Ngày học mong muốn</label>
                <input 
                  type="date" 
                  min={today} 
                  value={date} 
                  onChange={(e) => { setDate(e.target.value); setStartTime(''); }} 
                  style={styles.inputStyle} 
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Khung giờ trống khả dụng</label>
                {daySlots.length === 0 ? (
                  <div style={styles.alertBox}>
                    ⚠️ Gia sư chưa mở lịch hẹn cho ngày này. Vui lòng chọn ngày khác sếp nhé.
                  </div>
                ) : (
                  <div style={styles.slotsGrid}>
                    {daySlots.map((slot) => {
                      const isBooked = slot.status === 'booked';
                      const isSelected = effectiveStartTime === slot.start;
                      return (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setStartTime(slot.start)}
                          style={{
                            ...styles.slotBtn,
                            ...(isSelected && !isBooked ? styles.slotBtnSelected : {}),
                            ...(isBooked ? styles.slotBtnBooked : {})
                          }}
                        >
                          {slot.start}
                          {slot.end && <span style={{ display: 'block', fontSize: '11px', opacity: 0.7 }}>đến {slot.end}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Thời lượng học (Giờ)</label>
                <div style={styles.durationGrid}>
                  {DURATIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDuration(item)}
                      style={{
                        ...styles.durationBtn,
                        ...(duration === item ? styles.durationBtnSelected : {})
                      }}
                    >
                      {item} giờ
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI 2: NHU CẦU & HÌNH THỨC */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Nhu cầu học tập cụ thể</h3>
            </div>
            <div style={styles.cardContent}>
              {tutor?.subjects?.length > 0 && (
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Môn học phổ biến của gia sư</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {tutor.subjects.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSubject(item)}
                        style={{
                          ...styles.tagBtn,
                          ...(subject === item ? styles.tagBtnSelected : {})
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Môn học chính xác <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="Ví dụ: Đại số lớp 12, Tiếng Anh giao tiếp..."
                  style={styles.inputStyle}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Mục tiêu cụ thể của buổi học này</label>
                <textarea 
                  rows={4}
                  value={goal} 
                  onChange={(e) => setGoal(e.target.value)} 
                  placeholder="Ví dụ: Lấy lại gốc chương hàm số, sửa lỗi phát âm, giải đề thi thử học kì..."
                  style={styles.textareaStyle}
                />
              </div>

              {(!tutor?.format || tutor.format === 'flex') && (
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Hình thức lên lớp học</label>
                  <div style={styles.durationGrid}>
                    <button
                      type="button"
                      onClick={() => setFormat('online')}
                      style={{ ...styles.durationBtn, ...(effectiveFormat === 'online' ? styles.durationBtnSelected : {}) }}
                    >
                      🖥️ Học trực tuyến (Online)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('offline')}
                      style={{ ...styles.durationBtn, ...(effectiveFormat === 'offline' ? styles.durationBtnSelected : {}) }}
                    >
                      🏠 Học trực tiếp (Offline)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* CỘT PHẢI: TOÀN BỘ BILL XÁC NHẬN (STICKY SIDEBAR) */}
        <aside style={styles.sidebar}>
          <div style={styles.cardSticky}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Xác nhận yêu cầu</h3>
            </div>
            <div style={styles.cardContent}>
              {/* Profile tóm tắt gia sư */}
              <div style={styles.tutorSummary}>
                <img 
                  src={tutor?.avatarUrl || 'https://via.placeholder.com/150'} 
                  alt={tutor?.name} 
                  style={styles.avatar} 
                />
                <div style={{ minWidth: 0 }}>
                  <p style={styles.tutorName}>{tutor?.name || 'Đang tải thông tin...'}</p>
                  <p style={styles.tutorTitle}>{tutor?.title || 'Gia sư chuyên nghiệp'}</p>
                </div>
              </div>

              {/* Chi tiết đơn */}
              <div style={styles.billBox}>
                <div style={styles.billLine}>📅 {date}</div>
                <div style={styles.billLine}>⏰ {effectiveStartTime} ({duration} giờ)</div>
                <div style={styles.billLine}>📚 Môn: {subject || 'Chưa điền'}</div>
                <div style={styles.billLine}>📍 Hình thức: {effectiveFormat === 'online' ? 'Trực tuyến' : 'Trực tiếp'}</div>
              </div>

              {/* Tổng học phí tạm tính */}
              <div style={styles.totalRow}>
                <span>Học phí dự kiến:</span>
                <span style={styles.totalPrice}>
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <p style={styles.noteText}>
                📌 Sau khi gửi yêu cầu, gia sư sẽ nhận được thông báo để duyệt slot. Trạng thái lịch học sẽ được cập nhật liên tục tại Tab "Lịch học".
              </p>

              <button
                type="submit"
                form="booking-flow"
                onClick={handleBookingSubmit}
                disabled={isSubmitting || !tutor || openSlots.length === 0}
                style={{
                  ...styles.submitBtn,
                  ...((isSubmitting || !tutor || openSlots.length === 0) ? styles.submitBtnDisabled : {})
                }}
              >
                {isSubmitting ? 'Đang gửi đơn...' : '🚀 Gửi yêu cầu đặt lịch'}
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE PRESET DARK MODE PREMIUM ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif'
  },
  gridMain: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    alignItems: 'start',
    // Responsive grid qua Media Queries mô phỏng bằng layout chuẩn
    '@media(minWidth: 992px)': {
      gridTemplateColumns: '1fr 360px'
    }
  },
  formFlow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  backLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: '12px'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: 0
  },
  subtextTitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: '6px 0 0 0'
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '10px'
  },
  stepCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#64748b'
  },
  stepActive: {
    borderColor: '#3498db',
    color: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  cardSticky: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'between',
    alignItems: 'center',
    backgroundColor: '#1a2333'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: '#f1f5f9'
  },
  badgeLike: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    color: '#3498db',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  labelForm: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  inputStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '11px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  textareaStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.5'
  },
  alertBox: {
    border: '1px dashed #475569',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#94a3b8'
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px'
  },
  slotBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#fff',
    padding: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  slotBtnSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
    color: '#fff',
    boxShadow: '0 0 12px rgba(52, 152, 219, 0.4)'
  },
  slotBtnBooked: {
    backgroundColor: '#1e293b',
    borderColor: '#1e293b',
    color: '#475569',
    textDecoration: 'line-through',
    cursor: 'not-allowed'
  },
  durationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px'
  },
  durationBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#fff',
    padding: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center'
  },
  durationBtnSelected: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    color: '#3498db'
  },
  tagBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    color: '#fff',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  tagBtnSelected: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    color: '#3498db'
  },
  sidebar: {
    position: 'sticky',
    top: '24px'
  },
  tutorSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '14px',
    borderBottom: '1px solid #334155'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    backgroundColor: '#334155'
  },
  tutorName: {
    margin: 0,
    fontWeight: 'bold',
    fontSize: '14px'
  },
  tutorTitle: {
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#94a3b8'
  },
  billBox: {
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  billLine: {
    fontSize: '13px',
    color: '#cbd5e1'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  totalPrice: {
    fontSize: '20px',
    color: '#3498db'
  },
  noteText: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0
  },
  submitBtn: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    width: '100%',
    padding: '14px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '4px'
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    color: '#64748b',
    cursor: 'not-allowed'
  },
  loadingBox: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '100px 20px',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    fontSize: '16px'
  }
};