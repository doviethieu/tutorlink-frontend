import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Đưa cái handleDatLich từ tầng trên rớt xuống
function TrangChu({ tuKhoa, handleDatLich }) {
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);

  useEffect(() => {
    // Gọi điện lên API lấy danh sách gia sư
    axios.get('http://localhost:8000/api/tutors')
      .then(response => {
        const nguoiDaDuyet = response.data.filter(gs => gs.status === 'Đã duyệt');
        setDanhSachGiaSu(nguoiDaDuyet);
      })
      .catch(error => console.log("Lỗi tải dữ liệu:", error));
  }, []);

  // BỘ LỌC
  const danhSachLoc = danhSachGiaSu.filter((gs) => {
    if (!tuKhoa) return true;
    
    const ten = gs.name.toLowerCase();
    const monHoc = gs.subject.toLowerCase();
    const tuKhoaNho = tuKhoa.toLowerCase();

    return ten.includes(tuKhoaNho) || monHoc.includes(tuKhoaNho);
  });

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
                <p style={{ margin: '5px 0', color: '#f39c12' }}>⭐ {gs.rating}/5.0</p>
                
                {/* 2. Nối công tắc vào cái nút bấm để khi click nó nảy số */}
                <button 
                  onClick={() => handleDatLich(gs)}
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