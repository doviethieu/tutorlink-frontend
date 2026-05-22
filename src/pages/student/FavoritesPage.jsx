import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteService } from '../../services/favorite.service';

export default function GiaSuYeuThich() {
  const navigate = useNavigate();

  // --- STATES QUẢN LÝ DANH SÁCH ---
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DANH SÁCH GIA SƯ YÊU THÍCH ---
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        if (!localStorage.getItem('tutorlinkToken')) {
          navigate('/login');
          return;
        }

        const data = await favoriteService.list();
        setTutors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi đồng bộ API favorites:", err);
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  // --- HÀM BỎ YÊU THÍCH (REMOVE FAVORITE) ---
  const handleRemoveFavorite = async (tutorId) => {
    try {
      await favoriteService.remove(tutorId);
      
      setTutors(tutors.filter(tutor => tutor.id !== tutorId));
      alert('💔 Đã xóa gia sư khỏi danh sách yêu thích!');
    } catch (err) {
      alert('Không thể xóa gia sư khỏi danh sách yêu thích.');
    }
  };

  if (loading) {
    return <div style={styles.loadingBox}>⏳ Đang tải kho lưu trữ gia sư của sếp...</div>;
  }

  return (
    <div style={styles.container}>
      
      {/* THANH TIÊU ĐỀ HERO KHỞI ĐẦU */}
      <div style={styles.heroCard}>
        <div>
          <span style={styles.accentBadge}>Danh sách lưu</span>
          <h1 style={styles.mainTitle}>Gia sư đã lưu tâm đắc</h1>
          <p style={styles.subtitle}>Nơi lưu trữ những hồ sơ gia sư chất lượng cao sếp dự định lựa chọn để đồng hành.</p>
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={styles.btnExplore}>🔍 Tìm thêm gia sư</button>
        </Link>
      </div>

      {/* HIỂN THỊ KHI DANH SÁCH TRỐNG */}
      {tutors.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={{ fontSize: '44px', marginBottom: '15px' }}>❤️</div>
          <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700' }}>Chưa có gia sư yêu thích</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 24px 0', fontSize: '14px', lineHeight: '1.5' }}>
            Hãy khám phá và lưu lại những gia sư phù hợp với nhu cầu của sếp.
          </p>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={styles.btnActionCenter}>Khám phá gia sư ngay</button>
          </Link>
        </div>
      ) : (
        /* GRID HIỂN THỊ DANH SÁCH GIA SƯ */
        <div style={styles.layoutGrid}>
          {tutors.map((tutor) => (
            <div key={tutor.id} style={styles.tutorCard}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Avatar thiết kế hình vuông bo góc hiện đại đồng bộ tổng thể */}
                <div style={styles.avatarFake}>{tutor.name?.charAt(0) || 'T'}</div>
                <button 
                  onClick={() => handleRemoveFavorite(tutor.id)} 
                  style={styles.btnHeartActive}
                  title="Xóa khỏi danh sách lưu"
                >
                  ❤️
                </button>
              </div>

              <div style={{ marginTop: '18px' }}>
                <Link to={`/giasu/${tutor.id}`} style={styles.tutorNameLink}>
                  {tutor.name}
                </Link>
                <p style={styles.tutorTitle} title={tutor.title}>{tutor.title || tutor.headline || tutor.bio}</p>
              </div>

              {/* KHỐI HIỂN THỊ CÁC THẺ MÔN HỌC */}
              <div style={styles.badgeWrapper}>
                {tutor.subjects?.map((subject) => (
                  <span key={subject} style={styles.subjectBadge}>{subject}</span>
                ))}
              </div>

              {/* PHẦN CHÂN CARD: GIÁ TIỀN & ĐÁNH GIÁ SẢN PHẨM */}
              <div style={styles.cardFooter}>
                <span style={styles.priceTxt}>{(tutor.price || 0).toLocaleString('vi-VN')} đ/h</span>
                <span style={styles.ratingBox}>
                  <span style={{ color: '#fbbf24', marginRight: '3px' }}>⭐</span> {tutor.rating || 0}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 🛠️ BỘ KHUNG CSS INLINE SLATE DARK-MODE PREMIUM SANG TRỌNG ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 6%',
    color: '#cbd5e1',
    fontFamily: "'Inter', sans-serif"
  },
  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '30px 40px',
    borderRadius: '16px',
    marginBottom: '35px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  accentBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Đổi sang màu Cam Neon giống trang Đặt Lịch
    color: '#f97316',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  mainTitle: { 
    fontSize: '28px', 
    fontWeight: '800', 
    color: '#fff', 
    margin: '12px 0 6px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: { fontSize: '14.5px', color: '#94a3b8', margin: 0, lineHeight: '1.5' },
  btnExplore: { 
    backgroundColor: 'transparent', 
    border: '1px solid #475569', 
    color: '#fff', 
    padding: '12px 22px', 
    borderRadius: '8px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    fontSize: '13.5px',
    transition: '0.2s'
  },
  emptyCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    padding: '80px 20px', 
    borderRadius: '16px', 
    textAlign: 'center',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
  },
  btnActionCenter: { 
    backgroundColor: '#38bdf8', // Đổi sang Sky Blue tinh tế
    color: '#0f172a', 
    border: 'none', 
    padding: '14px 28px', 
    borderRadius: '8px', 
    fontWeight: '700', 
    cursor: 'pointer',
    fontSize: '14.5px',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)'
  },
  layoutGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', 
    gap: '28px' 
  },
  tutorCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    borderRadius: '16px', 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    transition: '0.2s'
  },
  avatarFake: { 
    width: '52px', 
    height: '52px', 
    borderRadius: '12px', 
    backgroundColor: '#334155', 
    color: '#38bdf8', // Điểm nhẹ chữ chữ cái đầu bằng Sky Blue thanh thoát
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '800', 
    fontSize: '22px' 
  },
  btnHeartActive: { 
    backgroundColor: 'rgba(239, 68, 68, 0.12)', // Đổi sang Red-Rose dịu mắt chuẩn Tailwind
    border: 'none', 
    width: '38px', 
    height: '38px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '16px' 
  },
  tutorNameLink: { 
    color: '#fff', 
    fontSize: '19px', 
    fontWeight: '700', 
    textDecoration: 'none', 
    display: 'block', 
    marginBottom: '8px',
    letterSpacing: '-0.3px'
  },
  tutorTitle: { 
    fontSize: '13.5px', 
    color: '#94a3b8', 
    margin: 0, 
    lineHeight: '1.5',
    lineClamp: 2, 
    display: '-webkit-box', 
    WebkitLineClamp: 2, 
    WebkitBoxOrient: 'vertical', 
    overflow: 'hidden', 
    height: '40px' 
  },
  badgeWrapper: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '6px', 
    marginTop: '16px', 
    minHeight: '26px' 
  },
  subjectBadge: { 
    backgroundColor: '#0f172a', 
    color: '#38bdf8', // Chữ môn học đồng bộ Sky Blue siêu mượt
    fontSize: '11px', 
    padding: '4px 10px', 
    borderRadius: '6px', 
    border: '1px solid rgba(56, 189, 248, 0.25)',
    fontWeight: '600'
  },
  cardFooter: { 
    borderTop: '1px solid #334155', 
    marginTop: '20px', 
    paddingTop: '16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  priceTxt: { 
    color: '#10b981', // Màu xanh Emerald chuẩn hóa đơn cao cấp
    fontWeight: '800', 
    fontSize: '17px' 
  },
  ratingBox: { 
    color: '#fff', 
    fontSize: '13px', 
    fontWeight: '700', 
    backgroundColor: '#0f172a', 
    padding: '4px 10px', 
    borderRadius: '6px', 
    border: '1px solid #334155' 
  },
  loadingBox: {
    color: '#94a3b8',
    textAlign: 'center',
    paddingTop: '120px',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif"
  }
};
