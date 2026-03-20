import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); 
  const currentRole = localStorage.getItem('role');

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

    if (currentRole === 'admin') {
      fetch('http://localhost:8000/api/tutors')
        .then(res => res.json())
        .then(data => setAllTutors(data))
        .catch(err => console.error(err));
    }
  }, [token, navigate, currentRole]);

  const giaSuChoDuyet = allTutors.filter(nguoi => nguoi.status !== 'Đã duyệt');

  const handleDangXuat = () => {
    localStorage.clear();
    // Báo cho Navbar biết để cập nhật
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
        alert('🎉 Hồ sơ đã được gửi đi thành công! Vui lòng chờ CEO duyệt để được lên sóng.');
        setName(''); setSubject(''); setPrice(''); setImage('');
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
        alert('✅ Đã duyệt thành công! Gia sư đã được lên sóng.');
        setAllTutors(allTutors.map(t => t._id === id ? { ...t, status: 'Đã duyệt' } : t));
      } else {
        alert('❌ Lỗi khi duyệt hồ sơ!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      {currentRole === 'tutor' && (
        <div style={{ backgroundColor: '#fff3cd', padding: '30px', borderRadius: '12px', border: '2px solid #ffeeba' }}>
          <h2 style={{ color: '#856404' }}>👨‍🏫 KHU VỰC GIA SƯ</h2>
          <form onSubmit={handleTaoHoSo} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
            <input type="text" placeholder="Họ và Tên (VD: Thầy Giáo Ba)" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Môn dạy (VD: Toán)" value={subject} onChange={(e) => setSubject(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="number" placeholder="Giá tiền/giờ (VNĐ)" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Gửi Hồ Sơ Kiểm Duyệt</button>
          </form>
        </div>
      )}

      {currentRole === 'student' && (
        <div style={{ backgroundColor: '#d1ecf1', padding: '30px', borderRadius: '12px', border: '2px solid #bee5eb' }}>
          <h2 style={{ color: '#0c5460' }}>👨‍🎓 KHU VỰC HỌC VIÊN</h2>
          <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>🔍 Ra Trang Chủ Tìm Gia Sư</button>
        </div>
      )}

      {currentRole === 'admin' && (
        <div style={{ backgroundColor: '#f8d7da', padding: '30px', borderRadius: '12px', border: '2px solid #f5c6cb' }}>
          <h2 style={{ color: '#721c24' }}>👑 KHU VỰC CEO (ADMIN)</h2>
          <p>Quyền lực tối thượng. Những hồ sơ dưới đây đang chờ Sếp xét duyệt.</p>

          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            {giaSuChoDuyet.length === 0 ? (
              <div style={{ padding: '15px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', textAlign: 'center' }}>
                🎉 Mọi hồ sơ đã được duyệt hết. Sếp có thể đi uống cafe! ☕
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {giaSuChoDuyet.map(nguoi => (
                  <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div>
                      <strong style={{ fontSize: '18px' }}>{nguoi.name}</strong> <br/>
                      <span style={{ color: '#666' }}>📚 Môn: {nguoi.subject} | 💰 Giá: {nguoi.price.toLocaleString()}đ</span>
                    </div>
                    <button onClick={() => handleDuyet(nguoi._id)} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ✅ Duyệt Lên Sóng
                    </button>
                  </div>
                ))}
              </div>
            )}
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