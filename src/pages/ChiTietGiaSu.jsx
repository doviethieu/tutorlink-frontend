import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewSection from '../components/ReviewSection';

function ChiTietGiaSu() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [giaSu, setGiaSu] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE MỚI: QUẢN LÝ BẬT/TẮT BẢNG CHỌN LỊCH VÀ LỊCH ĐÃ CHỌN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user')); 
  const studentId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || null;

  useEffect(() => {
    axios.get(`http://localhost:8000/api/tutors/${id}`)
      .then(response => {
        setGiaSu(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.log("Lỗi tải dữ liệu:", error);
        setLoading(false);
      });
  }, [id]);

  // Hàm mở bảng đặt lịch (Kiểm tra đăng nhập trước)
  const handleMoBangDatLich = () => {
    if (!studentId) {
      alert("🛑 Bạn phải đăng nhập thì mới đặt lịch được nhé!");
      navigate('/login'); 
      return;
    }
    setIsModalOpen(true);
  };

  // Hàm click chọn/bỏ chọn lịch trong bảng
  const handleToggleSlot = (day, time) => {
    const slotString = `${day}: ${time}`;
    if (selectedSlots.includes(slotString)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotString));
    } else {
      setSelectedSlots([...selectedSlots, slotString]);
    }
  };

  // Hàm chốt gửi lên Backend
  const handleXacNhanDatLich = async () => {
    if (selectedSlots.length === 0) {
      alert("📅 Bạn vui lòng chọn ít nhất 1 khung giờ trống nhé!");
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: giaSu._id, 
        studentName: userData?.name || "Học viên", 
        studentEmail: userData?.email || "Trao đổi qua Chat", 
        studentPhone: "Trao đổi qua Chat", 
        message: `Chào gia sư ${giaSu.name}, mình muốn đăng ký học môn ${giaSu.subject} với bạn vào các khung giờ đã chọn.`,
        selectedSchedule: selectedSlots 
      });
      
      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đã đặt lịch thành công! Bạn đã chọn: \n${selectedSlots.join('\n')}\nVui lòng chờ gia sư xác nhận nhé.`);
        setIsModalOpen(false); // Đóng bảng
        setSelectedSlots([]);  // Reset lại lịch đã chọn
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || "Lỗi đường truyền!"}`);
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải hồ sơ CV...</h2>;
  if (!giaSu) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>❌ Không tìm thấy CV này!</h2>;

  // Lịch trống giả lập (nếu DB chưa có)
  const lichRanh = giaSu.availableSchedule && giaSu.availableSchedule.length > 0 
    ? giaSu.availableSchedule 
    : [
        { day: 'Thứ 2', times: ['18:00 - 20:00', '20:00 - 22:00'] },
        { day: 'Thứ 4', times: ['18:00 - 20:00'] },
        { day: 'Thứ 6', times: ['19:00 - 21:00'] },
        { day: 'Chủ Nhật', times: ['08:00 - 10:00', '14:00 - 16:00'] }
      ];

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#F8FAFC', minHeight: '100vh', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
        
        {/* Cột trái */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1E293B', color: 'white', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={giaSu.image} alt={giaSu.name} style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #3B82F6' }} />
          <h2 style={{ marginTop: '20px', marginBottom: '5px', fontSize: '28px', textAlign: 'center' }}>{giaSu.name}</h2>
          <p style={{ margin: '0', color: '#94A3B8', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gia sư {giaSu.subject}</p>
          
          <div style={{ marginTop: '30px', width: '100%' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span>Đánh giá:</span> <strong style={{ color: '#FBBF24' }}>⭐ {giaSu.rating || "0"}/5.0</strong>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span>Học phí:</span> <strong style={{ color: '#10B981' }}>{giaSu.price.toLocaleString()}đ/h</strong>
            </p>
          </div>

          <button onClick={handleMoBangDatLich} style={{ width: '100%', padding: '15px', marginTop: '30px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'} onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
            📅 Gửi Yêu Cầu Đặt Lịch
          </button>

          <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '12px', marginTop: '15px', backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', transition: 'color 0.3s, border-color 0.3s' }} onMouseOver={(e) => { e.target.style.color = 'white'; e.target.style.borderColor = 'white'; }} onMouseOut={(e) => { e.target.style.color = '#94A3B8'; e.target.style.borderColor = '#475569'; }}>
            ⬅️ Quay lại
          </button>
        </div>

        {/* Cột phải */}
        <div style={{ flex: '2 1 500px', padding: '40px' }}>
          
          <h3 style={cvHeadingStyle}>Giới thiệu bản thân</h3>
          <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '16px' }}>
            {giaSu.description || `Xin chào! Mình là ${giaSu.name}, gia sư môn ${giaSu.subject}. Mình cam kết mang lại phương pháp học tập hiệu quả nhất cho học viên.`}
          </p>

          {giaSu.skills && (
            <>
              <h3 style={cvHeadingStyle}>Kỹ năng nổi bật</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {giaSu.skills.split(',').map((skill, idx) => (
                  <span key={idx} style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '6px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </>
          )}

          {giaSu.education && giaSu.education.length > 0 && (
            <>
              <h3 style={cvHeadingStyle}>🎓 Quá trình học tập</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {giaSu.education.map((edu, index) => (
                  <div key={index} style={{ borderLeft: '3px solid #3B82F6', paddingLeft: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1E293B', fontSize: '18px' }}>{edu.truong}</h4>
                    <p style={{ margin: '0', color: '#64748B' }}>{edu.chuyenNganh} <span style={{ color: '#94A3B8', fontSize: '14px' }}>({edu.nam})</span></p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Phần Review vẫn giữ nguyên */}
          <hr style={{ margin: '40px 0', border: '1px solid #E2E8F0' }} />
          <ReviewSection tutorId={giaSu._id} studentId={studentId} />

        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL: BẢNG POPUP CHỌN LỊCH HỌC */}
      {/* ========================================== */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '15px',
            width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1E293B', fontSize: '22px' }}>📅 Chọn lịch học với {giaSu.name}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}>✖</button>
            </div>
            
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>Bấm vào các khung giờ dưới đây để chọn lịch bạn muốn học:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {lichRanh.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', borderBottom: '1px dashed #E2E8F0', paddingBottom: '15px' }}>
                  <div style={{ width: '100px', fontWeight: 'bold', color: '#1E293B', marginTop: '5px' }}>
                    {item.day}
                  </div>
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

            {/* Hiển thị số lượng giờ đã chọn */}
            {selectedSlots.length > 0 && (
              <div style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '10px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                Đã chọn {selectedSlots.length} buổi học.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: 'white', color: '#475569', cursor: 'pointer', fontWeight: 'bold' }}>
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

const cvHeadingStyle = { color: '#1E293B', fontSize: '22px', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '20px', marginTop: '35px' };

export default ChiTietGiaSu;