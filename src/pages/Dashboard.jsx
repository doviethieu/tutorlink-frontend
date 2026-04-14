import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Socket.io
import { io } from 'socket.io-client';

// IMPORT CÁC COMPONENT CON
import AdminPanel from './AdminPanel'; 
import ChatBox from './ChatBox';
import StudentPanel from './StudentPanel';
import TutorPanel from './TutorPanel';

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

  // Lắng nghe bộ đàm từ Backend gửi về (DÀNH CHO CHAT)
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setDanhSachTinNhan((tinNhanCu) => [...tinNhanCu, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Hàm bấm nút Gửi tin nhắn 1-1
  const handleGuiTinNhan = (noiDungTinNhan) => {
    if (nguoiDangChat) {
      const duLieuTinNhan = {
        nguoiGui: user ? user.name : "Người ẩn danh",
        emailGui: user?.email,             
        nguoiNhan: nguoiDangChat.name,
        emailNhan: nguoiDangChat.email,   
        noiDung: noiDungTinNhan,
        thoiGian: new Date().toLocaleTimeString() 
      };
      
      socket.emit('send_message', duLieuTinNhan);
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

  // ==========================================
  // HÀM CẬP NHẬT TRẠNG THÁI ĐƠN HỌC (ĐÃ ĐỘ THÊM BÁO LỖI)
  // ==========================================
  const handleCapNhatDon = async (idDon, trangThaiMoi) => {
    console.log("👉 Đang gọi API Cập nhật cho đơn ID:", idDon);
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${idDon}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: trangThaiMoi })
      });

      if (response.ok) {
        alert(`✅ Đã chuyển trạng thái thành: ${trangThaiMoi}`);
        // Ghi chú: Có Socket rồi nên dòng setDanhSachHocVien dưới đây có thể không cần thiết nữa, 
        // nhưng cứ giữ nguyên code của Sếp cho an tâm.
        setDanhSachHocVien(danhSachHocVien.map(don => 
          don._id === idDon ? { ...don, status: trangThaiMoi } : don
        ));
      } else {
        const errorData = await response.json();
        alert(`❌ Lỗi từ Backend: ${errorData.message}`);
        console.error("Chi tiết lỗi:", errorData);
      }
    } catch (error) {
      alert(`❌ Lỗi Mạng/CORS: Không thể kết nối tới Backend. Chi tiết: ${error.message}`);
      console.error("Lỗi mạng/CORS:", error);
    }
  };

  // ==========================================
  // HÀM XÓA ĐƠN HỌC (ĐÃ ĐỘ THÊM BÁO LỖI)
  // ==========================================
  const handleXoaDonHoc = async (idDon) => {
    if (!window.confirm("🗑️ Sếp có chắc chắn muốn XÓA đơn đặt lịch này không?")) return;
    
    console.log("👉 Đang gọi API Xóa cho đơn ID:", idDon);
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${idDon}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert("✅ Đã xóa đơn thành công!");
        setDanhSachHocVien(danhSachHocVien.filter(don => don._id !== idDon));
        if (nguoiDangChat && danhSachHocVien.find(d => d._id === idDon)?.studentEmail === nguoiDangChat.email) {
          setNguoiDangChat(null);
        }
      } else {
        const errorData = await response.json();
        alert(`❌ Xóa thất bại: ${errorData.message}`);
        console.error("Chi tiết lỗi:", errorData);
      }
    } catch (error) {
      alert(`❌ Lỗi Mạng/CORS: Không thể kết nối tới Backend. Chi tiết: ${error.message}`);
      console.error("Lỗi mạng/CORS:", error);
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

  // ==========================================
  // ⚡ MỚI THÊM: REAL-TIME LẮNG NGHE ĐƠN ĐẶT LỊCH QUA SOCKET
  // ==========================================
  useEffect(() => {
    // 1. DÀNH CHO GIA SƯ: Nghe xem có ai đặt lịch mình không
    const handleNewBooking = (bookingData) => {
      if (myTutorProfile && bookingData.tutorId === myTutorProfile._id) {
        alert(`🔔 Ting ting! Học viên ${bookingData.studentName} vừa gửi yêu cầu đặt lịch!`);
        setDanhSachHocVien(prev => [bookingData, ...prev]);
      }
    };

    // 2. DÀNH CHO CẢ 2 BÊN: Nghe xem trạng thái đơn thay đổi (Accept/Reject)
    const handleStatusUpdated = (updatedBooking) => {
      // Nếu mình là Học sinh vừa được duyệt đơn
      if (user && updatedBooking.studentEmail === user.email) {
        alert(`📣 Đơn học của bạn đã được gia sư đổi thành: ${updatedBooking.status}`);
        setLichSuHoc(prev => prev.map(don => 
          don._id === updatedBooking._id ? updatedBooking : don
        ));
      }
      
      // Nếu mình là Gia sư vừa bấm duyệt đơn (Đồng bộ cho màn hình mượt)
      if (myTutorProfile && updatedBooking.tutorId === myTutorProfile._id) {
          setDanhSachHocVien(prev => prev.map(don => 
              don._id === updatedBooking._id ? updatedBooking : don
          ));
      }
    };

    socket.on('new_booking', handleNewBooking);
    socket.on('booking_status_updated', handleStatusUpdated);

    // Dọn dẹp Listener khi thoát trang
    return () => {
      socket.off('new_booking', handleNewBooking);
      socket.off('booking_status_updated', handleStatusUpdated);
    };
  }, [myTutorProfile, user]);
  // ==========================================


  // BIẾN COMPONENT KHUNG CHAT SẴN ĐỂ TRUYỀN XUỐNG DƯỚI
  const ChatBoxComponent = (
    <ChatBox 
      nguoiDangChat={nguoiDangChat} 
      tinNhanHienThi={tinNhanHienThi} 
      currentUser={user} 
      onSendMessage={handleGuiTinNhan} 
    />
  );

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', color: '#1F2937' }}>
      
      {/* MENU TABS CHUYỂN ĐỔI */}
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

      {/* KHU VỰC HIỂN THỊ CỦA NGƯỜI DÙNG BÌNH THƯỜNG */}
      {currentRole !== 'admin' && (
        <div style={{ marginBottom: '40px' }}>
          
          {/* KÊNH 1: LỊCH SỬ ĐẶT LỊCH (Đã được gói gọn vào StudentPanel) */}
          {activeTab === 'lichSu' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <StudentPanel 
                lichSuHoc={lichSuHoc}
                allTutors={allTutors}
                nguoiDangChat={nguoiDangChat}
                setNguoiDangChat={setNguoiDangChat}
                handleXoaDonLichSu={handleXoaDonLichSu}
                chatBox={ChatBoxComponent}
              />
            </div>
          )}

          {/* KÊNH 2: GÓC GIA SƯ (Đã được gói gọn vào TutorPanel) */}
          {activeTab === 'giaSu' && (
            <div style={{ animation: 'fadeIn 0.5s' }}>
              <TutorPanel 
                myTutorProfile={myTutorProfile}
                danhSachHocVien={danhSachHocVien}
                nguoiDangChat={nguoiDangChat}
                setNguoiDangChat={setNguoiDangChat}
                handleXoaDonHoc={handleXoaDonHoc}
                handleCapNhatDon={handleCapNhatDon}
                chatBox={ChatBoxComponent}
              />
            </div>
          )}
        </div>
      )}

      {/* KHU VỰC HIỂN THỊ DÀNH RIÊNG CHO ADMIN */}
      {currentRole === 'admin' && (
        <AdminPanel 
          allTutors={allTutors} 
          handleDuyet={handleDuyet} 
          handleXoa={handleXoa} 
        />
      )}

      <button onClick={handleDangXuat} style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#1F2937', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
        Đăng Xuất
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default Dashboard;