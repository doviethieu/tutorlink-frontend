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

  // Tự động cuộn xuống đáy khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoomId]);

  // 📥 Hàm xử lý gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: Date.now(),
      sender: 'user', // Mặc định người dùng hiện tại
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
            <span style={styles.onlineCount}>Hệ thống bảo mật</span>
          </div>
          
          <div style={styles.roomList}>
            {rooms.map(room => (
              <div 
                key={room.id} 
                onClick={() => {
                  setActiveRoomId(room.id);
                  room.unread = false; // Đọc rồi thì xóa unread
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
                    <p style={styles.lastMessage}>{room.lastMessage}</p>
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
              {/* Thanh tiêu đề trên cùng của cuộc trò chuyện */}
              <div style={styles.chatHeader}>
                <div>
                  <h4 style={styles.activeTitle}>{activeRoom.name}</h4>
                  <p style={styles.activeSubtitle}>Chuyên mục: {activeRoom.role}</p>
                </div>
              </div>

              {/* Khu vực hiển thị nội dung các dòng tin nhắn */}
              <div style={styles.messageContent}>
                {activeChatMessages.length === 0 ? (
                  <div style={styles.emptyChat}>👋 Hãy mở lời bằng một lời chào để bắt đầu buổi trao đổi!</div>
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
                            backgroundColor: isMe ? '#3498db' : '#334155',
                            color: '#fff',
                            borderRadius: isMe ? '12px 12px 0px 12px' : '12px 12px 12px 0px'
                          }}
                        >
                          <p style={styles.msgText}>{msg.text}</p>
                          <span style={styles.msgTime}>{msg.time}</span>
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
                  placeholder="Nhập nội dung tin nhắn trao đổi bài học..."
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

// --- HỆ THỐNG CSS INLINE STYLE HOÀN QUYỆN DARK COMPLEX ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    height: 'calc(100vh - 70px)', // Trừ bớt chiều cao của Navbar
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },
  chatBox: {
    maxWidth: '1200px',
    height: '100%',
    margin: '0 auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    display: 'flex',
    overflow: 'hidden'
  },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#111827'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #334155'
  },
  sidebarTitle: {
    color: '#f8fafc',
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  onlineCount: {
    fontSize: '12px',
    color: '#10b981',
    display: 'block',
    marginTop: '4px'
  },
  roomList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px'
  },
  roomItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '6px',
    transition: 'background 0.2s'
  },
  avatarMini: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#475569',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
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
    color: '#f1f5f9',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  roomTime: {
    color: '#64748b',
    fontSize: '11px'
  },
  roomBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lastMessage: {
    color: '#94a3b8',
    fontSize: '12px',
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
    backgroundColor: '#3498db',
    marginLeft: '6px'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e293b'
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
    backgroundColor: '#1e293b'
  },
  activeTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold'
  },
  activeSubtitle: {
    color: '#94a3b8',
    margin: '2px 0 0 0',
    fontSize: '12px'
  },
  messageContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    position: 'relative'
  },
  msgText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    wordBreak: 'break-word'
  },
  msgTime: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.6)',
    display: 'block',
    textAlign: 'right',
    marginTop: '4px'
  },
  emptyChat: {
    textAlign: 'center',
    color: '#64748b',
    paddingTop: '40px',
    fontSize: '14px'
  },
  inputArea: {
    padding: '16px',
    borderTop: '1px solid #334155',
    backgroundColor: '#111827',
    display: 'flex',
    gap: '12px'
  },
  inputField: {
    flex: 1,
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '0 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  btnSend: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '0 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  noSelect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748b',
    fontSize: '15px'
  }
};