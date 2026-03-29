import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🌟 MỚI THÊM: Súng ống Socket.io
import { io } from 'socket.io-client';

// 🌟 MỚI THÊM: Nối dây cáp tới trạm Backend
const socket = io('http://localhost:8000');

const Dashboard = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('tutorlinkToken'); 
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null;
  const currentRole = user ? user.role : null; 

  const [activeTab, setActiveTab] = useState('lichSu');

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [allTutors, setAllTutors] = useState([]);

  const [danhSachHocVien, setDanhSachHocVien] = useState([]);
  const [lichSuHoc, setLichSuHoc] = useState([]);

  // ==========================================
  // 🌟 KHU VỰC STATE CHO CHAT 1-1 (MESSENGER)
  // ==========================================
  const [tinNhanMoi, setTinNhanMoi] = useState('');
  const [danhSachTinNhan, setDanhSachTinNhan] = useState([]);
  
  // NGUỜI ĐANG ĐƯỢC CHỌN ĐỂ CHAT CÙNG { email, name }
  const [nguoiDangChat, setNguoiDangChat] = useState(null); 

  // 🌟 Lắng nghe bộ đàm từ Backend gửi về
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setDanhSachTinNhan((tinNhanCu) => [...tinNhanCu, data]);
    });

    // Dọn dẹp khi tắt trang
    return () => {
      socket.off('receive_message');
    };
  }, []);

  // 🌟 Hàm bấm nút Gửi tin nhắn 1-1
  const handleGuiTinNhan = () => {
    if (tinNhanMoi.trim() !== '' && nguoiDangChat) {
      const duLieuTinNhan = {
        nguoiGui: user ? user.name : "Người ẩn danh",
        emailGui: user?.email,             // Khẳng định chủ quyền người gửi
        nguoiNhan: nguoiDangChat.name,
        emailNhan: nguoiDangChat.email,   // Xác định đúng mục tiêu nhận
        noiDung: tinNhanMoi,
        thoiGian: new Date().toLocaleTimeString() // Lấy giờ hiện tại
      };
      
      // Bắn lên trạm Backend
      socket.emit('send_message', duLieuTinNhan);
      
      // Xóa trắng ô nhập sau khi gửi
      setTinNhanMoi('');
    }
  };

  // Lọc ra ĐÚNG những tin nhắn của 2 người đang nói chuyện với nhau
  const tinNhanHienThi = danhSachTinNhan.filter(msg => 
    (msg.emailGui === user?.email && msg.emailNhan === nguoiDangChat?.email) || 
    (msg.emailGui === nguoiDangChat?.email && msg.emailNhan === user?.email)
  );

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

  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:8000/api/bookings/student/${user.email}`)
        .then(res => res.json())
        .then(data => setLichSuHoc(data))
        .catch(err => console.error("Lỗi lấy lịch sử học:", err));
    }
  }, [user?.email]);

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
          email: user?.email 
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

  const handleCapNhatDon = async (idDon, trangThaiMoi) => {
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${idDon}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: trangThaiMoi })
      });
      
      if (response.ok) {
        setDanhSachHocVien(danhSachHocVien.map(don => 
          don._id === idDon ? { ...don, status: trangThaiMoi } : don
        ));
      }
    } catch (error) {
      console.error("Lỗi cập nhật đơn:", error);
    }
  };

// ==========================================
  // 🌟 HÀM XÓA ĐƠN HỌC VIÊN (Dành cho Gia sư)
  // ==========================================
  const handleXoaDonHoc = async (idDon) => {
    if (!window.confirm("🗑️ Sếp có chắc chắn muốn XÓA đơn đặt lịch này không?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${idDon}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Nếu Backend báo OK, lập tức đá nó khỏi màn hình
        setDanhSachHocVien(danhSachHocVien.filter(don => don._id !== idDon));
        // Nếu đang mở chat với đúng người bị xóa thì đóng chat lại
        if (nguoiDangChat && danhSachHocVien.find(d => d._id === idDon)?.studentEmail === nguoiDangChat.email) {
          setNguoiDangChat(null);
        }
      } else {
        alert("❌ Xóa thất bại, Sếp kiểm tra lại Backend nhé!");
      }
    } catch (error) {
      console.error("Lỗi xóa đơn:", error);
    }
  };

  const myTutorProfile = user ? allTutors.find(t => t.email === user.email || t.name === user.name) : null;

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
      
      {currentRole !== 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          <button 
            onClick={() => { setActiveTab('lichSu'); setNguoiDangChat(null); }}
            style={{ 
              padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s',
              backgroundColor: activeTab === 'lichSu' ? '#004085' : '#e2e8f0', 
              color: activeTab === 'lichSu' ? 'white' : '#4a5568',
              border: 'none', boxShadow: activeTab === 'lichSu' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Lịch Sử Học Tập
          </button>
          
          <button 
            onClick={() => { setActiveTab('giaSu'); setNguoiDangChat(null); }}
            style={{ 
              padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s',
              backgroundColor: activeTab === 'giaSu' ? '#2ecc71' : '#e2e8f0', 
              color: activeTab === 'giaSu' ? 'white' : '#4a5568',
              border: 'none', boxShadow: activeTab === 'giaSu' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Góc Gia Sư
          </button>
        </div>
      )}

      {currentRole !== 'admin' && (
        <div style={{ marginBottom: '40px' }}>
          
          {/* 📺 KÊNH 1: LỊCH SỬ ĐẶT LỊCH (GIAO DIỆN HỌC VIÊN) */}
          {activeTab === 'lichSu' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{ display: 'flex', gap: '20px', textAlign: 'left' }}>
                
                {/* CỘT 1: LỊCH SỬ ĐẶT LỊCH */}
                <div style={{ flex: 1, backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '12px', border: '2px solid #cce5ff' }}>
                  <h2 style={{ color: '#004085', borderBottom: '2px solid #b8daff', paddingBottom: '10px' }}>
                    GIA SƯ CỦA TÔI
                  </h2>
                  
                  {lichSuHoc.length === 0 ? (
                    <p style={{ color: '#6c757d', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Bạn chưa đặt lịch với gia sư nào.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                      {lichSuHoc.map((don) => {
                        const thongTinGiaSu = allTutors.find(t => t._id === don.tutorId);
                        const tenGiaSu = thongTinGiaSu ? thongTinGiaSu.name : "Gia sư (Đã ẩn)";
                        const emailGiaSu = thongTinGiaSu ? thongTinGiaSu.email : "";

                        return (
                          <div key={don._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #b8daff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '16px', color: '#2c3e50' }}>{tenGiaSu}</strong>
                              
                              {/* 🌟 NÚT BẤM ĐỂ MỞ CHAT VỚI GIA SƯ NÀY */}
                              {emailGiaSu && (
                                <button 
                                  onClick={() => setNguoiDangChat({ email: emailGiaSu, name: tenGiaSu })}
                                  style={{ 
                                    padding: '5px 10px', borderRadius: '15px', 
                                    backgroundColor: nguoiDangChat?.email === emailGiaSu ? '#2980b9' : '#e0e0e0', 
                                    color: nguoiDangChat?.email === emailGiaSu ? 'white' : 'black', 
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                                  }}
                                >
                                  💬 Chat
                                </button>
                              )}
                            </div>
                            <span style={{ display: 'inline-block', marginTop: '8px', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', 
                                backgroundColor: don.status === 'Chấp nhận' ? '#d4edda' : don.status === 'Từ chối' ? '#f8d7da' : '#fff3cd',
                                color: don.status === 'Chấp nhận' ? '#155724' : don.status === 'Từ chối' ? '#721c24' : '#856404'
                              }}>
                                {don.status === 'Chấp nhận' ? '✅ ' : don.status === 'Từ chối' ? '❌ ' : '⏳ '} 
                                {don.status}
                            </span>
                            <p style={{ margin: '8px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Lời nhắn: <em>"{don.message}"</em></p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CỘT 2: KHUNG CHAT RIÊNG TƯ (HỌC VIÊN) */}
                <div style={{ flex: 1, backgroundColor: '#f4f6f9', padding: '0', borderRadius: '12px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '400px' }}>
                  <div style={{ backgroundColor: '#2980b9', color: 'white', padding: '15px', borderRadius: '12px 12px 0 0', fontWeight: 'bold' }}>
                    {nguoiDangChat ? `💬 Đang chat với: ${nguoiDangChat.name}` : "💬 Kênh Chat Riêng Tư"}
                  </div>
                  
                  {/* Vùng hiển thị tin nhắn */}
                  <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white' }}>
                    {!nguoiDangChat ? (
                      <p style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic', marginTop: '50px' }}>👈 Hãy chọn một Gia sư bên trái để bắt đầu trò chuyện</p>
                    ) : tinNhanHienThi.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic', marginTop: '50px' }}>Chưa có tin nhắn nào với {nguoiDangChat.name}.</p>
                    ) : (
                      tinNhanHienThi.map((msg, index) => {
                        const isMyMessage = user && msg.emailGui === user.email;
                        return (
                          <div key={index} style={{ 
                            alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
                            backgroundColor: isMyMessage ? '#2980b9' : '#ecf0f1', 
                            color: isMyMessage ? 'white' : '#2c3e50', 
                            padding: '10px 15px', 
                            borderRadius: '15px',
                            maxWidth: '80%',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textAlign: isMyMessage ? 'right' : 'left' }}>
                              <strong>{msg.nguoiGui}</strong> - {msg.thoiGian}
                            </div>
                            <div>{msg.noiDung}</div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Vùng nhập tin nhắn */}
                  {nguoiDangChat && (
                    <div style={{ padding: '10px', borderTop: '1px solid #ddd', backgroundColor: '#fdfbfb', borderRadius: '0 0 12px 12px', display: 'flex' }}>
                      <input 
                        type="text" 
                        placeholder={`Nhắn cho ${nguoiDangChat.name}...`} 
                        value={tinNhanMoi}
                        onChange={(e) => setTinNhanMoi(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGuiTinNhan()}
                        style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }} 
                      />
                      <button onClick={handleGuiTinNhan} style={{ marginLeft: '10px', padding: '10px 15px', borderRadius: '20px', backgroundColor: '#2980b9', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Gửi</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 📺 KÊNH 2: GÓC GIA SƯ */}
          {activeTab === 'giaSu' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
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

              {/* TRẠNG THÁI 3: ĐÃ LÊN SÓNG */}
              {myTutorProfile && myTutorProfile.status === 'Đã duyệt' && (
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ color: '#2ecc71', marginBottom: '20px' }}>🌟 XIN CHÀO GIA SƯ: {myTutorProfile.name}</h2>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    
                    {/* CỘT 1: DANH SÁCH HỌC VIÊN */}
                    <div style={{ flex: 1, backgroundColor: '#fdfbfb', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
                      <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>📚 Học viên của tôi</h3>
                      {(() => {
                        const danhSachDaLoc = danhSachHocVien.filter((hocVien, index, mangGoc) =>
                          index === mangGoc.findIndex((t) => t.studentEmail === hocVien.studentEmail)
                        );

                        if (danhSachDaLoc.length === 0) {
                          return <p style={{ color: '#7f8c8d', fontStyle: 'italic', marginTop: '15px' }}>Chưa có học viên nào đặt lịch.</p>;
                        }

                        return danhSachDaLoc.map((hocVien) => (
                          <div key={hocVien._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', marginTop: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong>{hocVien.studentName}</strong>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {/* 🌟 NÚT BẤM CHỌN HỌC VIÊN ĐỂ CHAT */}
                                <button 
                                  onClick={() => setNguoiDangChat({ email: hocVien.studentEmail, name: hocVien.studentName })}
                                  style={{ 
                                    padding: '5px 10px', borderRadius: '15px', 
                                    backgroundColor: nguoiDangChat?.email === hocVien.studentEmail ? '#3498db' : '#e0e0e0', 
                                    color: nguoiDangChat?.email === hocVien.studentEmail ? 'white' : 'black', 
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                                  }}
                                >
                                  💬 Chat
                                </button>

                                {/* 🗑️ NÚT XÓA ĐƠN (GIA SƯ XÓA HỌC VIÊN) */}
                                <button 
                                  onClick={() => handleXoaDonHoc(hocVien._id)}
                                  style={{ 
                                    padding: '5px 10px', borderRadius: '15px', 
                                    backgroundColor: '#e74c3c', color: 'white', 
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                                  }}
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <span style={{ color: hocVien.status === 'Chấp nhận' ? '#2ecc71' : hocVien.status === 'Từ chối' ? '#e74c3c' : '#e67e22', fontSize: '14px', fontWeight: 'bold' }}>
                                {hocVien.status}
                              </span>
                            </div>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>📞 {hocVien.studentPhone} | 📧 {hocVien.studentEmail}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#34495e', fontStyle: 'italic' }}>"{hocVien.message}"</p>
                            {hocVien.status === 'Chờ xác nhận' && (
                              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleCapNhatDon(hocVien._id, 'Chấp nhận')} style={{ flex: 1, padding: '8px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Chấp nhận</button>
                                <button onClick={() => handleCapNhatDon(hocVien._id, 'Từ chối')} style={{ flex: 1, padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>❌ Từ chối</button>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>

                    {/* CỘT 2: KHUNG CHAT RIÊNG TƯ (GIA SƯ) */}
                    <div style={{ flex: 1, backgroundColor: '#f4f6f9', padding: '0', borderRadius: '12px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', height: '400px' }}>
                      <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px', borderRadius: '12px 12px 0 0', fontWeight: 'bold' }}>
                        {nguoiDangChat ? `💬 Đang chat với: ${nguoiDangChat.name}` : "💬 Kênh Chat Riêng Tư"}
                      </div>
                      
                      {/* Vùng hiển thị tin nhắn */}
                      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white' }}>
                        {!nguoiDangChat ? (
                          <p style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic', marginTop: '50px' }}>👈 Chọn một Học viên bên trái để tư vấn nhé!</p>
                        ) : tinNhanHienThi.length === 0 ? (
                          <p style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic', marginTop: '50px' }}>Chưa có tin nhắn nào. Bắt đầu hỗ trợ học viên ngay!</p>
                        ) : (
                          tinNhanHienThi.map((msg, index) => {
                            const isMyMessage = user && msg.emailGui === user.email;
                            return (
                              <div key={index} style={{ 
                                alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
                                backgroundColor: isMyMessage ? '#3498db' : '#ecf0f1', 
                                color: isMyMessage ? 'white' : '#2c3e50', 
                                padding: '10px 15px', 
                                borderRadius: '15px',
                                maxWidth: '80%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}>
                                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textAlign: isMyMessage ? 'right' : 'left' }}>
                                  <strong>{msg.nguoiGui}</strong> - {msg.thoiGian}
                                </div>
                                <div>{msg.noiDung}</div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Vùng nhập tin nhắn */}
                      {nguoiDangChat && (
                        <div style={{ padding: '10px', borderTop: '1px solid #ddd', backgroundColor: '#fdfbfb', borderRadius: '0 0 12px 12px', display: 'flex' }}>
                          <input 
                            type="text" 
                            placeholder={`Gửi ${nguoiDangChat.name}...`} 
                            value={tinNhanMoi}
                            onChange={(e) => setTinNhanMoi(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleGuiTinNhan()}
                            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }} 
                          />
                          <button onClick={handleGuiTinNhan} style={{ marginLeft: '10px', padding: '10px 15px', borderRadius: '20px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Gửi</button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* KHU VỰC ADMIN */}
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

      <button onClick={handleDangXuat} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        Đăng Xuất
      </button>

      {/* CSS Nhẹ để chuyển Tab cho mượt */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;