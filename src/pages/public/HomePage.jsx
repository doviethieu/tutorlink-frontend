import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { tutorService } from '../../services/tutor.service';

function TrangChu({ tuKhoa }) { 
  const [danhSachGiaSu, setDanhSachGiaSu] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    tutorService.list({ limit: 12 })
      .then((rows) => setDanhSachGiaSu(Array.isArray(rows) ? rows : []))
      .catch(() => setDanhSachGiaSu([]));
  }, []);

  const danhSachLoc = danhSachGiaSu.filter((gs) => {
    if (!tuKhoa) return true;
    const ten = gs?.name?.toLowerCase() || "";
    const monHoc = (gs?.subject || gs?.subjects?.join(' ') || '').toLowerCase();
    const tuKhoaNho = tuKhoa.toLowerCase();
    return ten.includes(tuKhoaNho) || monHoc.includes(tuKhoaNho);
  });

  const handleMoBangDatLich = (giaSu) => {
    if (!localStorage.getItem('tutorlinkToken')) {
      alert("Bạn cần đăng nhập trước khi đặt lịch.");
      navigate('/login'); 
      return;
    }
    navigate(`/giasu/${giaSu._id || giaSu.id}/book`);
  };

  const handleXemHoSo = (idGiaSu) => {
    navigate(`/giasu/${idGiaSu}`);
  };

  return (
    <div style={styles.container}>
      
      {/* BANNER KHỞI ĐỘNG (HIỂN THỊ KHI CHƯA LOG IN) */}
      {!localStorage.getItem('tutorlinkUser') && (
        <div style={styles.heroBanner}>
          <span style={styles.heroBadge}>PHIÊN BẢN CẬP NHẬT 2026</span>
          <h1 style={styles.heroTitle}>
            Tutor<span style={{ color: '#C05A3E' }}>Link</span>
          </h1>
          <h2 style={styles.heroSubtitle}>
            Hệ thống kết nối Học viên và Gia sư Sư phạm Công nghệ cao
          </h2>
          <p style={styles.heroText}>
            Lập lịch học thông minh, tương tác không gian chat realtime thời gian thực và quản lý tiến độ học tập toàn diện.
          </p>
          <a href="#danh-sach-gia-su" style={{ textDecoration: 'none' }}>
            <button style={styles.heroBtn}>🔍 Khám phá danh sách Gia sư</button>
          </a>
        </div>
      )}

      {/* KHÔNG GIAN DANH SÁCH GIA SƯ */}
      <div id="danh-sach-gia-su" style={styles.mainWrapper}>
        <h2 style={styles.sectionTitle}>
          ✨ Đội ngũ Gia sư Nổi bật ✨
        </h2>

        <div style={styles.responsiveGrid}>
          {danhSachLoc.length > 0 ? (
            danhSachLoc.map((gs) => (
              <div key={gs._id} style={styles.tutorCard}>
                <div style={{ position: 'relative' }}>
                  <img src={gs.image} alt={gs.name} style={styles.tutorImg} />
                  <span style={styles.ratingBadge}>⭐ {gs.rating || "5.0"}</span>
                </div>
                
                <div style={styles.cardBody}>
                  <h3 title={gs.name} style={styles.tutorName}>
                    {gs.name}
                  </h3>
                  
                  <p style={styles.tutorSubject}>📚 Môn dạy: <span style={{ color: '#C05A3E', fontWeight: '700' }}>{gs.subject || gs.subjects?.join(', ') || 'Đa môn'}</span></p>
                  <p style={styles.tutorPrice}>
                    💰 {Number(gs?.price) ? Number(gs.price).toLocaleString() : "250.000"} ₫<span style={styles.priceSub}>/giờ</span>
                  </p>
                  
                  <div style={styles.actionGroup}>
                    <button onClick={() => handleMoBangDatLich(gs)} style={styles.btnBook}>
                      📅 Đặt Khung Giờ Học
                    </button>
                    <button onClick={() => handleXemHoSo(gs._id)} style={styles.btnDetail}>
                      👁️ Xem hồ sơ năng lực
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyContainer}>
              <h3>Không tìm thấy dữ liệu gia sư phù hợp với từ khóa!</h3>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// --- BỘ KHUNG DESIGN SYSTEM TUTORLINK KEM - NAVY - CAM ĐẤT ---
const styles = {
  container: { backgroundColor: '#FAF7F0', minHeight: '100vh', color: '#1E293B', fontFamily: "'Inter', sans-serif" },
  heroBanner: { background: '#FAF7F0', color: '#1E293B', padding: '96px 24px 84px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '62vh', borderBottom: '1px solid #E7DED2' },
  heroBadge: { backgroundColor: 'rgba(192, 90, 62, 0.1)', color: '#C05A3E', fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '20px', letterSpacing: '1px', marginBottom: '16px', border: '1px solid rgba(192, 90, 62, 0.22)' },
  heroTitle: { fontSize: '3.5rem', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-1px', color: '#1E293B' },
  heroSubtitle: { fontSize: '2rem', fontWeight: '700', margin: '0 0 16px 0', maxWidth: '800px', lineHeight: '1.3', color: '#1E293B' },
  heroText: { fontSize: '15px', color: '#5F6B7A', marginBottom: '36px', maxWidth: '600px', lineHeight: '1.6' },
  heroBtn: { padding: '14px 30px', backgroundColor: '#C05A3E', color: '#FAF7F0', borderRadius: '8px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(192, 90, 62, 0.25)' },
  mainWrapper: { padding: '60px 24px', maxWidth: '1240px', margin: '0 auto', boxSizing: 'border-box' },
  sectionTitle: { textAlign: 'center', color: '#1E293B', marginBottom: '44px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' },
  responsiveGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', justifyContent: 'center' },
  tutorCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(30,41,59,0.08)', border: '1px solid #E7DED2', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' },
  tutorImg: { width: '100%', height: '240px', objectFit: 'cover' },
  ratingBadge: { position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(250, 247, 240, 0.85)', backdropFilter: 'blur(4px)', color: '#FBBF24', padding: '5px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', border: '1px solid rgba(245, 158, 11, 0.2)' },
  cardBody: { padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  tutorName: { margin: '0 0 12px 0', fontSize: '19px', color: '#1E293B', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tutorSubject: { margin: '0 0 8px 0', color: '#5F6B7A', fontSize: '14px' },
  tutorPrice: { margin: '0 0 20px 0', color: '#10B981', fontSize: '18px', fontWeight: '700' },
  priceSub: { color: '#7C6F64', fontSize: '13px', fontWeight: '400', paddingLeft: '2px' },
  actionGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' },
  btnBook: { width: '100%', padding: '11px', backgroundColor: '#C05A3E', color: '#FAF7F0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(192, 90, 62, 0.15)' },
  btnDetail: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#1E293B', border: '1px solid #E7DED2', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13.5px' },
  emptyContainer: { textAlign: 'center', padding: '40px', width: '100%', color: '#8A7D72' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(250, 247, 240, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '32px', borderRadius: '16px', width: '92%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto', color: '#1E293B', boxShadow: '0 25px 50px rgba(30,41,59,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E7DED2', paddingBottom: '16px', marginBottom: '20px' },
  modalTitle: { margin: 0, color: '#1E293B', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px' },
  modalCloseBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8A7D72' },
  modalDesc: { color: '#5F6B7A', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.5' },
  scheduleRow: { display: 'flex', alignItems: 'flex-start', borderBottom: '1px solid #E7DED2', paddingBottom: '16px', gap: '16px' },
  scheduleDayLabel: { width: '150px', fontWeight: '700', color: '#1E293B', marginTop: '6px', fontSize: '14px', flexShrink: 0 },
  slotsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 },
  slotBtn: { padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.1s ease' },
  successAlert: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13.5px', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.15)' },
  alertDangerArea: { marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.06)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.15)' },
  dangerTitle: { margin: '0 0 12px 0', color: '#f87171', fontSize: '14.5px', fontWeight: '700' },
  dangerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF7F0', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E7DED2', gap: '12px' },
  btnCancelBooking: { padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12.5px' },
  modalFooter: { display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E7DED2', paddingTop: '20px' },
  btnModalClose: { padding: '10px 18px', borderRadius: '8px', border: '1px solid #7C6F64', backgroundColor: 'transparent', color: '#1E293B', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px' },
  btnModalSubmit: { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#FAF7F0', cursor: 'pointer', fontWeight: '800', fontSize: '13.5px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }
};

export default TrangChu;
