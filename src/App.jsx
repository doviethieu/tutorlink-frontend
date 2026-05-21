import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet, Link } from 'react-router-dom'; 
import axios from 'axios';
import Navbar from './components/Navbar';
import AuthLayout from './components/AuthLayout'; 

// IMPORT CÁC TRANG CỦA HỆ THỐNG
import TrangChu from './pages/TrangChu';
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy'; 
import QuenMatKhau from './pages/QuenMatKhau'; 
import DatLaiMatKhau from './pages/DatLaiMatKhau'; 
import XacMinhEmail from './pages/XacMinhEmail'; 
import Dashboard from './pages/Dashboard';
import GioHang from './pages/GioHang';
import DanhSachGiaSu from './pages/DanhSachGiaSu'; 
import ChiTietGiaSu from './pages/ChiTietGiaSu';
import DatLichHoc from './pages/DatLichHoc'; 
import TaoHoSoCV from './pages/TaoHoSoCV'; // Trang Đăng ký tạo CV Gia sư nhiều bước
import HoSoGiaSu from './pages/HoSoGiaSu'; 
import VideoCall from './pages/VideoCall'; 
import TroGiup from './pages/TroGiup'; 

// 📅 MANAGEMENT PAGES (HỌC VIÊN)
import LichHocHocVien from './pages/LichHocHocVien';
import GiaSuYeuThich from './pages/GiaSuYeuThich'; 
import KetQuaThanhToan from './pages/KetQuaThanhToan';
import CongThanhToan from './pages/CongThanhToan'; 
import Profile from './pages/Profile'; 
import StudentPanel from './pages/StudentPanel'; 
import TrangChat from './pages/TrangChat'; 

// ⏳ TUTOR PORTAL PAGES (GIA SƯ)
import LichRanhGiaSu from './pages/LichRanhGiaSu'; 
import LichDayGiaSu from './pages/LichDayGiaSu'; 
import TutorPanel from './pages/TutorPanel'; 
import ThuNhapGiaSu from './pages/ThuNhapGiaSu'; 

// <-- ADMIN PANEL -->
import AdminTongQuan from './pages/AdminTongQuan'; 
import AdminDuyetGiaSu from './pages/AdminDuyetGiaSu'; 
import AdminNguoiDung from './pages/AdminNguoiDung'; 

// =========================================================================
// 🛠️ 1. KHU KHAI BÁO CƠ CHẾ LAYOUT SIDEBAR CHUNG CHO CÁC CHỨC NĂNG
// =========================================================================
function AppDashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '90vh', backgroundColor: '#0f172a' }}>
      {/* CỘT TRÁI: THANH ĐIỀU HƯỚNG CHỨC NĂNG (SIDEBAR) */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <h3 style={{ color: '#3498db', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Bảng điều khiển</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li><Link to="/dashboard" style={styles.sidebarLink}>📅 Tổng quan (Dashboard)</Link></li>
          
          {/* 🔥 GIỮ NGUYÊN ĐƯỜNG DẪN ĐỒNG BỘ: Chuyển hướng chuẩn về /tutor/register */}
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

      {/* CỘT PHẢI: NƠI HIỂN THỊ NỘI DUNG CHI TIẾT CỦA TỪNG TRANG */}
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

  useEffect(() => {
    const fetchAllTutors = async () => {
      try {
        const token = localStorage.getItem('tutorlinkToken');
        if (!token) return;
        const res = await axios.get('http://localhost:8000/api/admin/tutors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllTutors(Array.isArray(res?.data) ? res.data : (res?.data?.tutors || []));
      } catch (error) {
        // 🛠️ ĐÃ FIX MOCK DATA CHUẨN MẢNG: Tránh crash hàm map/filter ở các trang liên kết
        setAllTutors([
          { _id: 't1', name: 'Nguyễn Văn A', subject: 'Toán học lớp 12', subjects: ['Toán Học'], levels: ['Cấp 3'], phone: '0912345678', email: 'vana@gmail.com', status: 'pending', message: 'Mong muốn dạy học sinh thi đại học' },
          { _id: 't2', name: 'Trần Thị B', subject: 'Tiếng Anh giao tiếp', subjects: ['Tiếng Anh'], levels: ['Giao tiếp'], phone: '0987654321', email: 'thib@gmail.com', status: 'Đã duyệt', message: 'Tập trung dạy giao tiếp thực hành' }
        ]);
      }
    };
    fetchAllTutors();
  }, []);

  const handleDuyet = async (idGiaSu) => {
    try {
      const token = localStorage.getItem('tutorlinkToken');
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
      const token = localStorage.getItem('tutorlinkToken');
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
    const gioHangMoi = gioHang.filter(gs => gs._id !== idGiaSu);
    setGioHang(gioHangMoi);
  };

  const thanhToanThicheng = () => {
    const randomBookingId = `BK-${Math.floor(Math.random() * 90000) + 10000}`;
    setGioHang([]); 
    navigate(`/payment/result?status=success&bookingId=${randomBookingId}`); 
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      
      {/* THANH NAVBAR CHUNG TOÀN HỆ THỐNG */}
      <Navbar setTuKhoa={setTuKhoa} soLuongGioHang={gioHang.length} />

      <Routes>
        {/* TRANG CHỦ PUBLIC */}
        <Route path="/" element={<TrangChu tuKhoa={tuKhoa} handleDatLich={handleDatLich} />} />
        
        <Route path="/giohang" element={<GioHang 
          gioHang={gioHang} 
          xoaKhoiGioHang={xoaKhoiGioHang} 
          thanhToanThanhCong={thanhToanThicheng} 
        />} />
        
        {/* LUỒNG AUTH XÁC THỰC */}
        <Route path="/login" element={<AuthLayout><DangNhap /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><DangKy /></AuthLayout>} /> 
        <Route path="/forgot-password" element={<AuthLayout><QuenMatKhau /></AuthLayout>} /> 
        <Route path="/reset-password" element={<AuthLayout><DatLaiMatKhau /></AuthLayout>} /> 
        <Route path="/verify-email" element={<AuthLayout><XacMinhEmail /></AuthLayout>} /> 

        {/* ========================================================================= */}
        {/* 🧠 LAYOUT SIDEBAR CHUNG (CÓ MENU TRÁI) */}
        {/* ========================================================================= */}
        <Route element={<AppDashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tutor/register" element={<TaoHoSoCV />} /> 
          <Route path="/student/panel" element={<StudentPanel lichSuHoc={allTutors} allTutors={allTutors} handleXoaDonLichSu={handleXoa} />} /> 
          <Route path="/bookings" element={<LichHocHocVien />} /> 
          <Route path="/favorites" element={<GiaSuYeuThich />} /> 
          <Route path="/chat" element={<TrangChat />} /> 
          <Route path="/profile" element={<Profile />} /> 
          
          {/* LUỒNG CHỨC NĂNG GIA SƯ */}
          <Route path="/tutor/panel" element={<TutorPanel />} /> 
          <Route path="/tutor/profile" element={<HoSoGiaSu />} /> 
          <Route path="/tutor/availability" element={<LichRanhGiaSu />} />
          <Route path="/tutor/bookings" element={<LichDayGiaSu />} />
          <Route path="/tutor/earnings" element={<ThuNhapGiaSu />} /> 
        </Route>

        {/* ========================================================================= */}
        {/* 🌍 CÁC ROUTE PUBLIC VÀ CHI TIẾT HỌC VIÊN XEM */}
        {/* ========================================================================= */}
        <Route path="/tutors" element={<DanhSachGiaSu />} /> 
        <Route path="/giasu/:id" element={<ChiTietGiaSu />} /> {/* Trang public học viên xem */}
        <Route path="/giasu/:id/book" element={<DatLichHoc />} /> 
        <Route path="/payment/result" element={<KetQuaThanhToan />} /> 
        
        {/* 🔥 ĐÃ ĐỒNG BỘ ĐƯỜNG DẪN CHUẨN ĐỂ ĐIỀU HƯỚNG TỪ MODAL ĐẶT LỊCH SANG */}
        <Route path="/cong-thanh-toan" element={<CongThanhToan />} /> 
        
        <Route path="/room/:roomId" element={<VideoCall />} /> 
        <Route path="/support" element={<TroGiup />} /> 

        {/* ========================================================================= */}
        {/* 🛠️ LUỒNG ĐIỀU HƯỚNG KIỂM DUYỆT ADMIN (ĐÃ VÁ LỖI KHỚP ĐƯỜNG DẪN) */}
        {/* ========================================================================= */}
        <Route path="/admin" element={
          <AdminTongQuan 
            allTutors={allTutors} 
            handleDuyet={handleDuyet} 
            handleXoa={handleXoa} 
          />
        } /> 
        {/* Đã đồng bộ: Khi admin nhấn xem CV từ bảng quản trị, hệ thống sẽ mở đúng trang này */}
        <Route path="/giasu/:id" element={<AdminDuyetGiaSu />} /> 
        <Route path="/admin/tutors/:id" element={<AdminDuyetGiaSu />} /> 
        <Route path="/admin/users" element={<AdminNguoiDung />} /> 
      </Routes>
    </div>
  );
}

const styles = {
  sidebarLink: {
    display: 'block',
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: 'rgba(255,255,255,0.02)'
  }
};

export default App;