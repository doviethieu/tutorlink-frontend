import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TrangChu from './pages/TrangChu';
import DangNhap from './pages/DangNhap';
import Dashboard from './pages/Dashboard';
import GioHang from './pages/GioHang';
import ChiTietGiaSu from './pages/ChiTietGiaSu';
import TaoHoSoCV from './pages/TaoHoSoCV'; // 👈 1. Thêm import trang Tạo CV ở đây

function App() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [gioHang, setGioHang] = useState([]);
  const navigate = useNavigate(); // Dùng để chuyển trang sau khi thanh toán

  // 1. Hàm Thêm vào giỏ
  const handleDatLich = (giaSu) => {
    const daCo = gioHang.find(item => item._id === giaSu._id);
    if(daCo) {
        alert("Bạn đã chọn gia sư này rồi, chọn người khác nhé!");
    } else {
        setGioHang([...gioHang, giaSu]);
        alert(`🎉 Đã thêm gia sư ${giaSu.name} vào giỏ hàng!`);
    }
  };

  // 2. Hàm Xóa khỏi giỏ
  const xoaKhoiGioHang = (idGiaSu) => {
    // Lọc ra những người KHÁC với cái ID bị xóa (Tức là giữ lại những người không bị xóa)
    const gioHangMoi = gioHang.filter(gs => gs._id !== idGiaSu);
    setGioHang(gioHangMoi);
  };

  // 3. Hàm Thanh toán thành công
  const thanhToanThanhCong = () => {
    alert("🎉 CHỐT ĐƠN THÀNH CÔNG! Gia sư sẽ sớm liên hệ với bạn nhé!");
    setGioHang([]); // Xả sạch giỏ hàng về 0
    navigate('/'); // Đá khách về lại Trang chủ để mua tiếp
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      
      <Navbar setTuKhoa={setTuKhoa} soLuongGioHang={gioHang.length} />

      <Routes>
        <Route path="/" element={<TrangChu tuKhoa={tuKhoa} handleDatLich={handleDatLich} />} />
        
        {/* Truyền 2 cái mới xuống cho phòng Giỏ Hàng */}
        <Route path="/giohang" element={<GioHang 
          gioHang={gioHang} 
          xoaKhoiGioHang={xoaKhoiGioHang} 
          thanhToanThanhCong={thanhToanThanhCong} 
        />} />
        
        <Route path="/login" element={<DangNhap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/giasu/:id" element={<ChiTietGiaSu />} />
        
        {/* 👈 2. Khai báo đường dẫn /tao-cv ở đây */}
        <Route path="/tao-cv" element={<TaoHoSoCV />} /> 
      </Routes>
    </div>
  );
}

export default App;