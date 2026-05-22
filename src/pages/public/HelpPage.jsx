import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/report.service';

function TroGiup() {
  // Lấy data user đã đăng nhập sẵn từ hệ thống
  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user'));
  // Xác định vai trò chuẩn của tài khoản
  let userRole = "Khách";
  if (userData) {
    userRole = userData.role || (userData.user?.role === 'tutor' ? 'Gia sư' : 'Học viên');
  }

  // State quản lý form dữ liệu hỗ trợ
  const [formData, setFormData] = useState({
    name: userData?.name || userData?.user?.name || '',
    email: userData?.email || userData?.user?.email || '',
    role: userRole,
    topic: 'Lỗi hệ thống / Kỹ thuật',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const token = localStorage.getItem('tutorlinkToken') || localStorage.getItem('token');
      if (!token) {
        setTickets([]);
        return;
      }

      const data = await reportService.listMine();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Không tải được lịch sử hỗ trợ:', error);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('tutorlinkToken') || localStorage.getItem('token');
      if (!token) {
        alert('Bạn cần đăng nhập để gửi yêu cầu hỗ trợ.');
        return;
      }

      const response = await reportService.create({
        ...formData,
        title: formData.topic,
        body: formData.message,
        type: formData.topic.includes('Khiếu nại') ? 'Complaint' : 'Support',
        target: formData.topic,
      });

      alert(response?.meta?.message || "Đã gửi phiếu hỗ trợ thành công! Ban quản trị sẽ phản hồi qua email sớm nhất.");
      setFormData(prev => ({ ...prev, message: '' }));
      loadTickets();
    } catch (error) {
      const message = error?.response?.data?.error?.message || 'Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardBox}>
        
        {/* KHỐI TIÊU ĐỀ TRUNG TÂM HỖ TRỢ */}
        <div style={styles.headerArea}>
          <span style={styles.topBadge}>TRUNG TÂM TRỢ GIÚP 24/7</span>
          <h2 style={styles.title}>📬 Gửi yêu cầu hỗ trợ</h2>
          <p style={styles.subtitle}>
            Sếp đang gặp sự cố kỹ thuật hoặc lỗi vận hành? Hãy gửi ticket trực tiếp tới ban quản trị TutorLink để được xử lý trong vòng 15 phút.
          </p>
        </div>

        {/* FORM LIÊN HỆ ĐỒNG BỘ SLATE DARK */}
        <form onSubmit={handleSubmit} style={styles.formContainer}>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Họ và tên tài khoản *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên của sếp"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Địa chỉ Email nhận phản hồi *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.flexRow}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={styles.label}>Vai trò</label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Học viên">Học viên</option>
                <option value="Gia sư">Gia sư</option>
                <option value="Khách">Khách vãng lai</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={styles.label}>Chủ đề cần xử lý *</label>
              <select 
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Lỗi hệ thống / Kỹ thuật">Lỗi hệ thống / Kỹ thuật</option>
                <option value="Tài khoản / Đăng nhập">Tài khoản / Đăng nhập</option>
                <option value="Thanh toán / Học phí">Thanh toán / Học phí</option>
                <option value="Khiếu nại / Tố cáo">Khiếu nại / Tố cáo gia sư</option>
                <option value="Hợp tác / Khác">Chủ đề câu hỏi khác</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nội dung mô tả chi tiết vấn đề *</label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Sếp vui lòng mô tả chi tiết lỗi phát sinh, mã đơn đặt lịch hoặc thời gian bốc lỗi hệ thống để bên em xử lý nhanh nhất..."
              style={styles.textarea}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.btnSubmit,
              backgroundColor: loading ? '#475569' : '#38bdf8',
              color: loading ? '#94a3b8' : '#0f172a',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "⏳ Đang nén dữ liệu gửi đi..." : "🚀 Gửi Yêu Cầu Tới Ban Quản Trị"}
          </button>

        </form>

        <div style={styles.ticketHistory}>
          <div style={styles.ticketHeader}>
            <h3 style={styles.ticketTitle}>Lịch sử yêu cầu</h3>
            <span style={styles.ticketCount}>{tickets.length} ticket</span>
          </div>

          {ticketsLoading ? (
            <p style={styles.emptyText}>Đang tải lịch sử hỗ trợ...</p>
          ) : tickets.length === 0 ? (
            <p style={styles.emptyText}>Bạn chưa có yêu cầu hỗ trợ nào.</p>
          ) : (
            <div style={styles.ticketList}>
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket._id || ticket.id} style={styles.ticketItem}>
                  <div style={styles.ticketItemTop}>
                    <strong style={styles.ticketSubject}>{ticket.title || ticket.topic}</strong>
                    <span style={statusStyle(ticket.status)}>{translateStatus(ticket.status)}</span>
                  </div>
                  <p style={styles.ticketMessage}>{ticket.description || ticket.body || ticket.message}</p>
                  {ticket.resolution && (
                    <p style={styles.ticketResolution}>Phản hồi admin: {ticket.resolution}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function translateStatus(status) {
  if (status === 'resolved') return 'Đã xử lý';
  if (status === 'dismissed') return 'Đã đóng';
  return 'Đang mở';
}

function statusStyle(status) {
  const base = {
    borderRadius: '999px',
    padding: '4px 9px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap'
  };
  if (status === 'resolved') return { ...base, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)' };
  if (status === 'dismissed') return { ...base, color: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.12)' };
  return { ...base, color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.12)' };
}

// --- 🛠️ BỘ HỆ THỐNG DESIGN SYSTEM SLATE PREMIUM DARK MODE ĐỒNG BỘ ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box'
  },
  cardBox: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '780px',
    padding: '40px',
    border: '1px solid #334155',
    boxSizing: 'border-box'
  },
  headerArea: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  topBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '20px',
    letterSpacing: '0.5px',
    display: 'inline-block',
    marginBottom: '12px'
  },
  title: {
    color: '#fff',
    fontSize: '26px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.6'
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    width: '100%'
  },
  flexRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#cbd5e1',
    fontSize: '13.5px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: '14.5px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease'
  },
  select: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: '14.5px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: '14.5px',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    lineHeight: '1.5'
  },
  btnSubmit: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)',
    transition: 'all 0.15s ease',
    marginTop: '10px'
  },
  ticketHistory: {
    marginTop: '30px',
    borderTop: '1px solid #334155',
    paddingTop: '24px'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px'
  },
  ticketTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '17px',
    fontWeight: 800
  },
  ticketCount: {
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: 700
  },
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  ticketItem: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '14px'
  },
  ticketItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  ticketSubject: {
    color: '#fff',
    fontSize: '14px'
  },
  ticketMessage: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: '10px 0 0 0'
  },
  ticketResolution: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.18)',
    borderRadius: '8px',
    fontSize: '12.5px',
    lineHeight: 1.5,
    margin: '10px 0 0 0',
    padding: '10px'
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '13px',
    margin: 0
  },
};

export default TroGiup;
