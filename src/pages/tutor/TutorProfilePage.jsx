import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 🛠️ ĐÃ FIX CHÍNH XÁC: Import axios từ thư viện 'axios' chuẩn của Node Modules
import axios from 'axios'; 

export default function HoSoGiaSu() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // 1. STATE QUẢN LÝ DỮ LIỆU CỦA FORM
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    location: '',
    responseTime: '',
    format: 'flex',
    school: '',
    degree: '',
    years: 0,
    cert: '',
    subjects: '',
    levels: '',
    price: 0
  });

  // State quản lý lỗi validation cục bộ
  const [errors, setErrors] = useState({});

  // 2. FETCH HỒ SƠ TỪ BACKEND
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:8000/api/tutors/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          const data = res.data;
          setProfile(data);
          
          setFormData({
            headline: data.headline || '',
            bio: data.bio || '',
            location: data.location || '',
            responseTime: data.responseTime || '',
            format: data.format || 'flex',
            school: data.education?.school || '',
            degree: data.education?.degree || '',
            years: data.education?.years || 0,
            cert: data.education?.cert || '',
            subjects: data.subjects?.join(', ') || '',
            levels: data.levels?.join(', ') || '',
            price: data.price || 0
          });
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin hồ sơ gia sư:", error);
        // Fallback Mock dữ liệu đồng bộ giao diện cao cấp cho sếp test
        setProfile({ status: 'approved' }); 
        setFormData({
          headline: 'Gia sư chuyên Toán THPT, luyện thi đại học điểm cao',
          bio: 'Kinh nghiệm giảng dạy lâu năm với giáo trình được tối ưu hóa cho từng đối tượng học sinh chuyên nghiệp.',
          location: 'Hà Nội · Cầu Giấy',
          responseTime: 'Trong vòng 15 phút',
          format: 'flex',
          school: 'Đại học Sư phạm Hà Nội',
          degree: 'Cử nhân Sư phạm Toán',
          years: 5,
          cert: 'Chứng chỉ Nghiệp vụ Sư phạm Cao cấp',
          subjects: 'Toán, Hình học, Đại số',
          levels: 'Lớp 10, Lớp 11, Lớp 12',
          price: 250000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  // 3. XỬ LÝ VALIDATION KHI LƯU
  const validateForm = () => {
    let tempErrors = {};
    if (formData.headline.length < 5) tempErrors.headline = 'Tiêu đề hiển thị tối thiểu phải đạt 5 ký tự sếp nhé.';
    if (formData.bio.length < 30) tempErrors.bio = 'Mô tả bản thân & phương pháp cần tối thiểu 30 ký tự để thuyết phục học viên.';
    if (!formData.location.trim()) tempErrors.location = 'Vui lòng điền khu vực địa lý giảng dạy.';
    if (!formData.school.trim()) tempErrors.school = 'Tên trường học hoặc đơn vị đào tạo không được để trống.';
    if (!formData.degree.trim()) tempErrors.degree = 'Vui lòng nhập chuyên ngành/bằng cấp hiện tại.';
    if (formData.years < 0 || formData.years > 50) tempErrors.years = 'Số năm kinh nghiệm nhập vào không hợp lệ.';
    if (!formData.subjects.trim()) tempErrors.subjects = 'Vui lòng điền ít nhất một môn học sở trường.';
    if (!formData.levels.trim()) tempErrors.levels = 'Vui lòng cấu hình cấp học có thể nhận dạy.';
    if (formData.price < 50000) tempErrors.price = 'Mức học phí tối thiểu hệ thống cấu hình là 50.000 ₫/giờ.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // 4. SUBMIT CẬP NHẬT LÊN SERVER
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Sếp ơi, vui lòng kiểm tra lại các trường thông tin bị lỗi bên dưới nhé!");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('tutorlinkToken');
      const cleanSplit = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        format: formData.format,
        responseTime: formData.responseTime || undefined,
        education: {
          school: formData.school,
          degree: formData.degree,
          years: Number(formData.years),
          cert: formData.cert || undefined,
        },
        subjects: cleanSplit(formData.subjects),
        levels: cleanSplit(formData.levels),
        price: Number(formData.price),
      };

      if (!token) {
        console.log("Gửi dữ liệu cập nhật (Gia lập):", payload);
        alert('🎉 Đã cập nhật cấu hình hồ sơ (Simulated)!');
        return;
      }

      await axios.put('http://localhost:8000/api/tutors/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Chúc mừng sếp, hồ sơ gia sư toàn năng đã được cập nhật thành công!');
    } catch (error) {
      console.error(error);
      alert('Gặp lỗi hệ thống khi đồng bộ hồ sơ rồi sếp ơi!');
    } finally {
      setIsSaving(false);
    }
  };

  // --- THÀNH PHẦN HIỂN THỊ BADGE TRẠNG THÁI KIỂM DUYỆT ---
  const renderStatusBadge = (status) => {
    if (status === 'approved') return <span style={{ ...styles.badge, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>✓ Đã duyệt</span>;
    if (status === 'rejected') return <span style={{ ...styles.badge, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>⚠️ Bị từ chối</span>;
    return <span style={{ ...styles.badge, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>⏳ Chờ duyệt</span>;
  };

  if (isLoading) {
    return <div style={styles.loadingBox}>⏳ Đang tải cấu hình hồ sơ gia sư tinh tú...</div>;
  }

  if (!profile) {
    return (
      <div style={styles.noProfileBox}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
        <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#fff', fontWeight: '700' }}>Sếp chưa khởi tạo hồ sơ gia sư</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.5' }}>Bật cấu hình profile để mở khoá luồng nhận học viên và quản lý lịch trình giảng dạy.</p>
        <Link to="/tao-cv" style={styles.btnActionLink}>Khởi tạo ngay</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* NÚT BACK */}
        <Link to="/tutor/panel" style={styles.backLink}>
          ← Quay lại bảng điều khiển của tôi
        </Link>

        {/* TIÊU ĐỀ CHÍNH & BADGE STATUS */}
        <div style={styles.headerFlex}>
          <h1 style={styles.mainTitle}>Chỉnh sửa hồ sơ cá nhân</h1>
          {renderStatusBadge(profile.status)}
        </div>
        <p style={styles.subtextTitle}>Thông tin năng lực này sẽ được hiển thị công khai trên cổng tìm kiếm để tiếp cận đến hàng ngàn học viên tiềm năng.</p>

        <form onSubmit={handleSaveProfile} style={styles.formSpace}>
          
          {/* KHỐI 1: THÔNG TIN NỀN TẢNG */}
          <div style={styles.card}>
            <h3 style={styles.cardHeaderTitle}>🔒 Thông tin nền tảng hiển thị</h3>
            <div style={styles.cardContent}>
              
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Tiêu đề hồ sơ thu hút học viên <span style={styles.required}>*</span></label>
                <input 
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  style={styles.inputStyle}
                  placeholder="Ví dụ: Thủ khoa Sư Phạm chuyên Anh, Cam kết đầu ra IELTS 7.0+"
                />
                {errors.headline && <span style={styles.errorText}>⚠️ {errors.headline}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Giới thiệu chi tiết & Phương pháp giảng dạy <span style={styles.required}>*</span></label>
                <textarea 
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={styles.textareaStyle}
                  placeholder="Chia sẻ sâu hơn về lộ trình học, mẹo làm bài và kinh nghiệm thực chiến của sếp..."
                />
                {errors.bio && <span style={styles.errorText}>⚠️ {errors.bio}</span>}
              </div>

              <div style={styles.gridTwoColumns}>
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Khu vực hành chính giảng dạy <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Ví dụ: Hà Nội · Cầu Giấy"
                  />
                  {errors.location && <span style={styles.errorText}>⚠️ {errors.location}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Thời gian tương tác phản hồi</label>
                  <input 
                    type="text"
                    value={formData.responseTime}
                    onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Ví dụ: Trong vòng 15 phút, Phản hồi ngay"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Hình thức lên lớp giảng dạy <span style={styles.required}>*</span></label>
                <div style={styles.radioGroup}>
                  {[
                    { v: 'online', l: '🖥️ Trực tuyến (Online)' },
                    { v: 'offline', l: '🏠 Tại nhà (Offline)' },
                    { v: 'flex', l: '⚡ Linh hoạt (Flex)' }
                  ].map((opt) => (
                    <label 
                      key={opt.v}
                      style={{
                        ...styles.radioLabel,
                        borderColor: formData.format === opt.v ? '#38bdf8' : '#334155',
                        backgroundColor: formData.format === opt.v ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        color: formData.format === opt.v ? '#38bdf8' : '#cbd5e1'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="format" 
                        value={opt.v} 
                        checked={formData.format === opt.v}
                        onChange={() => setFormData({ ...formData, format: opt.v })}
                        style={{ display: 'none' }}
                      />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* KHỐI 2: HỌC VẤN & TRÌNH ĐỘ */}
          <div style={styles.card}>
            <h3 style={styles.cardHeaderTitle}>🎓 Học vấn & Trình độ sư phạm</h3>
            <div style={styles.cardContent}>
              
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Trường đào tạo / Đại học chính quy <span style={styles.required}>*</span></label>
                <input 
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  style={styles.inputStyle}
                  placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                />
                {errors.school && <span style={styles.errorText}>⚠️ {errors.school}</span>}
              </div>

              <div style={styles.gridTwoColumns}>
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Bằng cấp / Học vị chuyên ngành <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Ví dụ: Cử nhân Kỹ thuật Phần mềm"
                  />
                  {errors.degree && <span style={styles.errorText}>⚠️ {errors.degree}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Kinh nghiệm đứng lớp (Số năm) <span style={styles.required}>*</span></label>
                  <input 
                    type="number"
                    min={0}
                    max={50}
                    value={formData.years}
                    onChange={(e) => setFormData({ ...formData, years: Number(e.target.value) })}
                    style={styles.inputStyle}
                  />
                  {errors.years && <span style={styles.errorText}>⚠️ {errors.years}</span>}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Chứng chỉ bổ trợ đi kèm khác</label>
                <input 
                  type="text"
                  value={formData.cert}
                  onChange={(e) => setFormData({ ...formData, cert: e.target.value })}
                  style={styles.inputStyle}
                  placeholder="Phân tách các chứng chỉ bằng dấu phẩy. Ví dụ: TOEIC 950, N2, HSK 5..."
                />
              </div>

            </div>
          </div>

          {/* KHỐI 3: CHUYÊN MÔN & ĐỊNH GIÁ */}
          <div style={styles.card}>
            <h3 style={styles.cardHeaderTitle}>📚 Khối chuyên môn & Học phí cấu hình</h3>
            <div style={styles.cardContent}>
              
              <div style={styles.gridTwoColumns}>
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Danh sách môn học đảm nhiệm <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Phân tách bằng dấu phẩy. Ví dụ: Toán 12, Vật Lý lý thuyết..."
                  />
                  {errors.subjects && <span style={styles.errorText}>⚠️ {errors.subjects}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Cấp học/Lớp nhận giảng dạy <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.levels}
                    onChange={(e) => setFormData({ ...formData, levels: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Phân tách bằng dấu phẩy. Ví dụ: THPT, Ôn thi chuyên lớp 9..."
                  />
                  {errors.levels && <span style={styles.errorText}>⚠️ {errors.levels}</span>}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Định giá học phí đề xuất (₫ / Giờ học) <span style={styles.required}>*</span></label>
                <input 
                  type="number"
                  step={10000}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={styles.inputStyle}
                />
                {errors.price && <span style={styles.errorText}>⚠️ {errors.price}</span>}
              </div>

            </div>
          </div>

          {/* NÚT SUBMIT ĐỒNG BỘ */}
          <div style={styles.submitRow}>
            <button 
              type="submit" 
              style={styles.btnSave}
              disabled={isSaving}
            >
              {isSaving ? '⏳ Hệ thống đang cập nhật hồ sơ...' : '💾 Lưu & Xuất bản hồ sơ'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// --- 🛠️ HỆ THỐNG CSS INLINE PRESET DARK SLATE PREMIUM ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    color: '#cbd5e1',
    fontFamily: "'Inter', sans-serif"
  },
  wrapper: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  backLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '18px',
    transition: 'color 0.2s'
  },
  headerFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  badge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '5px 14px',
    borderRadius: '20px'
  },
  subtextTitle: {
    color: '#94a3b8',
    fontSize: '14.5px',
    margin: '8px 0 32px 0',
    lineHeight: '1.6'
  },
  loadingBox: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '120px 20px',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    fontSize: '16px',
    fontFamily: "'Inter', sans-serif"
  },
  noProfileBox: {
    maxWidth: '520px',
    margin: '120px auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '40px 30px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
  },
  btnActionLink: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    display: 'inline-block',
    fontSize: '14.5px',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)'
  },
  formSpace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '26px'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  cardHeaderTitle: {
    fontSize: '16px',
    fontWeight: '700',
    backgroundColor: '#1e293b',
    padding: '16px 24px',
    margin: 0,
    borderBottom: '1px solid #334155',
    color: '#fff',
    letterSpacing: '-0.3px'
  },
  cardContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px'
  },
  labelForm: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#cbd5e1'
  },
  required: {
    color: '#f87171',
    marginLeft: '2px'
  },
  inputStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textareaStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: "'Inter', sans-serif",
    lineHeight: '1.6'
  },
  radioGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '4px'
  },
  radioLabel: {
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'center',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '600',
    marginTop: '4px'
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px'
  },
  btnSave: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    border: 'none',
    padding: '14px 36px',
    borderRadius: '8px',
    fontSize: '15.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)',
    transition: 'all 0.2s'
  }
};