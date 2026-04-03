import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 

function TrangChu({ tuKhoa }) { 
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  const navigate = useNavigate(); 

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

  // ==========================================
  // CHỐT ĐƠN HỌC THỬ TỰ ĐỘNG
  // ==========================================
  const handleDangKyHocThu = async (giaSu) => {
    const userString = localStorage.getItem('tutorlinkUser');
    if (!userString) {
      alert("🛑 Bạn phải đăng nhập thì mới đăng ký học thử được nhé!");
      navigate('/login'); 
      return;
    }

    const user = JSON.parse(userString);

    try {
      const response = await axios.post('http://localhost:8000/api/bookings', {
        tutorId: giaSu._id, 
        studentName: user.name, 
        studentEmail: user.email, 
        studentPhone: "Trao đổi qua Chat", 
        // Đã sửa lại lời nhắn thành Học thử miễn phí
        message: `Chào gia sư ${giaSu.name}, mình muốn đăng ký học thử miễn phí môn ${giaSu.subject} với bạn!`
      });

      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đã gửi yêu cầu học thử thành công đến gia sư ${giaSu.name}! Vui lòng chờ gia sư phản hồi.`);
      }
    } catch (error) {
      console.error("Lỗi đặt lịch:", error);
      const thongBaoLoi = error.response?.data?.message || "Lỗi đường truyền, chưa gửi được yêu cầu!";
      alert(`❌ ${thongBaoLoi}`);
    }
  };

  // ==========================================
  // CHUYỂN HƯỚNG SANG TRANG XEM HỒ SƠ
  // ==========================================
  const handleXemHoSo = (idGiaSu) => {
    // Tạm thời em để navigate tới /giasu/id. 
    // Nếu Sếp chưa làm trang chi tiết này thì nó sẽ ra màn hình trắng, lúc đó Sếp báo em để làm thêm trang chi tiết nha!
    navigate(`/giasu/${idGiaSu}`);
  };

  return (
    <>
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
                border: '1px solid #F1F5F9'
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
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: '0', fontSize: '22px', color: '#1E293B', fontWeight: 'bold' }}>{gs.name}</h3>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                      ⭐ {gs.rating || "5.0"}
                    </span>
                  </div>
                  
                  <p style={{ margin: '8px 0', color: '#64748B', fontSize: '15px' }}>📚 Môn dạy: <strong>{gs.subject}</strong></p>
                  <p style={{ margin: '8px 0', color: '#10B981', fontSize: '18px', fontWeight: 'bold' }}>
                    💰 {gs.price.toLocaleString()}đ<span style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 'normal' }}>/giờ</span>
                  </p>
                  
                  {/* KHU VỰC 2 NÚT BẤM MỚI */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                    
                    {/* Nút 1: Học thử miễn phí (Nút chính) */}
                    <button 
                      onClick={() => handleDangKyHocThu(gs)}
                      style={{
                        width: '100%', padding: '12px', backgroundColor: '#3B82F6',
                        color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', 
                        fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                    >
                      🎁 Đăng ký học thử miễn phí
                    </button>

                    {/* Nút 2: Xem hồ sơ (Nút phụ) */}
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
    </>
  );
}

export default TrangChu;