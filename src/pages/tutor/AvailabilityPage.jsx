import React, { useState, useEffect } from 'react';
import { availabilityService } from '../../services/availability.service';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // Từ 8:00 đến 21:00

export default function LichRanhGiaSu() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recurring, setRecurring] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // State quản lý danh sách các slot đã chọn dưới dạng chuỗi "dayIdx-hour" để tối ưu hóa hiệu năng
  const [activeSlots, setActiveSlots] = useState(new Set());

  // --- FETCH LỊCH RẢNH TỪ BACKEND ---
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await availabilityService.getMine();
        const normalized = normalizeSlots(data);
        const slotSet = new Set(normalized.map(s => `${s.dayIdx}-${s.hour}`));
        setActiveSlots(slotSet);
      } catch (error) {
        console.error("Lỗi fetch lịch rảnh:", error);
        setErrorMessage(error.response?.data?.error?.message || 'Không tải được lịch rảnh. Vui lòng kiểm tra hồ sơ gia sư hoặc đăng nhập lại.');
        setActiveSlots(new Set());
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  // --- CHUYỂN ĐỔI CHUẨN HÓA DỮ LIỆU ---
  const normalizeSlots = (payload) => {
    if (!Array.isArray(payload)) return [];
    return payload.map((slot) => ({
      dayIdx: Number(slot.dayIdx ?? slot.day_idx ?? 0),
      hour: Number(slot.hour ?? 0),
    }));
  };

  // --- BẬT/TẮT NHANH MỘT Ô LỊCH RẢNH ---
  const toggleSlot = (dayIdx, hour) => {
    const key = `${dayIdx}-${hour}`;
    const nextSlots = new Set(activeSlots);
    
    if (nextSlots.has(key)) {
      nextSlots.delete(key);
    } else {
      nextSlots.add(key);
    }
    setActiveSlots(nextSlots);
  };

  // --- GỬI DỮ LIỆU ĐÃ SỬA LÊN SERVER ---
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const slotsPayload = Array.from(activeSlots).map((key) => {
        const [dayIdx, hour] = key.split('-').map(Number);
        return { dayIdx, hour };
      });

      await availabilityService.replaceMine({
        recurring,
        slots: slotsPayload
      });
      
      alert(`🎉 Đã lưu thành công ${activeSlots.size} khung giờ rảnh lên hệ thống!`);
    } catch (error) {
      alert(error.response?.data?.error?.message || "Lỗi lưu lịch rảnh rồi sếp ơi!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* KHỐI HEADER BẢNG ĐIỀU KHIỂN */}
      <div style={styles.headerControl}>
        <div>
          <span style={styles.apiBadge}>Availability Engine</span>
          <h1 style={styles.mainTitle}>Thiết lập lịch rảnh dạy</h1>
          <p style={styles.subtitle}>Click chọn các khung giờ sếp có thể nhận lớp. Học viên sẽ dựa vào lịch này để đặt lịch học.</p>
        </div>
        <div style={styles.btnActionGroup}>
          <button 
            type="button" 
            onClick={() => setRecurring(!recurring)} 
            style={recurring ? styles.btnToggleActive : styles.btnToggleOutline}
          >
            🔄 {recurring ? 'Lặp lại hàng tuần' : 'Chỉ áp dụng tuần này'}
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving} 
            style={styles.btnSave}
          >
            {isSaving ? 'Đang lưu lịch...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div style={styles.errorCard}>{errorMessage}</div>
      )}

      {/* KHỐI MA TRẬN LỊCH CHI TIẾT */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>📅 Ma trận thời gian chi tiết</h3>
          <span style={styles.slotCountBadge}>
            {isLoading ? 'Đang cập nhật...' : `Đã mở ${activeSlots.size} khung giờ rảnh`}
          </span>
        </div>

        <div style={styles.overflowWrapper}>
          <div style={styles.calendarGridContainer}>
            
            {/* THÀNH PHẦN 1: DÒNG TIÊU ĐỀ THỨ (DAYS HEADER) */}
            <div style={styles.gridRowDays}>
              <div /> {/* Ô trống căn lề góc trên bên trái */}
              {DAYS.map((day) => (
                <div key={day} style={styles.dayLabelHeader}>{day}</div>
              ))}
            </div>

            {/* THÀNH PHẦN 2: DANH SÁCH CÁC KHUNG GIỜ CHI TIẾT */}
            {HOURS.map((hour) => (
              <div key={hour} style={styles.gridRowHours}>
                {/* Cột mốc giờ */}
                <div style={styles.hourTimelineLabel}>
                  {String(hour).padStart(2, '0')}:00
                </div>
                
                {/* 7 ô tương ứng với các thứ trong tuần */}
                {DAYS.map((_, dayIdx) => {
                  const isSelected = activeSlots.has(`${dayIdx}-${hour}`);
                  return (
                    <button
                      key={`${dayIdx}-${hour}`}
                      type="button"
                      onClick={() => toggleSlot(dayIdx, hour)}
                      title={`Thứ ${dayIdx + 2} lúc ${hour}:00`}
                      style={{
                        ...styles.slotButton,
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : '#FFFFFF',
                        borderColor: isSelected ? '#10b981' : '#E7DED2',
                        boxShadow: isSelected ? '0 0 8px rgba(16, 185, 129, 0.15)' : 'none'
                      }}
                    >
                      {/* Bỏ chữ text thô, dùng điểm tròn tín hiệu tinh tế chuẩn e-calendar */}
                      <span style={{
                        ...styles.statusDot,
                        backgroundColor: isSelected ? '#10b981' : 'transparent'
                      }} />
                    </button>
                  );
                })}
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
}

// --- 🛠️ HỆ THỐNG CSS INLINE PRESET DARK SLATE PREMIUM ĐỒNG BỘ MƯỚT MẮT ---
const styles = {
  pageContainer: {
    backgroundColor: '#FAF7F0',
    minHeight: '100vh',
    padding: '40px 24px',
    fontFamily: "'Inter', sans-serif",
    color: '#1E293B'
  },
  headerControl: {
    maxWidth: '1200px',
    margin: '0 auto 28px auto',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  apiBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    color: '#a855f7',
    fontSize: '11.5px',
    fontWeight: '700',
    padding: '5px 12px',
    borderRadius: '20px',
    display: 'inline-block',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    letterSpacing: '0.5px'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '14px 0 6px 0',
    color: '#1E293B',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#5F6B7A',
    fontSize: '14.5px',
    margin: 0,
    lineHeight: '1.5'
  },
  btnActionGroup: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap'
  },
  btnToggleActive: {
    backgroundColor: '#E7DED2',
    border: '1px solid #7C6F64',
    color: '#C05A3E',
    padding: '11px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnToggleOutline: {
    backgroundColor: 'transparent',
    border: '1px solid #7C6F64',
    color: '#1E293B',
    padding: '11px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnSave: {
    backgroundColor: '#C05A3E', // Đưa về dải màu chủ đạo sắc nét của TutorLink
    border: 'none',
    color: '#FAF7F0',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(192, 90, 62, 0.2)'
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    borderRadius: '16px',
    padding: '28px'
  },
  errorCard: {
    maxWidth: '1200px',
    margin: '0 auto 18px auto',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    borderRadius: '12px',
    padding: '14px 18px',
    fontSize: '13.5px',
    fontWeight: '700'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
    color: '#1E293B'
  },
  slotCountBadge: {
    backgroundColor: '#FAF7F0',
    color: '#5F6B7A',
    fontSize: '13px',
    padding: '5px 14px',
    borderRadius: '20px',
    fontWeight: '700',
    border: '1px solid #E7DED2'
  },
  overflowWrapper: {
    overflowX: 'auto',
    width: '100%'
  },
  calendarGridContainer: {
    minWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  gridRowDays: {
    display: 'grid',
    gridTemplateColumns: '90px repeat(7, 1fr)',
    gap: '8px',
    paddingBottom: '14px',
    borderBottom: '1px solid #E7DED2'
  },
  dayLabelHeader: {
    textAlign: 'center',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: '0.3px'
  },
  gridRowHours: {
    display: 'grid',
    gridTemplateColumns: '90px repeat(7, 1fr)',
    gap: '8px',
    alignItems: 'center'
  },
  hourTimelineLabel: {
    textAlign: 'right',
    paddingRight: '16px',
    fontSize: '13px',
    color: '#5F6B7A',
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  slotButton: {
    height: '42px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    transition: 'all 0.15s ease-in-out'
  }
};
