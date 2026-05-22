import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { tutorService } from '../../services/tutor.service';
import { availabilityService } from '../../services/availability.service';
import { bookingService } from '../../services/booking.service';

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
        const [tutorData, availabilityData] = await Promise.all([
          tutorService.get(tutorId),
          availabilityService.getTutorAvailability(tutorId).catch(() => [])
        ]);

        setTutor(tutorData);
        setAvailabilityDays(Array.isArray(availabilityData) ? availabilityData : []);

        if (tutorData?.subjects?.length > 0) {
          setSubject(tutorData.subjects[0]);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin đặt lịch:", error);
        setTutor(null);
        setAvailabilityDays([]);
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

  const effectiveStartTime = useMemo(() => {
    const available = openSlots.some((s) => s.start === startTime);
    return available ? startTime : openSlots[0]?.start || startTime;
  }, [openSlots, startTime]);

  const effectiveFormat = useMemo(() => {
    if (tutor?.format === 'online' || tutor?.format === 'offline') return tutor.format;
    return format;
  }, [tutor, format]);

  const totalAmount = useMemo(() => {
    return Math.round((tutor?.price || 0) * duration);
  }, [tutor, duration]);

  // --- SUBMIT GỬI ĐƠN ĐẶT LỊCH ---
  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

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
      const payload = {
        tutorId: tutor?._id || tutor?.id || tutorId,
        date,
        startTime: effectiveStartTime,
        duration,
        format: effectiveFormat,
        subject: subject.trim(),
        goal: goal.trim(),
      };

      const token = localStorage.getItem('tutorlinkToken');
      if (!token) {
        alert('Bạn cần đăng nhập để đặt lịch học.');
        navigate('/login');
        return;
      }

      const booking = await bookingService.create(payload);

      alert('🎉 Đã gửi yêu cầu đặt lịch học thành công! Tiếp theo hãy thanh toán để giữ tiền an toàn trong escrow.');
      navigate('/payment', {
        state: {
          bookingInfo: booking,
          totalAmount: booking.amount || totalAmount,
          tutorName: tutor?.name || tutor?.fullName || 'Gia sư hệ thống',
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error?.message || 'Không tạo được yêu cầu đặt lịch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={styles.loadingBox}>⏳ Đang tải cấu hình lịch trình gia sư tinh tú...</div>;
  }

  return (
    <div style={styles.container}>
      {/* 🛠️ ĐÃ SỬA: Thêm id="booking-flow" để ăn khớp với nút submit bên ngoài */}
      <div style={styles.gridMain}>
        
        {/* CỘT TRÁI: ĐIỀN THÔNG TIN ĐẶT LỊCH */}
        <form id="booking-flow" onSubmit={handleBookingSubmit} style={styles.formFlow}>
          <div>
            <Link to={`/giasu/${tutorId}`} style={styles.backLink}>
              ← Quay lại hồ sơ gia sư
            </Link>
            <h1 style={styles.mainTitle}>Đặt lịch học</h1>
            <p style={styles.subtextTitle}>Chọn slot còn trống từ lịch rảnh của gia sư, gửi nhu cầu và chờ xác nhận.</p>
          </div>

          {/* TIẾN TRÌNH TRỰC QUAN (Đồng bộ màu sắc hệ thống) */}
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
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Khung giờ trống thực tế từ gia sư</p>
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

              <div style={styles.billBox}>
                <div style={styles.billLine}>📅 Ngày: **{date}**</div>
                <div style={styles.billLine}>⏰ Giờ: **{effectiveStartTime}** ({duration} giờ)</div>
                <div style={styles.billLine}>📚 Môn: **{subject || 'Chưa chọn'}**</div>
                <div style={styles.billLine}>📍 Lớp: **{effectiveFormat === 'online' ? 'Trực tuyến' : 'Trực tiếp'}**</div>
              </div>

              <div style={styles.totalRow}>
                <span>Học phí dự kiến:</span>
                <span style={styles.totalPrice}>
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <p style={styles.noteText}>
                📌 Sau khi gửi yêu cầu, bạn sẽ chuyển sang bước thanh toán. Học phí được giữ trong escrow và chỉ giải ngân sau khi buổi học hoàn thành.
              </p>

              <button
                type="submit"
                form="booking-flow" // Đã kích hoạt liên kết chuẩn xác với id form bên trái
                disabled={isSubmitting || !tutor || openSlots.length === 0}
                style={{
                  ...styles.submitBtn,
                  ...((isSubmitting || !tutor || openSlots.length === 0) ? styles.submitBtnDisabled : {})
                }}
              >
                {isSubmitting ? '⏳ Đang gửi đơn...' : '🚀 Gửi yêu cầu & thanh toán'}
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

// --- 🛠️ ĐÃ CẬP NHẬT: BỘ CSS INLINE CHUẨN SLATE DARK-MODE PREMIUM ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 6%',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif"
  },
  // 🛠️ ĐÃ SỬA: Responsive layout qua CSS Grid tự động, thay thế cho đoạn mô phỏng cũ lỗi thời
  gridMain: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    alignItems: 'start'
  },
  formFlow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    gridColumn: 'span 1',
    // Nếu màn hình lớn hơn 992px thì ép cột form rộng hơn cột bill nhận đơn
    flex: '1 1 65%'
  },
  backLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '12px',
    transition: '0.2s'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '800',
    margin: 0,
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtextTitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: '6px 0 0 0',
    lineHeight: '1.5'
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#64748b'
  },
  stepActive: {
    borderColor: '#38bdf8', // Đổi sang Sky Blue đồng bộ thương hiệu
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    overflow: 'hidden'
  },
  cardSticky: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
  },
  cardHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    color: '#fff'
  },
  badgeLike: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Màu Cam Neon thương hiệu giống Auth
    color: '#f97316',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },
  cardContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  labelForm: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#cbd5e1'
  },
  inputStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: '0.2s'
  },
  textareaStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    fontFamily: "'Inter', sans-serif",
    lineHeight: '1.6'
  },
  alertBox: {
    border: '1px dashed #475569',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '13.5px',
    color: '#94a3b8',
    lineHeight: '1.5'
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
    gap: '10px'
  },
  slotBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px 10px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  slotBtnSelected: {
    backgroundColor: '#38bdf8', // Đổi sang dải Sky Blue mới
    borderColor: '#38bdf8',
    color: '#0f172a',
    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)'
  },
  slotBtnBooked: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#475569',
    textDecoration: 'line-through',
    cursor: 'not-allowed'
  },
  durationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '10px'
  },
  durationBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#fff',
    padding: '14px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
    transition: '0.2s'
  },
  durationBtnSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    color: '#38bdf8'
  },
  tagBtn: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    color: '#e2e8f0',
    padding: '6px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s'
  },
  tagBtnSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    color: '#38bdf8'
  },
  sidebar: {
    gridColumn: 'span 1',
    position: 'sticky',
    top: '24px',
    flex: '1 1 35%'
  },
  tutorSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    paddingBottom: '16px',
    borderBottom: '1px solid #334155'
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '12px', // Đồng bộ bo góc avatar thẻ vuông hiện đại giống danh sách gia sư
    objectFit: 'cover',
    backgroundColor: '#334155'
  },
  tutorName: {
    margin: 0,
    fontWeight: '700',
    fontSize: '14.5px',
    color: '#fff'
  },
  tutorTitle: {
    margin: '4px 0 0 0',
    fontSize: '12.5px',
    color: '#94a3b8'
  },
  billBox: {
    backgroundColor: '#0f172a',
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    border: '1px solid #233145'
  },
  billLine: {
    fontSize: '13.5px',
    color: '#cbd5e1',
    lineHeight: '1.4'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    fontSize: '14.5px',
    fontWeight: '700'
  },
  totalPrice: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#10b981' // Màu xanh Emerald cực tín của hóa đơn thực tế
  },
  noteText: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '4px 0'
  },
  submitBtn: {
    backgroundColor: '#38bdf8', // Đổi chữ tối trên nền Sky sáng để tăng tính tương phản
    color: '#0f172a',
    border: 'none',
    width: '100%',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '4px',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)'
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    color: '#64748b',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  loadingBox: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '120px 20px',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif"
  }
};
