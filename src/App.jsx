import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, Link, Navigate } from 'react-router-dom'; 
import axios from 'axios';
import Navbar from './components/common/Navbar';
import AuthLayout from './layouts/AuthLayout'; 

// 🛠️ ĐÃ SỬA: Khớp 100% với file thực tế của sếp (thư mục stores/ và file auth-store.js)
import { useAuthStore } from './stores/auth-store.js';

// IMPORT CÁC TRANG CỦA HỆ THỐNG
import TrangChu from './pages/public/HomePage';
import DangNhap from './pages/auth/LoginPage';
import DangKy from './pages/auth/RegisterPage'; 
import QuenMatKhau from './pages/auth/ForgotPasswordPage'; 
import DatLaiMatKhau from './pages/auth/ResetPasswordPage'; 
import XacMinhEmail from './pages/auth/VerifyEmailPage'; 
import Dashboard from './pages/student/StudentDashboardPage';
import GioHang from './pages/student/CartPage';
import DanhSachGiaSu from './pages/public/TutorListPage'; 
import ChiTietGiaSu from './pages/public/TutorDetailPage';
import DatLichHoc from './pages/student/BookingPage'; 
import TaoHoSoCV from './pages/tutor/TutorProfileFormPage'; 
import HoSoGiaSu from './pages/tutor/TutorProfilePage'; 
import VideoCall from './pages/shared/VideoCallPage'; 
import TroGiup from './pages/public/HelpPage'; 

// 📅 MANAGEMENT PAGES (HỌC VIÊN)
import LichHocHocVien from './pages/student/MyBookingsPage';
import GiaSuYeuThich from './pages/student/FavoritesPage'; 
import KetQuaThanhToan from './pages/student/PaymentResultPage';
import CongThanhToan from './pages/student/PaymentPage'; 
import Profile from './pages/shared/ProfilePage'; 
import StudentPanel from './pages/student/StudentPanelPage'; 
import TrangChat from './pages/shared/ChatPage'; 

// ⏳ TUTOR PORTAL PAGES (GIA SƯ)
import LichRanhGiaSu from './pages/tutor/AvailabilityPage'; 
import LichDayGiaSu from './pages/tutor/TutorBookingsPage'; 
import TutorPanel from './pages/tutor/TutorDashboardPage'; 
import ThuNhapGiaSu from './pages/tutor/EarningsPage'; 

// <-- ADMIN PANEL -->
import AdminTongQuan from './pages/admin/AdminDashboardPage'; 
import AdminDuyetGiaSu from './pages/admin/AdminTutorsPage'; 
import AdminNguoiDung from './pages/admin/AdminUsersPage'; 

// =========================================================================
// 🔒 COMPONENT BẢO VỆ ROUTE (PROTECTED ROUTE CORES)
// =========================================================================
function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.accessToken) || localStorage.getItem('tutorlinkToken');
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated && localStorage.getItem('tutorlink-auth')) {
    return <div style={{ color: '#38bdf8', padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh' }}>🔄 Đang đồng bộ phiên đăng nhập TutorLink...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// =========================================================================
// 🛠️ 1. KHU KHAI BÁO CƠ CHẾ LAYOUT SIDEBAR CHUNG CHO CÁC CHỨC NĂNG
// =========================================================================
function AppDashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '90vh', backgroundColor: '#0f172a' }}>
      <div style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <h3 style={{ color: '#3498db', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Bảng điều khiển</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><Link to="/dashboard" style={styles.sidebarLink}>📅 Tổng quan (Dashboard)</Link></li>
          <li><Link to="/tutor/register" style={{...styles.sidebarLink, color: '#f1c40f', border: '1px dashed rgba(241, 196, 15, 0.3)', backgroundColor: 'rgba(241, 196, 15, 0.05)'}}>📝 Đăng ký làm Gia sư</Link></li>
          <li><Link to="/student/panel" style={styles.sidebarLink}>🎓 Không gian học viên</Link></li>
          <li><Link to="/bookings" style={styles.sidebarLink}>⏰ Lịch học của bạn</Link></li>
          <li><Link to="/favorites" style={styles.sidebarLink}>💖 Gia sư tâm đắc</Link></li>
          <li><Link to="/chat" style={styles.sidebarLink}>💬 Tin nhắn (Trang Chat)</Link></li>
          <li><Link to="/profile" style={styles.sidebarLink}>👤 Hồ sơ cá nhân</Link></li>
        </ul>

        <h3 style={{ color: '#2ecc71', fontSize: '14px', textTransform: 'uppercase', margin: '25px 0 10px 0', fontWeight: 'bold', letterSpacing: '0.5px' }}>Góc Gia Sư</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><Link to="/tutor/panel" style={styles.sidebarLink}>💼 Trung tâm gia sư</Link></li>
          <li><Link to="/tutor/availability" style={styles.sidebarLink}>📆 Cài đặt lịch rảnh</Link></li>
          <li><Link to="/tutor/earnings" style={styles.sidebarLink}>💳 Quản lý thu nhập</Link></li>
        </ul>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#0f172a' }}>
        <Outlet /> 
      </div>
    </div>
  );
}

// =========================================================================
// 🚀 2. LUỒNG COMPONENT CHÍNH APP
// =========================================================================
function App() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [gioHang, setGioHang] = useState([]);
  const navigate = useNavigate(); 
  const [allTutors, setAllTutors] = useState([]);
  
  const currentToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchAllTutors = async () => {
      try {
        const token = currentToken || localStorage.getItem('tutorlinkToken');
        if (!token) return;
        const res = await axios.get('http://localhost:8000/api/admin/tutors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllTutors(Array.isArray(res?.data) ? res.data : (res?.data?.tutors || []));
      } catch (error) {
        setAllTutors([
          { _id: 't1', name: 'Nguyễn Văn A', subject: 'Toán học lớp 12', subjects: ['Toán Học'], levels: ['Cấp 3'], phone: '0912345678', email: 'vana@gmail.com', status: 'pending', message: 'Mong muốn dạy học sinh thi đại học' },
          { _id: 't2', name: 'Trần Thị B', subject: 'Tiếng Anh giao tiếp', subjects: ['Tiếng Anh'], levels: ['Giao tiếp'], phone: '0987654321', email: 'thib@gmail.com', status: 'Đã duyệt', message: 'Tập trung dạy giao tiếp thực hành' }
        ]);
      }
    };
    fetchAllTutors();
  }, [currentToken]);

  const handleDuyet = async (idGiaSu) => {
    try {
      const token = currentToken || localStorage.getItem('tutorlinkToken');
      await axios.post(`http://localhost:8000/api/admin/tutors/${idGiaSu}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTutors(allTutors.map(gs => gs._id === idGiaSu ? { ...gs, status: 'approved' } : gs));
      alert("🎉 Đã duyệt nhanh gia sư lên sóng thành công!");
    } catch (error) {
      setAllTutors(allTutors.map(gs => gs._id === idGiaSu ? { ...gs, status: 'approved' } : gs));
      alert("[Mock Test] Giả lập duyệt nhanh gia sư lên sóng thành công!");
    }
  };

  const handleXoa = async (idGiaSu) => {
    if (!window.confirm("Sếp có chắc chắn muốn từ chối hoặc hạ sóng xóa gia sư này không?")) return;
    try {
      const token = currentToken || localStorage.getItem('tutorlinkToken');
      await axios.delete(`http://localhost:8000/api/admin/tutors/${idGiaSu}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTutors(allTutors.filter(gs => gs._id !== idGiaSu));
      alert("❌ Đã xóa hồ sơ gia sư khỏi hệ thống!");
    } catch (error) {
      setAllTutors(allTutors.filter(gs => gs._id !== idGiaSu));
      alert("[Mock Test] Giả lập xóa hồ sơ gia sư thành công!");
    }
  };

  const handleDatLich = (giaSu) => {
    const daCo = gioHang.find(item => item._id === giaSu._id);
    if(daCo) {
        alert("Bạn đã chọn gia sư này rồi, chọn người khác nhé!");
    } else {
        setGioHang([...gioHang, giaSu]);
        alert(`🎉 Đã thêm gia sư ${giaSu.name} vào giỏ hàng!`);
    }
  };

  const xoaKhoiGioHang = (idGiaSu) => {
    setGioHang(gioHang.filter(gs => gs._id !== idGiaSu));
  };

  const thanhToanThicheng = () => {
    const randomBookingId = `BK-${Math.floor(Math.random() * 90000) + 10000}`;
    setGioHang([]); 
    navigate(`/payment/result?status=success&bookingId=${randomBookingId}`); 
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <Navbar setTuKhoa={setTuKhoa} soLuongGioHang={gioHang.length} />
      <Routes>
        <Route path="/" element={<TrangChu tuKhoa={tuKhoa} handleDatLich={handleDatLich} />} />
        <Route path="/giohang" element={<GioHang gioHang={gioHang} xoaKhoiGioHang={xoaKhoiGioHang} thanhToanThanhCong={thanhToanThicheng} />} />
        
        <Route path="/login" element={<AuthLayout><DangNhap /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><DangKy /></AuthLayout>} /> 
        <Route path="/forgot-password" element={<AuthLayout><QuenMatKhau /></AuthLayout>} /> 
        <Route path="/reset-password" element={<AuthLayout><DatLaiMatKhau /></AuthLayout>} /> 
        <Route path="/verify-email" element={<AuthLayout><XacMinhEmail /></AuthLayout>} /> 

        <Route element={<ProtectedRoute><AppDashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tutor/register" element={<TaoHoSoCV />} /> 
          <Route path="/student/panel" element={<StudentPanel lichSuHoc={allTutors} allTutors={allTutors} handleXoaDonLichSu={handleXoa} />} /> 
          <Route path="/bookings" element={<LichHocHocVien />} /> 
          <Route path="/favorites" element={<GiaSuYeuThich />} /> 
          <Route path="/chat" element={<TrangChat />} /> 
          <Route path="/profile" element={<Profile />} /> 
          
          <Route path="/tutor/panel" element={<TutorPanel />} /> 
          <Route path="/tutor/profile" element={<HoSoGiaSu />} /> 
          <Route path="/tutor/availability" element={<LichRanhGiaSu />} />
          <Route path="/tutor/bookings" element={<LichDayGiaSu />} />
          <Route path="/tutor/earnings" element={<ThuNhapGiaSu />} /> 
        </Route>

        <Route path="/tutors" element={<DanhSachGiaSu />} /> 
        <Route path="/giasu/:id" element={<ChiTietGiaSu />} /> 
        <Route path="/giasu/:id/book" element={<DatLichHoc />} /> 
        <Route path="/payment/result" element={<KetQuaThanhToan />} /> 
        <Route path="/cong-thanh-toan" element={<CongThanhToan />} /> 
        <Route path="/room/:roomId" element={<VideoCall />} /> 
        <Route path="/support" element={<TroGiup />} /> 

        <Route path="/admin" element={<ProtectedRoute><AdminTongQuan allTutors={allTutors} handleDuyet={handleDuyet} handleXoa={handleXoa} /></ProtectedRoute>} /> 
        <Route path="/admin/tutors/:id" element={<ProtectedRoute><AdminDuyetGiaSu /></ProtectedRoute>} /> 
        <Route path="/admin/users" element={<ProtectedRoute><AdminNguoiDung /></ProtectedRoute>} /> 
      </Routes>
    </div>
  );
}

const styles = {
  sidebarLink: { display: 'block', color: '#cbd5e1', textDecoration: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }
};

export default App;
