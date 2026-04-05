import React from 'react';
import { useNavigate } from 'react-router-dom';

const TutorPanel = ({ myTutorProfile, danhSachHocVien, nguoiDangChat, setNguoiDangChat, handleXoaDonHoc, handleCapNhatDon, chatBox }) => {
  const navigate = useNavigate();

  // 1. CHƯA CÓ HỒ SƠ -> NÚT DẪN SANG TRANG TẠO CV
  if (!myTutorProfile) {
    return (
      <div style={{ backgroundColor: '#F9FAFB', padding: '40px 30px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
          <h2 style={{ color: '#1E3A8A', marginTop: 0, fontSize: '24px' }}>🎓 TRỞ THÀNH GIA SƯ ĐỐI TÁC</h2>
          <p style={{ color: '#4B5563', fontSize: '16px', marginBottom: '25px', lineHeight: '1.6' }}>
            Để đảm bảo chất lượng giảng dạy, bạn cần tạo Hồ sơ CV chi tiết và tham gia một buổi phỏng vấn ngắn với Admin trước khi chính thức lên sóng.
          </p>
          <button 
            onClick={() => navigate('/tao-cv')} 
            style={{ padding: '15px 30px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(249, 115, 22, 0.3)' }}
          >
            📝 Bắt đầu tạo CV Gia sư
          </button>
      </div>
    );
  }

  // 2. ĐÃ NỘP CV -> CHỜ PHỎNG VẤN VỚI ADMIN
  if (myTutorProfile.status === 'Chờ duyệt') {
    return (
      <div style={{ backgroundColor: '#FFFBEB', padding: '30px', borderRadius: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
        <h2 style={{ color: '#B45309', marginTop: 0 }}>⏳ ĐANG CHỜ SẮP XẾP PHỎNG VẤN</h2>
        <p style={{ color: '#92400E', fontSize: '16px', lineHeight: '1.6' }}>
          🎉 CV của bạn đã được gửi thành công! <br/>
          Admin đang xem xét hồ sơ và sẽ sớm liên hệ với bạn (qua Số điện thoại/Email) để sắp xếp lịch phỏng vấn online. Hãy để ý điện thoại nhé!
        </p>
      </div>
    );
  }

  // 3. ĐÃ ĐẬU PHỎNG VẤN (ĐÃ DUYỆT) -> HIỆN THÔNG TIN GIA SƯ
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ color: '#1E3A8A', marginBottom: '20px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>🌟 XIN CHÀO GIA SƯ: {myTutorProfile.name}</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* CỘT 1: DANH SÁCH HỌC VIÊN */}
        <div style={{ flex: 1, backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ color: '#1F2937', marginTop: 0 }}>📚 Học viên của tôi</h3>
          {(() => {
            const danhSachDaLoc = danhSachHocVien.filter((hocVien, index, mangGoc) =>
              index === mangGoc.findIndex((t) => t.studentEmail === hocVien.studentEmail)
            );

            if (danhSachDaLoc.length === 0) {
              return <p style={{ color: '#6B7280', fontStyle: 'italic', marginTop: '15px' }}>Chưa có học viên nào đặt lịch.</p>;
            }

            return danhSachDaLoc.map((hocVien) => (
              <div key={hocVien._id} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', marginTop: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px', color: '#1F2937' }}>{hocVien.studentName}</strong>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setNguoiDangChat({ email: hocVien.studentEmail, name: hocVien.studentName })}
                      style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
                        backgroundColor: nguoiDangChat?.email === hocVien.studentEmail ? '#1E3A8A' : '#E5E7EB', 
                        color: nguoiDangChat?.email === hocVien.studentEmail ? 'white' : '#1F2937', 
                        border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                      }}
                    >
                      💬 Chat
                    </button>

                    <button 
                      onClick={() => handleXoaDonHoc(hocVien._id)}
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
                <div style={{ marginTop: '10px' }}>
                  <span style={{ color: hocVien.status === 'Chấp nhận' ? '#10B981' : hocVien.status === 'Từ chối' ? '#EF4444' : '#F59E0B', fontSize: '14px', fontWeight: 'bold' }}>
                    {hocVien.status}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4B5563' }}>📞 {hocVien.studentPhone} | 📧 {hocVien.studentEmail}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#1F2937', fontStyle: 'italic', backgroundColor: '#F9FAFB', padding: '8px', borderRadius: '4px' }}>"{hocVien.message}"</p>
                
                {hocVien.status === 'Chờ xác nhận' && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleCapNhatDon(hocVien._id, 'Chấp nhận')} style={{ flex: 1, padding: '10px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Chấp nhận</button>
                    <button onClick={() => handleCapNhatDon(hocVien._id, 'Từ chối')} style={{ flex: 1, padding: '10px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>❌ Từ chối</button>
                  </div>
                )}
              </div>
            ));
          })()}
        </div>

        {/* CỘT 2: KHUNG CHAT ĐƯỢC TRUYỀN VÀO */}
        {chatBox}

      </div>
    </div>
  );
};

export default TutorPanel;