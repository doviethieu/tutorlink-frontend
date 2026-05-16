import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 

function TrangChu({ tuKhoa }) { 
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  const navigate = useNavigate(); 

  // --- STATE QUẢN LÝ BẬT/TẮT MODAL ĐẶT LỊCH NGAY TẠI TRANG CHỦ ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null); 
  const [selectedSlots, setSelectedSlots] = useState([]);  

  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user')); 
  const studentId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || null;

  // 🚀 TẠO LỊCH THÔNG MINH TỰ ĐỘNG LẤY 7 NGÀY TỚI KÈM NGÀY/THÁNG THỰC TẾ
  const generateSmartSchedule = () => {
    const schedule = [];
    const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const cacCaHoc = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00'];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i); // Tự động cộng thêm ngày
      
      let dayName = daysOfWeek[date.getDay()];
      // Nâng cấp: Hiển thị chữ "Hôm nay" và "Ngày mai" cho thân thiện
      if (i === 0) dayName = "Hôm nay";
      if (i === 1) dayName = "Ngày mai";

      // Định dạng ngày tháng thành 01/05, 12/10...
      const dateString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      schedule.push({
        day: `${dayName} (${dateString})`,
        times: cacCaHoc
      });
    }
    return schedule;
  };

  const lichThongMinh = generateSmartSchedule();

  useEffect(() => {
    axios.get('http://localhost:8000/api/tutors')
      .then(response => {
        const nguoiDaDuyet = response.data.filter(gs => gs.status === 'Đã duyệt');
        setDanhSachGiaSu(nguoiDaDuyet);
      })
      .catch(error => console.log("Lỗi tải dữ liệu:", error));
  }, []);

  const danhSachLoc = danhSachGiaSu.filter((gs) => {
    if (!tuKhoa) return true;
    const ten = gs.name.toLowerCase();
    const monHoc = gs.subject.toLowerCase();
    const tuKhoaNho = tuKhoa.toLowerCase();
    return ten.includes(tuKhoaNho) || monHoc.includes(tuKhoaNho);
  });

  // --- HÀM MỞ BẢNG ĐẶT LỊCH TẠI TRANG CHỦ ---
  const handleMoBangDatLich = (giaSu) => {
    if (!studentId) {
      alert("🛑 Bạn phải đăng nhập thì mới đặt lịch học được nhé!");
      navigate('/login'); 
      return;
    }
    setSelectedTutor(giaSu);
    setSelectedSlots([]); 
    setIsModalOpen(true);
  };

  // --- HÀM CLICK CHỌN KHUNG GIỜ ---
  const handleToggleSlot = (day, time) => {
    const slotString = `${day}: ${time}`;
    if (selectedSlots.includes(slotString)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotString));
    } else {
      setSelectedSlots([...selectedSlots, slotString]);
    }
  };

  // --- HÀM GỬI YÊU CẦU LÊN BACKEND ---
  const handleXacNhanDatLich = async () => {
    if (selectedSlots.length === 0) {
      alert("📅 Bạn vui lòng chọn ít nhất 1 khung giờ trống nhé!");
      return;
    }
    
    // GHÉP CÁC KHUNG GIỜ ĐÃ CHỌN THÀNH MỘT CHUỖI
    const chuoiLichHoc = selectedSlots.join(', ');

    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: selectedTutor._id, 
        studentName: userData?.name || "Học viên", 
        studentEmail: userData?.email || "Trao đổi qua Chat", 
        studentPhone: "Trao đổi qua Chat", 
        message: `Chào gia sư ${selectedTutor.name}, mình muốn đăng ký học môn ${selectedTutor.subject} với bạn vào: ${chuoiLichHoc}.`,
        selectedSchedule: selectedSlots 
      });
      
      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đã đặt lịch thành công với gia sư ${selectedTutor.name}! Bạn đã chọn: \n${selectedSlots.join('\n')}\nVui lòng chờ gia sư xác nhận.`);
        setIsModalOpen(false); 
        setSelectedTutor(null);
        setSelectedSlots([]);  
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || "Lỗi đường truyền!"}`);
    }
  };

  // --- HÀM XEM CHI TIẾT CV ---
  const handleXemHoSo = (idGiaSu) => {
    navigate(`/giasu/${idGiaSu}`);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ======================================================= */}
      {/* 🌟 PHẦN GIỚI THIỆU (CHỈ HIỆN KHI CHƯA ĐĂNG NHẬP) 🌟 */}
      {/* ======================================================= */}
      {!localStorage.getItem('tutorlinkUser') && (
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          color: 'white',
          padding: '120px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          borderBottom: '5px solid #F97316'
        }}>
          
          <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '2px' }}>
            Tutor<span style={{ color: '#F97316' }}>Link</span>
          </h1>
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 20px 0', maxWidth: '800px', lineHeight: '1.4' }}>
            Kết nối Học viên và Gia sư trên toàn thế giới
          </h2>
          
          <p style={{ fontSize: '1.2rem', color: '#D1D5DB', marginBottom: '40px', maxWidth: '600px', lineHeight: '1.6' }}>
            Tìm kiếm gia sư hoàn hảo dành cho bạn, hoặc chia sẻ kiến thức để trở thành một phần của cộng đồng giáo dục toàn cầu.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#danh-sach-gia-su" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '16px 35px', backgroundColor: '#F97316', color: 'white', borderRadius: '30px', 
                fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)', transition: 'transform 0.2s, backgroundColor 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                🔍 Tìm Gia Sư
              </button>
            </a>
            
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '16px 35px', backgroundColor: 'transparent', color: 'white', border: '2px solid #F97316',
                borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                👩‍🏫 Áp dụng làm Gia sư
              </button>
            </Link>
          </div>
          
          <div style={{ marginTop: '70px', animation: 'bounce 2s infinite', color: '#9CA3AF' }}>
            <p style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Cuộn để khám phá</p>
            <div style={{ fontSize: '28px' }}>↓</div>
          </div>

          <style>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-15px); }
              60% { transform: translateY(-7px); }
            }
            html { scroll-behavior: smooth; } 
          `}</style>
        </div>
      )}

      {/* ======================================================= */}
      {/* 📜 DANH SÁCH GIA SƯ */}
      {/* ======================================================= */}
      <div id="danh-sach-gia-su" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#1E293B', marginBottom: '40px', fontSize: '32px', fontWeight: 'bold' }}>
          Gia sư Nổi bật
        </h2>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {danhSachLoc.length > 0 ? (
            danhSachLoc.map((gs) => (
              <div key={gs._id} style={{
                backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', width: '320px',
                transition: 'all 0.3s', cursor: 'default',
                border: '1px solid #F1F5F9',
                display: 'flex', flexDirection: 'column' 
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
                }}
              >
                {/* Ảnh gia sư */}
                <img src={gs.image} alt={gs.name} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                
                {/* Thông tin gia sư */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* PHẦN ĐÃ FIX LỖI TRÀN TÊN */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' }}>
                    <h3 
                      title={gs.name} 
                      style={{ 
                        margin: '0', 
                        fontSize: '22px', 
                        color: '#1E293B', 
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1 
                      }}
                    >
                      {gs.name}
                    </h3>
                    <span style={{ 
                      backgroundColor: '#FEF3C7', 
                      color: '#D97706', 
                      padding: '4px 8px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      flexShrink: 0 
                    }}>
                      ⭐ {gs.rating || "5.0"}
                    </span>
                  </div>
                  
                  <p style={{ margin: '8px 0', color: '#64748B', fontSize: '15px' }}>📚 Môn dạy: <strong>{gs.subject}</strong></p>
                  <p style={{ margin: '8px 0', color: '#10B981', fontSize: '18px', fontWeight: 'bold' }}>
                    💰 {gs.price.toLocaleString()}đ<span style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 'normal' }}>/giờ</span>
                  </p>
                  
                  {/* KHU VỰC 2 NÚT BẤM */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
                    
                    <button 
                      onClick={() => handleMoBangDatLich(gs)}
                      style={{
                        width: '100%', padding: '12px', backgroundColor: '#3B82F6',
                        color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', 
                        fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                    >
                      📅 Chọn Lịch & Đặt Học
                    </button>

                    <button 
                      onClick={() => handleXemHoSo(gs._id)}
                      style={{
                        width: '100%', padding: '12px', backgroundColor: '#F8FAFC',
                        color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', 
                        cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#F1F5F9';
                        e.target.style.borderColor = '#94A3B8';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#F8FAFC';
                        e.target.style.borderColor = '#CBD5E1';
                      }}
                    >
                      👁️ Xem chi tiết hồ sơ
                    </button>

                  </div>

                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', width: '100%' }}>
              <h3 style={{ color: '#64748B', fontSize: '20px' }}>
                Không tìm thấy gia sư nào phù hợp với từ khóa "{tuKhoa}"!
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 📅 POPUP MODAL CHỌN LỊCH TRỐNG NGAY TẠI TRANG CHỦ */}
      {/* ======================================================= */}
      {isModalOpen && selectedTutor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '15px',
            width: '90%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1E293B', fontSize: '22px' }}>📅 Chọn lịch học với {selectedTutor.name}</h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedTutor(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}>✖</button>
            </div>
            
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>Bấm vào các khung giờ dưới đây để chọn lịch bạn muốn học (Lịch 7 ngày tới):</p>
            
            {/* 🚀 BẢNG LỊCH THÔNG MINH HIỂN THỊ "HÔM NAY, NGÀY MAI, 01/05..." */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {lichThongMinh.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px dashed #E2E8F0', paddingBottom: '15px' }}>
                  
                  {/* Cột Thứ ngày tháng (Đã nới rộng thành 140px để chứa đủ chữ) */}
                  <div style={{ width: '140px', fontWeight: 'bold', color: '#1E293B', marginTop: '5px', fontSize: '15px' }}>
                    {item.day}
                  </div>
                  
                  {/* Cột các Khung giờ */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
                    {item.times.map((time, idx) => {
                      const slotString = `${item.day}: ${time}`;
                      const isSelected = selectedSlots.includes(slotString);
                      
                      return (
                        <button 
                          key={idx}
                          onClick={() => handleToggleSlot(item.day, time)}
                          style={{
                            padding: '8px 15px', borderRadius: '8px',
                            border: isSelected ? '2px solid #3B82F6' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#EFF6FF' : 'white',
                            color: isSelected ? '#1D4ED8' : '#475569',
                            cursor: 'pointer', fontWeight: isSelected ? 'bold' : 'normal',
                            transition: 'all 0.2s'
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
              <div style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                Đã chọn {selectedSlots.length} buổi học.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setIsModalOpen(false); setSelectedTutor(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
                Hủy
              </button>
              <button onClick={handleXacNhanDatLich} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                ✅ Xác Nhận Đặt Lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrangChu;