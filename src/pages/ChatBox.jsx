import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom'; 

const socket = io.connect("http://localhost:8000");

const ChatBox = ({ nguoiDangChat, currentUser, idTuUrl }) => {
  const { id } = useParams(); 
  
  const [tinNhanMoi, setTinNhanMoi] = useState('');
  const [tinNhanHienThi, setTinNhanHienThi] = useState([]);
  const scrollRef = useRef();

  // TẠO PHÒNG CHUNG ĐỂ 2 NGƯỜI LUÔN CHẠM MẶT NHAU
  const emailCuaToi = currentUser?.email || "khach@gmail.com";
  const emailNguoiKia = nguoiDangChat?.email || nguoiDangChat?._id || "doitac_khong_xac_dinh";
  
  let roomID = id || idTuUrl; 
  if (!roomID && nguoiDangChat) {
     roomID = [emailCuaToi, emailNguoiKia].sort().join("___");
  }

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tinNhanHienThi]);

  // 1. QUẢN LÝ VÀO PHÒNG VÀ RỜI PHÒNG (CHỐT CHẶN CHỐNG LẶP TIN NHẮN)
  useEffect(() => {
    if (roomID) {
      console.log("Đang vào phòng chat CHUNG:", roomID); 
      socket.emit("join_room", roomID);

      axios.get(`http://localhost:8000/api/messages/${roomID}`)
        .then((res) => {
          setTinNhanHienThi(res.data);
        })
        .catch((err) => console.error("Lỗi tải tin nhắn:", err));
    }

    // DỌN DẸP: Khi chuyển sang chat với người khác, tháo tai nghe phòng cũ ra!
    return () => {
      if (roomID) {
        console.log("Đã rời phòng:", roomID);
        socket.emit("leave_room", roomID);
      }
    };
  }, [roomID]);

  // 2. LẮNG NGHE TIN NHẮN TỪ SERVER
  useEffect(() => {
    const handleReceive = (data) => {
      setTinNhanHienThi((prev) => {
        // Lọc tin nhắn trùng lặp do React StrictMode hoặc lỗi mạng
        const isDuplicated = prev.some(m => 
          (m._id && m._id === data._id) || 
          (m.noiDung === data.noiDung && m.thoiGian === data.thoiGian && m.emailGui === data.emailGui) 
        );
        
        if (isDuplicated) return prev; 
        return [...prev, data];
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, []);

  // 3. XỬ LÝ GỬI TIN NHẮN
  const handleSend = async () => {
    if (!roomID) {
      alert("❌ Lỗi: Không thể khởi tạo phòng chat chung!");
      return;
    }

    if (tinNhanMoi.trim() !== '') {
      const dataTinNhan = {
        room: roomID, 
        emailGui: currentUser?.email || "khach@gmail.com",
        nguoiGui: currentUser?.name || "Khách",
        noiDung: tinNhanMoi,
        thoiGian: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      socket.emit("send_message", dataTinNhan);
      
      setTinNhanHienThi((prev) => [...prev, dataTinNhan]);
      setTinNhanMoi('');
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '480px', overflow: 'hidden' }}>
      
      {/* ======================================================== */}
      {/* KHU VỰC ĐÃ SỬA: THANH TIÊU ĐỀ + NÚT GỌI VIDEO */}
      {/* ======================================================== */}
      <div style={{ backgroundColor: '#1E3A8A', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {nguoiDangChat ? `💬 Đang chat với: ${nguoiDangChat.name}` : "💬 Kênh Chat"}
        </div>
        
        {/* Nút chỉ hiện ra khi đã chọn người để chat */}
        {nguoiDangChat && roomID && (
          <button 
            onClick={() => window.open(`/room/${roomID}`, '_blank')}
            style={{
              padding: '6px 12px', 
              backgroundColor: '#10B981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '14px',
              transition: '0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
          >
            📹 Vào lớp ngay
          </button>
        )}
      </div>
      {/* ======================================================== */}
      
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'white' }}>
        {!nguoiDangChat ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '50px' }}>👈 Chọn một người để bắt đầu</p>
        ) : tinNhanHienThi.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '50px' }}>Chưa có tin nhắn nào...</p>
        ) : (
          tinNhanHienThi.map((msg, index) => {
            const isMyMessage = currentUser && msg.emailGui === currentUser.email;
            return (
              <div key={index} style={{ 
                alignSelf: isMyMessage ? 'flex-end' : 'flex-start', 
                backgroundColor: isMyMessage ? '#1E3A8A' : '#F3F4F6', 
                color: isMyMessage ? 'white' : '#1F2937', 
                padding: '10px 15px', 
                borderRadius: '15px',
                maxWidth: '80%'
              }}>
                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', textAlign: isMyMessage ? 'right' : 'left' }}>
                  <strong>{msg.nguoiGui}</strong> - {msg.thoiGian}
                </div>
                <div style={{ lineHeight: '1.4' }}>{msg.noiDung}</div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {nguoiDangChat && (
        <div style={{ padding: '15px', borderTop: '1px solid #E5E7EB', display: 'flex' }}>
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            value={tinNhanMoi}
            onChange={(e) => setTinNhanMoi(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '10px 15px', borderRadius: '25px', border: '1px solid #D1D5DB' }} 
          />
          <button onClick={handleSend} style={{ marginLeft: '10px', padding: '0 20px', borderRadius: '25px', backgroundColor: '#F97316', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Gửi
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;