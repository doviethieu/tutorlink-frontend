import React, { useEffect, useMemo, useState } from 'react';
import ChatBox from '../../components/chat/ChatBox';
import { bookingService } from '../../services/booking.service';
import { chatService } from '../../services/chat.service';
import { useAuthStore } from '../../stores/auth-store';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('tutorlinkUser') || 'null');
  } catch {
    return null;
  }
}

function getBookingId(booking) {
  return booking?._id || booking?.id;
}

function getPartner(booking, currentRole) {
  if (currentRole === 'tutor') {
    return {
      _id: booking?.student?.id || booking?.studentId,
      name: booking?.student?.name || booking?.studentName || 'Học viên',
      email: booking?.student?.email || booking?.studentEmail || '',
      role: 'Học viên',
    };
  }

  return {
    _id: booking?.tutor?.id || booking?.tutorId,
    name: booking?.tutor?.name || booking?.tutorName || 'Gia sư',
    email: booking?.tutor?.email || '',
    role: 'Gia sư',
  };
}

function makeRoomFromBooking(booking, currentRole) {
  const id = getBookingId(booking);
  const partner = getPartner(booking, currentRole);

  return {
    id: `booking-${id}`,
    bookingId: id,
    partner,
    name: partner.name,
    role: `${partner.role} • ${booking.subject || 'Buổi học'}`,
    lastMessage: booking.status === 'confirmed'
      ? 'Lịch học đã xác nhận. Bạn có thể trao đổi thêm tại đây.'
      : 'Trao đổi trước buổi học tại phòng chat này.',
    time: booking.date || '',
    status: booking.status,
    meetingUrl: booking.meetingUrl || `/room/booking-${id}`,
  };
}

function normalizeRoom(room) {
  const id = room.roomId || room.id || `booking-${room.bookingId}`;
  const partner = room.partner || {};
  return {
    id,
    bookingId: room.bookingId,
    partner: {
      _id: partner._id || partner.id || '',
      name: partner.name || room.name || 'Thành viên',
      email: partner.email || '',
      role: partner.role || 'partner',
    },
    name: room.name || partner.name || 'Thành viên',
    role: `${partner.role === 'student' ? 'Học viên' : 'Gia sư'} • ${room.subject || 'Buổi học'}`,
    lastMessage: room.lastMessage || 'Trao đổi trước buổi học tại phòng chat này.',
    time: room.date || '',
    status: room.status,
    meetingUrl: room.meetingUrl || `/room/${id}`,
  };
}

export default function TrangChat() {
  const storeUser = useAuthStore((state) => state.user);
  const currentUser = storeUser || readStoredUser();
  const role = currentUser?.role || 'student';

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRooms() {
      setLoading(true);
      setError('');
      try {
        let nextRooms = [];

        try {
          const apiRooms = await chatService.listRooms();
          nextRooms = (Array.isArray(apiRooms) ? apiRooms : []).map(normalizeRoom);
        } catch {
          const bookings = role === 'tutor'
            ? await bookingService.listForTutor()
            : await bookingService.listForStudent({ limit: 100 });

          nextRooms = (Array.isArray(bookings) ? bookings : [])
            .filter((booking) => getBookingId(booking))
            .filter((booking) => booking.status === 'confirmed')
            .map((booking) => makeRoomFromBooking(booking, role));
        }

        if (ignore) return;
        setRooms(nextRooms);
        setActiveRoomId((prev) => prev || nextRooms[0]?.id || '');
      } catch (err) {
        if (!ignore) {
          setRooms([]);
          setError(err?.response?.data?.error?.message || 'Không thể tải danh sách phòng chat.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadRooms();
    return () => {
      ignore = true;
    };
  }, [role]);

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId) || null,
    [rooms, activeRoomId],
  );

  return (
    <div style={styles.container}>
      <div style={styles.chatShell}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Tin nhắn lớp học</h3>
            <span style={styles.onlineCount}>Realtime chat + video room</span>
          </div>

          <div style={styles.roomList}>
            {loading && <div style={styles.stateText}>Đang tải phòng chat...</div>}
            {!loading && error && <div style={styles.errorText}>{error}</div>}
            {!loading && !error && rooms.length === 0 && (
              <div style={styles.stateText}>Chưa có booking nào để mở phòng chat.</div>
            )}

            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoomId(room.id)}
                style={{
                  ...styles.roomItem,
                  backgroundColor: room.id === activeRoomId ? '#E7DED2' : 'transparent',
                }}
              >
                <div style={styles.avatarMini}>{room.name.charAt(0).toUpperCase()}</div>
                <div style={styles.roomMeta}>
                  <div style={styles.roomTopRow}>
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={styles.roomTime}>{room.time}</span>
                  </div>
                  <p style={styles.roomRole}>{room.role}</p>
                  <p style={styles.lastMessage}>{room.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main style={styles.chatArea}>
          {activeRoom ? (
            <>
              <div style={styles.chatHeader}>
                <div>
                  <h4 style={styles.activeTitle}>{activeRoom.name}</h4>
                  <p style={styles.activeSubtitle}>{activeRoom.role}</p>
                </div>
                <a href={activeRoom.meetingUrl} target="_blank" rel="noreferrer" style={styles.videoBtn}>
                  Vào video
                </a>
              </div>

              <ChatBox
                key={activeRoom.id}
                nguoiDangChat={activeRoom.partner}
                currentUser={currentUser}
                idTuUrl={activeRoom.id}
              />
            </>
          ) : (
            <div style={styles.noSelect}>Chọn một phòng chat từ danh sách bên trái.</div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#FAF7F0',
    height: 'calc(100vh - 70px)',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
  },
  chatShell: {
    maxWidth: '1200px',
    height: '100%',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    borderRadius: '14px',
    display: 'grid',
    gridTemplateColumns: '330px 1fr',
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '1px solid #E7DED2',
    backgroundColor: '#FAF7F0',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  sidebarHeader: {
    padding: '22px 18px',
    borderBottom: '1px solid #E7DED2',
  },
  sidebarTitle: {
    color: '#1E293B',
    margin: 0,
    fontSize: '17px',
    fontWeight: 800,
  },
  onlineCount: {
    color: '#10b981',
    fontSize: '12px',
    display: 'block',
    marginTop: '6px',
  },
  roomList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 8px',
  },
  roomItem: {
    width: '100%',
    display: 'flex',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '6px',
    border: 'none',
    textAlign: 'left',
    color: '#1E293B',
  },
  avatarMini: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#C05A3E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    border: '1px solid rgba(192, 90, 62, 0.24)',
    flexShrink: 0,
  },
  roomMeta: {
    minWidth: 0,
    flex: 1,
  },
  roomTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  roomName: {
    color: '#1E293B',
    fontWeight: 700,
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roomTime: {
    color: '#8A7D72',
    fontSize: '11px',
    flexShrink: 0,
  },
  roomRole: {
    margin: '4px 0 0',
    color: '#C05A3E',
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lastMessage: {
    margin: '4px 0 0',
    color: '#5F6B7A',
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatArea: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '18px',
    gap: '12px',
  },
  chatHeader: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #E7DED2',
    borderRadius: '10px',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  activeTitle: {
    margin: 0,
    color: '#1E293B',
    fontSize: '16px',
    fontWeight: 800,
  },
  activeSubtitle: {
    margin: '5px 0 0',
    color: '#5F6B7A',
    fontSize: '13px',
  },
  videoBtn: {
    textDecoration: 'none',
    backgroundColor: '#10b981',
    color: '#052e16',
    borderRadius: '8px',
    padding: '9px 14px',
    fontWeight: 800,
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  noSelect: {
    color: '#5F6B7A',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    color: '#5F6B7A',
    padding: '20px 14px',
    fontSize: '13px',
  },
  errorText: {
    color: '#fca5a5',
    padding: '20px 14px',
    fontSize: '13px',
  },
};
