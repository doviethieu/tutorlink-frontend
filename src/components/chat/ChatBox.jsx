import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import io from 'socket.io-client';
import { api, API_BASE_URL, unwrap } from '../../lib/api';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

const ChatBox = ({ nguoiDangChat, currentUser, idTuUrl }) => {
  const { id } = useParams(); 
  
  const [tinNhanMoi, setTinNhanMoi] = useState('');
  const [tinNhanHienThi, setTinNhanHienThi] = useState([]);
  const scrollRef = useRef();

  // TẠO PHÒNG CHUNG ĐỂ 2 NGƯỜI LUÔN CHẠM MẶT NHAU
  const emailCuaToi = currentUser?.email || '';
  const emailNguoiKia = nguoiDangChat?.email || nguoiDangChat?._id || "doitac_khong_xac_dinh";
  
  const roomID = useMemo(() => {
    if (idTuUrl) return idTuUrl;
    if (id) return id;
    if (!nguoiDangChat) return '';
    return [emailCuaToi, emailNguoiKia].sort().join("___");
  }, [emailCuaToi, emailNguoiKia, id, idTuUrl, nguoiDangChat]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tinNhanHienThi]);

  // 1. QUẢN LÝ VÀO PHÒNG VÀ RỜI PHÒNG (CHỐT CHẶN CHỐNG LẶP TIN NHẮN)
  useEffect(() => {
    if (roomID) {
      const token = localStorage.getItem('tutorlinkToken');
      socket.auth = { token };
      if (!socket.connected) socket.connect();
      socket.emit("join_room", roomID);

      api.get(`/chat/messages/${encodeURIComponent(roomID)}`)
        .then((res) => {
          const rows = unwrap(res.data);
          setTinNhanHienThi(Array.isArray(rows) ? rows : []);
        })
        .catch((err) => console.error("Lỗi tải tin nhắn từ DB:", err));
    }

    // DỌN DẸP: Khi chuyển sang chat với người khác, rời phòng cũ tránh nhận nhầm tin chéo phòng
    return () => {
      if (roomID) {
        socket.emit("leave_room", roomID);
      }
    };
  }, [roomID]);

  // 2. LẮNG NGHE TIN NHẮN REALTIME TỪ SERVER
  useEffect(() => {
    const handleReceive = (data) => {
      setTinNhanHienThi((prev) => {
        // Chặn trùng tin nhắn do cơ chế StrictMode hoặc trùng lặp gói tin mạng
        const isDuplicated = prev.some(m => 
          (m._id && data._id && m._id === data._id) || 
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

  // 3. XỬ LÝ GỬI TIN NHẮN (ĐÃ ĐỒNG BỘ LƯU DATABASE MongoDB)
  const handleSend = async () => {
    if (!roomID) {
      alert("❌ Lỗi: Không thể khởi tạo phòng chat chung!");
      return;
    }

    if (tinNhanMoi.trim() !== '') {
      const dataTinNhan = {
        roomId: roomID,
        room: roomID,
        emailGui: currentUser?.email || "khach@gmail.com",
        nguoiGui: currentUser?.name || "Khách",
        content: tinNhanMoi.trim(),
        noiDung: tinNhanMoi.trim(),
        thoiGian: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        const res = await api.post('/chat/messages', dataTinNhan);
        
        // Sử dụng data trả về từ DB (có kèm theo định danh `_id` thật) để tránh lỗi key lặp
        const savedMsg = unwrap(res.data) || dataTinNhan;

        setTinNhanHienThi((prev) => (
          prev.some((m) => m._id && savedMsg._id && m._id === savedMsg._id) ? prev : [...prev, savedMsg]
        ));
        setTinNhanMoi('');
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#FAF7F0', borderRadius: '12px', border: '1px solid #E7DED2', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      
      {/* THANH TIÊU ĐỀ + NÚT VÀO PHÒNG HỌC VIDEO TRỰC TUYẾN */}
      <div style={{ backgroundColor: '#FFFFFF', color: '#FAF7F0', padding: '14px 16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E7DED2' }}>
        <div>
          {nguoiDangChat ? `💬 Đang chat với: ${nguoiDangChat.name}` : "💬 Kênh Chat"}
        </div>
        
        {/* Nút chỉ hiện ra khi đã chọn người để chat */}
        {nguoiDangChat && roomID && (
          <button 
            onClick={() => window.open(`/room/${roomID}`, '_blank')}
            style={{
              padding: '6px 12px', 
              backgroundColor: '#10b981', 
              color: '#052e16', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '14px',
              transition: '0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            📹 Vào lớp ngay
          </button>
        )}
      </div>
      
      {/* KHU VỰC HIỂN THỊ NỘI DUNG CHAT */}
      <div style={{ flex: 1, minHeight: 0, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#FAF7F0' }}>
        {!nguoiDangChat ? (
          <p style={{ textAlign: 'center', color: '#5F6B7A', marginTop: '50px' }}>Chọn một người để bắt đầu hội thoại</p>
        ) : tinNhanHienThi.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#5F6B7A', marginTop: '50px' }}>Hãy gửi tin nhắn để bắt đầu trao đổi.</p>
        ) : (
          tinNhanHienThi.map((msg, index) => {
            const senderId = String(msg.senderId?._id || msg.senderId || '');
            const currentId = String(currentUser?._id || currentUser?.id || '');
            const isMyMessage = currentUser && (msg.emailGui === currentUser.email || senderId === currentId);
            return (
              <div key={msg._id || index} style={{ 
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
                <div style={{ lineHeight: '1.4', wordBreak: 'break-word' }}>{msg.noiDung}</div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* THANH INPUT NHẬP LIỆU GỬI ĐI */}
      {nguoiDangChat && (
        <div style={{ padding: '15px', borderTop: '1px solid #E7DED2', display: 'flex', backgroundColor: '#FFFFFF' }}>
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            value={tinNhanMoi}
            onChange={(e) => setTinNhanMoi(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '10px 15px', borderRadius: '25px', border: '1px solid #E7DED2', outline: 'none', backgroundColor: '#FAF7F0', color: '#1E293B' }} 
          />
          <button onClick={handleSend} style={{ marginLeft: '10px', padding: '0 20px', borderRadius: '25px', backgroundColor: '#F97316', color: '#FAF7F0', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Gửi
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
