import React from 'react';

const AdminPanel = ({ allTutors, handleDuyet, handleXoa }) => {
  // Tự động lọc danh sách ngay trong component này
  const giaSuChoDuyet = allTutors.filter(nguoi => nguoi.status !== 'Đã duyệt');
  const giaSuDaLenSong = allTutors.filter(nguoi => nguoi.status === 'Đã duyệt');

  return (
    <div style={{ backgroundColor: '#FEF2F2', padding: '30px', borderRadius: '12px', border: '1px solid #FECACA' }}>
      <h2 style={{ color: '#991B1B', marginTop: 0 }}>👑 KHU VỰC QUẢN TRỊ VIÊN</h2>
      
      {/* HỒ SƠ CHỜ DUYỆT */}
      <h3 style={{ textAlign: 'left', color: '#991B1B' }}>⏳ Hồ sơ chờ phỏng vấn ({giaSuChoDuyet.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
        {giaSuChoDuyet.map(nguoi => (
          <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #FECACA', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '18px', color: '#1F2937' }}>{nguoi.name}</strong> 
              <span style={{ color: '#4B5563', fontSize: '16px' }}> - Dạy: {nguoi.subject}</span>
              
              <div style={{ marginTop: '12px', fontSize: '15px', color: '#1F2937', backgroundColor: '#F3F4F6', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #F59E0B', display: 'inline-block' }}>
                <div style={{ marginBottom: '5px' }}>📞 SĐT liên hệ: <strong>{nguoi.phone || 'Chưa cập nhật'}</strong></div>
                <div>📧 Email: <strong>{nguoi.contactEmail || nguoi.email}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* ĐÃ THÊM NÚT XEM CV Ở ĐÂY */}
                <button onClick={() => window.open(`/giasu/${nguoi._id}`, '_blank')} style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>👁️ Xem CV</button>
                
                <button onClick={() => handleDuyet(nguoi._id)} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✅ Duyệt (Pass)</button>
                <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>❌ Từ chối (Xóa)</button>
            </div>
          </div>
        ))}
      </div>

      {/* GIA SƯ ĐÃ LÊN SÓNG */}
      <h3 style={{ textAlign: 'left', color: '#065F46' }}>✅ Gia sư đã lên sóng</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {giaSuDaLenSong.map(nguoi => (
          <div key={nguoi._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#D1FAE5', padding: '15px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
            <div style={{ textAlign: 'left', color: '#065F46' }}>
              <strong style={{ fontSize: '16px' }}>{nguoi.name}</strong> - {nguoi.subject}
              <div style={{ marginTop: '5px', fontSize: '14px', opacity: 0.9 }}>
                📞 {nguoi.phone || 'Chưa cập nhật'} | 📧 {nguoi.contactEmail || nguoi.email}
              </div>
            </div>
            
            {/* ĐÃ BỌC LẠI BẰNG DIV ĐỂ THÊM NÚT XEM CV */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.open(`/giasu/${nguoi._id}`, '_blank')} style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>👁️ Xem CV</button>
              <button onClick={() => handleXoa(nguoi._id)} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;