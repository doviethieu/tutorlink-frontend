import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, Link, Navigate } from 'react-router-dom'; 
import Navbar from './components/common/Navbar';
import AuthLayout from './layouts/AuthLayout'; 

// 🛠️ ĐÃ SỬA: Khớp 100% với file thực tế của sếp (thư mục stores/ và file auth-store.js)
import { useAuthStore } from './stores/auth-store.js';
import { adminService } from './services/admin.service';
import { tutorService } from './services/tutor.service';

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
import AdminTaiChinh from './pages/admin/AdminFinancePage'; 

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

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('tutorlinkUser') || 'null');
  } catch {
    return null;
  }
}

function getHomeForRole(role) {
  if (role === 'admin') return '/admin';
  if (role === 'tutor') return '/tutor/panel';
  return '/dashboard';
}

function RequireRole({ roles, children }) {
  const storeUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken) || localStorage.getItem('tutorlinkToken');
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated && localStorage.getItem('tutorlink-auth')) {
    return <div style={{ color: '#38bdf8', padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh' }}>🔄 Đang đồng bộ phiên đăng nhập TutorLink...</div>;
  }

  if (!token) return <Navigate to="/login" replace />;

  const role = storeUser?.role || getStoredUser()?.role || 'student';
  if (!roles.includes(role)) {
    return <Navigate to={getHomeForRole(role)} replace />;
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
          <li><Link to="/tutor/bookings" style={styles.sidebarLink}>⏰ Lịch dạy của bạn</Link></li>
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
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchAllTutors = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('tutorlinkUser') || 'null');
        const role = currentUser?.role || storedUser?.role;
        const token = currentToken || localStorage.getItem('tutorlinkToken');

        const tutors = role === 'admin' && token
          ? await adminService.tutorQueue({ status: 'all', limit: 50 })
          : await tutorService.list({ limit: 50 });

        setAllTutors(Array.isArray(tutors) ? tutors : []);
      } catch (error) {
        setAllTutors([]);
      }
    };
    fetchAllTutors();
  }, [currentToken, currentUser?.role]);

  const handleDuyet = async (idGiaSu) => {
    try {
      await adminService.approveTutor(idGiaSu);
      setAllTutors(allTutors.map(gs => gs._id === idGiaSu ? { ...gs, status: 'approved' } : gs));
      alert("🎉 Đã duyệt nhanh gia sư lên sóng thành công!");
    } catch (error) {
      alert("Không thể duyệt nhanh gia sư. Vui lòng kiểm tra backend hoặc quyền admin.");
    }
  };

  const handleXoa = async (idGiaSu) => {
    if (!window.confirm("Sếp có chắc chắn muốn từ chối hoặc hạ sóng xóa gia sư này không?")) return;
    try {
      await adminService.suspendTutor(idGiaSu, 'Admin hạ sóng hồ sơ');
      setAllTutors(allTutors.map(gs => gs._id === idGiaSu ? { ...gs, status: 'suspended' } : gs));
      alert("❌ Đã hạ sóng hồ sơ gia sư khỏi marketplace!");
    } catch (error) {
      alert("Không thể hạ sóng hồ sơ gia sư. Vui lòng kiểm tra backend hoặc quyền admin.");
    }
  };

  const handleAnGiaSuKhoiHocVien = (idGiaSu) => {
    setAllTutors((items) => items.filter((gs) => (gs._id || gs.id) !== idGiaSu));
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
          <Route path="/dashboard" element={<RequireRole roles={['student', 'tutor', 'admin']}><Dashboard /></RequireRole>} />
          <Route path="/tutor/register" element={<RequireRole roles={['student', 'tutor', 'admin']}><TaoHoSoCV /></RequireRole>} /> 
          <Route path="/student/panel" element={<RequireRole roles={['student', 'tutor', 'admin']}><StudentPanel lichSuHoc={allTutors} allTutors={allTutors} handleXoaDonLichSu={handleAnGiaSuKhoiHocVien} /></RequireRole>} /> 
          <Route path="/bookings" element={<RequireRole roles={['student', 'tutor', 'admin']}><LichHocHocVien /></RequireRole>} /> 
          <Route path="/favorites" element={<RequireRole roles={['student', 'tutor', 'admin']}><GiaSuYeuThich /></RequireRole>} /> 
          <Route path="/chat" element={<TrangChat />} /> 
          <Route path="/profile" element={<Profile />} /> 
          
          <Route path="/tutor/panel" element={<RequireRole roles={['tutor', 'admin']}><TutorPanel /></RequireRole>} /> 
          <Route path="/tutor/profile" element={<RequireRole roles={['tutor', 'admin']}><HoSoGiaSu /></RequireRole>} /> 
          <Route path="/tutor/availability" element={<RequireRole roles={['tutor', 'admin']}><LichRanhGiaSu /></RequireRole>} />
          <Route path="/tutor/bookings" element={<RequireRole roles={['tutor', 'admin']}><LichDayGiaSu /></RequireRole>} />
          <Route path="/tutor/earnings" element={<RequireRole roles={['tutor', 'admin']}><ThuNhapGiaSu /></RequireRole>} /> 
        </Route>

        <Route path="/tutors" element={<DanhSachGiaSu />} /> 
        <Route path="/giasu/:id" element={<ChiTietGiaSu />} /> 
        <Route path="/giasu/:id/book" element={<RequireRole roles={['student', 'tutor', 'admin']}><DatLichHoc /></RequireRole>} /> 
        <Route path="/payment/result" element={<KetQuaThanhToan />} /> 
        <Route path="/payment" element={<RequireRole roles={['student', 'tutor', 'admin']}><CongThanhToan /></RequireRole>} /> 
        <Route path="/cong-thanh-toan" element={<RequireRole roles={['student', 'tutor', 'admin']}><CongThanhToan /></RequireRole>} /> 
        <Route path="/room/:roomId" element={<VideoCall />} /> 
        <Route path="/support" element={<ProtectedRoute><TroGiup /></ProtectedRoute>} /> 

        <Route path="/admin" element={<RequireRole roles={['admin']}><AdminTongQuan allTutors={allTutors} handleDuyet={handleDuyet} handleXoa={handleXoa} /></RequireRole>} /> 
        <Route path="/admin/tutors/:id" element={<RequireRole roles={['admin']}><AdminDuyetGiaSu /></RequireRole>} /> 
        <Route path="/admin/users" element={<RequireRole roles={['admin']}><AdminNguoiDung /></RequireRole>} /> 
        <Route path="/admin/finance" element={<RequireRole roles={['admin']}><AdminTaiChinh /></RequireRole>} /> 
      </Routes>
    </div>
  );
}

const styles = {
  sidebarLink: { display: 'block', color: '#cbd5e1', textDecoration: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }
};

export default App;
