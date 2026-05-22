import React from 'react';

const StudentPanel = ({ 
  lichSuHoc = [], 
  allTutors = [], 
  nguoiDangChat, 
  setNguoiDangChat, 
  handleXoaDonLichSu, 
  chatBox 
}) => {
  
  // Đảm bảo an toàn dữ liệu tuyệt đối trước khi map dữ liệu ra UI
  const safeLichSuHoc = Array.isArray(lichSuHoc) ? lichSuHoc : [];

  return (
    <div style={styles.panelContainer}>
      
      {/* CỘT 1: DANH SÁCH LỊCH SỬ ĐẶT LỊCH LỚP HỌC */}
      <div style={styles.mainSection}>
        <h2 style={styles.sectionTitle}>
          🎓 Gia sư của tôi
        </h2>
        
        {safeLichSuHoc.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>
              Sếp chưa đặt lịch với gia sư nào hoặc dữ liệu đang được đồng bộ.
            </p>
          </div>
        ) : (
          <div style={styles.cardsWrapper}>
            {safeLichSuHoc.map((don) => {
              const thongTinGiaSu = (allTutors || []).find(t => t && (t._id === don.tutorId || t.id === don.tutorId));
              const tenGiaSu = thongTinGiaSu ? thongTinGiaSu.name : "Gia sư (Hệ thống ẩn)";
              const emailGiaSu = thongTinGiaSu ? thongTinGiaSu.email : "";
              const dangActiveChat = nguoiDangChat?.email === emailGiaSu;

              return (
                <div key={don._id || Math.random()} style={styles.tutorCard}>
                  <div style={styles.cardHeader}>
                    <strong style={styles.tutorName}>{tenGiaSu}</strong>
                    
                    <div style={styles.btnGroup}>
                      {/* === NÚT CHAT REALTIME TÍCH HỢP BIẾN ĐỔI TRẠNG THÁI === */}
                      {emailGiaSu && (
                        don.status === 'Chấp nhận' ? (
                          <button 
                            type="button"
                            onClick={() => setNguoiDangChat && setNguoiDangChat({ email: emailGiaSu, name: tenGiaSu })}
                            style={{ 
                              ...styles.btnChatActive,
                              backgroundColor: dangActiveChat ? '#0284c7' : '#38bdf8', 
                              color: dangActiveChat ? '#fff' : '#0f172a'
                            }}
                          >
                            💬 Chat ngay
                          </button>
                        ) : (
                          <button 
                            type="button"
                            disabled
                            title={don.status === 'Hoàn thành' ? "Buổi học đã kết thúc" : "Gia sư cần chấp nhận để mở khóa trò chuyện"}
                            style={styles.btnChatDisabled}
                          >
                            🔒 {don.status === 'Hoàn thành' ? 'Đã đóng' : 'Chờ duyệt'}
                          </button>
                        )
                      )}

                      <button 
                        type="button"
                        onClick={() => handleXoaDonLichSu && handleXoaDonLichSu(don._id)}
                        style={styles.btnDelete}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>

                  {/* HỆ THỐNG BADGE TRẠNG THÁI HIỂN THỊ CHUẨN ĐẸP 2026 */}
                  <span style={{ 
                    ...styles.statusBadge, 
                    backgroundColor: don.status === 'Chấp nhận' ? 'rgba(16, 185, 129, 0.12)' : don.status === 'Từ chối' ? 'rgba(239, 68, 68, 0.12)' : don.status === 'Hoàn thành' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: don.status === 'Chấp nhận' ? '#10b981' : don.status === 'Từ chối' ? '#f87171' : don.status === 'Hoàn thành' ? '#94a3b8' : '#f59e0b',
                    border: don.status === 'Chấp nhận' ? '1px solid rgba(16, 185, 129, 0.2)' : don.status === 'Từ chối' ? '1px solid rgba(239, 68, 68, 0.2)' : don.status === 'Hoàn thành' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    {don.status === 'Chấp nhận' ? '✓ ' : don.status === 'Từ chối' ? '✕ ' : don.status === 'Hoàn thành' ? '⚑ ' : '⏳ '} 
                    {don.status || 'Chờ duyệt'}
                  </span>
                  
                  <p style={styles.messageText}>
                    Lời nhắn: <em style={{ color: '#cbd5e1', fontStyle: 'normal' }}>“{don.message || 'Không có lời nhắn gửi kèm.'}”</em>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CỘT 2: KHUNG CHAT ĐƯỢC NHÚNG VÀO LINH HOẠT */}
      {chatBox && (
        <div style={styles.asideChatSection}>
          {chatBox}
        </div>
      )}

    </div>
  );
};

// --- 🛠️ BỘ KHUNG DESIGN SYSTEM SLATE PREMIUM - PHÂN TÁCH KHÔNG GIAN CỰC THOÁNG ---
const styles = {
  panelContainer: {
    display: 'flex', 
    gap: '24px', 
    textAlign: 'left', 
    minHeight: '80vh', 
    flexWrap: 'wrap',
    fontFamily: "'Inter', sans-serif"
  },
  mainSection: {
    flex: '2', 
    minWidth: '340px', 
    backgroundColor: '#1e293b', 
    padding: '28px', 
    borderRadius: '16px', 
    border: '1px solid #334155'
  },
  asideChatSection: {
    flex: '1', 
    minWidth: '320px', 
    backgroundColor: '#1e293b', 
    padding: '24px', 
    borderRadius: '16px', 
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column'
  },
  sectionTitle: {
    color: '#fff', 
    borderBottom: '1px solid #334155', 
    paddingBottom: '14px', 
    marginTop: 0, 
    fontSize: '18px', 
    fontWeight: '700',
    letterSpacing: '-0.3px'
  },
  emptyContainer: {
    padding: '50px 20px', 
    textAlign: 'center'
  },
  emptyText: {
    color: '#94a3b8', 
    fontSize: '14px', 
    lineHeight: '1.6',
    margin: 0
  },
  cardsWrapper: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px', 
    marginTop: '20px'
  },
  tutorCard: {
    padding: '20px', 
    backgroundColor: '#0f172a', 
    borderRadius: '12px', 
    border: '1px solid #334155', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  cardHeader: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '12px'
  },
  tutorName: {
    fontSize: '16px', 
    color: '#fff',
    fontWeight: '700'
  },
  btnGroup: {
    display: 'flex', 
    gap: '10px'
  },
  btnChatActive: {
    padding: '7px 16px', 
    borderRadius: '8px', 
    fontSize: '13px',
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: '700', 
    transition: 'all 0.15s ease'
  },
  btnChatDisabled: {
    padding: '7px 16px', 
    borderRadius: '8px', 
    fontSize: '13px',
    backgroundColor: '#1e293b', 
    color: '#475569', 
    border: '1px solid #334155', 
    cursor: 'not-allowed', 
    fontWeight: '700'
  },
  btnDelete: {
    padding: '7px 16px', 
    borderRadius: '8px', 
    fontSize: '13px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    color: '#f87171', 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    cursor: 'pointer', 
    fontWeight: '700',
    transition: 'all 0.15s ease'
  },
  statusBadge: {
    display: 'inline-block', 
    marginTop: '14px', 
    padding: '4px 10px', 
    borderRadius: '6px', 
    fontSize: '12px', 
    fontWeight: '700'
  },
  messageText: {
    margin: '14px 0 0 0', 
    color: '#94a3b8', 
    fontSize: '13.5px', 
    lineHeight: '1.6'
  }
};

export default StudentPanel;