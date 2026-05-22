import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        const token = localStorage.getItem('tutorlinkToken');
        // Gọi cổng API Backend thực tế của sếp
        const res = await axios.get('http://localhost:8000/api/tutors', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Kiểm tra cấu trúc dữ liệu trả về để map chính xác vào mảng
        if (res.data && Array.isArray(res.data)) {
          setTutors(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setTutors(res.data.data);
        } else {
          throw new Error("Sai định dạng cấu trúc JSON trả về");
        }
      } catch (err) {
        console.error("Lỗi API Backend, kích hoạt Mock Data để tránh lỗi trang trắng tinh:");
        
        // Dữ liệu mẫu hiển thị siêu đẹp cứu cánh khi Backend chưa bật hoặc lỗi mạng
        setTutors([
          { 
            _id: '1', 
            name: 'Nguyễn Văn Học', 
            subject: 'Toán Học (Đại số & Giải tích)', 
            level: 'Lớp 12 / Luyện thi ĐH', 
            price: 250000, 
            rate: 4.9, 
            avatarUrl: '', 
            bio: 'Kinh nghiệm 5 năm luyện thi đại học điểm cao, phương pháp dạy dễ hiểu, mẹo giải nhanh trắc nghiệm.', 
            status: 'approved' 
          },
          { 
            _id: '2', 
            name: 'Trần Thị Mỹ Linh', 
            subject: 'Tiếng Anh (IELTS / Giao tiếp)', 
            level: 'Mọi cấp độ học viên', 
            price: 300000, 
            rate: 5.0, 
            avatarUrl: '', 
            bio: 'Sở hữu chứng chỉ 8.5 IELTS, phương pháp dạy tương tác phản xạ thực tế, cam kết tăng band điểm.', 
            status: 'approved' 
          },
          { 
            _id: '3', 
            name: 'Phạm Hoàng Nam', 
            subject: 'Vật Lý (Cơ học & Điện học)', 
            level: 'Lớp 10 - Lớp 12', 
            price: 220000, 
            rate: 4.8, 
            avatarUrl: '', 
            bio: 'Cựu học sinh trường chuyên Lê Hồng Phong, giúp học sinh mất gốc lấy lại căn bản thần tốc.', 
            status: 'approved' 
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTutors();
  }, []);

  // --- BỘ LỌC TÌM KIẾM THÔNG MINH (FILTER LOGIC) ---
  const filteredTutors = tutors.filter(tutor => {
    const matchTuKhoa = (
      tutor.name?.toLowerCase().includes(tuKhoa.toLowerCase()) || 
      tutor.subject?.toLowerCase().includes(tuKhoa.toLowerCase())
    );
    
    const matchMonHoc = monHocFilter === 'all' || tutor.subject?.toLowerCase().includes(monHocFilter.toLowerCase());
    
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
              key={tutor._id} 
              style={{
                ...styles.tutorCard,
                // Kích hoạt hiệu ứng nhấc thẻ card mượt mà kèm đổi màu border cam neon đồng bộ
                transform: hoveredCard === tutor._id ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: hoveredCard === tutor._id ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                borderColor: hoveredCard === tutor._id ? '#f97316' : '#334155'
              }}
              onMouseEnter={() => setHoveredCard(tutor._id)}
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
                    <span style={styles.rateBadge}>⭐ {tutor.rate || '5.0'}</span>
                  </div>
                  <p style={styles.tutorSubject}>{tutor.subject}</p>
                  <p style={styles.tutorLevel}>🎓 {tutor.level}</p>
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
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}> / giờ</span>
                  </div>
                </div>
                <Link 
                  to={`/giasu/${tutor._id}`} 
                  style={{
                    ...styles.btnDetail,
                    // Đã thay bằng màu xanh Sky sáng chuẩn thiết kế mới
                    backgroundColor: hoveredBtn === tutor._id ? '#0284c7' : '#38bdf8'
                  }}
                  onMouseEnter={() => setHoveredBtn(tutor._id)}
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
    backgroundColor: '#0f172a', 
    minHeight: '100vh', 
    padding: '40px 6%', 
    fontFamily: "'Inter', sans-serif", 
    color: '#e2e8f0' 
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
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#94a3b8', 
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
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    padding: '0 15px', 
    borderRadius: '10px', 
    height: '46px' 
  },
  searchInput: { 
    backgroundColor: 'transparent', 
    border: 'none', 
    color: '#fff', 
    width: '100%', 
    outline: 'none', 
    fontSize: '14px' 
  },
  selectFilter: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
    color: '#fff', 
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
    color: '#94a3b8', 
    padding: '60px 0', 
    fontSize: '15px' 
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '25px' 
  },
  tutorCard: { 
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
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
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Đổi sang tông Cam thương hiệu của trang Login
    color: '#f97316', 
    fontWeight: '800', 
    fontSize: '22px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  tutorName: { 
    margin: 0, 
    fontSize: '18px', 
    color: '#fff', 
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
    color: '#38bdf8', // Đồng bộ dải màu Sky Blue với nút bấm
    fontWeight: '600' 
  },
  tutorLevel: { 
    margin: 0, 
    fontSize: '13px', 
    color: '#94a3b8' 
  },
  tutorBio: { 
    fontSize: '13px', 
    color: '#cbd5e1', 
    lineHeight: '1.6', 
    margin: '18px 0', 
    flexGrow: 1 
  },
  cardFooter: { 
    borderTop: '1px solid #334155', 
    paddingTop: '15px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  priceLabel: { 
    fontSize: '12px', 
    color: '#94a3b8', 
    display: 'block' 
  },
  priceValue: { 
    fontSize: '19px', 
    fontWeight: '900', 
    color: '#10b981' // Màu Emerald Green giống bên trang hóa đơn của sếp
  },
  btnDetail: { 
    color: '#0f172a', // Đổi chữ màu tối để tương phản cực nét trên nền Sky sáng
    padding: '10px 18px', 
    borderRadius: '8px', 
    textDecoration: 'none', 
    fontSize: '13.5px', 
    fontWeight: '700', 
    transition: 'background-color 0.2s ease' 
  }
};