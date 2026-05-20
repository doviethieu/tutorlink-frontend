import { useState, useEffect } from 'react';
import axios from 'axios';

function TroGiup() {
  // Lấy data user đã đăng nhập sẵn
  const userData = JSON.parse(localStorage.getItem('tutorlinkUser')) || JSON.parse(localStorage.getItem('user'));
  const userId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id || null;
  
  // Xác định vai trò
  let userRole = "Khách";
  if (userData) {
    userRole = userData.role || (userData.user?.role === 'tutor' ? 'Gia sư' : 'Học viên');
  }

  // State quản lý form dữ liệu
  const [formData, setFormData] = useState({
    name: userData?.name || userData?.user?.name || '',
    email: userData?.email || userData?.user?.email || '',
    role: userRole,
    topic: 'Lỗi hệ thống / Kỹ thuật',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/support', {
        userId,
        ...formData
      });
      
      if (response.status === 201) {
        alert(`🎉 ${response.data.message}`);
        // Giữ lại tên email, chỉ xóa nội dung tin nhắn sau khi gửi thành công
        setFormData(prev => ({ ...prev, message: '' }));
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || "Lỗi kết nối mạng!"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      minHeight: '90vh',
      padding: '60px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '600px',
        padding: '40px',
        border: '1px solid #E2E8F0'
      }}>
        
        {/* Tiêu đề */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            📬 Trung Tâm Trợ Giúp
          </h2>
          <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>
            Bạn gặp khó khăn? Đừng lo, hãy gửi tin nhắn trực tiếp tới ban quản trị TutorLink.
          </p>
        </div>

        {/* Form liên hệ */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Họ và tên *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên của bạn"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Địa chỉ Email *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email để admin phản hồi"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Vai trò</label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', backgroundColor: '#F8FAFC' }}
              >
                <option value="Học viên">Học viên</option>
                <option value="Gia sư">Gia sư</option>
                <option value="Khách">Khách vãng lai</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Chủ đề cần hỗ trợ *</label>
              <select 
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px' }}
              >
                <option value="Lỗi hệ thống / Kỹ thuật">Lỗi hệ thống / Kỹ thuật</option>
                <option value="Tài khoản / Đăng nhập">Tài khoản / Đăng nhập</option>
                <option value="Thanh toán / Học phí">Thanh toán / Học phí</option>
                <option value="Khiếu nại / Tố cáo">Khiếu nại / Tố cáo gia sư</option>
                <option value="Hợp tác / Khác">Chủ đề khác</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Nội dung chi tiết *</label>
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải (Kèm theo thời gian bốc lỗi nếu có)..."
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#94A3B8' : '#F97316',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
            }}
            onMouseOver={(e) => { if(!loading) e.target.style.backgroundColor = '#EA580C'; }}
            onMouseOut={(e) => { if(!loading) e.target.style.backgroundColor = '#F97316'; }}
          >
            {loading ? "⏳ Đang gửi yêu cầu..." : "🚀 Gửi Tin Nhắn Tới Admin"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default TroGiup;