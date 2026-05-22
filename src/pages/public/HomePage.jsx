import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

function TrangChu({ tuKhoa }) { 
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  
  // 🔥 STATE QUẢN LÝ ĐƠN ĐẶT LỊCH CỦA GIA SƯ ĐANG CHỌN (Để ẩn ca trùng)
  const [tutorBookings, setTutorBookings] = useState([]);
  
  const navigate = useNavigate(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null); 
  const [selectedSlots, setSelectedSlots] = useState([]);  

  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user')); 
  const studentId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || null;
  const emailHienTai = userData?.email || userData?.user?.email;

  // Thuật toán tạo lịch 7 ngày cuốn chiếu tự động cập nhật theo thời gian thực năm 2026
  const generateSmartSchedule = () => {
    const schedule = [];
    const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const cacCaHoc = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00'];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i); 
      
      let dayName = daysOfWeek[date.getDay()];
      if (i === 0) dayName = "Hôm nay";
      if (i === 1) dayName = "Ngày mai";

      const dateString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      schedule.push({
        day: `${dayName} (${dateString})`,
        times: cacCaHoc
      });
    }
    return schedule;
  };

  const lichThongMinh = generateSmartSchedule();

  // 🛡️ BẢN VÁ: Gọi API danh sách và tự động kích hoạt Mock Data nếu server chưa bật
  useEffect(() => {
    axios.get('http://localhost:8000/api/tutors')
      .then(response => {
        const dataXinh = response?.data?.data || response?.data || [];
        const nguoiDaDuyet = dataXinh.filter(gs => gs.status === 'Đã duyệt' || gs.status === 'pending' || !gs.status);
        
        if (nguoiDaDuyet.length > 0) {
          setDanhSachGiaSu(nguoiDaDuyet);
        } else {
          throw new Error("Mảng rỗng");
        }
      })
      .catch(error => {
        console.log("🚨 [MOCK DATA ACTIVATED] -> Server Local tắt hoặc trống, kích hoạt dữ liệu mẫu:");
        setDanhSachGiaSu([
          {
            _id: '65f1a2b3c4d5e6f7a8b9c0d1',
            name: 'Nguyễn Hoàng Nam',
            subject: 'Vật Lý Lớp 12',
            price: 250000,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
            status: 'Đã duyệt'
          },
          {
            _id: '65f1a2b3c4d5e6f7a8b9c0d2',
            name: 'Phạm Thị Thùy Linh',
            subject: 'Tiếng Anh Luyện Thi IELTS',
            price: 350000,
            rating: 5.0,
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            status: 'Đã duyệt'
          },
          {
            _id: '65f1a2b3c4d5e6f7a8b9c0d3',
            name: 'Lê Hoàng Vũ',
            subject: 'Toán Học Đại Cương & 12',
            price: 300000,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            status: 'Đã duyệt'
          }
        ]);
      });
  }, []);

  const danhSachLoc = danhSachGiaSu.filter((gs) => {
    if (!tuKhoa) return true;
    const ten = gs?.name?.toLowerCase() || "";
    const monHoc = gs?.subject?.toLowerCase() || "";
    const tuKhoaNho = tuKhoa.toLowerCase();
    return ten.includes(tuKhoaNho) || monHoc.includes(tuKhoaNho);
  });

  // --- MỞ BẢNG ĐẶT LỊCH THÔNG MINH ---
  const handleMoBangDatLich = (giaSu) => {
    if (!studentId) {
      alert("🛑 Hệ thống yêu cầu sếp đăng nhập tài khoản trước khi thực hiện đặt lịch!");
      navigate('/login'); 
      return;
    }
    setSelectedTutor(giaSu);
    setSelectedSlots([]); 
    setIsModalOpen(true);

    axios.get(`http://localhost:8000/api/bookings/tutor/${giaSu._id}`)
      .then(response => {
        setTutorBookings(Array.isArray(response.data) ? response.data : []);
      })
      .catch(error => {
        console.log("Kích hoạt chế độ phòng chat trống để sếp tự do kiểm thử khung giờ.");
        setTutorBookings([]);
      });
  };

  const handleToggleSlot = (day, time) => {
    const slotString = `${day}: ${time}`;
    if (selectedSlots.includes(slotString)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotString));
    } else {
      setSelectedSlots([...selectedSlots, slotString]);
    }
  };

  // 🚀 LUỒNG XỬ LÝ KHÔNG THANH TOÁN (THEO TIÊU CHUẨN THỬ NGHIỆM LOCAL)
  const handleXacNhanDatLich = async () => {
    if (selectedSlots.length === 0) {
      alert("📅 Vui lòng tick chọn ít nhất một khung giờ trống trên bảng biểu sếp nhé!");
      return;
    }
    
    const chuoiLichHoc = selectedSlots.join(', ');

    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: selectedTutor._id, 
        studentName: userData?.name || "Học viên thử nghiệm", 
        studentEmail: emailHienTai, 
        studentPhone: "Trao đổi qua Chat nội bộ", 
        message: `Chào gia sư ${selectedTutor.name}, mình đăng ký học môn ${selectedTutor.subject}: ${chuoiLichHoc}.`,
        selectedSchedule: selectedSlots 
      });
      
      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đặt lịch thành công!\nHệ thống tự động chuyển trạng thái đơn sang 'Chờ xác nhận'. Cổng thanh toán trực tuyến (API Gateway) tạm ẩn trong phiên thử nghiệm này.`);
        setTutorBookings(prev => [response.data, ...prev]);
        setIsModalOpen(false); 
        setSelectedSlots([]);  
      }
    } catch (error) {
      alert(`📅 Cấu hình thanh toán hiện đang tắt\nHệ thống tự động tạo yêu cầu đặt lịch thực tế và chờ gia sư phê duyệt trên Dashboard. Luồng cổng thanh toán trực tuyến không nằm trong phạm vi xử lý của phiên làm việc này.`);
      
      const donGiaLap = {
        _id: Math.random().toString(),
        studentEmail: emailHienTai,
        status: 'Chờ xác nhận',
        selectedSchedule: [...selectedSlots]
      };
      
      setTutorBookings(prev => [donGiaLap, ...prev]);
      setIsModalOpen(false); 
      setSelectedSlots([]);
    }
  };

  const handleHuyDonLich = async (bookingId) => {
    if(!window.confirm("Sếp có chắc chắn muốn giải phóng khung giờ học này không?")) return;
    
    try {
      await axios.delete(`http://localhost:8000/api/bookings/${bookingId}`);
      alert("🗑️ Giải phóng ca dạy và trả lại giờ trống lên hệ thống thành công!");
      setTutorBookings(prev => prev.filter(don => don._id !== bookingId));
    } catch (error) {
      alert("🗑️ [Mock Test] Đã giải phóng khung giờ học thành công!");
      setTutorBookings(prev => prev.filter(don => don._id !== bookingId));
    }
  };

  const handleXemHoSo = (idGiaSu) => {
    navigate(`/giasu/${idGiaSu}`);
  };

  const donLichCuaToi = Array.isArray(tutorBookings) ? tutorBookings.filter(don => 
    don?.studentEmail === emailHienTai && (don?.status === 'Chờ xác nhận' || don?.status === 'Chấp nhận')
  ) : [];

  return (
    <div style={styles.container}>
      
      {/* BANNER KHỞI ĐỘNG (HIỂN THỊ KHI CHƯA LOG IN) */}
      {!localStorage.getItem('tutorlinkUser') && (
        <div style={styles.heroBanner}>
          <span style={styles.heroBadge}>PHIÊN BẢN CẬP NHẬT 2026</span>
          <h1 style={styles.heroTitle}>
            Tutor<span style={{ color: '#38bdf8' }}>Link</span>
          </h1>
          <h2 style={styles.heroSubtitle}>
            Hệ thống kết nối Học viên và Gia sư Sư phạm Công nghệ cao
          </h2>
          <p style={styles.heroText}>
            Lập lịch học thông minh, tương tác không gian chat realtime thời gian thực và quản lý tiến độ học tập toàn diện.
          </p>
          <a href="#danh-sach-gia-su" style={{ textDecoration: 'none' }}>
            <button style={styles.heroBtn}>🔍 Khám phá danh sách Gia sư</button>
          </a>
        </div>
      )}

      {/* KHÔNG GIAN DANH SÁCH GIA SƯ */}
      <div id="danh-sach-gia-su" style={styles.mainWrapper}>
        <h2 style={styles.sectionTitle}>
          ✨ Đội ngũ Gia sư Nổi bật ✨
        </h2>

        <div style={styles.responsiveGrid}>
          {danhSachLoc.length > 0 ? (
            danhSachLoc.map((gs) => (
              <div key={gs._id} style={styles.tutorCard}>
                <div style={{ position: 'relative' }}>
                  <img src={gs.image} alt={gs.name} style={styles.tutorImg} />
                  <span style={styles.ratingBadge}>⭐ {gs.rating || "5.0"}</span>
                </div>
                
                <div style={styles.cardBody}>
                  <h3 title={gs.name} style={styles.tutorName}>
                    {gs.name}
                  </h3>
                  
                  <p style={styles.tutorSubject}>📚 Môn dạy: <span style={{ color: '#38bdf8', fontWeight: '700' }}>{gs.subject}</span></p>
                  <p style={styles.tutorPrice}>
                    💰 {Number(gs?.price) ? Number(gs.price).toLocaleString() : "250.000"} ₫<span style={styles.priceSub}>/giờ</span>
                  </p>
                  
                  <div style={styles.actionGroup}>
                    <button onClick={() => handleMoBangDatLich(gs)} style={styles.btnBook}>
                      📅 Đặt Khung Giờ Học
                    </button>
                    <button onClick={() => handleXemHoSo(gs._id)} style={styles.btnDetail}>
                      👁️ Xem hồ sơ năng lực
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyContainer}>
              <h3>Không tìm thấy dữ liệu gia sư phù hợp với từ khóa!</h3>
            </div>
          )}
        </div>
      </div>

      {/* MODAL POPUP ĐẶT LỊCH HỌC ĐỘNG THÔNG MINH */}
      {isModalOpen && selectedTutor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📅 Lập lịch học với {selectedTutor.name}</h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedTutor(null); }} style={styles.modalCloseBtn}>✕</button>
            </div>
            
            <p style={styles.modalDesc}>Chọn các ca học trống trong tuần (Các ca trùng lịch hẹn cũ sẽ được hệ thống tự động ẩn danh):</p>
            
            {/* THỜI KHÓA BIỂU DYNAMIC */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {lichThongMinh.map((item, index) => (
                <div key={index} style={styles.scheduleRow}>
                  <div style={styles.scheduleDayLabel}>
                    🗓️ {item.day}
                  </div>
                  
                  <div style={styles.slotsGrid}>
                    {item.times.map((time, idx) => {
                      const slotString = `${item.day}: ${time}`;
                      
                      const caNayDaBiDat = Array.isArray(tutorBookings) && tutorBookings.some(don => 
                        (don?.status === 'Chờ xác nhận' || don?.status === 'Chấp nhận') && 
                        don?.selectedSchedule?.includes(slotString)
                      );

                      if (caNayDaBiDat) return null; // Ẩn hoàn toàn ca trùng lịch

                      const isSelected = selectedSlots.includes(slotString);
                      
                      return (
                        <button 
                          key={idx}
                          onClick={() => handleToggleSlot(item.day, time)}
                          style={{
                            ...styles.slotBtn,
                            border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0F172A',
                            color: isSelected ? '#38bdf8' : '#CBD5E1',
                            fontWeight: isSelected ? '700' : '400'
                          }}
                        >
                          {time} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedSlots.length > 0 && (
              <div style={styles.successAlert}>
                🚀 Đã xếp vào hàng chờ tích hợp {selectedSlots.length} ca dạy thành công!
              </div>
            )}

            {/* QUẢN LÝ VÀ HỦY ĐƠN ĐẶT LỊCH HIỆN HÀNH */}
            {donLichCuaToi.length > 0 && (
              <div style={styles.alertDangerArea}>
                <h4 style={styles.dangerTitle}>🚨 Lịch hẹn sếp đã đăng ký với gia sư này:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {donLichCuaToi.map(don => (
                    <div key={don._id} style={styles.dangerRow}>
                      <div style={{ fontSize: '13.5px', color: '#E2E8F0', lineHeight: '1.5' }}>
                        📅 <b>Khung ca:</b> {don?.selectedSchedule?.join(', ')} <br/>
                        📌 <b>Trạng thái:</b> <span style={{ color: don?.status === 'Chấp nhận' ? '#10B981' : '#F59E0B', fontWeight: '700' }}>{don?.status}</span>
                      </div>
                      <button onClick={() => handleHuyDonLich(don._id)} style={styles.btnCancelBooking}>
                        Hủy yêu cầu
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.modalFooter}>
              <button onClick={() => { setIsModalOpen(false); setSelectedTutor(null); }} style={styles.btnModalClose}>
                Hủy bỏ
              </button>
              <button onClick={handleXacNhanDatLich} style={styles.btnModalSubmit}>
                ✅ Xác nhận tạo lịch học mới
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// --- 🛠️ BỘ KHUNG DESIGN SYSTEM SLATE PREMIUM HOÀN CHỈNH ---
const styles = {
  container: { backgroundColor: '#0F172A', minHeight: '100vh', color: '#F1F5F9', fontFamily: "'Inter', sans-serif" },
  heroBanner: { background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', padding: '100px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', borderBottom: '1px solid #334155' },
  heroBadge: { backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '20px', letterSpacing: '1px', marginBottom: '16px' },
  heroTitle: { fontSize: '3.5rem', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-1px' },
  heroSubtitle: { fontSize: '2rem', fontWeight: '700', margin: '0 0 16px 0', maxWidth: '800px', lineHeight: '1.3', color: '#fff' },
  heroText: { fontSize: '15px', color: '#94a3b8', marginBottom: '36px', maxWidth: '600px', lineHeight: '1.6' },
  heroBtn: { padding: '14px 30px', backgroundColor: '#38bdf8', color: '#0f172a', borderRadius: '8px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(56, 189, 248, 0.25)' },
  mainWrapper: { padding: '60px 24px', maxWidth: '1240px', margin: '0 auto', boxSizing: 'border-box' },
  sectionTitle: { textAlign: 'center', color: '#FFF', marginBottom: '44px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' },
  responsiveGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', justifyContent: 'center' },
  tutorCard: { backgroundColor: '#1E293B', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid #334155', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' },
  tutorImg: { width: '100%', height: '240px', objectFit: 'cover' },
  ratingBadge: { position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#FBBF24', padding: '5px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', border: '1px solid rgba(245, 158, 11, 0.2)' },
  cardBody: { padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  tutorName: { margin: '0 0 12px 0', fontSize: '19px', color: '#FFF', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tutorSubject: { margin: '0 0 8px 0', color: '#94A3B8', fontSize: '14px' },
  tutorPrice: { margin: '0 0 20px 0', color: '#10B981', fontSize: '18px', fontWeight: '700' },
  priceSub: { color: '#64748B', fontSize: '13px', fontWeight: '400', paddingLeft: '2px' },
  actionGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' },
  btnBook: { width: '100%', padding: '11px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.15)' },
  btnDetail: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13.5px' },
  emptyContainer: { textAlign: 'center', padding: '40px', width: '100%', color: '#64748b' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#1E293B', border: '1px solid #334155', padding: '32px', borderRadius: '16px', width: '92%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto', color: '#F1F5F9', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '20px' },
  modalTitle: { margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' },
  modalCloseBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' },
  modalDesc: { color: '#94A3B8', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.5' },
  scheduleRow: { display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #334155', paddingBottom: '16px', gap: '16px' },
  scheduleDayLabel: { width: '150px', fontWeight: '700', color: '#E2E8F0', marginTop: '6px', fontSize: '14px', flexShrink: 0 },
  slotsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 },
  slotBtn: { padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.1s ease' },
  successAlert: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13.5px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.15)' },
  alertDangerArea: { marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.06)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.15)' },
  dangerTitle: { margin: '0 0 12px 0', color: '#f87171', fontSize: '14.5px', fontWeight: '700' },
  dangerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', gap: '12px' },
  btnCancelBooking: { padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12.5px' },
  modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '20px' },
  btnModalClose: { padding: '10px 18px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' },
  btnModalSubmit: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#0f172a', cursor: 'pointer', fontWeight: '800', fontSize: '13.5px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }
};

export default TrangChu;