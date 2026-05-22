import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDuyetGiaSu() {
  const { id } = useParams(); // Lấy ID gia sư từ URL
  const navigate = useNavigate();

  // Khởi tạo State lưu trữ dữ liệu hồ sơ thật
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [ghiChu, setGhiChu] = useState(''); // State cho ghi chú nội bộ

  // 1. Tự động quét Database thật để lấy thông tin chi tiết gia sư
  useEffect(() => {
    const fetchTutorProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('tutorlinkToken');
        
        // 🛠️ ĐÃ FIX: Sửa lại đường dẫn chuẩn khớp với API Backend của sếp
        const response = await axios.get(`http://localhost:8000/api/tutors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Bóc tách dữ liệu chuẩn từ Backend trả về
        const data = response?.data?.data || response?.data || null;
        if (data) {
          setProfile(data);
          setGhiChu(data.ghiChuInternal || '');
        } else {
          alert('🛑 Không tìm thấy dữ liệu thật của gia sư này!');
        }
      } catch (err) {
        console.error("❌ Lỗi gọi API thật:", err.message);
        alert('🛑 Không thể kết nối đến cơ sở dữ liệu thật hoặc ID gia sư không tồn tại!');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorProfile();
  }, [id]);

  // 2. Hàm xử lý hành động Duyệt / Yêu cầu bổ sung / Từ chối (Tương tác DB Thật)
  const handleAction = async (kind) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('tutorlinkToken');
      
      // Sếp lưu ý kiểm tra xem các đường dẫn POST này Backend của sếp đã viết chưa nhé
      let endpoint = `http://localhost:8000/api/tutors/${id}/approve`;
      let payload = { ghiChuInternal: ghiChu };

      if (kind === 'request') {
        endpoint = `http://localhost:8000/api/tutors/${id}/request-info`;
        payload.message = ghiChu || 'Vui lòng bổ sung thêm bằng cấp hoặc thông tin hồ sơ rõ ràng hơn.';
      } else if (kind === 'reject') {
        endpoint = `http://localhost:8000/api/tutors/${id}/reject`;
        payload.message = ghiChu || 'Hồ sơ không đạt yêu cầu xét duyệt của hệ thống TutorLink.';
      }

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Hệ thống đã cập nhật trạng thái hồ sơ lên MongoDB thành công!');
      navigate('/admin'); 
    } catch (err) {
      console.error("Lỗi thao tác duyệt:", err.message);
      alert(`❌ Thao tác thất bại! Vui lòng kiểm tra lại API xử lý nút [${kind}] ở Backend.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: '#fff', backgroundColor: '#0f172a', padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
        ⏳ Đang kết nối MongoDB tải hồ sơ gia sư thực tế...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ color: '#fff', backgroundColor: '#0f172a', padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#e74c3c', fontSize: '18px', fontWeight: 'bold' }}>⚠️ Không tìm thấy hồ sơ gia sư trong cơ sở dữ liệu thực tế!</p>
        <button onClick={() => navigate('/admin')} style={styles.backLinkBtn}>Quay lại Bảng quản trị</button>
      </div>
    );
  }

  // 🛠️ ĐÃ FIX: Đồng bộ hóa toàn bộ tên biến khớp 100% với file TaoHoSoCV
  const name = profile?.full_name || profile?.name || 'Gia sư ẩn danh';
  const isApproved = profile?.status === 'approved' || profile?.status === 'Đã duyệt';

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/admin')} style={styles.backLinkBtn}>
        ⬅️ Quay lại bảng quản trị tổng
      </button>

      <div style={styles.gridContainer}>
        {/* KHU VỰC BÊN TRÁI: HIỂN THỊ CHI TIẾT HỒ SƠ THẬT */}
        <div style={styles.leftColumn}>
          
          {/* Card 1: Avatar và thông tin tổng quan nhanh */}
          <div style={styles.card}>
            <div style={styles.profileHeader}>
              {profile?.image ? (
                <img src={profile.image} alt="Avatar Gia sư" style={styles.avatarImage} />
              ) : (
                <div style={styles.avatarMock}>{name.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: isApproved ? '#27ae60' : '#e67e22'
                }}>
                  {profile?.status === 'pending' ? '⏳ Chờ kiểm duyệt' : `🟢 Trạng thái: ${profile?.status}`}
                </span>
                <h1 style={styles.mainTitle}>{name}</h1>
                <p style={styles.headlineText}>{profile?.headline || 'Chưa thiết lập headline'}</p>
                <p style={styles.emailText}>✉️ Email tài khoản: {profile?.email || 'Chưa cập nhật'}</p>
                <p style={styles.emailText}>📞 Số điện thoại: {profile?.phone || 'Chưa cập nhật'}</p>
                <p style={styles.emailText}>💰 Học phí yêu cầu: {profile?.price ? `${profile.price.toLocaleString()} ₫/giờ` : 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Nội dung CV chi tiết */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 Thông tin hồ sơ năng lực chi tiết</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <InfoBox label="Môn học giảng dạy" value={profile?.subject || profile?.subjects} />
              <InfoBox label="Khu vực dạy / Hình thức" value={`${profile?.location || ''} (${profile?.format || ''})`} />
              <InfoBox label="Giới thiệu bản thân & Phương pháp dạy" value={profile?.description || profile?.bio} />
              <InfoBox label="Kỹ năng & Chứng chỉ bổ sung" value={profile?.skills} />
              
              {/* Hiển thị mảng Học vấn động từ DB */}
              <div style={styles.infoBox}>
                <p style={styles.infoLabel}>🎓 Quá trình học tập (Học vấn)</p>
                {Array.isArray(profile?.education) ? (
                  profile.education.map((edu, idx) => (
                    <p key={idx} style={styles.arrayItem}>• Trường: {edu.truong} | Ngành: {edu.chuyenNganh} ({edu.nam})</p>
                  ))
                ) : (
                  <p style={styles.infoValue}>{profile?.education || 'Chưa bổ sung học vấn'}</p>
                )}
              </div>

              {/* Hiển thị mảng Kinh nghiệm động từ DB */}
              <div style={styles.infoBox}>
                <p style={styles.infoLabel}>💼 Kinh nghiệm giảng dạy</p>
                {Array.isArray(profile?.experience) ? (
                  profile.experience.map((exp, idx) => (
                    <div key={idx} style={{marginBottom: '10px'}}>
                      <p style={{...styles.infoValue, fontWeight: 'bold'}}>• {exp.noiLamViec}:</p>
                      <p style={{...styles.infoValue, paddingLeft: '10px', color: '#94a3b8'}}>{exp.moTa}</p>
                    </div>
                  ))
                ) : (
                  <p style={styles.infoValue}>{profile?.experience || 'Chưa bổ sung kinh nghiệm'}</p>
                )}
              </div>

            </div>
          </div>

          {/* Card 3: Ghi chú nội bộ dành riêng cho Admin */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📝 Ghi chú nội bộ của Ban quản trị</h3>
            <textarea 
              placeholder="Nhập lý do cần sửa đổi hoặc lý do đánh trượt hồ sơ tại đây..." 
              rows={4} 
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              style={styles.textarea}
            />
          </div>
        </div>

        {/* KHU VỰC BÊN PHẢI: THANH THAO TÁC DUYỆT */}
        <div style={styles.rightColumn}>
          <div style={styles.sidebarCard}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px', marginTop: 0 }}>
              🛡️ Thao tác kiểm duyệt
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              
              <button 
                onClick={() => handleAction('approve')} 
                disabled={actionLoading}
                style={{ ...styles.btnAction, backgroundColor: '#27ae60' }}
              >
                {actionLoading ? '⏳ Đang lưu...' : '✅ Duyệt hồ sơ này'}
              </button>

              <button 
                onClick={() => handleAction('request')} 
                disabled={actionLoading}
                style={{ ...styles.btnAction, backgroundColor: '#e67e22' }}
              >
                💬 Yêu cầu sửa đổi bổ sung
              </button>

              <button 
                onClick={() => handleAction('reject')} 
                disabled={actionLoading}
                style={{ ...styles.btnAction, backgroundColor: '#c0392b' }}
              >
                ❌ Từ chối hồ sơ (Đánh trượt)
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// HÀM CHỐNG CRASH MẢNG
function InfoBox({ label, value }) {
  const textHienThi = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={styles.infoValue}>{textHienThi || 'Chưa bổ sung mục thông tin này.'}</p>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '35px 5%', fontFamily: 'Arial, sans-serif', color: '#f8fafc' },
  backLinkBtn: { backgroundColor: 'transparent', border: '1px solid #475569', color: '#3498db', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginBottom: '25px', display: 'inline-block' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightColumn: { position: 'sticky', top: '25px' },
  card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' },
  sidebarCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)', border: '1px solid #e2e8f0' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '22px' },
  avatarMock: { width: '75px', height: '75px', borderRadius: '50%', backgroundColor: '#3498db', color: '#fff', fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3498db' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: '#fff', display: 'inline-block', marginBottom: '8px', textTransform: 'uppercase' },
  mainTitle: { fontSize: '26px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#fff' },
  headlineText: { fontSize: '14px', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: '1.4' },
  emailText: { fontSize: '13px', color: '#cbd5e1', margin: '0 0 4px 0' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', margin: '0 0 18px 0', color: '#fff', borderLeft: '3px solid #3498db', paddingLeft: '10px' },
  infoBox: { backgroundColor: '#0f172a', border: '1px solid #334155', padding: '16px', borderRadius: '8px' },
  infoLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' },
  infoValue: { fontSize: '14px', color: '#cbd5e1', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' },
  arrayItem: { fontSize: '14px', color: '#cbd5e1', margin: '0 0 5px 0' },
  textarea: { width: '100%', padding: '14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', lineHeight: '1.4' },
  btnAction: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', transition: 'opacity 0.2s' }
};