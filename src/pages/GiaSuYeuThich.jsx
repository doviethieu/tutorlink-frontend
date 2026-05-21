import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get('http://localhost:8000/api/favorites', { headers });
        if (res.data) setTutors(res.data);
      } catch (err) {
        console.error("Lỗi đồng bộ API favorites, kích hoạt Mock Data để sếp test giao diện:");
        
        // MOCK DATA SẴN SÀNG CHO SẾP KIỂM THỬ
        setTutors([
          { id: 'gs1', name: 'Thầy Trần Hùng', title: 'Thạc sĩ Toán giải tích - Giảng viên Đại học Bách Khoa', price: 300000, rating: 4.9, subjects: ['Toán Cao Cấp', 'Đại Số'], avatarUrl: '' },
          { id: 'gs2', name: 'Cô Sarah Nguyễn', title: 'Cựu du học sinh Anh quốc - Chứng chỉ IELTS 8.5', price: 250000, rating: 5.0, subjects: ['IELTS', 'Tiếng Anh Giao Tiếp'], avatarUrl: '' },
          { id: 'gs3', name: 'Anh Minh Lê', title: 'Senior Fullstack Engineer - Chuyên gia đào tạo Frontend', price: 400000, rating: 4.8, subjects: ['ReactJS', 'NodeJS', 'Javascript'], avatarUrl: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  // --- HÀM BỎ YÊU THÍCH (REMOVE FAVORITE) ---
  const handleRemoveFavorite = async (tutorId) => {
    try {
      const token = localStorage.getItem('tutorlinkToken');
      // Gửi request lên hệ thống backend (Khi có backend thực tế)
      await axios.delete(`http://localhost:8000/api/favorites/${tutorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cập nhật nhanh state trên giao diện
      setTutors(tutors.filter(tutor => tutor.id !== tutorId));
      alert('💔 Đã xóa gia sư khỏi danh sách yêu thích!');
    } catch (err) {
      // Vì đang chạy ở chế độ Frontend độc lập, em xử lý cho xóa trực tiếp trên State luôn để sếp test mượt mà
      setTutors(tutors.filter(tutor => tutor.id !== tutorId));
    }
  };

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>⏳ Đang tải kho lưu trữ gia sư của sếp...</div>;
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
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>❤️</div>
          <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>Chưa có gia sư yêu thích</h3>
          <p style={{ color: '#94a3b8', margin: '0 0 20px 0', fontSize: '14px' }}>Hãy khám phá và lưu lại những gia sư phù hợp với nhu cầu của sếp.</p>
          <Link to="/">
            <button style={styles.btnActionCenter}>Khám phá gia sư</button>
          </Link>
        </div>
      ) : (
        /* GRID HIỂN THỊ DANH SÁCH GIA SƯ */
        <div style={styles.layoutGrid}>
          {tutors.map((tutor) => (
            <div key={tutor.id} style={styles.tutorCard}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={styles.avatarFake}>{tutor.name.charAt(0)}</div>
                <button 
                  onClick={() => handleRemoveFavorite(tutor.id)} 
                  style={styles.btnHeartActive}
                  title="Xóa khỏi danh sách lưu"
                >
                  ❤️
                </button>
              </div>

              <div style={{ marginTop: '16px' }}>
                <Link to={`/giasu/${tutor.id}`} style={styles.tutorNameLink}>
                  {tutor.name}
                </Link>
                <p style={styles.tutorTitle}>{tutor.title}</p>
              </div>

              {/* KHỐI HIỂN THỊ CÁC THẺ MÔN HỌC */}
              <div style={styles.badgeWrapper}>
                {tutor.subjects?.map((subject) => (
                  <span key={subject} style={styles.subjectBadge}>{subject}</span>
                ))}
              </div>

              {/* PHẦN CHÂN CARD: GIÁ TIỀN & ĐÁNH GIÁ SẢN PHẨM */}
              <div style={styles.cardFooter}>
                <span style={styles.priceTxt}>{tutor.price.toLocaleString('vi-VN')} đ/h</span>
                <span style={styles.ratingBox}>
                  <span style={{ color: '#f1c40f' }}>⭐</span> {tutor.rating || 0}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE CAO CẤP ĐỒNG BỘ TOÀN APP ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 5%',
    color: '#cbd5e1',
    fontFamily: 'Arial, sans-serif'
  },
  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '30px',
    borderRadius: '16px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  accentBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    color: '#3498db',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  mainTitle: { fontSize: '26px', fontWeight: 'bold', color: '#fff', margin: '12px 0 6px 0' },
  subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  btnExplore: { backgroundColor: 'transparent', border: '1px solid #475569', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  emptyCard: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '60px 20px', borderRadius: '16px', textAlign: 'center' },
  btnActionCenter: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  layoutGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '24px' },
  tutorCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' },
  avatarFake: { width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#334155', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' },
  btnHeartActive: { backgroundColor: 'rgba(231, 76, 60, 0.15)', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  tutorNameLink: { color: '#fff', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none', display: 'block', transition: 'color 0.2s', marginBottom: '6px' },
  tutorTitle: { fontSize: '13px', color: '#94a3b8', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px' },
  badgeWrapper: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px', minHeight: '26px' },
  subjectBadge: { backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #334155' },
  cardFooter: { borderTop: '1px solid #334155', marginTop: '16px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceTxt: { color: '#2ecc71', fontWeight: 'bold', fontSize: '16px' },
  ratingBox: { color: '#fff', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#0f172a', padding: '3px 8px', borderRadius: '6px', border: '1px solid #334155' }
};