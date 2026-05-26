import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorService } from '../../services/tutor.service';

export default function DanhSachGiaSu() {
  // --- KHU VỰC QUẢN LÝ TRẠNG THÁI (STATES) ---
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tuKhoa, setTuKhoa] = useState('');
  const [monHocFilter, setMonHocFilter] = useState('all');
  
  // Quản lý hiệu ứng tương tác chuột (Hover) cho từng phần tử
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // --- HÀM TỰ ĐỘNG KẾT NỐI DATABASE / API BACKEND ---
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const data = await tutorService.list({ limit: 24 });
        setTutors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải danh sách gia sư:", err);
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  // --- BỘ LỌC TÌM KIẾM THÔNG MINH (FILTER LOGIC) ---
  const filteredTutors = tutors.filter(tutor => {
    const subjectsText = (tutor.subjects || []).join(' ');
    const matchTuKhoa = (
      tutor.name?.toLowerCase().includes(tuKhoa.toLowerCase()) || 
      subjectsText.toLowerCase().includes(tuKhoa.toLowerCase()) ||
      tutor.bio?.toLowerCase().includes(tuKhoa.toLowerCase())
    );
    
    const matchMonHoc = monHocFilter === 'all' || subjectsText.toLowerCase().includes(monHocFilter.toLowerCase());
    
    return matchTuKhoa && matchMonHoc;
  });

  return (
    <div style={styles.container}>
      
      {/* 1. KHU VỰC TIÊU ĐỀ HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={styles.topBadge}>ĐỘI NGŨ CHẤT LƯỢNG CAO</span>
        <h1 style={styles.mainTitle}>Tìm Kiếm Gia Sư Phù Hợp</h1>
        <p style={styles.subtitle}>Học tập 1 kèm 1 chất lượng cao cùng các thủ khoa, giảng viên uy tín trên toàn quốc.</p>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG BỘ LỌC TÌM KIẾM (TOOLBAR) */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrapper}>
          <span style={{ marginRight: '10px', fontSize: '16px' }}>🔍</span>
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên gia sư, môn học..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <select 
          value={monHocFilter}
          onChange={(e) => setMonHocFilter(e.target.value)}
          style={styles.selectFilter}
        >
          <option value="all">📚 Tất cả môn học</option>
          <option value="Toán">Toán Học</option>
          <option value="Tiếng Anh">Tiếng Anh</option>
          <option value="Lý">Vật Lý</option>
        </select>
      </div>

      {/* 3. KHU VỰC HIỂN THỊ THÔNG TIN CHÍNH */}
      {loading ? (
        <div style={styles.centerText}>⏳ Đang tải danh sách gia sư tinh tú...</div>
      ) : filteredTutors.length === 0 ? (
        <div style={styles.centerText}>❌ Không tìm thấy gia sư nào khớp với bộ lọc của sếp!</div>
      ) : (
        <div style={styles.grid}>
          {filteredTutors.map(tutor => (
            <div 
              key={tutor.id || tutor._id} 
              style={{
                ...styles.tutorCard,
                // Kích hoạt hiệu ứng nhấc thẻ card mượt mà kèm đổi màu border cam neon đồng bộ
                transform: hoveredCard === (tutor.id || tutor._id) ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredCard === (tutor.id || tutor._id) ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                borderColor: hoveredCard === (tutor.id || tutor._id) ? '#C05A3E' : '#E7DED2'
              }}
              onMouseEnter={() => setHoveredCard(tutor.id || tutor._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* KHU VỰC THÔNG TIN TRÊN CARD (AVATAR + TÊN) */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '15px' }}>
                <div style={styles.avatarMock}>
                  {tutor.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={styles.tutorName}>{tutor.name}</h3>
                    <span style={styles.rateBadge}>⭐ {tutor.rating || '5.0'}</span>
                  </div>
                  <p style={styles.tutorSubject}>{(tutor.subjects || []).join(', ') || 'Chưa cập nhật môn học'}</p>
                  <p style={styles.tutorLevel}>🎓 {(tutor.levels || []).join(', ') || 'Mọi cấp độ'}</p>
                </div>
              </div>

              {/* KHU VỰC GIỚI THIỆU SƠ LƯỢC TỂ TRẠNG */}
              <p style={styles.tutorBio}>{tutor.bio}</p>

              {/* KHU VỰC CHÂN THẺ CARD (GIÁ CẢ + NÚT BẤM) */}
              <div style={styles.cardFooter}>
                <div>
                  <span style={styles.priceLabel}>Học phí chỉ từ:</span>
                  <div style={styles.priceValue}>
                    {tutor.price?.toLocaleString('vi-VN')}đ
                    <span style={{ fontSize: '12px', color: '#5F6B7A', fontWeight: 'normal' }}> / giờ</span>
                  </div>
                </div>
                <Link 
                  to={`/giasu/${tutor.slug || tutor.id || tutor._id}`} 
                  style={{
                    ...styles.btnDetail,
                    // Đã thay bằng màu xanh Sky sáng chuẩn thiết kế mới
                    backgroundColor: hoveredBtn === (tutor.id || tutor._id) ? '#0284c7' : '#C05A3E'
                  }}
                  onMouseEnter={() => setHoveredBtn(tutor.id || tutor._id)}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Xem hồ sơ →
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 🛠️ ĐÃ CẬP NHẬT: BỘ CSS INLINE CHUẨN SLATE DARK-MODE ĐỒNG BỘ 100% ---
const styles = {
  container: { 
    backgroundColor: '#FAF7F0', 
    minHeight: '100vh', 
    padding: '40px 6%', 
    fontFamily: "'Inter', sans-serif", 
    color: '#1E293B' 
  },
  topBadge: { 
    backgroundColor: 'rgba(16, 185, 129, 0.15)', 
    color: '#10b981', 
    padding: '6px 14px', 
    borderRadius: '20px', 
    fontSize: '11px', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em' 
  },
  mainTitle: { 
    fontSize: '34px', 
    fontWeight: '800', 
    margin: '15px 0 10px 0', 
    color: '#1E293B',
    letterSpacing: '-0.5px'
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#5F6B7A', 
    maxWidth: '600px', 
    margin: '0 auto',
    lineHeight: '1.6'
  },
  toolbar: { 
    display: 'flex', 
    gap: '15px', 
    marginBottom: '35px', 
    flexWrap: 'wrap' 
  },
  searchWrapper: { 
    flex: 1, 
    minWidth: '280px', 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    border: '1px solid #E7DED2', 
    padding: '0 15px', 
    borderRadius: '10px', 
    height: '46px' 
  },
  searchInput: { 
    backgroundColor: 'transparent', 
    border: 'none', 
    color: '#1E293B', 
    width: '100%', 
    outline: 'none', 
    fontSize: '14px' 
  },
  selectFilter: { 
    backgroundColor: '#FFFFFF', 
    border: '1px solid #E7DED2', 
    color: '#1E293B', 
    padding: '0 15px', 
    borderRadius: '10px', 
    height: '46px', 
    fontSize: '14px', 
    outline: 'none', 
    cursor: 'pointer', 
    minWidth: '180px' 
  },
  centerText: { 
    textAlign: 'center', 
    color: '#5F6B7A', 
    padding: '60px 0', 
    fontSize: '15px' 
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '25px' 
  },
  tutorCard: { 
    backgroundColor: '#FFFFFF', 
    border: '1px solid #E7DED2', 
    borderRadius: '14px', 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    transition: 'all 0.25s ease' 
  },
  avatarMock: { 
    width: '52px', 
    height: '52px', 
    borderRadius: '12px', 
    backgroundColor: 'rgba(192, 90, 62, 0.15)', // Đổi sang tông Cam thương hiệu của trang Login
    color: '#C05A3E', 
    fontWeight: '800', 
    fontSize: '22px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  tutorName: { 
    margin: 0, 
    fontSize: '18px', 
    color: '#1E293B', 
    fontWeight: '700' 
  },
  rateBadge: { 
    backgroundColor: 'rgba(245, 158, 11, 0.15)', 
    color: '#f59e0b', 
    padding: '2px 8px', 
    borderRadius: '6px', 
    fontSize: '13px', 
    fontWeight: '700' 
  },
  tutorSubject: { 
    margin: '4px 0 2px 0', 
    fontSize: '14px', 
    color: '#C05A3E', // Đồng bộ dải màu Sky Blue với nút bấm
    fontWeight: '600' 
  },
  tutorLevel: { 
    margin: 0, 
    fontSize: '13px', 
    color: '#5F6B7A' 
  },
  tutorBio: { 
    fontSize: '13px', 
    color: '#1E293B', 
    lineHeight: '1.6', 
    margin: '18px 0', 
    flexGrow: 1 
  },
  cardFooter: { 
    borderTop: '1px solid #E7DED2', 
    paddingTop: '15px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  priceLabel: { 
    fontSize: '12px', 
    color: '#5F6B7A', 
    display: 'block' 
  },
  priceValue: { 
    fontSize: '19px', 
    fontWeight: '900', 
    color: '#10b981' // Màu Emerald Green giống bên trang hóa đơn của sếp
  },
  btnDetail: { 
    color: '#FAF7F0', // Đổi chữ màu tối để tương phản cực nét trên nền Sky sáng
    padding: '10px 18px', 
    borderRadius: '8px', 
    textDecoration: 'none', 
    fontSize: '13.5px', 
    fontWeight: '700', 
    transition: 'background-color 0.2s ease' 
  }
};
