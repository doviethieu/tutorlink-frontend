import React, { useState, useEffect, useRef } from 'react';

export default function TrangChat() {
  // 👥 Danh sách các đoạn hội thoại (Phòng chat) mẫu
  const [rooms, setRooms] = useState([
    { id: 'r1', name: 'Gia sư Nguyễn Văn A', lastMessage: 'Hẹn sếp tối nay 19h vào lớp nhé!', time: '12:30', unread: true, role: 'Toán học 12' },
    { id: 'r2', name: 'Học viên Trần Minh Quân', lastMessage: 'Dạ phần này em hiểu rồi ạ.', time: 'Hôm qua', unread: false, role: 'Học viên' },
    { id: 'r3', name: 'Gia sư Trần Thị B', lastMessage: 'Sếp gửi giúp em file bài tập hôm trước.', time: '15 thg 5', unread: false, role: 'Tiếng Anh' }
  ]);

  const [activeRoomId, setActiveRoomId] = useState('r1');
  const [messages, setMessages] = useState({
    r1: [
      { id: 1, sender: 'tutor', text: 'Chào sếp, em đã xem qua mục tiêu học tập sếp gửi trong đơn đặt lịch.', time: '12:28' },
      { id: 2, sender: 'user', text: 'Dạ vâng, tối nay mình tập trung sửa phần hình học không gian trước được không ạ?', time: '12:29' },
      { id: 3, sender: 'tutor', text: 'Hẹn sếp tối nay 19h vào lớp nhé! Em đã chuẩn bị sẵn slide bài tập rồi.', time: '12:30' }
    ],
    r2: [
      { id: 1, sender: 'user', text: 'Thầy ơi bài 4 đề thi thử làm thế nào ạ?', time: 'Hôm qua' },
      { id: 2, sender: 'tutor', text: 'Sếp áp dụng công thức đạo hàm hàm hợp là ra ngay.', time: 'Hôm qua' },
      { id: 3, sender: 'user', text: 'Dạ phần này em hiểu rồi ạ.', time: 'Hôm qua' }
    ],
    r3: []
  });

  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Tự động cuộn xuống đáy khi có tin nhắn mới hoặc đổi phòng chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoomId]);

  // 📥 Hàm xử lý gửi tin nhắn nội bộ
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now(),
      sender: 'user', 
      text: inputText,
      time: currentTime
    };

    // Cập nhật mảng tin nhắn của phòng hiện tại
    setMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
    }));

    // Cập nhật nội dung tin nhắn cuối cùng ở danh sách bên trái
    setRooms(prev => prev.map(room => 
      room.id === activeRoomId 
        ? { ...room, lastMessage: inputText, time: currentTime, unread: false } 
        : room
    ));

    setInputText('');
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const activeChatMessages = messages[activeRoomId] || [];

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        
        {/* BÊN TRÁI: DANH SÁCH BẠN CHAT */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Tin nhắn nội bộ</h3>
            <span style={styles.onlineCount}>● Kết nối bảo mật</span>
          </div>
          
          <div style={styles.roomList}>
            {rooms.map(room => (
              <div 
                key={room.id} 
                onClick={() => {
                  setActiveRoomId(room.id);
                  // Cập nhật trạng thái unread trực tiếp trong danh sách hiển thị
                  setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread: false } : r));
                }}
                style={{
                  ...styles.roomItem,
                  backgroundColor: room.id === activeRoomId ? '#334155' : 'transparent'
                }}
              >
                <div style={styles.avatarMini}>
                  {room.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.roomMeta}>
                  <div style={styles.roomTopRow}>
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={styles.roomTime}>{room.time}</span>
                  </div>
                  <div style={styles.roomBottomRow}>
                    <p style={{
                      ...styles.lastMessage,
                      color: room.unread ? '#fff' : '#94a3b8',
                      fontWeight: room.unread ? '700' : '400'
                    }}>{room.lastMessage}</p>
                    {room.unread && <span style={styles.unreadDot} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BÊN PHẢI: KHÔNG GIAN CHAT CHI TIẾT */}
        <div style={styles.chatArea}>
          {activeRoom ? (
            <>
              {/* Thanh tiêu đề cuộc trò chuyện */}
              <div style={styles.chatHeader}>
                <div>
                  <h4 style={styles.activeTitle}>{activeRoom.name}</h4>
                  <p style={styles.activeSubtitle}>Chuyên mục giảng dạy: {activeRoom.role}</p>
                </div>
              </div>

              {/* Khu vực nội dung các tin nhắn */}
              <div style={styles.messageContent}>
                {activeChatMessages.length === 0 ? (
                  <div style={styles.emptyChat}>👋 Hãy gửi một lời chào để khởi động buổi trao đổi bài học sếp nhé!</div>
                ) : (
                  activeChatMessages.map(msg => {
                    const isMe = msg.sender === 'user';
                    return (
                      <div 
                        key={msg.id} 
                        style={{
                          ...styles.messageRow,
                          justifyContent: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div 
                          style={{
                            ...styles.messageBubble,
                            backgroundColor: isMe ? '#38bdf8' : '#334155', // Chuyển sang Sky Blue cao cấp cho tin nhắn của mình
                            color: isMe ? '#0f172a' : '#fff', // Màu chữ tương phản cao cho sếp dễ đọc
                            borderRadius: isMe ? '12px 12px 0px 12px' : '12px 12px 12px 0px'
                          }}
                        >
                          <p style={styles.msgText}>{msg.text}</p>
                          <span style={{
                            ...styles.msgTime,
                            color: isMe ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.5)'
                          }}>{msg.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Thanh nhập liệu gõ tin nhắn dưới cùng */}
              <form onSubmit={handleSendMessage} style={styles.inputArea}>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập nội dung trao đổi bài học với gia sư..."
                  style={styles.inputField}
                />
                <button type="submit" style={styles.btnSend}>Gửi ⚡</button>
              </form>
            </>
          ) : (
            <div style={styles.noSelect}>Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin sếp ơi!</div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- 🛠️ BỘ HỆ THỐNG PRESET DESIGN SLATE PREMIUM ĐỒNG BỘ TUYỆT ĐỐI ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    height: 'calc(100vh - 70px)', 
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif"
  },
  chatBox: {
    maxWidth: '1200px',
    height: '100%',
    margin: '0 auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    display: 'flex',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
  },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0f172a' // Đưa sidebar về deep dark tăng chiều sâu thị giác
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #334155'
  },
  sidebarTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '-0.3px'
  },
  onlineCount: {
    fontSize: '12px',
    color: '#10b981',
    display: 'block',
    marginTop: '6px',
    fontWeight: '600'
  },
  roomList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px'
  },
  roomItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'background 0.15s ease'
  },
  avatarMini: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#334155',
    color: '#38bdf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
    border: '1px solid rgba(56, 189, 248, 0.2)'
  },
  roomMeta: {
    flex: 1,
    minWidth: 0
  },
  roomTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  roomName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  roomTime: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: '500'
  },
  roomBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    fontSize: '12.5px',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#38bdf8', // Đồng bộ thành chấm thông báo màu Sky Blue rực rỡ
    marginLeft: '8px',
    flexShrink: 0
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e293b'
  },
  chatHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #334155',
    backgroundColor: '#1e293b'
  },
  activeTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  activeSubtitle: {
    color: '#94a3b8',
    margin: '4px 0 0 0',
    fontSize: '12.5px'
  },
  messageContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '10px 15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  msgText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word'
  },
  msgTime: {
    fontSize: '10px',
    display: 'block',
    textAlign: 'right',
    marginTop: '4px',
    fontWeight: '500'
  },
  emptyChat: {
    textAlign: 'center',
    color: '#64748b',
    paddingTop: '60px',
    fontSize: '14.5px'
  },
  inputArea: {
    padding: '16px 24px',
    borderTop: '1px solid #334155',
    backgroundColor: '#0f172a', // Đưa khu vực gõ văn bản về tone tối mượt mà
    display: 'flex',
    gap: '12px'
  },
  inputField: {
    flex: 1,
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '0 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  btnSend: {
    backgroundColor: '#38bdf8', // Đổi màu nút gửi đồng bộ với tone hệ thống
    color: '#0f172a',
    border: 'none',
    padding: '0 22px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  noSelect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '15px',
    fontWeight: '500'
  }
};