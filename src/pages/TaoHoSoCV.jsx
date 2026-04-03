import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TaoHoSoCV() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // LẤY THÔNG TIN USER TỪ LOCALSTORAGE ĐỂ LÀM CHÌA KHÓA NHẬN DIỆN
  const userString = localStorage.getItem('tutorlinkUser');
  const user = userString ? JSON.parse(userString) : null;

  // Form lưu trữ toàn bộ dữ liệu CV
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '', 
    phone: '',        
    subject: '',
    price: '',
    image: '',
    description: '',
    education: [{ truong: '', chuyenNganh: '', nam: '' }], 
    experience: [{ noiLamViec: '', moTa: '' }], 
    skills: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, value, type) => {
    const newArray = [...formData[type]];
    newArray[index][field] = value;
    setFormData({ ...formData, [type]: newArray });
  };

  const addArrayItem = (type, defaultObject) => {
    setFormData({ ...formData, [type]: [...formData[type], defaultObject] });
  };

  const handleSubmitCV = async (e) => {
    e.preventDefault();
    
    if (!user || !user.email) {
        alert("🛑 Bạn cần đăng nhập trước khi tạo CV!");
        navigate('/login');
        return;
    }

    setLoading(true);
    
    try {
      const payload = { 
          ...formData, 
          status: 'Chờ duyệt',
          email: user.email 
      };
      
      await axios.post('http://localhost:8000/api/tutors', payload);
      alert("🎉 Đã gửi CV thành công! Admin sẽ liên hệ với bạn qua Email/SĐT vừa cung cấp.");
      navigate('/dashboard'); 
    } catch (error) {
      alert("❌ Lỗi khi gửi CV: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', color: '#1E293B', marginBottom: '10px', fontSize: '32px' }}>Tạo CV Gia Sư</h2>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '40px' }}>Điền đầy đủ thông tin để Admin liên hệ phỏng vấn nhé!</p>

        <form onSubmit={handleSubmitCV} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <h3 style={{ color: '#3B82F6', marginTop: 0 }}>1. Thông tin cơ bản</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input name="name" placeholder="Họ và Tên" onChange={handleInputChange} required style={inputStyle} />
              <input name="subject" placeholder="Môn giảng dạy (VD: Toán 12, IELTS)" onChange={handleInputChange} required style={inputStyle} />
              <input name="price" type="number" placeholder="Học phí / giờ (VNĐ)" onChange={handleInputChange} required style={inputStyle} />
              <input name="image" placeholder="Link ảnh đại diện (URL)" onChange={handleInputChange} required style={inputStyle} />
            </div>
          </div>

          {/* PHẦN 2: HỌC VẤN */}
          <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <h3 style={{ color: '#3B82F6', marginTop: 0 }}>2. Quá trình học tập</h3>
            {formData.education.map((edu, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input placeholder="Trường ĐH/CĐ" value={edu.truong} onChange={(e) => handleArrayChange(index, 'truong', e.target.value, 'education')} style={inputStyle} required />
                <input placeholder="Chuyên ngành" value={edu.chuyenNganh} onChange={(e) => handleArrayChange(index, 'chuyenNganh', e.target.value, 'education')} style={inputStyle} required />
                <input placeholder="Năm TN" value={edu.nam} onChange={(e) => handleArrayChange(index, 'nam', e.target.value, 'education')} style={{...inputStyle, width: '100px'}} required />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('education', { truong: '', chuyenNganh: '', nam: '' })} style={addBtnStyle}>
              + Thêm học vấn
            </button>
          </div>

          {/* PHẦN 3: KINH NGHIỆM */}
          <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <h3 style={{ color: '#3B82F6', marginTop: 0 }}>3. Kinh nghiệm giảng dạy</h3>
            {formData.experience.map((exp, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '15px' }}>
                <input placeholder="Nơi làm việc / Chức vụ" value={exp.noiLamViec} onChange={(e) => handleArrayChange(index, 'noiLamViec', e.target.value, 'experience')} style={inputStyle} required />
                <textarea placeholder="Mô tả công việc chi tiết..." value={exp.moTa} onChange={(e) => handleArrayChange(index, 'moTa', e.target.value, 'experience')} style={{...inputStyle, height: '80px', resize: 'vertical'}} required />
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('experience', { noiLamViec: '', moTa: '' })} style={addBtnStyle}>
              + Thêm kinh nghiệm
            </button>
          </div>

          {/* PHẦN 4: KỸ NĂNG & GIỚI THIỆU */}
          <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <h3 style={{ color: '#3B82F6', marginTop: 0 }}>4. Giới thiệu & Kỹ năng</h3>
            <input name="skills" placeholder="Kỹ năng (VD: IELTS 8.0, Giao tiếp tốt...)" onChange={handleInputChange} style={{...inputStyle, marginBottom: '15px'}} />
            <textarea name="description" placeholder="Viết một đoạn ngắn giới thiệu bản thân..." onChange={handleInputChange} style={{...inputStyle, height: '100px', resize: 'vertical'}} required />
          </div>

          {/* PHẦN 5: THÔNG TIN LIÊN HỆ */}
          <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <h3 style={{ color: '#3B82F6', marginTop: 0 }}>5. Thông tin liên hệ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input name="contactEmail" type="email" placeholder="Email liên hệ phỏng vấn" onChange={handleInputChange} required style={inputStyle} />
              <input name="phone" type="tel" placeholder="Số điện thoại liên hệ" onChange={handleInputChange} required style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '16px', backgroundColor: '#F97316', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '10px'
          }}>
            {loading ? '⏳ Đang gửi CV...' : '🚀 NỘP CV ĐỂ ADMIN XÉT DUYỆT'}
          </button>

        </form>
      </div>
    </div>
  );
}

// Styles
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const addBtnStyle = { padding: '8px 15px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px dashed #94A3B8', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' };

export default TaoHoSoCV;