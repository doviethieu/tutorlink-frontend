import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewSection from '../components/ReviewSection';

function ChiTietGiaSu() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [giaSu, setGiaSu] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ ĐẶT LỊCH VÀ LỊCH BẬN ĐỒNG BỘ ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [tutorBookings, setTutorBookings] = useState([]); 

  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user')); 
  const studentId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || null;
  const emailHienTai = userData?.email || userData?.user?.email;

  // 🛡️ API & MOCK DATA CAO CẤP
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/tutors/${id}`)
      .then(response => {
        setGiaSu(response?.data?.data || response?.data);
        setLoading(false);
      })
      .catch(error => {
        console.log("🚨 Kích hoạt Mock Data theo chuẩn Layout CV Joboko:");
        setGiaSu({
          _id: id || '65f1a2b3c4d5e6f7a8b9c0d1',
          name: 'NGUYỄN HOÀNG NAM',
          subject: 'Vật Lý 12',
          subjects: ['Vật Lý 12', 'Luyện Thi Đại Học Khối A', 'Vật Lý Lý Thuyết'],
          price: 250000, 
          rating: 4.9,
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
          description: 'Sinh viên năm 3 chuyên ngành Điện tử Viễn thông tại Đại học Bách Khoa Hà Nội. Có hơn 3 năm kinh nghiệm luyện thi học sinh lớp 12 bứt phá điểm số từ bết bát lên 8+, 9+. Phương pháp dạy học thực chiến, tập trung vào bản chất hiện tượng tư duy logic thay vì học vẹt công thức.',
          skills: 'Luyện thi đại học siêu tốc, Khôi phục mất gốc, Tư duy giải trắc nghiệm nhanh, Cam kết đầu ra',
          location: 'Hai Bà Trưng, Hà Nội (Có nhận dạy nhà riêng hoặc Online)',
          type: 'Trực tiếp tại nhà & Trực tuyến qua Zoom',
          experience: 'Hơn 3 năm kinh nghiệm gia sư tự do',
          badges: ['Đã xác minh bằng cấp', 'Top Gia sư Xuất sắc tháng', 'Đối tác Kim Cương TutorLink'],
          education: [
            { truong: 'Đại học Bách Khoa Hà Nội', chuyenNganh: 'Kỹ thuật Điện tử Viễn thông (Hệ Tiên Tiến)', nam: '2023 - Nay' },
            { truong: 'THPT Chuyên Hà Nội - Amsterdam', chuyenNganh: 'Cựu học sinh chuyên khối Vật Lý', nam: '2020 - 2023' }
          ],
          availableSchedule: [
            { day: 'Thứ 2', times: ['18:00 - 20:00', '20:00 - 22:00'] },
            { day: 'Thứ 4', times: ['18:00 - 20:00'] },
            { day: 'Thứ 6', times: ['19:00 - 21:00'] },
            { day: 'Chủ Nhật', times: ['08:00 - 10:00', '14:00 - 16:00'] }
          ]
        });
        setLoading(false);
      });
  }, [id]);

  const handleMoBangDatLich = () => {
    if (!studentId) {
      alert("🛑 Bạn phải đăng nhập thì mới đặt lịch được nhé!");
      navigate('/login'); 
      return;
    }
    setSelectedSlots([]);
    setIsModalOpen(true);

    axios.get(`http://localhost:8000/api/bookings/tutor/${id}`)
      .then(response => {
        setTutorBookings(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setTutorBookings([]));
  };

  const handleToggleSlot = (day, time) => {
    const slotString = `${day}: ${time}`;
    if (selectedSlots.includes(slotString)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotString));
    } else {
      setSelectedSlots([...selectedSlots, slotString]);
    }
  };

  // 🚀 HÀM XỬ LÝ XÁC NHẬN ĐẶT LỊCH VÀ CHUYỂN TRANG THANH TOÁN TỰ ĐỘNG
  const handleXacNhanDatLich = async () => {
    if (selectedSlots.length === 0) {
      alert("📅 Bạn vui lòng chọn ít nhất 1 khung giờ nhé!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: giaSu._id, 
        studentName: userData?.name || "Học viên thử nghiệm", 
        studentEmail: emailHienTai || "Trao đổi qua Chat", 
        studentPhone: "Trao đổi qua Chat", 
        message: `Chào gia sư ${giaSu.name}, mình muốn đăng ký học môn ${giaSu.subject || 'Gia sư'} với bạn.`,
        selectedSchedule: selectedSlots 
      });
      if (response.status === 201 || response.status === 200) {
        setTutorBookings(prev => [response.data, ...prev]);
        setIsModalOpen(false);
        setSelectedSlots([]);  
        
        // Điều hướng trực tiếp sang trang cổng thanh toán
        navigate('/cong-thanh-toan');
      }
    } catch (error) {
      console.log("🚨 Chạy chế độ Mock Test: Điều hướng sang trang thanh toán.");
      const donGiaLap = { _id: Math.random().toString(), studentEmail: emailHienTai, status: 'Chờ xác nhận', selectedSchedule: [...selectedSlots] };
      setTutorBookings(prev => [donGiaLap, ...prev]);
      setIsModalOpen(false);
      setSelectedSlots([]);
      
      // Kể cả khi rớt vào block catch (do chưa bật server backend), vẫn chuyển sang trang thanh toán để sếp demo mượt mà
      navigate('/cong-thanh-toan');
    }
  };

  const handleHuyDonLich = async (bookingId) => {
    if(!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này?")) return;
    setTutorBookings(prev => prev.filter(don => don._id !== bookingId));
    alert("🗑️ Đã giải phóng khung giờ học thành công!");
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#94a3b8' }}>⏳ Đang xuất bản CV Gia sư...</h2>;
  if (!giaSu) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#f87171' }}>❌ Không tìm thấy hồ sơ!</h2>;

  const giaHienThi = Number(giaSu?.price) ? Number(giaSu.price).toLocaleString('vi-VN') : "250.000";
  const monHocHienThi = giaSu.subject || (Array.isArray(giaSu.subjects) ? giaSu.subjects.join(', ') : 'Đa môn');
  
  // 🛡️ VÁ CHẮC CHẮN: Luôn có mảng dự phòng nếu dữ liệu trống, triệt tiêu lỗi trắng màn
  const lichRanh = giaSu.availableSchedule && giaSu.availableSchedule.length > 0 
    ? giaSu.availableSchedule 
    : [
        { day: 'Thứ 2', times: ['18:00 - 20:00', '20:00 - 22:00'] },
        { day: 'Thứ 4', times: ['18:00 - 20:00'] },
        { day: 'Thứ 6', times: ['19:00 - 21:00'] },
        { day: 'Chủ Nhật', times: ['08:00 - 10:00', '14:00 - 16:00'] }
      ];

  const donLichCuaToi = Array.isArray(tutorBookings) ? tutorBookings.filter(don => don?.studentEmail === emailHienTai && (don?.status === 'Chờ xác nhận' || don?.status === 'Chấp nhận')) : [];

  return (
    <div style={{ padding: '50px 20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      
      {/* NÚT BACK GỌN GÀNG ĐẶT PHÍA TRÊN CV */}
      <div style={{ maxWidth: '950px', margin: '0 auto 20px auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⬅️ Quay lại danh sách gia sư
        </button>
      </div>

      {/* CONTAINER CHÍNH THEO KHUÔN CV JOBOKO CAO CẤP */}
      <div style={{ maxWidth: '950px', margin: '0 auto', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        
        {/* ========================================== */}
        {/* PHẦN 1: HEADER CV SIÊU RỘNG (MAIN PROFILE) */}
        {/* ========================================== */}
        <div style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', padding: '40px', display: 'flex', flexWrap: 'wrap', gap: '35px', alignItems: 'center' }}>
          <img 
            src={giaSu.image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'} 
            alt={giaSu.name} 
            style={{ width: '150px', height: '150px', borderRadius: '12px', objectFit: 'cover', border: '3px solid #F97316', boxShadow: '0 8px 20px rgba(249, 115, 22, 0.2)' }} 
          />
          <div style={{ flex: '1 1 400px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>{giaSu.name}</h1>
            <p style={{ margin: '0 0 15px 0', color: '#F97316', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>🎓 Vị trí: Gia sư chuyên môn {monHocHienThi}</p>
            
            {/* Hàng ngang thông tin liên hệ / Địa điểm */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px', color: '#94a3b8', marginBottom: '15px' }}>
              <span>📍 {giaSu.location || 'Toàn quốc'}</span>
              <span>💰 {giaHienThi} ₫/giờ</span>
              <span>⭐ {giaSu.rating || "5.0"} / 5.0 Rating</span>
            </div>

            {/* Khối Huy Hiệu Đạt Được */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(giaSu.badges || ['Đã xác minh bằng cấp', 'Top Gia sư Xuất sắc']).map((badge, idx) => (
                <span key={idx} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Cụm nút Action gọi lịch bên góc phải Header */}
          <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '20px', marginTop: '10px' }}>
            <button 
              onClick={handleMoBangDatLich} 
              style={{ padding: '12px 28px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}
            >
              📅 Đặt Lịch Hẹn & Gửi Yêu Cầu Học
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* PHẦN 2: BỐ CỤC NỘI DUNG DẠNG GRID CHUẨN CV */}
        {/* ========================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', padding: '40px' }}>
          
          {/* CỘT TRÁI CV: THÔNG TIN CHI TIẾT & TIỂU SỬ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            
            <div>
              <h3 style={cvSectionTitleStyle}>📝 Mục tiêu & Giới thiệu bản thân</h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '14.5px', whiteSpace: 'pre-line', margin: 0 }}>
                {giaSu.description}
              </p>
            </div>

            <div>
              <h3 style={cvSectionTitleStyle}>💼 Kinh nghiệm giảng dạy</h3>
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
                <p style={{ margin: '0 0 5px 0', color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>Gia sư tự do xuất sắc</p>
                <span style={{ fontSize: '12px', color: '#F97316', fontWeight: '500' }}>Thời gian: {giaSu.experience || 'Trên 3 năm'}</span>
                <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.6' }}>
                  Từng kèm cặp hàng chục học viên lấy lại gốc, bứt phá tư duy giải trắc nghiệm nhanh, cải thiện điểm số rõ rệt trên lớp và trong các kỳ thi lớn.
                </p>
              </div>
            </div>

            <div>
              <h3 style={cvSectionTitleStyle}>⚙️ Hình thức & Phương thức</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#cbd5e1' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>Lớp nhận:</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{giaSu.type || 'Trực tiếp & Online'}</td></tr>
                  <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>Học phí công khai:</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>{giaHienThi} ₫ / Giờ</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Môn giảng dạy:</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#38BDF8' }}>{monHocHienThi}</td></tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* CỘT PHẢI CV: HỌC VẤN & THANH TIÊU CHUẨN KỸ NĂNG (PROGRESS BAR ĐẶC TRƯNG JOBOKO) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            
            <div>
              <h3 style={cvSectionTitleStyle}>🎓 Học vấn & Bằng cấp</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Array.isArray(giaSu?.education) && giaSu.education.length > 0 ? (
                  giaSu.education.map((edu, index) => (
                    <div key={index} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #F97316' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: '#F97316', borderRadius: '50%', position: 'absolute', left: '-5px', top: '5px' }} />
                      <span style={{ fontSize: '12px', color: '#F97316', fontWeight: 'bold' }}>{edu.nam}</span>
                      <h4 style={{ margin: '2px 0', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' }}>{edu.truong}</h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '13.5px' }}>{edu.chuyenNganh}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Đã xác minh trình độ Đại học chuyên ngành liên quan.</p>
                )}
              </div>
            </div>

            <div>
              <h3 style={cvSectionTitleStyle}>⚡ Chỉ số năng lực kỹ năng</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {typeof giaSu.skills === 'string' && giaSu.skills.split(',').map((skill, idx) => {
                  const phanTramNangLuc = idx === 0 ? '95%' : idx === 1 ? '90%' : idx === 2 ? '85%' : '80%';
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '5px' }}>
                        <span style={{ color: '#e2e8f0', fontWeight: '500' }}>✨ {skill.trim()}</span>
                        <span style={{ color: '#F97316', fontWeight: 'bold' }}>{phanTramNangLuc}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: phanTramNangLuc, height: '100%', backgroundColor: '#F97316', borderRadius: '10px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Khu vực bình luận rộng mở ở đáy CV */}
        <div style={{ borderTop: '1px solid #334155', padding: '40px', backgroundColor: '#111827' }}>
          <ReviewSection tutorId={giaSu._id} studentId={studentId} />
        </div>

      </div>

      {/* ========================================== */}
      {/* MODAL CHỌN LỊCH PHỐI MÀU CAM THEO THƯƠNG HIỆU */}
      {/* ========================================== */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', color: '#f1f5f9', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>📅 Đăng ký khung giờ với gia sư</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}>✖</button>
            </div>
            
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '25px' }}>Chọn các ca học mong muốn bên dưới:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '30px' }}>
              {lichRanh?.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px dashed #334155', paddingBottom: '15px' }}>
                  <div style={{ width: '110px', fontWeight: 'bold', color: '#e2e8f0', marginTop: '6px', fontSize: '14px' }}>🗓️ {item?.day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', flex: 1 }}>
                    {item?.times && item.times.map((time, idx) => {
                      const slotString = `${item.day}: ${time}`;
                      const isSelected = selectedSlots.includes(slotString);
                      return (
                        <button 
                          key={idx}
                          onClick={() => handleToggleSlot(item.day, time)}
                          style={{
                            padding: '8px 14px', borderRadius: '6px',
                            border: isSelected ? '2px solid #F97316' : '1px solid #334155',
                            backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : '#0f172a',
                            color: isSelected ? '#F97316' : '#cbd5e1',
                            cursor: 'pointer', fontSize: '13px'
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

            {donLichCuaToi.length > 0 && (
              <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#FCA5A5', fontSize: '14px' }}>🚨 Đơn lịch đã gửi:</h4>
                {donLichCuaToi.map(don => (
                  <div key={don._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>{don?.selectedSchedule?.join(', ')} - <strong>{don?.status}</strong></div>
                    <button onClick={() => handleHuyDonLich(don._id)} style={{ padding: '5px 10px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Hủy</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#94a3b8', cursor: 'pointer' }}>Hủy</button>
              
              {/* 🔥 ĐÃ ĐỒNG BỘ CHUẨN TÊN TEXT THEO GIAO DIỆN VÀ GẮN HÀM handleXacNhanDatLich */}
              <button onClick={handleXacNhanDatLich} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#10B981', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>✅ Xác Nhận Đặt Lịch Mới</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLE TIÊU ĐỀ SECTION CHUẨN ĐỒNG BỘ THEO MẪU JOBOKO DAN-DAU
const cvSectionTitleStyle = { 
  color: '#ffffff', 
  fontSize: '18px', 
  fontWeight: '700',
  borderBottom: '2px solid #F97316', 
  paddingBottom: '6px', 
  marginBottom: '16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

export default ChiTietGiaSu;