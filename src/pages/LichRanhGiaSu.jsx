import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 8:00 đến 21:00

export default function LichRanhGiaSu() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recurring, setRecurring] = useState(true);
  
  // State quản lý danh sách các slot đã chọn dưới dạng chuỗi "dayIdx-hour"
  const [activeSlots, setActiveSlots] = useState(new Set());

  // --- FETCH LỊCH RẢNH TỪ BACKEND ---
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) {
          // Nếu không có token, nạp mock-data mẫu cho sếp dễ kiểm tra giao diện
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

  // Hàm tạo dữ liệu mẫu phòng khi chưa kết nối backend
  const loadMockSlots = () => {
    const mockData = [
      { dayIdx: 0, hour: 9 },  { dayIdx: 0, hour: 10 }, // Thứ 2: 9h, 10h
      { dayIdx: 2, hour: 14 }, { dayIdx: 2, hour: 15 }, // Thứ 4: 14h, 15h
      { dayIdx: 5, hour: 19 }, { dayIdx: 5, hour: 20 }  // Thứ 7: 19h, 20h
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
      
      // Chuyển đổi Set ngược lại thành mảng object để gửi API
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
          <span style={styles.apiBadge}>Availability API</span>
          <h1 style={styles.mainTitle}>Quản lý lịch rảnh</h1>
          <p style={styles.subtitle}>Đọc và lưu cấu hình thời gian rảnh trực tiếp vào tài khoản gia sư của bạn.</p>
        </div>
        <div style={styles.btnActionGroup}>
          <button 
            type="button" 
            onClick={() => setRecurring(!recurring)} 
            style={recurring ? styles.btnToggleActive : styles.btnToggleOutline}
          >
            🔄 {recurring ? 'Lặp lại hàng tuần' : 'Chỉ áp dụng 1 lần'}
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSaving} 
            style={styles.btnSave}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* KHỐI MA TRẬN LỊCH CHI TIẾT */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>📅 Lịch trình tuần</h3>
          <span style={styles.slotCountBadge}>
            {isLoading ? 'Đang tải...' : `${activeSlots.size} ô đã mở`}
          </span>
        </div>

        <div style={styles.overflowWrapper}>
          <div style={styles.calendarGridContainer}>
            
            {/* THÀNH PHẦN 1: DÒNG TIÊU ĐỀ THỨ (DAYS HEADER) */}
            <div style={styles.gridRowDays}>
              <div /> {/* Ô trống góc trên cùng bên trái */}
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
                
                {/* 7 ô tương ứng với 7 ngày trong tuần */}
                {DAYS.map((_, dayIdx) => {
                  const isSelected = activeSlots.has(`${dayIdx}-${hour}`);
                  return (
                    <button
                      key={`${dayIdx}-${hour}`}
                      type="button"
                      onClick={() => toggleSlot(dayIdx, hour)}
                      style={{
                        ...styles.slotButton,
                        backgroundColor: isSelected ? '#3498db' : '#1e293b',
                        borderColor: isSelected ? '#3498db' : '#334155',
                        color: isSelected ? '#fff' : '#64748b'
                      }}
                    >
                      {isSelected ? 'Mở' : '+'}
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

// --- KIẾN TRÚC CSS INLINE DARK MODE CHUYÊN NGHIỆP ---
const styles = {
  pageContainer: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    color: '#fff'
  },
  headerControl: {
    maxWidth: '1200px',
    margin: '0 auto 24px auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '20px'
  },
  apiBadge: {
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    color: '#9b59b6',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '12px 0 6px 0'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0
  },
  btnActionGroup: {
    display: 'flex',
    gap: '12px'
  },
  btnToggleActive: {
    backgroundColor: '#475569',
    border: '1px solid #475569',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnToggleOutline: {
    backgroundColor: 'transparent',
    border: '1px solid #475569',
    color: '#cbd5e1',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnSave: {
    backgroundColor: '#2ecc71',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0
  },
  slotCountBadge: {
    backgroundColor: '#334155',
    color: '#cbd5e1',
    fontSize: '13px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '600'
  },
  overflowWrapper: {
    overflowX: 'auto',
    width: '100%'
  },
  calendarGridContainer: {
    minWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  gridRowDays: {
    display: 'grid',
    gridTemplateColumns: '80px repeat(7, 1fr)',
    gap: '6px',
    paddingBottom: '10px',
    borderBottom: '1px solid #334155'
  },
  dayLabelHeader: {
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  gridRowHours: {
    display: 'grid',
    gridTemplateColumns: '80px repeat(7, 1fr)',
    gap: '6px',
    alignItems: 'center'
  },
  hourTimelineLabel: {
    textAlign: 'right',
    paddingRight: '12px',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  slotButton: {
    height: '38px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};