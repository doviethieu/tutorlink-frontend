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

  useEffect(() => {
    if (!token) {
      alert('🛑 Bạn cần đăng nhập để vào đây!');
      navigate('/login');
    }

    // Load dữ liệu cho Admin hoặc User thường đều cần để xem trạng thái
    fetch('http://localhost:8000/api/tutors')
      .then(res => res.json())
      .then(data => setAllTutors(data))
      .catch(err => console.error(err));
  }, [token, navigate]);

  const giaSuChoDuyet = allTutors.filter(nguoi => nguoi.status !== 'Đã duyệt');
  const giaSuDaLenSong = allTutors.filter(nguoi => nguoi.status === 'Đã duyệt');

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
          status: 'Chờ duyệt'
        })
      });
      if (response.ok) {
        alert('🎉 Hồ sơ đã được gửi đi thành công! Vui lòng chờ Admin duyệt để được lên sóng.');
        setName(''); setSubject(''); setPrice('');
        // Load lại danh sách
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
        alert('✅ Đã duyệt thành công!');
        setAllTutors(allTutors.map(t => t._id === id ? { ...t, status: 'Đã duyệt' } : t));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleXoa = async (id) => {
    if (!window.confirm("⚠️ Sếp có chắc chắn muốn XÓA hồ sơ này không?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/tutors/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert(' Đã xoá thành công!');
        setAllTutors(allTutors.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* ---------------- KHU VỰC NGƯỜI DÙNG THƯỜNG / HỌC VIÊN ---------------- */}
      {(currentRole === 'user' || currentRole === 'student' || currentRole === 'tutor') && (
        <div style={{ marginBottom: '40px' }}>
            <div style={{ backgroundColor: '#fff3cd', padding: '30px', borderRadius: '12px', border: '2px solid #ffeeba', marginBottom: '20px' }}>
                <h2 style={{ color: '#856404' }}>🎓 ĐĂNG KÝ LÀM GIA SƯ</h2>
                <p>Bạn muốn kiếm thêm thu nhập? Hãy điền thông tin bên dưới.</p>
                <form onSubmit={handleTaoHoSo} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
                    <input type="text" placeholder="Họ và Tên" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Môn dạy" value={subject} onChange={(e) => setSubject(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="number" placeholder="Giá tiền/giờ (VNĐ)" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}> Gửi Hồ Sơ Ngay</button>
                </form>
            </div>
        </div>
      )}

      {/* ---------------- KHU VỰC CEO / ADMIN ---------------- */}
      {currentRole === 'admin' && (
        <div style={{ backgroundColor: '#f8d7da', padding: '30px', borderRadius: '12px', border: '2px solid #f5c6cb' }}>
          <h2 style={{ color: '#721c24' }}>👑 KHU VỰC QUẢN TRỊ VIÊN</h2>
          
          {/* CHỜ DUYỆT */}
          <h3 style={{ textAlign: 'left', color: '#721c24' }}>⏳ Hồ sơ chờ duyệt ({giaSuChoDuyet.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            {giaSuChoDuyet.map(nguoi => (
              <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
                <div style={{ textAlign: 'left' }}>
                    <strong>{nguoi.name}</strong> - {nguoi.subject}
                </div>
                <div>
                    <button onClick={() => handleDuyet(nguoi._id)} style={{ marginRight: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Duyệt</button>
                    <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                </div>
              </div>
            ))}
          </div>

          {/* ĐÃ LÊN SÓNG */}
          <h3 style={{ textAlign: 'left', color: '#155724' }}>✅ Đã lên sóng </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {giaSuDaLenSong.map(nguoi => (
              <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px' }}>
                <div style={{ textAlign: 'left' }}>
                    <strong>{nguoi.name}</strong> - {nguoi.subject}
                </div>
                <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Xóa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleDangXuat} style={{ marginTop: '30px', padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        Đăng Xuất
      </button>
    </div>
  );
};

export default Dashboard;