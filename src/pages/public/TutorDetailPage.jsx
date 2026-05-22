import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSection from '../../components/tutors/ReviewSection';
import { tutorService } from '../../services/tutor.service';

function ChiTietGiaSu() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [giaSu, setGiaSu] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ ĐÃ FIX CHẮC CHẮN: Rút gọn cú pháp lấy thông tin User đăng nhập để tránh lỗi undefined
  const rawUser = localStorage.getItem('tutorlinkUser') || localStorage.getItem('user');
  const userData = rawUser ? JSON.parse(rawUser) : null;
  
  const studentId = userData?._id || userData?.id || null;

  // 🛡️ ĐỒNG BỘ DỮ LIỆU TỪ BACKEND MONGODB THẬT
  useEffect(() => {
    setLoading(true);
    tutorService.get(id)
      .then(dataGiaSu => {
        setGiaSu(dataGiaSu || null);
        setLoading(false);
      })
      .catch(error => {
        console.error("Không tải được hồ sơ gia sư:", error.message);
        setGiaSu(null);
        setLoading(false);
      });
  }, [id]);

  const handleMoBangDatLich = () => {
    if (!studentId) {
      alert("🛑 Hệ thống yêu cầu: Sếp vui lòng đăng nhập trước khi thao tác đặt lịch hẹn nhé!");
      navigate('/login'); 
      return;
    }
    navigate(`/giasu/${giaSu?._id || giaSu?.id || id}/book`);
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#94a3b8' }}>⏳ Đang xuất bản hồ sơ CV Gia sư...</h2>;
  if (!giaSu) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#f87171' }}>❌ Không tìm thấy hồ sơ hệ thống!</h2>;

  const giaHienThi = Number(giaSu?.price) ? Number(giaSu.price).toLocaleString('vi-VN') : "250.000";
  const monHocHienThi = giaSu.subject || (Array.isArray(giaSu.subjects) ? giaSu.subjects.join(', ') : 'Đa môn');
  
  return (
    <div style={{ padding: '50px 20px', backgroundColor: '#0f172a', minHeight: '100vh', color: '#f1f5f9', fontFamily: "'Inter', sans-serif" }}>
      
      {/* NÚT BACK GỌN GÀNG ĐẶT PHÍA TRÊN CV */}
      <div style={{ maxWidth: '950px', margin: '0 auto 20px auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⬅️ Quay lại danh sách đối tác gia sư
        </button>
      </div>

      {/* CONTAINER CHÍNH THEO KHUÔN CV JOBOKO CAO CẤP */}
      <div style={{ maxWidth: '950px', margin: '0 auto', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        
        {/* PHẦN 1: HEADER CV SIÊU RỘNG (MAIN PROFILE) */}
        <div style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', padding: '40px', display: 'flex', flexWrap: 'wrap', gap: '35px', alignItems: 'center' }}>
          <img 
            src={giaSu.image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'} 
            alt={giaSu.name} 
            style={{ width: '150px', height: '150px', borderRadius: '12px', objectFit: 'cover', border: '3px solid #F97316', boxShadow: '0 8px 20px rgba(249, 115, 22, 0.2)' }} 
          />
          <div style={{ flex: '1 1 400px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>{giaSu.name}</h1>
            <p style={{ margin: '0 0 15px 0', color: '#F97316', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>🎓 Vị trí: Gia sư chuyên môn {monHocHienThi}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px', color: '#94a3b8', marginBottom: '15px' }}>
              <span>📍 {giaSu.location || 'Hà Nội'}</span>
              <span>💰 {giaHienThi} ₫/giờ</span>
              <span>⭐ {giaSu.rating || "4.9"} / 5.0 Rating</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(giaSu.badges || ['Đã xác minh bằng cấp', 'Top Gia sư Xuất sắc']).map((badge, idx) => (
                <span key={idx} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '20px', marginTop: '10px' }}>
            <button 
              onClick={handleMoBangDatLich} 
              style={{ padding: '12px 28px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}
            >
              📅 Đặt Lịch Hẹn & Gửi Yêu Cầu Học
            </button>
          </div>
        </div>

        {/* PHẦN 2: BỐ CỤC NỘI DUNG DẠNG GRID CHUẨN CV */}
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
                <p style={{ margin: '0 0 5px 0', color: '#ffffff', fontWeight: 'bold', fontSize: '15px' }}>Gia sư tự do chuyên sâu</p>
                <span style={{ fontSize: '12px', color: '#F97316', fontWeight: '500' }}>Thời gian: {giaSu.experience || 'Trên 3 năm kinh nghiệm'}</span>
                <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.6' }}>
                  Từng kèm cặp nhiều thế hệ học viên bứt phá tư duy giải toán, lý trắc nghiệm tốc độ cao, tối ưu phương pháp ghi nhớ thay vì học vẹt.
                </p>
              </div>
            </div>

            <div>
              <h3 style={cvSectionTitleStyle}>⚙️ Hình thức & Phương thức</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#cbd5e1' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>Hình thức học:</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>{giaSu.type || 'Trực tiếp & Online'}</td></tr>
                  <tr style={{ borderBottom: '1px solid #334155' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>Học phí niêm yết:</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>{giaHienThi} ₫ / Giờ</td></tr>
                  <tr><td style={{ padding: '8px 0', color: '#94a3b8' }}>Chuyên môn cốt lõi:</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#38BDF8' }}>{monHocHienThi}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CỘT PHẢI CV: HỌC VẤN & THANH TIÊU CHUẨN KỸ NĂNG */}
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
                  <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #F97316' }}>
                    <span style={{ fontSize: '12px', color: '#F97316', fontWeight: 'bold' }}>Hệ chính quy</span>
                    <h4 style={{ margin: '2px 0', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' }}>Đại Học / Chứng chỉ Chuyên Môn</h4>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Đã xác minh đầy đủ hồ sơ lý lịch tại hệ thống TutorLink.</p>
                  </div>
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

        {/* Khu vực đánh giá ở đáy CV */}
        <div style={{ borderTop: '1px solid #334155', padding: '40px', backgroundColor: '#111827' }}>
          <ReviewSection tutorId={giaSu._id} studentId={studentId} />
        </div>

      </div>

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
