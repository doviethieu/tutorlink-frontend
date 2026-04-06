import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ChiTietGiaSu() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [giaSu, setGiaSu] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user hiện tại
  const currentUser = JSON.parse(localStorage.getItem('tutorlinkUser')); 

  // 1. Tải hồ sơ gia sư
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

  // 2. Xử lý đăng ký học thử
  const handleDangKyHocThu = async () => {
    if (!currentUser) {
      alert("🛑 Bạn phải đăng nhập thì mới đăng ký học thử được nhé!");
      navigate('/login'); 
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: giaSu._id, 
        studentName: currentUser.name, 
        studentEmail: currentUser.email, 
        studentPhone: "Trao đổi qua Chat", 
        message: `Chào gia sư ${giaSu.name}, mình muốn đăng ký học thử miễn phí môn ${giaSu.subject} với bạn!`
      });
      
      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đã gửi yêu cầu học thử thành công đến gia sư ${giaSu.name}! Vui lòng vào mục Tin nhắn / Quản lý của bạn để trao đổi chi tiết nhé.`);
        // Sếp có thể mở comment dòng dưới đây nếu muốn đăng ký xong thì tự động nhảy sang trang Chat/Inbox luôn:
        // navigate('/inbox'); 
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || "Lỗi đường truyền!"}`);
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải hồ sơ CV...</h2>;
  if (!giaSu) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>❌ Không tìm thấy CV này!</h2>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
        
        {/* Cột trái (Thông tin cơ bản) */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#1E293B', color: 'white', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={giaSu.image} alt={giaSu.name} style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #3B82F6' }} />
          <h2 style={{ marginTop: '20px', marginBottom: '5px', fontSize: '28px', textAlign: 'center' }}>{giaSu.name}</h2>
          <p style={{ margin: '0', color: '#94A3B8', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>Gia sư {giaSu.subject}</p>
          
          <div style={{ marginTop: '30px', width: '100%' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span>Đánh giá:</span> <strong style={{ color: '#FBBF24' }}>⭐ {giaSu.rating || "5.0"}/5.0</strong>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span>Học phí:</span> <strong style={{ color: '#10B981' }}>{giaSu.price.toLocaleString()}đ/h</strong>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span>Trạng thái:</span> <strong style={{ color: '#38BDF8' }}>{giaSu.status}</strong>
            </p>
          </div>

          <button onClick={handleDangKyHocThu} style={{ width: '100%', padding: '15px', marginTop: '30px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background-color 0.3s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'} onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
            🎁 Đăng ký học thử ngay
          </button>
          
          <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '12px', marginTop: '15px', backgroundColor: 'transparent', color: '#94A3B8', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', transition: 'color 0.3s, border-color 0.3s' }} onMouseOver={(e) => { e.target.style.color = 'white'; e.target.style.borderColor = 'white'; }} onMouseOut={(e) => { e.target.style.color = '#94A3B8'; e.target.style.borderColor = '#475569'; }}>
            ⬅️ Quay lại
          </button>
        </div>

        {/* Cột phải (Chi tiết CV) */}
        <div style={{ flex: '2 1 500px', padding: '40px' }}>
          
          <h3 style={cvHeadingStyle}>Giới thiệu bản thân</h3>
          <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '16px' }}>
            {giaSu.description || `Xin chào! Mình là ${giaSu.name}, gia sư môn ${giaSu.subject} với nhiều năm tâm huyết trong nghề giáo dục. Mình cam kết mang lại phương pháp học tập hiệu quả và thú vị nhất cho học viên.`}
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

          {giaSu.experience && giaSu.experience.length > 0 && (
            <>
              <h3 style={cvHeadingStyle}>💼 Kinh nghiệm làm việc</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {giaSu.experience.map((exp, index) => (
                  <div key={index} style={{ borderLeft: '3px solid #F59E0B', paddingLeft: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1E293B', fontSize: '18px' }}>{exp.noiLamViec}</h4>
                    <p style={{ margin: '0', color: '#64748B', lineHeight: '1.6' }}>{exp.moTa}</p>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const cvHeadingStyle = { color: '#1E293B', fontSize: '22px', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '20px', marginTop: '35px' };

export default ChiTietGiaSu;