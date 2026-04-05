import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import ChatBox from './ChatBox'; // Gọi cái giao diện chat vào đây

const socket = io.connect("http://localhost:8000");

const TrangChat = () => {
  // Lấy user đang đăng nhập (giả lập hoặc từ localStorage)
  const currentUser = JSON.parse(localStorage.getItem('tutorlinkUser')) || { name: "Test User", email: "test@gmail.com" };
  
  // Trạng thái quản lý phòng và tin nhắn
  const [nguoiDangChat, setNguoiDangChat] = useState(null); // Ví dụ: { _id: "123", name: "Gia sư A" }
  const [tinNhanHienThi, setTinNhanHienThi] = useState([]);

  // 1. KHI CHỌN NGƯỜI ĐỂ CHAT -> VÀO PHÒNG & TẢI LỊCH SỬ
  useEffect(() => {
    if (nguoiDangChat) {
      const roomID = nguoiDangChat._id; // Dùng ID người kia làm phòng
      socket.emit("join_room", roomID);

      // Tải lịch sử chat từ Database
      axios.get(`http://localhost:8000/api/messages/${roomID}`)
        .then((res) => setTinNhanHienThi(res.data))
        .catch((err) => console.log("Lỗi tải tin nhắn:", err));
    }
  }, [nguoiDangChat]);

  // 2. LẮNG NGHE TIN NHẮN TỪ SOCKET ĐỔ VỀ
  useEffect(() => {
    const nhanTinNhan = (data) => {
      setTinNhanHienThi((listCu) => [...listCu, data]);
    };
    
    socket.on("receive_message", nhanTinNhan);
    return () => socket.off("receive_message", nhanTinNhan); // Dọn dẹp để không bị nhân đôi tin nhắn
  }, []);

  // 3. HÀM XỬ LÝ KHI BẤM NÚT "GỬI" (Truyền xuống ChatBox)
  const handleSendMessage = async (noiDungMoi) => {
    if (!nguoiDangChat) return;

    const dataTinNhan = {
      room: nguoiDangChat._id,
      emailGui: currentUser.email,
      nguoiGui: currentUser.name,
      noiDung: noiDungMoi,
      thoiGian: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Bắn lên Backend để lưu DB và gửi cho người kia
    await socket.emit("send_message", dataTinNhan);
    
    // Tự hiện lên màn hình của mình
    setTinNhanHienThi((listCu) => [...listCu, dataTinNhan]);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      
      {/* KHUNG BÊN TRÁI: DANH SÁCH NGƯỜI DÙNG (Demo nhanh) */}
      <div style={{ width: '250px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h3>Danh bạ</h3>
        <button 
          onClick={() => setNguoiDangChat({ _id: "room_giasu_A", name: "Gia sư Toán" })}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', cursor: 'pointer' }}
        >
          Chat với Gia sư Toán
        </button>
      </div>

      {/* KHUNG BÊN PHẢI: CHATBOX */}
      <ChatBox 
        nguoiDangChat={nguoiDangChat} 
        tinNhanHienThi={tinNhanHienThi} 
        currentUser={currentUser} 
        onSendMessage={handleSendMessage} 
      />
      
    </div>
  );
};

export default TrangChat;