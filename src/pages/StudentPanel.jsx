import React from 'react';

// Đã bọc lót giá trị mặc định (= []) ngay trên tham số để phòng hờ sếp quên truyền prop từ App.jsx
const StudentPanel = ({ 
  lichSuHoc = [], 
  allTutors = [], 
  nguoiDangChat, 
  setNguoiDangChat, 
  handleXoaDonLichSu, 
  chatBox 
}) => {
  
  // Đảm bảo dữ liệu luôn là mảng, kể cả khi prop truyền xuống bị lỗi null/undefined từ API
  const safeLichSuHoc = Array.isArray(lichSuHoc) ? lichSuHoc : [];

  return (
    <div style={{ display: 'flex', gap: '20px', textAlign: 'left', minHeight: '80vh', flexWrap: 'wrap' }}>
      
      {/* CỘT 1: LỊCH SỬ ĐẶT LỊCH (Đã convert 100% sang giao diện Dark Mode cao cấp) */}
      <div style={{ flex: 1, minWidth: '320px', backgroundColor: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155' }}>
        <h2 style={{ color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '12px', marginTop: 0, fontSize: '20px', fontWeight: 'bold' }}>
          🎓 GIA SƯ CỦA TÔI
        </h2>
        
        {safeLichSuHoc.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0, fontSize: '15px' }}>
              Sếp chưa đặt lịch với gia sư nào hoặc dữ liệu đang được đồng bộ.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {safeLichSuHoc.map((don) => {
              const thongTinGiaSu = (allTutors || []).find(t => t && (t._id === don.tutorId || t.id === don.tutorId));
              const tenGiaSu = thongTinGiaSu ? thongTinGiaSu.name : "Gia sư (Hệ thống ẩn)";
              const emailGiaSu = thongTinGiaSu ? thongTinGiaSu.email : "";

              return (
                <div key={don._id || Math.random()} style={{ padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{tenGiaSu}</strong>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      
                      {/* === NÚT CHAT BẢO MẬT === */}
                      {emailGiaSu && (
                        don.status === 'Chấp nhận' ? (
                          <button 
                            onClick={() => setNguoiDangChat && setNguoiDangChat({ email: emailGiaSu, name: tenGiaSu })}
                            style={{ 
                              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                              backgroundColor: nguoiDangChat?.email === emailGiaSu ? '#1e3a8a' : '#3498db', 
                              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
                            }}
                          >
                            💬 Chat
                          </button>
                        ) : (
                          <button 
                            disabled
                            title={don.status === 'Hoàn thành' ? "Buổi học đã kết thúc" : "Gia sư cần chấp nhận để mở khóa Chat"}
                            style={{ 
                              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                              backgroundColor: '#334155', color: '#64748b', 
                              border: 'none', cursor: 'not-allowed', fontWeight: 'bold'
                            }}
                          >
                            🔒 {don.status === 'Hoàn thành' ? 'Đã đóng' : 'Chat'}
                          </button>
                        )
                      )}

                      <button 
                        onClick={() => handleXoaDonLichSu && handleXoaDonLichSu(don._id)}
                        style={{ 
                          padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                          backgroundColor: '#ef4444', color: 'white', 
                          border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>

                  {/* BADGE TRẠNG THÁI KHỚP MÀU TỐI GIÚP NHÌN RÕ RÀNG */}
                  <span style={{ 
                    display: 'inline-block', marginTop: '12px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', 
                    backgroundColor: don.status === 'Chấp nhận' ? 'rgba(46, 204, 113, 0.2)' : don.status === 'Từ chối' ? 'rgba(231, 76, 60, 0.2)' : don.status === 'Hoàn thành' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: don.status === 'Chấp nhận' ? '#2ecc71' : don.status === 'Từ chối' ? '#e74c3c' : don.status === 'Hoàn thành' ? '#94a3b8' : '#f1c40f'
                  }}>
                    {don.status === 'Chấp nhận' ? '✅ ' : don.status === 'Từ chối' ? '❌ ' : don.status === 'Hoàn thành' ? '🏁 ' : '⏳ '} 
                    {don.status || 'Chờ duyệt'}
                  </span>
                  
                  <p style={{ margin: '12px 0 0 0', color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>
                    Lời nhắn: <em style={{ color: '#cbd5e1' }}>"{don.message || 'Không có lời nhắn.'}"</em>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CỘT 2: KHUNG CHAT ĐƯỢC TRUYỀN VÀO (NẾU CÓ) */}
      {chatBox && (
        <div style={{ width: '360px', minWidth: '300px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155' }}>
          {chatBox}
        </div>
      )}

    </div>
  );
};

export default StudentPanel;