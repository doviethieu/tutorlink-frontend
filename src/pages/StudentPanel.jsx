import React from 'react';

const StudentPanel = ({ lichSuHoc, allTutors, nguoiDangChat, setNguoiDangChat, handleXoaDonLichSu, chatBox }) => {
  return (
    <div style={{ display: 'flex', gap: '20px', textAlign: 'left' }}>
      
      {/* CỘT 1: LỊCH SỬ ĐẶT LỊCH */}
      <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h2 style={{ color: '#1E3A8A', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px', marginTop: 0 }}>
          GIA SƯ CỦA TÔI
        </h2>
        
        {lichSuHoc.length === 0 ? (
          <p style={{ color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Bạn chưa đặt lịch với gia sư nào.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {lichSuHoc.map((don) => {
              const thongTinGiaSu = allTutors.find(t => t._id === don.tutorId);
              const tenGiaSu = thongTinGiaSu ? thongTinGiaSu.name : "Gia sư (Đã ẩn)";
              const emailGiaSu = thongTinGiaSu ? thongTinGiaSu.email : "";

              return (
                <div key={don._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '16px', color: '#1F2937' }}>{tenGiaSu}</strong>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      
                      {/* === NÚT CHAT ĐÃ ĐƯỢC GẮN ĐIỀU KIỆN (CÓ THÊM CASE HOÀN THÀNH) === */}
                      {emailGiaSu && (
                        don.status === 'Chấp nhận' ? (
                          <button 
                            onClick={() => setNguoiDangChat({ email: emailGiaSu, name: tenGiaSu })}
                            style={{ 
                              padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                              backgroundColor: nguoiDangChat?.email === emailGiaSu ? '#1E3A8A' : '#3B82F6', 
                              color: 'white', 
                              border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
                            }}
                          >
                            💬 Chat
                          </button>
                        ) : (
                          <button 
                            disabled
                            title={don.status === 'Hoàn thành' ? "Buổi học đã kết thúc" : "Gia sư cần chấp nhận để mở khóa Chat"}
                            style={{ 
                              padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                              backgroundColor: '#E5E7EB', color: '#9CA3AF', 
                              border: 'none', cursor: 'not-allowed', fontWeight: 'bold'
                            }}
                          >
                            🔒 {don.status === 'Hoàn thành' ? 'Đã đóng' : 'Chat'}
                          </button>
                        )
                      )}
                      {/* ======================================= */}

                      <button 
                        onClick={() => handleXoaDonLichSu(don._id)}
                        style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                          backgroundColor: '#EF4444', color: 'white', 
                          border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>

                  {/* TAG TRẠNG THÁI ĐÃ CẬP NHẬT THÊM MÀU XÁM CHO "HOÀN THÀNH" */}
                  <span style={{ display: 'inline-block', marginTop: '10px', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', 
                      backgroundColor: don.status === 'Chấp nhận' ? '#D1FAE5' : don.status === 'Từ chối' ? '#FEE2E2' : don.status === 'Hoàn thành' ? '#F3F4F6' : '#FEF3C7',
                      color: don.status === 'Chấp nhận' ? '#065F46' : don.status === 'Từ chối' ? '#991B1B' : don.status === 'Hoàn thành' ? '#4B5563' : '#92400E'
                    }}>
                      {don.status === 'Chấp nhận' ? '✅ ' : don.status === 'Từ chối' ? '❌ ' : don.status === 'Hoàn thành' ? '🏁 ' : '⏳ '} 
                      {don.status}
                  </span>
                  
                  <p style={{ margin: '10px 0 0 0', color: '#4B5563', fontSize: '14px' }}>Lời nhắn: <em>"{don.message}"</em></p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CỘT 2: KHUNG CHAT ĐƯỢC TRUYỀN VÀO */}
      {chatBox}

    </div>
  );
};

export default StudentPanel;