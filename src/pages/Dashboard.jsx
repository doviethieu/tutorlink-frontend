import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('tutorlinkToken'); 
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null;
  const currentRole = user ? user.role : null; 

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [allTutors, setAllTutors] = useState([]);

  // Tạo cái giỏ để đựng danh sách Học viên thật từ Backend
  const [danhSachHocVien, setDanhSachHocVien] = useState([]);

  useEffect(() => {
    if (!token) {
      alert('🛑 Bạn cần đăng nhập để vào đây!');
      navigate('/login');
    }

    fetch('http://localhost:8000/api/tutors')
      .then(res => res.json())
      .then(data => setAllTutors(data))
      .catch(err => console.error(err));
  }, [token, navigate]);

  const handleDangXuat = () => {
    localStorage.removeItem('tutorlinkToken');
    localStorage.removeItem('tutorlinkUser');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  const handleTaoHoSo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name, subject: subject, price: Number(price), image: image || "https://i.pravatar.cc/150?img=11",
          status: 'Chờ duyệt',
          email: user?.email // Gắn mác email để biết hồ sơ này của ai
        })
      });
      if (response.ok) {
        alert('🎉 Hồ sơ đã được gửi đi! Vui lòng chờ CEO duyệt.');
        setName(''); setSubject(''); setPrice('');
        const res = await fetch('http://localhost:8000/api/tutors');
        const data = await res.json();
        setAllTutors(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDuyet = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tutors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã duyệt' })
      });
      if (response.ok) {
        setAllTutors(allTutors.map(t => t._id === id ? { ...t, status: 'Đã duyệt' } : t));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleXoa = async (id) => {
    if (!window.confirm("⚠️ Sếp có chắc chắn muốn XÓA hồ sơ này không?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/tutors/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAllTutors(allTutors.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // TÌM HỒ SƠ GIA SƯ CỦA CHÍNH TÀI KHOẢN NÀY
  // ==========================================
  // Chú ý: Cần thêm trường email vào Model Tutor sau này cho chuẩn
  const myTutorProfile = user ? allTutors.find(t => t.email === user.email || t.name === user.name) : null;

  // Gọi Backend lấy danh sách học viên của ông Gia sư này
  useEffect(() => {
    if (myTutorProfile && myTutorProfile._id) {
      fetch(`http://localhost:8000/api/bookings/tutor/${myTutorProfile._id}`)
        .then(res => res.json())
        .then(data => setDanhSachHocVien(data))
        .catch(err => console.error("Lỗi lấy đơn hàng:", err));
    }
  }, [myTutorProfile]);

  const giaSuChoDuyet = allTutors.filter(nguoi => nguoi.status !== 'Đã duyệt');
  const giaSuDaLenSong = allTutors.filter(nguoi => nguoi.status === 'Đã duyệt');

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* ======================================================== */}
      {/* KHU VỰC NGƯỜI DÙNG THƯỜNG / GIA SƯ */}
      {/* ======================================================== */}
      {currentRole !== 'admin' && (
        <div style={{ marginBottom: '40px' }}>
          
          {/* TRẠNG THÁI 1: CHƯA CÓ HỒ SƠ */}
          {!myTutorProfile && (
            <div style={{ backgroundColor: '#fff3cd', padding: '30px', borderRadius: '12px', border: '2px solid #ffeeba' }}>
                <h2 style={{ color: '#856404' }}>🎓 ĐĂNG KÝ LÀM GIA SƯ</h2>
                <form onSubmit={handleTaoHoSo} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
                    <input type="text" placeholder="Họ và Tên" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Môn dạy" value={subject} onChange={(e) => setSubject(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="number" placeholder="Giá tiền/giờ (VNĐ)" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Gửi Hồ Sơ Ngay</button>
                </form>
            </div>
          )}

          {/* TRẠNG THÁI 2: ĐANG CHỜ DUYỆT */}
          {myTutorProfile && myTutorProfile.status === 'Chờ duyệt' && (
            <div style={{ backgroundColor: '#e2e3e5', padding: '30px', borderRadius: '12px', border: '2px solid #d6d8db' }}>
              <h2 style={{ color: '#383d41' }}>⏳ HỒ SƠ ĐANG CHỜ DUYỆT</h2>
              <p>Hồ sơ của bạn đã được gửi lên hệ thống. Vui lòng chờ Admin duyệt để lên sóng nhé!</p>
            </div>
          )}

          {/* TRẠNG THÁI 3: ĐÃ LÊN SÓNG - GIAO DIỆN V.I.P */}
          {myTutorProfile && myTutorProfile.status === 'Đã duyệt' && (
            <div>
              <h2 style={{ color: '#2ecc71', textAlign: 'left' }}>🌟 XIN CHÀO GIA SƯ: {myTutorProfile.name}</h2>
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                
                {/* CỘT 1: DANH SÁCH HỌC VIÊN */}
                <div style={{ flex: 1, backgroundColor: '#fdfbfb', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                  <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>📚 Học viên của tôi</h3>
                  
                  {/* 🌟 MÁY LỌC TRÙNG BẰNG EMAIL */}
                  {(() => {
                    // Lọc để mỗi email chỉ xuất hiện 1 lần
                    const danhSachDaLoc = danhSachHocVien.filter((hocVien, index, mangGoc) =>
                      index === mangGoc.findIndex((t) => t.studentEmail === hocVien.studentEmail)
                    );

                    if (danhSachDaLoc.length === 0) {
                      return <p style={{ color: '#7f8c8d', fontStyle: 'italic', marginTop: '15px' }}>Chưa có học viên nào đặt lịch.</p>;
                    }

                    return danhSachDaLoc.map((hocVien) => (
                      <div key={hocVien._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', marginTop: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <strong>{hocVien.studentName}</strong> - <span style={{ color: '#e67e22', fontSize: '14px', fontWeight: 'bold' }}>{hocVien.status}</span>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>📞 {hocVien.studentPhone}</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#34495e', fontStyle: 'italic' }}>"{hocVien.message}"</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* CỘT 2: KHUNG CHAT (MOCKUP) */}
                <div style={{ flex: 1, backgroundColor: '#f4f6f9', padding: '0', borderRadius: '12px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '400px' }}>
                  <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '12px 12px 0 0', fontWeight: 'bold' }}>
                    💬 Kênh Chat Trực Tiếp
                  </div>
                  <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white' }}>
                    <div style={{ alignSelf: 'flex-start', backgroundColor: '#ecf0f1', padding: '10px', borderRadius: '10px' }}>Em chào thầy/cô ạ! Em muốn hỏi lịch học tuần sau.</div>
                    <div style={{ alignSelf: 'flex-end', backgroundColor: '#3498db', color: 'white', padding: '10px', borderRadius: '10px' }}>Chào em, chiều thứ 3 lúc 14h em nhé!</div>
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #ddd', backgroundColor: '#fdfbfb', borderRadius: '0 0 12px 12px', display: 'flex' }}>
                    <input type="text" placeholder="Nhập tin nhắn..." style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }} disabled />
                    <button disabled style={{ marginLeft: '10px', padding: '10px 15px', borderRadius: '20px', backgroundColor: '#bdc3c7', color: 'white', border: 'none' }}>Gửi</button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* KHU VỰC CEO / ADMIN */}
      {/* ======================================================== */}
      {currentRole === 'admin' && (
        <div style={{ backgroundColor: '#f8d7da', padding: '30px', borderRadius: '12px', border: '2px solid #f5c6cb' }}>
          <h2 style={{ color: '#721c24' }}>👑 KHU VỰC QUẢN TRỊ VIÊN</h2>
          
          <h3 style={{ textAlign: 'left', color: '#721c24' }}>⏳ Hồ sơ chờ duyệt ({giaSuChoDuyet.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            {giaSuChoDuyet.map(nguoi => (
              <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ textAlign: 'left' }}><strong>{nguoi.name}</strong> - {nguoi.subject}</div>
                <div>
                    <button onClick={() => handleDuyet(nguoi._id)} style={{ marginRight: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Duyệt</button>
                    <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ textAlign: 'left', color: '#155724' }}>✅ Đã lên sóng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {giaSuDaLenSong.map(nguoi => (
              <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px' }}>
                <div style={{ textAlign: 'left' }}><strong>{nguoi.name}</strong> - {nguoi.subject}</div>
                <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Xóa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleDangXuat} style={{ marginTop: '30px', padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        🚪 Đăng Xuất
      </button>
    </div>
  );
};

export default Dashboard;