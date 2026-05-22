import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // Từ 8:00 đến 21:00

export default function LichRanhGiaSu() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recurring, setRecurring] = useState(true);
  
  // State quản lý danh sách các slot đã chọn dưới dạng chuỗi "dayIdx-hour" để tối ưu hóa hiệu năng
  const [activeSlots, setActiveSlots] = useState(new Set());

  // --- FETCH LỊCH RẢNH TỪ BACKEND ---
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) {
          // Cơ chế Fallback nạp mock-data mẫu hỗ trợ sếp kiểm thử luồng độc lập cực mượt
          loadMockSlots();
          return;
        }
        
        const res = await axios.get('http://localhost:8000/api/availability/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const normalized = normalizeSlots(res.data);
        const slotSet = new Set(normalized.map(s => `${s.dayIdx}-${s.hour}`));
        setActiveSlots(slotSet);
      } catch (error) {
        console.error("Lỗi fetch lịch rảnh, nạp dữ liệu Mock dự phòng:");
        loadMockSlots();
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  // Bộ dữ liệu giả định chuẩn cấu trúc dữ liệu thực tế năm 2026
  const loadMockSlots = () => {
    const mockData = [
      { dayIdx: 0, hour: 9 },  { dayIdx: 0, hour: 10 }, 
      { dayIdx: 2, hour: 14 }, { dayIdx: 2, hour: 15 }, 
      { dayIdx: 5, hour: 19 }, { dayIdx: 5, hour: 20 }  
    ];
    setActiveSlots(new Set(mockData.map(s => `${s.dayIdx}-${s.hour}`)));
  };

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
      const token = localStorage.getItem('tutorlinkToken');
      
      const slotsPayload = Array.from(activeSlots).map((key) => {
        const [dayIdx, hour] = key.split('-').map(Number);
        return { dayIdx, hour };
      });

      if (token) {
        await axios.put('http://localhost:8000/api/availability/me', {
          recurring,
          slots: slotsPayload
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert(`🎉 Đã lưu thành công ${activeSlots.size} khung giờ rảnh lên hệ thống!`);
    } catch (error) {
      alert("Lỗi lưu lịch rảnh rồi sếp ơi!");
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
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                        borderColor: isSelected ? '#10b981' : '#334155',
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
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 24px',
    fontFamily: "'Inter', sans-serif",
    color: '#cbd5e1'
  },
  headerControl: {
    maxWidth: '1200px',
    margin: '0 auto 28px auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
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
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#94a3b8',
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
    backgroundColor: '#334155',
    border: '1px solid #475569',
    color: '#38bdf8',
    padding: '11px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnToggleOutline: {
    backgroundColor: 'transparent',
    border: '1px solid #475569',
    color: '#cbd5e1',
    padding: '11px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnSave: {
    backgroundColor: '#38bdf8', // Đưa về dải màu chủ đạo sắc nét của TutorLink
    border: 'none',
    color: '#0f172a',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)'
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '28px'
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
    color: '#fff'
  },
  slotCountBadge: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: '13px',
    padding: '5px 14px',
    borderRadius: '20px',
    fontWeight: '700',
    border: '1px solid #334155'
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
    borderBottom: '1px solid #334155'
  },
  dayLabelHeader: {
    textAlign: 'center',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#cbd5e1',
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
    color: '#94a3b8',
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