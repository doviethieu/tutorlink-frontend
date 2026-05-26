import { useEffect, useState } from 'react';
import { notificationService } from '../../services/notification.service';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.list({ limit: 50 });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications((items) => items.map((item) => (
      item.id === id ? { ...item, read: true } : item
    )));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <span style={styles.badge}>TutorLink</span>
          <h1 style={styles.title}>Thông báo</h1>
          <p style={styles.subtitle}>Theo dõi các cập nhật đặt lịch, buổi học và hệ thống.</p>
        </div>
        <button type="button" onClick={markAllRead} style={styles.button}>Đánh dấu đã đọc</button>
      </div>

      {loading ? (
        <div style={styles.empty}>Đang tải thông báo...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>Chưa có thông báo nào.</div>
      ) : (
        <div style={styles.list}>
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => markRead(item.id)}
              style={{
                ...styles.item,
                borderColor: item.read ? '#E7DED2' : '#C05A3E',
                backgroundColor: item.read ? '#FFFFFF' : 'rgba(192, 90, 62, 0.08)',
              }}
            >
              <div style={styles.itemTop}>
                <strong style={styles.itemTitle}>{item.title}</strong>
                {!item.read && <span style={styles.unread}>Mới</span>}
              </div>
              <p style={styles.body}>{item.body}</p>
              <span style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAF7F0',
    color: '#1E293B',
    padding: '40px 6%',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
  },
  badge: {
    color: '#C05A3E',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  title: {
    margin: '8px 0',
    color: '#1E293B',
  },
  subtitle: {
    margin: 0,
    color: '#5F6B7A',
  },
  button: {
    backgroundColor: '#C05A3E',
    color: '#FAF7F0',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    textAlign: 'left',
    border: '1px solid #E7DED2',
    borderRadius: '12px',
    padding: '18px',
    color: '#1E293B',
    cursor: 'pointer',
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  itemTitle: {
    color: '#1E293B',
  },
  unread: {
    color: '#FAF7F0',
    backgroundColor: '#C05A3E',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 800,
  },
  body: {
    color: '#1E293B',
    margin: '8px 0',
  },
  time: {
    color: '#5F6B7A',
    fontSize: '12px',
  },
  empty: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    color: '#5F6B7A',
  },
};
