import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Socket.io
import { io } from 'socket.io-client';

// Nối dây cáp tới trạm Backend
const socket = io('http://localhost:8000');

const Dashboard = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('tutorlinkToken'); 
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null;
  const currentRole = user ? user.role : null; 

  const [activeTab, setActiveTab] = useState('lichSu');
  const [allTutors, setAllTutors] = useState([]);
  const [danhSachHocVien, setDanhSachHocVien] = useState([]);
  const [lichSuHoc, setLichSuHoc] = useState([]);

  // ==========================================
  // KHU VỰC STATE CHO CHAT 1-1 (MESSENGER)
  // ==========================================
  const [tinNhanMoi, setTinNhanMoi] = useState('');
  const [danhSachTinNhan, setDanhSachTinNhan] = useState([]);
  const [nguoiDangChat, setNguoiDangChat] = useState(null); 

  // ==========================================
  // HÀM XÓA ĐƠN Ở TAB LỊCH SỬ HỌC TẬP
  // ==========================================
  const handleXoaDonLichSu = async (idDon) => {
    if (!window.confirm("🗑️ Bạn có chắc chắn muốn xóa lịch sử đơn này không?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${idDon}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setLichSuHoc(lichSuHoc.filter(don => don._id !== idDon));
        // Xóa luôn người đang chat nếu đang chat với gia sư của đơn bị xóa
        if (nguoiDangChat && lichSuHoc.find(d => d._id === idDon)?.studentEmail === nguoiDangChat.email) {
            setNguoiDangChat(null);
        }
      } else {
        alert("❌ Xóa thất bại, Sếp kiểm tra lại Backend nhé!");
      }
    } catch (error) {
      console.error("Lỗi xóa đơn:", error);
    }
  };

  // Lắng nghe bộ đàm từ Backend gửi về
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setDanhSachTinNhan((tinNhanCu) => [...tinNhanCu, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Hàm bấm nút Gửi tin nhắn 1-1
  const handleGuiTinNhan = () => {
    if (tinNhanMoi.trim() !== '' && nguoiDangChat) {
      const duLieuTinNhan = {
        nguoiGui: user ? user.name : "Người ẩn danh",
        emailGui: user?.email,             
        nguoiNhan: nguoiDangChat.name,
        emailNhan: nguoiDangChat.email,   
        noiDung: tinNhanMoi,
        thoiGian: new Date().toLocaleTimeString() 
      };
      
      socket.emit('send_message', duLieuTinNhan);
      setTinNhanMoi('');
    }
  };

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

  const handleXoaDonHoc = async (idDon) => {
    if (!window.confirm("🗑️ Sếp có chắc chắn muốn XÓA đơn đặt lịch này không?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${idDon}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDanhSachHocVien(danhSachHocVien.filter(don => don._id !== idDon));
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
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', color: '#1F2937' }}>
      
      {currentRole !== 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          <button 
            onClick={() => { setActiveTab('lichSu'); setNguoiDangChat(null); }}
            style={{ 
              padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s',
              backgroundColor: activeTab === 'lichSu' ? '#1E3A8A' : '#E5E7EB', 
              color: activeTab === 'lichSu' ? 'white' : '#4B5563',
              border: 'none', boxShadow: activeTab === 'lichSu' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Lịch Sử Học Tập
          </button>
          
          <button 
            onClick={() => { setActiveTab('giaSu'); setNguoiDangChat(null); }}
            style={{ 
              padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s',
              backgroundColor: activeTab === 'giaSu' ? '#F97316' : '#E5E7EB', 
              color: activeTab === 'giaSu' ? 'white' : '#4B5563',
              border: 'none', boxShadow: activeTab === 'giaSu' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Góc Gia Sư
          </button>
        </div>
      )}

      {currentRole !== 'admin' && (
        <div style={{ marginBottom: '40px' }}>
          
          {/* KÊNH 1: LỊCH SỬ ĐẶT LỊCH */}
          {activeTab === 'lichSu' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <div style={{ display: 'flex', gap: '20px', textAlign: 'left' }}>
                
                {/* CỘT 1: LỊCH SỬ ĐẶT LỊCH */}
                <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <h2 style={{ color: '#1E3A8A', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px', marginTop: 0 }}>
                    GIA SƯ CỦA TÔI
                  </h2>
                  
                  {lichSuHoc.length === 0 ? (
                    <p style={{ color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Bạn chưa đặt lịch với gia sư nào.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                      {lichSuHoc.map((don) => {
                        const thongTinGiaSu = allTutors.find(t => t._id === don.tutorId);
                        const tenGiaSu = thongTinGiaSu ? thongTinGiaSu.name : "Gia sư (Đã ẩn)";
                        const emailGiaSu = thongTinGiaSu ? thongTinGiaSu.email : "";

                        return (
                          <div key={don._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '16px', color: '#1F2937' }}>{tenGiaSu}</strong>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {emailGiaSu && (
                                  <button 
                                    onClick={() => setNguoiDangChat({ email: emailGiaSu, name: tenGiaSu })}
                                    style={{ 
                                      padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                                      backgroundColor: nguoiDangChat?.email === emailGiaSu ? '#1E3A8A' : '#E5E7EB', 
                                      color: nguoiDangChat?.email === emailGiaSu ? 'white' : '#1F2937', 
                                      border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
                                    }}
                                  >
                                    💬 Chat
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleXoaDonLichSu(don._id)}
                                  style={{ 
                                    padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                                    backgroundColor: '#EF4444', color: 'white', 
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                                  }}
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </div>
                            <span style={{ display: 'inline-block', marginTop: '10px', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', 
                                backgroundColor: don.status === 'Chấp nhận' ? '#D1FAE5' : don.status === 'Từ chối' ? '#FEE2E2' : '#FEF3C7',
                                color: don.status === 'Chấp nhận' ? '#065F46' : don.status === 'Từ chối' ? '#991B1B' : '#92400E'
                              }}>
                                {don.status === 'Chấp nhận' ? '✅ ' : don.status === 'Từ chối' ? '❌ ' : '⏳ '} 
                                {don.status}
                            </span>
                            <p style={{ margin: '10px 0 0 0', color: '#4B5563', fontSize: '14px' }}>Lời nhắn: <em>"{don.message}"</em></p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CỘT 2: KHUNG CHAT RIÊNG TƯ (HỌC VIÊN) */}
                <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '0', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '450px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#1E3A8A', color: 'white', padding: '15px', fontWeight: 'bold' }}>
                    {nguoiDangChat ? `💬 Đang chat với: ${nguoiDangChat.name}` : "💬 Kênh Chat Riêng Tư"}
                  </div>
                  
                  <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white' }}>
                    {!nguoiDangChat ? (
                      <p style={{ textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', marginTop: '50px' }}>👈 Hãy chọn một Gia sư bên trái để bắt đầu trò chuyện</p>
                    ) : tinNhanHienThi.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', marginTop: '50px' }}>Chưa có tin nhắn nào với {nguoiDangChat.name}.</p>
                    ) : (
                      tinNhanHienThi.map((msg, index) => {
                        const isMyMessage = user && msg.emailGui === user.email;
                        return (
                          <div key={index} style={{ 
                            alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
                            backgroundColor: isMyMessage ? '#1E3A8A' : '#F3F4F6', 
                            color: isMyMessage ? 'white' : '#1F2937', 
                            padding: '10px 15px', 
                            borderRadius: '15px',
                            maxWidth: '80%',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textAlign: isMyMessage ? 'right' : 'left' }}>
                              <strong>{msg.nguoiGui}</strong> - {msg.thoiGian}
                            </div>
                            <div style={{ lineHeight: '1.4' }}>{msg.noiDung}</div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {nguoiDangChat && (
                    <div style={{ padding: '15px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', display: 'flex' }}>
                      <input 
                        type="text" 
                        placeholder={`Nhắn cho ${nguoiDangChat.name}...`} 
                        value={tinNhanMoi}
                        onChange={(e) => setTinNhanMoi(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGuiTinNhan()}
                        style={{ flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '14px' }} 
                      />
                      <button onClick={handleGuiTinNhan} style={{ marginLeft: '10px', padding: '0 20px', borderRadius: '25px', backgroundColor: '#F97316', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>Gửi</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* KÊNH 2: GÓC GIA SƯ */}
          {activeTab === 'giaSu' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              
              {/* 1. CHƯA CÓ HỒ SƠ -> NÚT DẪN SANG TRANG TẠO CV */}
              {!myTutorProfile && (
                <div style={{ backgroundColor: '#F9FAFB', padding: '40px 30px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <h2 style={{ color: '#1E3A8A', marginTop: 0, fontSize: '24px' }}>🎓 TRỞ THÀNH GIA SƯ ĐỐI TÁC</h2>
                    <p style={{ color: '#4B5563', fontSize: '16px', marginBottom: '25px', lineHeight: '1.6' }}>
                      Để đảm bảo chất lượng giảng dạy, bạn cần tạo Hồ sơ CV chi tiết và tham gia một buổi phỏng vấn ngắn với Admin trước khi chính thức lên sóng.
                    </p>
                    <button 
                      onClick={() => navigate('/tao-cv')} 
                      style={{ padding: '15px 30px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(249, 115, 22, 0.3)' }}
                    >
                      📝 Bắt đầu tạo CV Gia sư
                    </button>
                </div>
              )}

              {/* 2. ĐÃ NỘP CV -> CHỜ PHỎNG VẤN VỚI ADMIN */}
              {myTutorProfile && myTutorProfile.status === 'Chờ duyệt' && (
                <div style={{ backgroundColor: '#FFFBEB', padding: '30px', borderRadius: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
                  <h2 style={{ color: '#B45309', marginTop: 0 }}>⏳ ĐANG CHỜ SẮP XẾP PHỎNG VẤN</h2>
                  <p style={{ color: '#92400E', fontSize: '16px', lineHeight: '1.6' }}>
                    🎉 CV của bạn đã được gửi thành công! <br/>
                    Admin đang xem xét hồ sơ và sẽ sớm liên hệ với bạn (qua Số điện thoại/Email) để sắp xếp lịch phỏng vấn online. Hãy để ý điện thoại nhé!
                  </p>
                </div>
              )}

              {/* 3. ĐÃ ĐẬU PHỎNG VẤN (ĐÃ DUYỆT) -> HIỆN THÔNG TIN GIA SƯ */}
              {myTutorProfile && myTutorProfile.status === 'Đã duyệt' && (
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ color: '#1E3A8A', marginBottom: '20px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>🌟 XIN CHÀO GIA SƯ: {myTutorProfile.name}</h2>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    
                    {/* CỘT 1: DANH SÁCH HỌC VIÊN */}
                    <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                      <h3 style={{ color: '#1F2937', marginTop: 0 }}>📚 Học viên của tôi</h3>
                      {(() => {
                        const danhSachDaLoc = danhSachHocVien.filter((hocVien, index, mangGoc) =>
                          index === mangGoc.findIndex((t) => t.studentEmail === hocVien.studentEmail)
                        );

                        if (danhSachDaLoc.length === 0) {
                          return <p style={{ color: '#6B7280', fontStyle: 'italic', marginTop: '15px' }}>Chưa có học viên nào đặt lịch.</p>;
                        }

                        return danhSachDaLoc.map((hocVien) => (
                          <div key={hocVien._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', marginTop: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '16px', color: '#1F2937' }}>{hocVien.studentName}</strong>
                              
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => setNguoiDangChat({ email: hocVien.studentEmail, name: hocVien.studentName })}
                                  style={{ 
                                    padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                                    backgroundColor: nguoiDangChat?.email === hocVien.studentEmail ? '#1E3A8A' : '#E5E7EB', 
                                    color: nguoiDangChat?.email === hocVien.studentEmail ? 'white' : '#1F2937', 
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                                  }}
                                >
                                  💬 Chat
                                </button>

                                <button 
                                  onClick={() => handleXoaDonHoc(hocVien._id)}
                                  style={{ 
                                    padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                                    backgroundColor: '#EF4444', color: 'white', 
                                    border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                                  }}
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                              <span style={{ color: hocVien.status === 'Chấp nhận' ? '#10B981' : hocVien.status === 'Từ chối' ? '#EF4444' : '#F59E0B', fontSize: '14px', fontWeight: 'bold' }}>
                                {hocVien.status}
                              </span>
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4B5563' }}>📞 {hocVien.studentPhone} | 📧 {hocVien.studentEmail}</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#1F2937', fontStyle: 'italic', backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '4px' }}>"{hocVien.message}"</p>
                            
                            {hocVien.status === 'Chờ xác nhận' && (
                              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleCapNhatDon(hocVien._id, 'Chấp nhận')} style={{ flex: 1, padding: '10px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Chấp nhận</button>
                                <button onClick={() => handleCapNhatDon(hocVien._id, 'Từ chối')} style={{ flex: 1, padding: '10px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>❌ Từ chối</button>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>

                    {/* CỘT 2: KHUNG CHAT RIÊNG TƯ (GIA SƯ) */}
                    <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '0', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '500px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#1E3A8A', color: 'white', padding: '15px', fontWeight: 'bold' }}>
                        {nguoiDangChat ? `💬 Đang chat với: ${nguoiDangChat.name}` : "💬 Kênh Chat Riêng Tư"}
                      </div>
                      
                      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white' }}>
                        {!nguoiDangChat ? (
                          <p style={{ textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', marginTop: '50px' }}>👈 Chọn một Học viên bên trái để tư vấn nhé!</p>
                        ) : tinNhanHienThi.length === 0 ? (
                          <p style={{ textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', marginTop: '50px' }}>Chưa có tin nhắn nào. Bắt đầu hỗ trợ học viên ngay!</p>
                        ) : (
                          tinNhanHienThi.map((msg, index) => {
                            const isMyMessage = user && msg.emailGui === user.email;
                            return (
                              <div key={index} style={{ 
                                alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
                                backgroundColor: isMyMessage ? '#1E3A8A' : '#F3F4F6', 
                                color: isMyMessage ? 'white' : '#1F2937', 
                                padding: '10px 15px', 
                                borderRadius: '15px',
                                maxWidth: '80%',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}>
                                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textAlign: isMyMessage ? 'right' : 'left' }}>
                                  <strong>{msg.nguoiGui}</strong> - {msg.thoiGian}
                                </div>
                                <div style={{ lineHeight: '1.4' }}>{msg.noiDung}</div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {nguoiDangChat && (
                        <div style={{ padding: '15px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', display: 'flex' }}>
                          <input 
                            type="text" 
                            placeholder={`Gửi ${nguoiDangChat.name}...`} 
                            value={tinNhanMoi}
                            onChange={(e) => setTinNhanMoi(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleGuiTinNhan()}
                            style={{ flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '14px' }} 
                          />
                          <button onClick={handleGuiTinNhan} style={{ marginLeft: '10px', padding: '0 20px', borderRadius: '25px', backgroundColor: '#F97316', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>Gửi</button>
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
        <div style={{ backgroundColor: '#FEF2F2', padding: '30px', borderRadius: '12px', border: '1px solid #FECACA' }}>
          <h2 style={{ color: '#991B1B', marginTop: 0 }}>👑 KHU VỰC QUẢN TRỊ VIÊN</h2>
          <h3 style={{ textAlign: 'left', color: '#991B1B' }}>⏳ Hồ sơ chờ phỏng vấn ({giaSuChoDuyet.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            {giaSuChoDuyet.map(nguoi => (
              <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                <div style={{ textAlign: 'left' }}>
                  <strong>{nguoi.name}</strong> - {nguoi.subject}
                  <br/>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>📧 {nguoi.email}</span>
                </div>
                <div>
                    <button onClick={() => handleDuyet(nguoi._id)} style={{ marginRight: '10px', backgroundColor: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Duyệt (Pass)</button>
                    <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Từ chối (Xóa)</button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ textAlign: 'left', color: '#065F46' }}>✅ Gia sư đã lên sóng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {giaSuDaLenSong.map(nguoi => (
              <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#D1FAE5', padding: '15px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                <div style={{ textAlign: 'left', color: '#065F46' }}><strong>{nguoi.name}</strong> - {nguoi.subject}</div>
                <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Xóa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleDangXuat} style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#1F2937', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
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