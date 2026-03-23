import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  // CHỐT ĐƠN TỰ ĐỘNG
  // ==========================================
  const handleChotDon = async (giaSu) => {
    const userString = localStorage.getItem('tutorlinkUser');
    if (!userString) {
      alert("🛑 Bạn phải đăng nhập thì mới được kết nối với Gia sư nhé!");
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
        message: `Chào gia sư ${giaSu.name}, mình muốn đặt lịch học môn ${giaSu.subject}!`
      });

      if (response.status === 201 || response.status === 200) {
        alert(`🎉 Đã chốt đơn thành công với gia sư ${giaSu.name}!`);
      }
    } catch (error) {
      console.error("Lỗi đặt lịch:", error);
      // Đọc đúng lời nhắn chống spam từ Backend!
      const thongBaoLoi = error.response?.data?.message || "Lỗi đường truyền, chưa chốt được đơn!";
      alert(`❌ ${thongBaoLoi}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontSize: '28px' }}>
        👨‍🏫 Danh sách Gia sư Nổi bật
      </h2>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {danhSachLoc.length > 0 ? (
          danhSachLoc.map((gs) => (
            <div key={gs._id} style={{
              backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)', width: '300px',
              transition: 'transform 0.3s', cursor: 'pointer'
            }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <img src={gs.image} alt={gs.name} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>{gs.name}</h3>
                <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '15px' }}>📚 Môn: <strong>{gs.subject}</strong></p>
                <p style={{ margin: '5px 0', color: '#e74c3c', fontSize: '18px', fontWeight: 'bold' }}>
                  💰 {gs.price.toLocaleString()}đ/h
                </p>
                <p style={{ margin: '5px 0', color: '#f39c12' }}>⭐ {gs.rating || "5.0"}/5.0</p>
                
                <button 
                  onClick={() => handleChotDon(gs)}
                  style={{
                  width: '100%', padding: '12px', marginTop: '15px', backgroundColor: '#3498db',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                }}>
                  📅 Đặt lịch học ngay
                </button>

              </div>
            </div>
          ))
        ) : (
          <h3 style={{ color: '#7f8c8d', width: '100%', textAlign: 'center' }}>
            🕵️‍♂️ Không tìm thấy gia sư nào phù hợp với từ khóa "{tuKhoa}"!
          </h3>
        )}
      </div>
    </div>
  );
}

export default TrangChu;