import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 

function TrangChu({ tuKhoa }) { 
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  
  // 🔥 STATE MỚI: Quản lý toàn bộ đơn đặt lịch của ông gia sư đang chọn (Để ẩn các ca bận)
  const [tutorBookings, setTutorBookings] = useState([]);
  
  const navigate = useNavigate(); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null); 
  const [selectedSlots, setSelectedSlots] = useState([]);  

  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user')); 
  const studentId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || null;
  const emailHienTai = userData?.email || userData?.user?.email;

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

  useEffect(() => {
    axios.get('http://localhost:8000/api/tutors')
      .then(response => {
        const nguoiDaDuyet = response.data.filter(gs => gs.status === 'Đã duyệt');
        setDanhSachGiaSu(nguoiDaDuyet);
      })
      .catch(error => console.log("Lỗi tải dữ liệu gia sư:", error));
  }, []);

  const danhSachLoc = danhSachGiaSu.filter((gs) => {
    if (!tuKhoa) return true;
    const ten = gs.name.toLowerCase();
    const monHoc = gs.subject.toLowerCase();
    const tuKhoaNho = tuKhoa.toLowerCase();
    return ten.includes(tuKhoaNho) || monHoc.includes(tuKhoaNho);
  });

  // --- HÀM MỞ BẢNG ĐẶT LỊCH + TẢI LỊCH BẬN CỦA GIA SƯ ĐÓ ---
  const handleMoBangDatLich = (giaSu) => {
    if (!studentId) {
      alert("🛑 Bạn phải đăng nhập thì mới đặt lịch học được nhé!");
      navigate('/login'); 
      return;
    }
    setSelectedTutor(giaSu);
    setSelectedSlots([]); 
    setIsModalOpen(true);

    // 🔥 Gọi API lấy danh sách đơn của riêng ông gia sư này để check trùng ca bận
    axios.get(`http://localhost:8000/api/bookings/tutor/${giaSu._id}`)
      .then(response => {
        setTutorBookings(response.data);
      })
      .catch(error => console.log("Lỗi tải lịch bận gia sư:", error));
  };

  const handleToggleSlot = (day, time) => {
    const slotString = `${day}: ${time}`;
    if (selectedSlots.includes(slotString)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotString));
    } else {
      setSelectedSlots([...selectedSlots, slotString]);
    }
  };

  const handleXacNhanDatLich = async () => {
    if (selectedSlots.length === 0) {
      alert("📅 Bạn vui lòng chọn ít nhất 1 khung giờ trống nhé!");
      return;
    }
    
    const chuoiLichHoc = selectedSlots.join(', ');

    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: selectedTutor._id, 
        studentName: userData?.name || "Học viên", 
        studentEmail: emailHienTai, 
        studentPhone: "Trao đổi qua Chat", 
        message: `Chào gia sư ${selectedTutor.name}, mình muốn đăng ký học môn ${selectedTutor.subject} với bạn vào: ${chuoiLichHoc}.`,
        selectedSchedule: selectedSlots 
      });
      
      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đã đặt lịch thành công!\nVui lòng chờ gia sư xác nhận.`);
        
        // 🔥 Cập nhật lịch bận ngay lập tức để ẩn khung giờ vừa chọn đi luôn
        setTutorBookings(prev => [response.data, ...prev]);
        setSelectedSlots([]);  
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || "Lỗi đường truyền!"}`);
    }
  };

  // --- 🔥 HÀM HỦY ĐƠN ĐẶT LỊCH CŨ ---
  const handleHuyDonLich = async (bookingId) => {
    if(!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt lịch này không?")) return;
    
    try {
      const response = await axios.delete(`http://localhost:8000/api/bookings/${bookingId}`);
      if(response.status === 200) {
        alert("🗑️ Đã hủy đơn lịch thành công! Khung giờ này đã được giải phóng.");
        // Loại bỏ đơn vừa xóa khỏi state để khung giờ tự động xuất hiện trở lại trên bảng lịch
        setTutorBookings(prev => prev.filter(don => don._id !== bookingId));
      }
    } catch (error) {
      alert("❌ Hủy đơn thất bại, vui lòng thử lại!");
    }
  };

  const handleXemHoSo = (idGiaSu) => {
    navigate(`/giasu/${idGiaSu}`);
  };

  // 🔥 Lọc ra các đơn hàng mà CHÍNH HỌC SINH NÀY đã đặt với ông gia sư này để làm tính năng Hủy
  const donLichCuaToi = tutorBookings.filter(don => 
    don.studentEmail === emailHienTai && (don.status === 'Chờ xác nhận' || don.status === 'Chấp nhận')
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* BANNER GIỚI THIỆU */}
      {!localStorage.getItem('tutorlinkUser') && (
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          color: 'white', padding: '120px 20px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', borderBottom: '5px solid #F97316'
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
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)', transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                🔍 Tìm Gia Sư
              </button>
            </a>
          </div>
        </div>
      )}

      {/* DANH SÁCH GIA SƯ */}
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
                transition: 'all 0.3s', border: '1px solid #F1F5F9',
                display: 'flex', flexDirection: 'column' 
              }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <img src={gs.image} alt={gs.name} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' }}>
                    <h3 title={gs.name} style={{ margin: '0', fontSize: '22px', color: '#1E293B', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {gs.name}
                    </h3>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                      ⭐ {gs.rating || "5.0"}
                    </span>
                  </div>
                  
                  <p style={{ margin: '8px 0', color: '#64748B', fontSize: '15px' }}>📚 Môn dạy: <strong>{gs.subject}</strong></p>
                  <p style={{ margin: '8px 0', color: '#10B981', fontSize: '18px', fontWeight: 'bold' }}>
                    💰 {gs.price.toLocaleString()}đ<span style={{ color: '#94A3B8', fontSize: '14px' }}>/giờ</span>
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
                    {/* NÚT LUÔN HIỆN ĐỂ HỌC SINH CÓ THỂ CLICK VÀO ĐẶT HOẶC HỦY LỊCH CŨ */}
                    <button 
                      onClick={() => handleMoBangDatLich(gs)}
                      style={{
                        width: '100%', padding: '12px', backgroundColor: '#3B82F6',
                        color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', 
                        fontWeight: 'bold', fontSize: '15px'
                      }}
                    >
                      📅 Chọn Lịch & Đặt Học
                    </button>

                    <button 
                      onClick={() => handleXemHoSo(gs._id)}
                      style={{
                        width: '100%', padding: '12px', backgroundColor: '#F8FAFC',
                        color: '#475569', border: '1px solid #CBD5E1', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
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
              <h3 style={{ color: '#64748B', fontSize: '20px' }}>Không tìm thấy gia sư!</h3>
            </div>
          )}
        </div>
      </div>

      {/* MODAL POPUP ĐẶT LỊCH THÔNG MINH */}
      {isModalOpen && selectedTutor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '15px',
            width: '90%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1E293B', fontSize: '22px' }}>📅 Chọn lịch học với {selectedTutor.name}</h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedTutor(null); }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}>✖</button>
            </div>
            
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>Các khung giờ trống của gia sư trong 7 ngày tới (Khung giờ đã có người đặt sẽ tự động ẩn):</p>
            
            {/* DANH SÁCH KHUNG GIỜ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {lichThongMinh.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px dashed #E2E8F0', paddingBottom: '15px' }}>
                  <div style={{ width: '140px', fontWeight: 'bold', color: '#1E293B', marginTop: '5px', fontSize: '15px' }}>
                    {item.day}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
                    {item.times.map((time, idx) => {
                      const slotString = `${item.day}: ${time}`;
                      
                      // 🔥 BỘ LỌC SPAM: Quét xem khung giờ này đã nằm trong đơn nào đang chạy chưa
                      const caNayDaBiDat = tutorBookings.some(don => 
                        (don.status === 'Chờ xác nhận' || don.status === 'Chấp nhận') && 
                        don.selectedSchedule.includes(slotString)
                      );

                      // NẾU ĐÃ BỊ ĐẶT -> ẨN KHUNG GIỜ ĐÓ ĐI THÔI LUÔN
                      if (caNayDaBiDat) return null;

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
                            cursor: 'pointer', transition: 'all 0.2s'
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
                Đã chọn {selectedSlots.length} buổi học mới.
              </div>
            )}

            {/* 🔥 QUẢN LÝ VÀ HỦY ĐƠN ĐẶT LỊCH CŨ */}
            {donLichCuaToi.length > 0 && (
              <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#FEF2F2', borderRadius: '10px', border: '1px solid #FCA5A5' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#991B1B', fontSize: '15px' }}>🚨 Lịch bạn đã gửi yêu cầu đặt với gia sư này:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {donLichCuaToi.map(don => (
                    <div key={don._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #FEE2E2' }}>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        📅 <strong>Khung giờ:</strong> {don.selectedSchedule.join(', ')} <br/>
                        📌 <strong>Trạng thái:</strong> <span style={{ color: don.status === 'Chấp nhận' ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>{don.status}</span>
                      </div>
                      <button 
                        onClick={() => handleHuyDonLich(don._id)}
                        style={{ padding: '8px 14px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                      >
                        ❌ Hủy Yêu Cầu
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '15px' }}>
              <button onClick={() => { setIsModalOpen(false); setSelectedTutor(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
                Đóng
              </button>
              <button onClick={handleXacNhanDatLich} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                ✅ Xác Nhận Đặt Lịch Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrangChu;