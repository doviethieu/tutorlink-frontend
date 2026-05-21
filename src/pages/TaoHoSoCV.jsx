import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TaoHoSoCV() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // 1. QUẢN LÝ TRẠNG THÁI TOÀN BỘ DỮ LIỆU FORM
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    location: '',
    format: 'flex',
    school: '',
    degree: '',
    years: 0,
    cert: '',
    subjects: '',
    levels: '',
    price: 200000
  });

  // Quản lý thông báo lỗi cho từng trường
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- HÀM VALIDATE THEO TỪNG BƯỚC ---
  const validateStep = () => {
    let tempErrors = {};
    if (step === 0) {
      if (formData.headline.length < 5) tempErrors.headline = 'Tiêu đề tối thiểu phải đạt 5 ký tự.';
      if (formData.bio.length < 30) tempErrors.bio = 'Mô tả chi tiết bản thân cần tối thiểu 30 ký tự.';
      if (!formData.location.trim()) tempErrors.location = 'Vui lòng điền thông tin khu vực của sếp.';
    }
    if (step === 1) {
      if (!formData.school.trim()) tempErrors.school = 'Tên trường đào tạo không được để trống.';
      if (!formData.degree.trim()) tempErrors.degree = 'Vui lòng bổ sung bằng cấp hoặc chuyên ngành.';
      if (formData.years < 0 || formData.years > 50) tempErrors.years = 'Số năm kinh nghiệm không hợp lệ.';
    }
    if (step === 2) {
      if (!formData.subjects.trim()) tempErrors.subjects = 'Vui lòng nhập ít nhất một môn giảng dạy.';
      if (!formData.levels.trim()) tempErrors.levels = 'Cấp học không được bỏ trống (Ví dụ: THPT, Đại học).';
      if (formData.price < 50000) tempErrors.price = 'Mức học phí tối thiểu cấu hình là 50.000 ₫/giờ.';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // --- ĐIỀU HƯỚNG GIỮA CÁC BƯỚC ---
  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  // --- XỬ LÝ GỬI HỒ SƠ LÊN BACKEND ---
  const handleSubmitProfile = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('tutorlinkToken');
      
      // Chuẩn hóa chuỗi CSV (dấu phẩy) thành mảng tương tự hàm splitCsv cũ
      const cleanSplit = (str) => str.split(',').map(item => item.trim()).filter(Boolean);

      const payload = {
        headline: formData.headline,
        bio: formData.bio,
        location: formData.location,
        format: formData.format,
        education: {
          school: formData.school,
          degree: formData.degree,
          years: Number(formData.years),
          cert: formData.cert
        },
        subjects: cleanSplit(formData.subjects),
        levels: cleanSplit(formData.levels),
        price: Number(formData.price)
      };

      if (!token) {
        // Mock phản hồi thành công nếu sếp test offline không qua cổng Auth
        console.log("Mock gửi dữ liệu Profile thành công:", payload);
        alert('🎉 Hồ sơ gia sư giả lập đã gửi! Hệ thống tự động chuyển sếp về Dashboard.');
        navigate('/tutor/panel');
        return;
      }

      await axios.post('http://localhost:8000/api/tutors/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Hồ sơ đã gửi thành công! Ban quản trị Admin sẽ phê duyệt hồ sơ của sếp trong vòng 24 giờ.');
      navigate('/tutor/panel');
    } catch (error) {
      console.error(error);
      alert('Không gửi được hồ sơ, sếp kiểm tra lại kết nối mạng hoặc API nhé!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hệ thống cấu hình text hiển thị cho Stepper trên cùng
  const stepsConfig = [
    { label: 'Thông tin', desc: 'Giới thiệu ngắn' },
    { label: 'Trình độ', desc: 'Bằng cấp chuyên ngành' },
    { label: 'Môn dạy & giá', desc: 'Môn học & học phí' },
    { label: 'Hoàn tất', desc: 'Gửi duyệt hồ sơ' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        <span style={styles.topBadge}>Hồ sơ gia sư</span>
        <h1 style={styles.mainTitle}>Tạo hồ sơ chuyên nghiệp</h1>
        <p style={styles.subtitle}>Hồ sơ rõ ràng, minh bạch giúp tài khoản của sếp được Admin duyệt nhanh và tăng tỷ lệ học viên đặt lịch.</p>

        {/* 1. THANH CHỈ HƯỚNG BƯỚC DẠNG TAB (STEPPER) */}
        <div style={styles.stepperContainer}>
          {stepsConfig.map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{
                ...styles.stepNumberBox,
                backgroundColor: i === step ? '#3498db' : (i < step ? '#10b981' : '#334155'),
                color: '#fff'
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={styles.stepMeta}>
                <p style={{ ...styles.stepLabel, color: i === step ? '#fff' : '#94a3b8' }}>{s.label}</p>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2. KHU VỰC ĐIỀU HƯỚNG FORM KHỚP THEO TỪNG STEP */}
        <div style={styles.formCard}>
          
          {/* STEP 0: THÔNG TIN CÁ NHÂN */}
          {step === 0 && (
            <form onSubmit={handleNext} style={styles.formSpace}>
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Tiêu đề hồ sơ <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Gia sư chuyên Toán THPT, Luyện thi tốt nghiệp đại học điểm cao"
                  value={formData.headline}
                  onChange={(e) => setFormData({...formData, headline: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.headline && <span style={styles.errorText}>{errors.headline}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Giới thiệu chi tiết bản thân <span style={styles.required}>*</span></label>
                <textarea 
                  rows={5} 
                  placeholder="Phương pháp giảng dạy độc quyền, đối tượng học sinh hướng tới, cam kết đầu ra..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  style={styles.textareaStyle}
                />
                {errors.bio && <span style={styles.errorText}>{errors.bio}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Khu vực sinh sống / Dạy offline <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Hà Nội, Cầu Giấy hoặc Toàn quốc..."
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.location && <span style={styles.errorText}>{errors.location}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Hình thức lên lớp giảng dạy <span style={styles.required}>*</span></label>
                <div style={styles.radioGroup}>
                  {[
                    { key: 'online', label: 'Trực tuyến (Online)' },
                    { key: 'offline', label: 'Tại nhà (Offline)' },
                    { key: 'flex', label: 'Linh hoạt (Flex)' }
                  ].map(opt => (
                    <label 
                      key={opt.key}
                      style={{
                        ...styles.radioLabel,
                        borderColor: formData.format === opt.key ? '#3498db' : '#334155',
                        backgroundColor: formData.format === opt.key ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="format" 
                        value={opt.key}
                        checked={formData.format === opt.key}
                        onChange={() => setFormData({...formData, format: opt.key})}
                        style={{ display: 'none' }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.footerForm}>
                <button type="button" onClick={() => navigate(-1)} style={styles.btnGhost}>← Quay lại</button>
                <button type="submit" style={styles.btnPrimary}>Tiếp tục →</button>
              </div>
            </form>
          )}

          {/* STEP 1: TRÌNH ĐỘ HỌC VẤN */}
          {step === 1 && (
            <form onSubmit={handleNext} style={styles.formSpace}>
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Trường học / Đại học tốt nghiệp <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Đại học Sư phạm Hà Nội hoặc Đại học Bách Khoa"
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.school && <span style={styles.errorText}>{errors.school}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Bằng cấp / Chuyên ngành đào tạo <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Cử nhân Sư phạm Toán, Thạc sĩ Ngôn ngữ Anh"
                  value={formData.degree}
                  onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.degree && <span style={styles.errorText}>{errors.degree}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Số năm kinh nghiệm giảng dạy thực tế <span style={styles.required}>*</span></label>
                <input 
                  type="number" 
                  min={0}
                  max={50}
                  value={formData.years}
                  onChange={(e) => setFormData({...formData, years: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.years && <span style={styles.errorText}>{errors.years}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Chứng chỉ liên quan bổ sung</label>
                <input 
                  type="text" 
                  placeholder="TESOL, IELTS 8.5, Chứng chỉ nghiệp vụ sư phạm (cách nhau bằng dấu phẩy)..."
                  value={formData.cert}
                  onChange={(e) => setFormData({...formData, cert: e.target.value})}
                  style={styles.inputStyle}
                />
              </div>

              <div style={styles.footerForm}>
                <button type="button" onClick={handleBack} style={styles.btnGhost}>← Quay lại</button>
                <button type="submit" style={styles.btnPrimary}>Tiếp tục →</button>
              </div>
            </form>
          )}

          {/* STEP 2: MÔN DẠY VÀ CẤU HÌNH GIÁ */}
          {step === 2 && (
            <form onSubmit={handleNext} style={styles.formSpace}>
              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Môn học đảm nhiệm dạy <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Toán, Vật lý, Hóa học (Phân tách bằng dấu phẩy)"
                  value={formData.subjects}
                  onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.subjects && <span style={styles.errorText}>{errors.subjects}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Cấp học / Phân khúc học viên <span style={styles.required}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Lớp 10, Lớp 11, Lớp 12, Ôn Đại học (Phân tách bằng dấu phẩy)"
                  value={formData.levels}
                  onChange={(e) => setFormData({...formData, levels: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.levels && <span style={styles.errorText}>{errors.levels}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelForm}>Học phí mong muốn (VND / giờ) <span style={styles.required}>*</span></label>
                <input 
                  type="number" 
                  step={10000}
                  placeholder="200000"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  style={styles.inputStyle}
                />
                {errors.price && <span style={styles.errorText}>{errors.price}</span>}
              </div>

              <div style={styles.footerForm}>
                <button type="button" onClick={handleBack} style={styles.btnGhost}>← Quay lại</button>
                <button type="submit" style={styles.btnPrimary}>Xem lại hồ sơ →</button>
              </div>
            </form>
          )}

          {/* STEP 3: TỔNG HỢP VÀ GỬI DUYỆT (SUMMARY) */}
          {step === 3 && (
            <div style={styles.formSpace}>
              <h3 style={styles.summaryTitle}>Kiểm tra thông tin kỹ lưỡng trước khi gửi</h3>
              <p style={styles.summarySubtitle}>Admin điều hành hệ thống sẽ trực tiếp rà soát bằng cấp và phê duyệt CV của sếp trong vòng tối đa 24 giờ.</p>
              
              <div style={styles.summaryGrid}>
                <div style={styles.summaryBlock}>
                  <p style={styles.summaryLabel}>👤 KHỐI THÔNG TIN</p>
                  <p style={styles.summaryHeadline}><b>Tiêu đề:</b> {formData.headline}</p>
                  <p style={styles.summaryText}><b>Giới thiệu:</b> {formData.bio}</p>
                  <p style={styles.summaryText}><b>Khu vực:</b> {formData.location} · <b>Hình thức:</b> {formData.format.toUpperCase()}</p>
                </div>

                <div style={styles.summaryBlock}>
                  <p style={styles.summaryLabel}>🎓 HỌC VẤN & CHỨNG CHỈ</p>
                  <p style={styles.summaryHeadline}><b>Trường:</b> {formData.school}</p>
                  <p style={styles.summaryText}><b>Bằng cấp:</b> {formData.degree} ({formData.years} năm KN)</p>
                  {formData.cert && <p style={styles.summaryText}><b>Chứng chỉ:</b> {formData.cert}</p>}
                </div>

                <div style={styles.summaryBlock}>
                  <p style={styles.summaryLabel}>📚 CHUYÊN MÔN & ĐỊNH GIÁ</p>
                  <p style={styles.summaryHeadline}><b>Môn dạy:</b> {formData.subjects}</p>
                  <p style={styles.summaryText}><b>Khối lớp:</b> {formData.levels}</p>
                  <p style={{ ...styles.summaryText, color: '#2ecc71', fontWeight: 'bold' }}>
                    💵 Học phí: {Number(formData.price).toLocaleString('vi-VN')} ₫/giờ
                  </p>
                </div>
              </div>

              <div style={styles.footerForm}>
                <button type="button" onClick={handleBack} style={styles.btnGhost} disabled={isSubmitting}>Sửa lại</button>
                <button 
                  type="button" 
                  onClick={handleSubmitProfile} 
                  style={styles.btnSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang đẩy dữ liệu lên...' : '🚀 Bấm gửi duyệt ngay'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE STYLE COMPACT DARK COMPLEX ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif'
  },
  wrapper: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  topBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    color: '#3498db',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '12px 0 6px 0'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: '0 0 30px 0',
    lineHeight: '1.5'
  },
  stepperContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '24px'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px'
  },
  stepNumberBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    shrink: 0
  },
  stepMeta: {
    minWidth: 0
  },
  stepLabel: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 'bold'
  },
  stepDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  formCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '28px'
  },
  formSpace: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  labelForm: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#cbd5e1'
  },
  required: {
    color: '#e74c3c'
  },
  inputStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '12px',
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
    fontFamily: 'Arial, sans-serif'
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
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '2px'
  },
  footerForm: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #334155',
    paddingTop: '20px',
    marginTop: '10px'
  },
  btnGhost: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  btnPrimary: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnSubmit: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0
  },
  summarySubtitle: {
    color: '#94a3b8',
    fontSize: '13px',
    margin: '0 0 10px 0'
  },
  summaryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  summaryBlock: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '16px'
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#3498db',
    margin: '0 0 8px 0',
    letterSpacing: '0.5px'
  },
  summaryHeadline: {
    fontSize: '14px',
    margin: '0 0 4px 0',
    color: '#f8fafc'
  },
  summaryText: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.4'
  }
};