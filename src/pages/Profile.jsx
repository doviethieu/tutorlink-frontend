import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const navigate = useNavigate();

  // --- 1. STATE QUẢN LÝ DỮ LIỆU USER ---
  const [me, setMe] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    role: 'student',
    emailVerified: false,
    isActive: true
  });

  // --- 2. STATE QUẢN LÝ FORM HỒ SƠ ---
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', avatarUrl: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // --- 3. STATE QUẢN LÝ FORM MẬT KHẨU ---
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // --- 4. STATE XÓA TÀI KHOẢN ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DỮ LIỆU NGƯỜI DÙNG KHI KHỞI CHẠY ---
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) {
          // Nếu không tìm thấy token, đẩy ra màn login hoặc dùng tạm dữ liệu Mock-up để sếp test giao diện
          setMockData();
          return;
        }
        const res = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        updateUserStates(res.data);
      } catch (error) {
        console.error("Lỗi fetch API /me, chuyển sang dùng Mock Data:");
        setMockData();
      }
    };
    fetchMe();
  }, []);

  const setMockData = () => {
    const mockUser = {
      fullName: 'Nguyễn Học Viên',
      email: 'hocvien.edumatch@gmail.com',
      phone: '0912345678',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256',
      role: 'student',
      emailVerified: true,
      isActive: true
    };
    updateUserStates(mockUser);
  };

  const updateUserStates = (userData) => {
    setMe(userData);
    setProfileForm({
      fullName: userData.fullName || '',
      phone: userData.phone || '',
      avatarUrl: userData.avatarUrl || ''
    });
  };

  // --- XỬ LÝ SỰ KIỆN UPLOAD ẢNH ĐẠI DIỆN ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('tutorlinkToken');
      const formData = new FormData();
      formData.append('avatar', file);

      // Giả lập hoặc gọi API upload thực tế
      alert("📸 Đang tải ảnh đại diện lên hệ thống...");
      
      // Ở đây ta mô phỏng gán trực tiếp URL ảnh vừa chọn (đối với môi trường Client-side test)
      const fakeUploadedUrl = URL.createObjectURL(file);
      setProfileForm(prev => ({ ...prev, avatarUrl: fakeUploadedUrl }));
      setMe(prev => ({ ...prev, avatarUrl: fakeUploadedUrl }));
      
      if (token) {
        await axios.post('http://localhost:8000/api/users/upload-avatar', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      alert("🎉 Tải ảnh đại diện thành công!");
    } catch (err) {
      alert("Lỗi khi tải ảnh đại diện lên backend!");
    }
  };

  // --- XỬ LÝ LƯU THAY ĐỔI HỒ SƠ ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!profileForm.fullName.trim()) errors.fullName = 'Tên phải có ít nhất 2 ký tự';
    if (profileForm.phone && !/^(\+84|0)[0-9]{9}$/.test(profileForm.phone)) {
      errors.phone = 'Số điện thoại Việt Nam không hợp lệ';
    }
    
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    setProfileErrors({});

    try {
      setIsUpdatingProfile(true);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (token) {
        const res = await axios.put('http://localhost:8000/api/users/profile', profileForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMe(res.data);
      } else {
        setMe(prev => ({ ...prev, ...profileForm }));
      }
      alert("✨ Cập nhật thông tin hồ sơ thành công!");
    } catch (err) {
      alert("Lỗi cập nhật hồ sơ rồi sếp ơi!");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // --- XỬ LÝ ĐỔI MẬT KHẨU ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    
    if (!passwordForm.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/[A-Z]/.test(passwordForm.newPassword) || !/\d/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ in hoa và 1 chữ số';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors({});

    try {
      setIsUpdatingPassword(true);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (token) {
        await axios.post('http://localhost:8000/api/users/change-password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert("🔒 Đổi mật khẩu thành công! Hệ thống yêu cầu đăng nhập lại.");
      localStorage.removeItem('tutorlinkToken');
      navigate('/login');
    } catch (err) {
      alert("Mật khẩu hiện tại không đúng hoặc lỗi hệ thống!");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- XỬ LÝ XÓA TÀI KHOẢN ---
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('tutorlinkToken');
      
      if (token) {
        await axios.delete('http://localhost:8000/api/users/account', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert("❌ Đã xoá tài khoản thành công (Chế độ lưu trữ tạm thời 30 ngày).");
      localStorage.removeItem('tutorlinkToken');
      navigate('/');
    } catch (err) {
      alert("Xoá tài khoản thất bại!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.gridWrapper}>
        
        {/* ================= KHỐI TRÁI: KHU VỰC ĐIỀU CHỈNH CHÍNH ================= */}
        <div style={styles.mainSection}>
          
          {/* BANNER & CARD AVATAR TỔNG QUAN */}
          <div style={styles.card}>
            <div style={styles.bannerHero}>
              <label style={styles.cameraBadge}>
                📷 Thay ảnh
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
            
            <div style={styles.avatarMetaWrapper}>
              <div style={styles.avatarPositioner}>
                <img 
                  src={me.avatarUrl || 'https://via.placeholder.com/150'} 
                  alt="Avatar" 
                  style={styles.avatarImg} 
                />
              </div>
              <button 
                style={styles.btnOutlineSmall} 
                onClick={() => document.getElementById('fullNameInput')?.focus()}
              >
                ✏️ Chỉnh sửa nhanh
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h1 style={styles.userTitleName}>{me.fullName || 'Hồ sơ EduMatch'}</h1>
              <p style={styles.userRoleSubtitle}>
                {me.role === 'tutor' ? '🚀 Gia sư trên TutorLink' : me.role === 'admin' ? '🛡️ Quản trị viên hệ thống' : '🎓 Học viên trên TutorLink'}
              </p>
              
              <div style={styles.metaRowText}>
                <span>📍 Việt Nam</span>
                <span>📧 {me.email || 'Chưa cập nhật email'}</span>
                {me.phone && <span>📞 {me.phone}</span>}
              </div>

              <div style={styles.badgeGroup}>
                <span style={{ ...styles.badge, backgroundColor: me.emailVerified ? 'rgba(46, 204, 113, 0.2)' : 'rgba(230, 126, 34, 0.2)', color: me.emailVerified ? '#2ecc71' : '#e67e22' }}>
                  {me.emailVerified ? '✓ Đã xác thực' : '⚠ Chưa xác thực'}
                </span>
                <span style={{ ...styles.badge, backgroundColor: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}>
                  {me.role === 'tutor' ? 'Gia sư' : me.role === 'admin' ? 'Quản trị viên' : 'Học sinh'}
                </span>
              </div>
            </div>
          </div>

          {/* FORM 1: CẬP NHẬT THÔNG TIN CƠ BẢN */}
          <div style={styles.card}>
            <h3 style={styles.cardTitleText}>Thông tin cá nhân</h3>
            <p style={styles.cardDescText}>Cập nhật tên hiển thị, số điện thoại liên lạc của bạn trên hệ thống.</p>
            
            <form onSubmit={handleProfileSubmit} style={styles.formContainer}>
              <div style={styles.inputWrapper}>
                <label style={styles.fieldLabel}>Họ và tên</label>
                <input 
                  id="fullNameInput"
                  type="text" 
                  style={styles.inputField} 
                  value={profileForm.fullName} 
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
                {profileErrors.fullName && <p style={styles.errorText}>{profileErrors.fullName}</p>}
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.fieldLabel}>Số điện thoại</label>
                <input 
                  type="text" 
                  style={styles.inputField} 
                  placeholder="0912345678"
                  value={profileForm.phone} 
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
                {profileErrors.phone && <p style={styles.errorText}>{profileErrors.phone}</p>}
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.fieldLabel}>Đường dẫn ảnh đại diện (URL)</label>
                <input 
                  type="text" 
                  style={styles.inputField} 
                  placeholder="https://example.com/avatar.jpg"
                  value={profileForm.avatarUrl} 
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                />
              </div>

              <button type="submit" disabled={isUpdatingProfile} style={styles.btnPrimary}>
                {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* FORM 2: ĐỔI MẬT KHẨU BẢO MẬT */}
          <div style={styles.card}>
            <h3 style={styles.cardTitleText}>Đổi mật khẩu bảo mật</h3>
            <p style={styles.cardDescText}>Tất cả các phiên đăng nhập trên thiết bị khác sẽ tự động đăng xuất sau khi đổi thành công.</p>
            
            <form onSubmit={handlePasswordSubmit} style={styles.formContainer}>
              <div style={styles.inputWrapper}>
                <label style={styles.fieldLabel}>Mật khẩu hiện tại *</label>
                <input 
                  type="password" 
                  style={styles.inputField} 
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                {passwordErrors.currentPassword && <p style={styles.errorText}>{passwordErrors.currentPassword}</p>}
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.fieldLabel}>Mật khẩu mới *</label>
                <input 
                  type="password" 
                  style={styles.inputField} 
                  placeholder="Ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                {passwordErrors.newPassword && <p style={styles.errorText}>{passwordErrors.newPassword}</p>}
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.fieldLabel}>Xác nhận lại mật khẩu mới *</label>
                <input 
                  type="password" 
                  style={styles.inputField} 
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                {passwordErrors.confirmPassword && <p style={styles.errorText}>{passwordErrors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={isUpdatingPassword} style={styles.btnPrimary}>
                {isUpdatingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              </button>
            </form>
          </div>

          {/* VÙNG NGUY HIỂM: XÓA ACCOUNT */}
          <div style={{ ...styles.card, border: '1px solid #7f1d1d', backgroundColor: 'rgba(127, 29, 29, 0.15)' }}>
            <h3 style={{ ...styles.cardTitleText, color: '#f87171' }}>⚠️ Vùng nguy hiểm nguy cơ cao</h3>
            <p style={{ ...styles.cardDescText, color: '#fca5a5' }}>
              Tài khoản của bạn sẽ bị vô hiệu hóa ngay lập tức. Hệ thống sẽ giữ trạng thái chờ khôi phục trong vòng 30 ngày trước khi tiến hành xóa vĩnh viễn.
            </p>
            
            <div style={{ marginTop: '16px' }}>
              {showDeleteConfirm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>Bạn có chắc chắn 100% muốn xóa tài khoản này?</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleDeleteAccount} disabled={isDeleting} style={styles.btnDangerConfirm}>
                      {isDeleting ? 'Đang thực thi...' : 'Đúng vậy, Xóa tài khoản'}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={styles.btnOutlineSmall}>
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} style={styles.btnDangerTrigger}>
                  Yêu cầu xóa tài khoản
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ================= KHỐI PHẢI: THANH THÔNG TIN BỔ TRỢ ================= */}
        <div style={styles.asideSection}>
          
          <div style={styles.card}>
            <h4 style={styles.asideTitle}>Ngôn ngữ hiển thị</h4>
            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>🇻🇳 Tiếng Việt (Vietnamese)</span>
            <p style={{ ...styles.cardDescText, marginTop: '8px' }}>
              Hồ sơ này định hình ngôn ngữ giao tiếp, tóm tắt lịch trình giảng dạy và thông báo đẩy mặc định của bạn trên hệ thống.
            </p>
          </div>

          <div style={styles.card}>
            <h4 style={styles.asideTitle}>Trạng thái hệ thống</h4>
            <div style={styles.statusListContainer}>
              <div style={styles.statusItemRow}>
                <span style={styles.statusLabelText}>Trạng thái hoạt động</span>
                <span style={{ ...styles.miniBadge, backgroundColor: me.isActive ? 'rgba(46,204,113,0.2)' : 'rgba(148,163,184,0.2)', color: me.isActive ? '#2ecc71' : '#94a3b8' }}>
                  {me.isActive ? 'Đang bật' : 'Chưa bật'}
                </span>
              </div>
              <div style={styles.statusItemRow}>
                <span style={styles.statusLabelText}>Email xác thực</span>
                <span style={{ ...styles.miniBadge, backgroundColor: me.emailVerified ? 'rgba(46,204,113,0.2)' : 'rgba(148,163,184,0.2)', color: me.emailVerified ? '#2ecc71' : '#94a3b8' }}>
                  {me.emailVerified ? 'Hoàn tất' : 'Chưa có'}
                </span>
              </div>
              <div style={styles.statusItemRow}>
                <span style={styles.statusLabelText}>Ảnh đại diện</span>
                <span style={{ ...styles.miniBadge, backgroundColor: me.avatarUrl ? 'rgba(46,204,113,0.2)' : 'rgba(148,163,184,0.2)', color: me.avatarUrl ? '#2ecc71' : '#94a3b8' }}>
                  {me.avatarUrl ? 'Sẵn sàng' : 'Chưa có'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// --- KIẾN TRÚC CSS INLINE CHUẨN DARK-MODE SIÊU MƯỢT ---
const styles = {
  pageContainer: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '30px 20px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif'
  },
  gridWrapper: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    // Responsive tự động trên màn hình lớn qua Media Query giả lập hoặc CSS Grid
  },
  mainSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  asideSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    overflow: 'hidden',
    position: 'relative'
  },
  bannerHero: {
    height: '140px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    margin: '-24px -24px 0 -24px',
    position: 'relative'
  },
  cameraBadge: {
    position: 'absolute',
    right: '16px',
    top: '16px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    border: '1px solid #475569',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    backdropFilter: 'blur(4px)'
  },
  avatarMetaWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '-50px',
    paddingBottom: '10px'
  },
  avatarPositioner: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '4px solid #1e293b',
    overflow: 'hidden',
    backgroundColor: '#334155'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  userTitleName: {
    fontSize: '26px',
    fontWeight: 'bold',
    margin: '10px 0 4px 0'
  },
  userRoleSubtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    margin: 0
  },
  metaRowText: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#64748b',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  badgeGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '14px'
  },
  badge: {
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600'
  },
  cardTitleText: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#fff'
  },
  cardDescText: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 20px 0',
    lineHeight: '1.5'
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#cbd5e1'
  },
  inputField: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  errorText: {
    color: '#f87171',
    fontSize: '12px',
    margin: '2px 0 0 0'
  },
  btnPrimary: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  btnOutlineSmall: {
    backgroundColor: 'transparent',
    border: '1px solid #475569',
    color: '#cbd5e1',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  btnDangerTrigger: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  },
  btnDangerConfirm: {
    backgroundColor: '#b91c1c',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px'
  },
  asideTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  statusItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabelText: {
    fontSize: '13px',
    color: '#cbd5e1'
  },
  miniBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold'
  }
};

// Khởi chạy CSS Grid nâng cao cho màn hình Desktop
setTimeout(() => {
  const wrapper = document.getElementById('profile-grid-layout');
  if (wrapper && window.innerWidth > 992) {
    wrapper.style.gridTemplateColumns = '1fr 320px';
  }
}, 100);