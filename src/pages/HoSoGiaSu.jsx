import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  // 2. FETCH HỒ SƠ CỦA TÔI TỪ BACKEND KHI VÀO TRANG
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
          
          // Đổ dữ liệu vào Form
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
        // Fallback Mock dữ liệu để sếp test giao diện mượt mà nếu chưa bật API
        setProfile({ status: 'approved' }); 
        setFormData({
          headline: 'Gia sư chuyên Toán THPT, luyện thi đại học điểm cao',
          bio: 'Kinh nghiệm giảng dạy lâu năm với giáo trình được tối ưu hóa cho từng đối tượng học sinh.',
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
    if (formData.headline.length < 5) tempErrors.headline = 'Tiêu đề tối thiểu phải đạt 5 ký tự.';
    if (formData.bio.length < 30) tempErrors.bio = 'Mô tả bản thân cần tối thiểu 30 ký tự.';
    if (!formData.location.trim()) tempErrors.location = 'Vui lòng điền khu vực giảng dạy.';
    if (!formData.school.trim()) tempErrors.school = 'Tên trường học không được để trống.';
    if (!formData.degree.trim()) tempErrors.degree = 'Vui lòng nhập chuyên ngành/bằng cấp.';
    if (formData.years < 0 || formData.years > 50) tempErrors.years = 'Số năm kinh nghiệm không phù hợp.';
    if (!formData.subjects.trim()) tempErrors.subjects = 'Vui lòng nhập ít nhất một môn học.';
    if (!formData.levels.trim()) tempErrors.levels = 'Vui lòng nhập cấp học giảng dạy.';
    if (formData.price < 50000) tempErrors.price = 'Mức phí tối thiểu cấu hình là 50.000 ₫/giờ.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // 4. SUBMIT CẬP NHẬT LÊN SERVER
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Sếp ơi, vui lòng kiểm tra lại các trường thông tin bị lỗi nhé!");
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
        alert('🎉 Đã cập nhật hồ sơ (Simulated)!');
        return;
      }

      await axios.put('http://localhost:8000/api/tutors/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Chúc mừng sếp, hồ sơ gia sư đã được cập nhật thành công!');
    } catch (error) {
      console.error(error);
      alert('Gặp lỗi khi lưu hồ sơ rồi sếp ơi!');
    } finally {
      setIsSaving(false);
    }
  };

  // --- THÀNH PHẦN HIỂN THỊ BADGE TRẠNG THÁI KIỂM DUYỆT ---
  const renderStatusBadge = (status) => {
    if (status === 'approved') return <span style={{ ...styles.badge, backgroundColor: '#10b981' }}>Đã duyệt</span>;
    if (status === 'rejected') return <span style={{ ...styles.badge, backgroundColor: '#ef4444' }}>Bị từ chối</span>;
    return <span style={{ ...styles.badge, backgroundColor: '#f59e0b' }}>Chờ duyệt</span>;
  };

  if (isLoading) {
    return <div style={styles.loadingBox}>Đang tải cấu hình hồ sơ gia sư...</div>;
  }

  if (!profile) {
    return (
      <div style={styles.noProfileBox}>
        <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Sếp chưa khởi tạo hồ sơ gia sư</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px 0' }}>Bật cấu hình profile để mở khoá luồng nhận học viên và đặt lịch.</p>
        <Link to="/tao-cv" style={styles.btnActionLink}>Tạo hồ sơ ngay</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* NÚT BACK */}
        <Link to="/tutor/panel" style={styles.backLink}>
          ← Quay lại bảng điều khiển
        </Link>

        {/* TIÊU ĐỀ CHÍNH & BADGE STATUS */}
        <div style={styles.headerFlex}>
          <h1 style={styles.mainTitle}>Chỉnh sửa hồ sơ cá nhân</h1>
          {renderStatusBadge(profile.status)}
        </div>
        <p style={styles.subtextTitle}>Thông tin này sẽ được hiển thị công khai trên danh sách tìm kiếm để tiếp cận học viên tiềm năng.</p>

        <form onSubmit={handleSaveProfile} style={styles.formSpace}>
          
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div style={styles.card}>
            <h3 style={styles.cardHeaderTitle}>🔒 Thông tin nền tảng</h3>
            <div style={styles.cardContent}>
              
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Tiêu đề hồ sơ hiển thị <span style={styles.required}>*</span></label>
                <input 
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  style={styles.inputStyle}
                />
                {errors.headline && <span style={styles.errorText}>{errors.headline}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Giới thiệu bản thân & Phương pháp dạy <span style={styles.required}>*</span></label>
                <textarea 
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={styles.textareaStyle}
                />
                {errors.bio && <span style={styles.errorText}>{errors.bio}</span>}
              </div>

              <div style={styles.gridTwoColumns}>
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Khu vực địa lý <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Ví dụ: Hà Nội · Cầu Giấy"
                  />
                  {errors.location && <span style={styles.errorText}>{errors.location}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Thời gian phản hồi (Trung bình)</label>
                  <input 
                    type="text"
                    value={formData.responseTime}
                    onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Ví dụ: Trong 15 phút, Ít khi quá 1 giờ"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Hình thức lên lớp giảng dạy <span style={styles.required}>*</span></label>
                <div style={styles.radioGroup}>
                  {[
                    { v: 'online', l: 'Trực tuyến' },
                    { v: 'offline', l: 'Tại nhà' },
                    { v: 'flex', l: 'Linh hoạt' }
                  ].map((opt) => (
                    <label 
                      key={opt.v}
                      style={{
                        ...styles.radioLabel,
                        borderColor: formData.format === opt.v ? '#3498db' : '#334155',
                        backgroundColor: formData.format === opt.v ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
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

          {/* KHỐI 2: TRÌNH ĐỘ & KINH NGHIỆM */}
          <div style={styles.card}>
            <h3 style={styles.cardHeaderTitle}>🎓 Học vấn & Trình độ sư phạm</h3>
            <div style={styles.cardContent}>
              
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Trường đào tạo / Đại học tốt nghiệp <span style={styles.required}>*</span></label>
                <input 
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  style={styles.inputStyle}
                />
                {errors.school && <span style={styles.errorText}>{errors.school}</span>}
              </div>

              <div style={styles.gridTwoColumns}>
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Bằng cấp / Học vị chuyên ngành <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    style={styles.inputStyle}
                  />
                  {errors.degree && <span style={styles.errorText}>{errors.degree}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Kinh nghiệm thực tế (Số năm) <span style={styles.required}>*</span></label>
                  <input 
                    type="number"
                    min={0}
                    max={50}
                    value={formData.years}
                    onChange={(e) => setFormData({ ...formData, years: Number(e.target.value) })}
                    style={styles.inputStyle}
                  />
                  {errors.years && <span style={styles.errorText}>{errors.years}</span>}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Chứng chỉ đi kèm bổ sung</label>
                <input 
                  type="text"
                  value={formData.cert}
                  onChange={(e) => setFormData({ ...formData, cert: e.target.value })}
                  style={styles.inputStyle}
                  placeholder="Ngăn cách bằng dấu phẩy. Ví dụ: IELTS 8.0, JLPT N1..."
                />
              </div>

            </div>
          </div>

          {/* KHỐI 3: MÔN DẠY & ĐỊNH GIÁ HỌC PHÍ */}
          <div style={styles.card}>
            <h3 style={styles.cardHeaderTitle}>📚 Khối chuyên môn & Học phí</h3>
            <div style={styles.cardContent}>
              
              <div style={styles.gridTwoColumns}>
                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Danh sách môn học <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="Toán, Vật lý, Hoá học..."
                  />
                  {errors.subjects && <span style={styles.errorText}>{errors.subjects}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.labelForm}>Cấp lớp nhận dạy <span style={styles.required}>*</span></label>
                  <input 
                    type="text"
                    value={formData.levels}
                    onChange={(e) => setFormData({ ...formData, levels: e.target.value })}
                    style={styles.inputStyle}
                    placeholder="THCS, THPT, Luyện thi đại học..."
                  />
                  {errors.levels && <span style={styles.errorText}>{errors.levels}</span>}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Định giá học phí mong muốn (₫ / Giờ học) <span style={styles.required}>*</span></label>
                <input 
                  type="number"
                  step={10000}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={styles.inputStyle}
                />
                {errors.price && <span style={styles.errorText}>{errors.price}</span>}
              </div>

            </div>
          </div>

          {/* NÚT SUBMIT LƯU LẠI */}
          <div style={styles.submitRow}>
            <button 
              type="submit" 
              style={styles.btnSave}
              disabled={isSaving}
            >
              {isSaving ? 'Đang cập nhật...' : '💾 Lưu và đồng bộ hồ sơ'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE PRESET DARK PREMIUM ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif'
  },
  wrapper: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  backLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: '16px'
  },
  headerFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0
  },
  badge: {
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '4px 12px',
    borderRadius: '20px',
    color: '#fff'
  },
  subtextTitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: '6px 0 30px 0',
    lineHeight: '1.5'
  },
  loadingBox: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    fontSize: '16px'
  },
  noProfileBox: {
    maxWidth: '500px',
    margin: '100px auto',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#fff'
  },
  btnActionLink: {
    backgroundColor: '#3498db',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    fontSize: '14px'
  },
  formSpace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  cardHeaderTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#1a2333',
    padding: '14px 20px',
    margin: 0,
    borderBottom: '1px solid #334155',
    color: '#f1f5f9'
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  labelForm: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  required: {
    color: '#ef4444'
  },
  inputStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '11px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  textareaStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.5'
  },
  radioGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginTop: '4px'
  },
  radioLabel: {
    border: '2px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '2px'
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px'
  },
  btnSave: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s'
  }
};