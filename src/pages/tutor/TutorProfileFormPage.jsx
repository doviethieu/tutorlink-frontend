import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorService } from '../../services/tutor.service';

function TaoHoSoCV() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🔐 1. XÁC THỰC NGƯỜI DÙNG & TOKEN HỆ THỐNG
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null;

  // 📝 2. CẤU TRÚC FORM DỮ LIỆU CHUẨN
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '', 
    phone: '',        
    headline: '',      
    location: '',      
    format: 'flex',    
    subject: '',
    price: '',
    image: '',
    description: '',   
    education: [{ truong: '', chuyenNganh: '', nam: '' }], 
    experience: [{ noiLamViec: '', moTa: '' }],             
    skills: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleArrayChange = (index, field, value, type) => {
    const newArray = [...formData[type]];
    newArray[index][field] = value;
    setFormData({ ...formData, [type]: newArray });
  };

  const addArrayItem = (type, defaultObject) => {
    setFormData({ ...formData, [type]: [...formData[type], defaultObject] });
  };

  const removeArrayItem = (type, index) => {
    // Cho phép xóa dòng nếu số lượng phần tử lớn hơn 1 nhằm đảm bảo tính toàn vẹn dữ liệu
    if (formData[type].length > 1) {
      const newArray = formData[type].filter((_, i) => i !== index);
      setFormData({ ...formData, [type]: newArray });
    }
  };

  // 🛡️ 3. BỘ VALIDATE DỮ LIỆU ĐẦU VÀO NGHIÊM NGẶT
  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = 'Họ và tên không được để trống.';
    if (formData.headline.length < 5) tempErrors.headline = 'Tiêu đề hồ sơ tối thiểu phải đạt 5 ký tự.';
    if (!formData.location.trim()) tempErrors.location = 'Vui lòng điền khu vực giảng dạy.';
    if (!formData.subject.trim()) tempErrors.subject = 'Vui lòng nhập môn học giảng dạy.';
    if (!formData.price || Number(formData.price) < 50000) tempErrors.price = 'Mức học phí tối thiểu là 50.000 ₫/giờ.';
    if (!formData.image.trim()) tempErrors.image = 'Vui lòng cung cấp link ảnh đại diện.';
    if (formData.description.length < 30) tempErrors.description = 'Mô tả chi tiết bản thân cần tối thiểu 30 ký tự.';
    if (!formData.contactEmail.trim()) tempErrors.contactEmail = 'Vui lòng nhập email liên hệ phỏng vấn.';
    if (!formData.phone.trim()) tempErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // 🚀 4. LUỒNG XỬ LÝ GỬI API LÊN BACKEND
  const handleSubmitCV = async (e) => {
    e.preventDefault();
    
    if (!user || !user.email) {
        alert("🛑 Hệ thống yêu cầu sếp đăng nhập trước khi thiết lập CV!");
        navigate('/login');
        return;
    }

    if (!validateForm()) {
        alert("⚠️ Thông tin chưa hợp lệ. Vui lòng kiểm tra lại các trường báo đỏ sếp nhé!");
        return;
    }

    setLoading(true);
    
    try {
      const payload = { 
          fullName: formData.name,
          email: formData.contactEmail || user.email,
          phone: formData.phone,
          headline: formData.headline,
          location: formData.location,
          format: formData.format,
          subjects: [formData.subject],
          price: Number(formData.price),
          avatarUrl: formData.image,
          bio: formData.description,
          description: formData.description,
          education: formData.education.map((edu) => ({
            school: edu.truong,
            major: edu.chuyenNganh,
            year: edu.nam,
          })),
          experience: formData.experience.map((exp) => ({
            company: exp.noiLamViec,
            description: exp.moTa,
          })),
          skills: formData.skills,
      };
      
      await tutorService.createProfile(payload);

      alert("🎉 Tạo CV thành công! Đội ngũ Admin TutorLink sẽ thẩm định hồ sơ của sếp và phản hồi trong 24 giờ tới.");
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Lỗi đồng bộ API:", error.response?.data || error.message);
      alert("❌ Lỗi hệ thống: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Tạo CV Gia Sư Chuyên Nghiệp</h2>
        <p style={styles.subtitle}>Cập nhật đầy đủ hồ sơ năng lực giúp tăng 90% tỷ lệ duyệt và thu hút học viên tiềm năng học tập.</p>

        <form onSubmit={handleSubmitCV} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>1. Thông tin cơ bản hiển thị</h3>
            <div style={styles.responsiveGrid}>
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Họ và Tên *</label>
                <input name="name" placeholder="Ví dụ: Nguyễn Văn A" value={formData.name} onChange={handleInputChange} style={styles.input} />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Môn giảng dạy chính *</label>
                <input name="subject" placeholder="Ví dụ: Toán lớp 12, Luyện thi IELTS" value={formData.subject} onChange={handleInputChange} style={styles.input} />
                {errors.subject && <span style={styles.errorText}>{errors.subject}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Mức học phí đề xuất (VNĐ / Giờ) *</label>
                <input name="price" type="number" placeholder="Tối thiểu từ 50.000" value={formData.price} onChange={handleInputChange} style={styles.input} />
                {errors.price && <span style={styles.errorText}>{errors.price}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Đường dẫn ảnh chân dung (URL) *</label>
                <input name="image" placeholder="https://example.com/avatar.jpg" value={formData.image} onChange={handleInputChange} style={styles.input} />
                {errors.image && <span style={styles.errorText}>{errors.image}</span>}
              </div>
            </div>

            <div style={{...styles.formGroup, marginTop: '16px'}}>
              <label style={styles.fieldLabel}>Tiêu đề hồ sơ thu hút *</label>
              <input name="headline" placeholder="Ví dụ: Gia sư chuyên Lý THPT - 5 năm kinh nghiệm luyện đề đại học điểm cao" value={formData.headline} onChange={handleInputChange} style={styles.input} />
              {errors.headline && <span style={styles.errorText}>{errors.headline}</span>}
            </div>

            <div style={{ ...styles.responsiveGrid, marginTop: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Khu vực giảng dạy trực tiếp *</label>
                <input name="location" placeholder="Ví dụ: Cầu Giấy, Hà Nội hoặc Quận 1, TP.HCM" value={formData.location} onChange={handleInputChange} style={styles.input} />
                {errors.location && <span style={styles.errorText}>{errors.location}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Hình thức lên lớp mặc định</label>
                <select name="format" value={formData.format} onChange={handleInputChange} style={styles.select}>
                  <option value="online">Trực tuyến (Online)</option>
                  <option value="offline">Tại nhà học viên (Offline)</option>
                  <option value="flex">Linh hoạt thích ứng (Flex)</option>
                </select>
              </div>
            </div>
          </div>

          {/* PHẦN 2: HỌC VẤN */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>2. Trình độ học vấn & Bằng cấp</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.education.map((edu, index) => (
                <div key={index} style={styles.arrayRow}>
                  <input placeholder="Trường Đại học / Cao đẳng" value={edu.truong} onChange={(e) => handleArrayChange(index, 'truong', e.target.value, 'education')} style={styles.input} required />
                  <input placeholder="Chuyên ngành đào tạo" value={edu.chuyenNganh} onChange={(e) => handleArrayChange(index, 'chuyenNganh', e.target.value, 'education')} style={styles.input} required />
                  <input placeholder="Năm tốt nghiệp" value={edu.nam} onChange={(e) => handleArrayChange(index, 'nam', e.target.value, 'education')} style={{...styles.input, width: '130px'}} required />
                  {formData.education.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem('education', index)} style={styles.btnDeleteRow} title="Xóa dòng này">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addArrayItem('education', { truong: '', chuyenNganh: '', nam: '' })} style={styles.addBtn}>
              + Thêm cơ sở học tập
            </button>
          </div>

          {/* PHẦN 3: KINH NGHIỆM */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>3. Kinh nghiệm làm việc & Giảng dạy</h3>
            {formData.experience.map((exp, index) => (
              <div key={index} style={styles.experienceBlock}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input placeholder="Nơi làm việc / Trường học / Trung tâm gia sư" value={exp.noiLamViec} onChange={(e) => handleArrayChange(index, 'noiLamViec', e.target.value, 'experience')} style={styles.input} required />
                  {formData.experience.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem('experience', index)} style={styles.btnDeleteBlock}>Xóa khối này</button>
                  )}
                </div>
                <textarea placeholder="Mô tả cụ thể vai trò giảng dạy, các khóa học đã phụ trách, thành tích đầu ra của học sinh..." value={exp.moTa} onChange={(e) => handleArrayChange(index, 'moTa', e.target.value, 'experience')} style={{...styles.textarea, height: '80px'}} required />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('experience', { noiLamViec: '', moTa: '' })} style={styles.addBtn}>
              + Thêm cột mốc kinh nghiệm
            </button>
          </div>

          {/* PHẦN 4: KỸ NĂNG & GIỚI THIỆU */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>4. Kỹ năng & Phương pháp sư phạm độc quyền</h3>
            <div style={{...styles.formGroup, marginBottom: '16px'}}>
              <label style={styles.fieldLabel}>Chứng chỉ đạt được & Công cụ hỗ trợ</label>
              <input name="skills" value={formData.skills} placeholder="Ví dụ: IELTS 8.5, Chứng chỉ sư phạm quốc gia, ứng dụng sơ đồ tư duy..." onChange={handleInputChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Giới thiệu chi tiết về triết lý giáo dục của bản thân *</label>
              <textarea name="description" value={formData.description} placeholder="Mô tả chi tiết phương pháp tiếp cận học sinh mất gốc, cam kết tiến độ, giáo trình biên soạn riêng... (Yêu cầu tối thiểu 30 ký tự)" onChange={handleInputChange} style={{...styles.textarea, height: '110px'}} />
              {errors.description && <span style={styles.errorText}>{errors.description}</span>}
            </div>
          </div>

          {/* PHẦN 5: THÔNG TIN LIÊN HỆ */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>5. Kênh liên hệ phỏng vấn trực tiếp</h3>
            <div style={styles.responsiveGrid}>
              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Email nhận thông báo lịch duyệt *</label>
                <input name="contactEmail" type="email" value={formData.contactEmail} placeholder="vi-du-email@gmail.com" onChange={handleInputChange} style={styles.input} />
                {errors.contactEmail && <span style={styles.errorText}>{errors.contactEmail}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.fieldLabel}>Số điện thoại di động chính chủ *</label>
                <input name="phone" type="tel" value={formData.phone} placeholder="Ví dụ: 0912345678" onChange={handleInputChange} style={styles.input} />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={loading ? styles.submitBtnDisabled : styles.submitBtn}>
            {loading ? '⏳ Đang đồng bộ hồ sơ lên Server...' : '🚀 GỬI DUYỆT HỒ SƠ GIA SƯ NGAY'}
          </button>

        </form>
      </div>
    </div>
  );
}

// --- 🛠️ BỘ HỆ THỐNG PRESET DESIGN SLATE DARK MODE SANG TRỌNG ---
const styles = {
  container: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '40px 24px', color: '#cbd5e1', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  card: { maxWidth: '880px', margin: '0 auto', backgroundColor: '#1e293b', padding: '40px 32px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', boxSizing: 'border-box' },
  title: { textAlign: 'center', color: '#fff', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' },
  subtitle: { textAlign: 'center', color: '#94a3b8', marginBottom: '36px', fontSize: '14px', lineHeight: '1.6' },
  section: { padding: '26px', border: '1px solid #334155', borderRadius: '12px', backgroundColor: '#0f172a', marginBottom: '4px' },
  sectionTitle: { color: '#38bdf8', marginTop: 0, fontSize: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '20px', fontWeight: '700', letterSpacing: '0.3px' },
  responsiveGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  arrayRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  experienceBlock: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px dashed #334155', paddingBottom: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' },
  fieldLabel: { fontSize: '12.5px', fontWeight: '700', color: '#cbd5e1' },
  input: { flex: 1, minWidth: '150px', padding: '12px 16px', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#1e293b', color: '#fff', transition: 'border-color 0.2s' },
  select: { width: '100%', padding: '12px 16px', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#1e293b', color: '#fff', cursor: 'pointer' },
  textarea: { width: '100%', padding: '12px 16px', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#1e293b', color: '#fff', resize: 'vertical', fontFamily: "'Inter', sans-serif" },
  errorText: { color: '#f87171', fontSize: '12.5px', fontWeight: '600', paddingLeft: '2px', marginTop: '2px' },
  addBtn: { alignSelf: 'flex-start', padding: '8px 14px', backgroundColor: 'transparent', color: '#38bdf8', border: '1px dashed rgba(56, 189, 248, 0.4)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', marginTop: '10px', transition: 'background-color 0.2s' },
  btnDeleteRow: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '12px 15px', cursor: 'pointer', fontWeight: '700' },
  btnDeleteBlock: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' },
  submitBtn: { width: '100%', padding: '15px', backgroundColor: '#38bdf8', color: '#0f172a', fontSize: '15.5px', fontWeight: '800', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)', transition: 'transform 0.1s' },
  submitBtnDisabled: { width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#475569', fontSize: '15.5px', fontWeight: '800', border: '1px solid #334155', borderRadius: '8px', cursor: 'not-allowed', marginTop: '10px' }
};

export default TaoHoSoCV;
