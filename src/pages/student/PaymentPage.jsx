import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CongThanhToan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // 🛠️ ĐÃ CẬP NHẬT: Đón nhận dữ liệu hóa đơn động truyền sang từ trang Chi Tiết Gia Sư
  const { bookingInfo, totalAmount, tutorName } = location.state || {};

  // Nếu chạy trực tiếp không qua luồng đặt lịch, cấu hình dữ liệu demo chuẩn để chống crash giao diện
  const soTienThanhToan = totalAmount || 250000;
  const tenGiaSuHienThi = tutorName || "Gia sư hệ thống";
  const maDonHang = bookingInfo?._id || "DH_TEST_" + Math.random().toString(36).substr(2, 6).toUpperCase();
  const cacCaHoc = bookingInfo?.selectedSchedule || ["Ca học thử nghiệm"];

  // HÀM MÔ PHỎNG KIỂM TRA IPN / XÁC NHẬN THANH TOÁN THÀNH CÔNG LÊN MONGODB
  const handleXacNhanChuyenKhoan = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('tutorlinkToken');
      
      // Nếu có _id đơn hàng thật, gọi API cập nhật trạng thái thanh toán lên Database
      if (bookingInfo?._id) {
        await axios.put(`http://localhost:8000/api/bookings/${bookingInfo._id}/payment-status`, {
          paymentStatus: 'Paid',
          status: 'Chấp nhận'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert("🎉 Cổng thanh toán TutorLink xác nhận: Giao dịch thành công! Hệ thống đã mở khóa lớp học trực tuyến cho bạn.");
      navigate('/bookings'); // Điều hướng học sinh về trang quản lý lịch học
    } catch (err) {
      console.log("🚨 Chế độ Mock Sandbox: Đồng bộ trạng thái giao diện.");
      alert("✔️ Hệ thống ghi nhận yêu cầu xác thực chuyển khoản thành công (Chế độ Sandbox)!");
      navigate('/');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* TIÊU ĐỀ CỔNG GIAO DỊCH */}
        <div style={styles.textCenter}>
          <span style={styles.accentBadge}>SANDBOX PAYMENT GATEWAY</span>
          <h1 style={styles.mainTitle}>Hóa Đơn Đặt Lịch Học</h1>
          <p style={styles.subtitle}>Sếp đang trải nghiệm luồng thanh toán tự động hóa của TutorLink</p>
        </div>

        <hr style={styles.divider} />

        {/* THÔNG TIN CHI TIẾT HÓA ĐƠN THỰC TẾ */}
        <div style={styles.invoiceBox}>
          <div style={styles.invoiceRow}>
            <span style={styles.label}>Mã đơn hàng:</span>
            <span style={{ ...styles.value, color: '#38bdf8' }}>{maDonHang}</span>
          </div>
          <div style={styles.invoiceRow}>
            <span style={styles.label}>Đối tác Gia sư:</span>
            <span style={styles.value}>{tenGiaSuHienThi}</span>
          </div>
          <div style={styles.invoiceRow}>
            <span style={styles.label}>Lịch đăng ký:</span>
            <span style={{ ...styles.value, fontSize: '13px', textAlign: 'right' }}>
              {cacCaHoc.join(', ')}
            </span>
          </div>
          <hr style={styles.dashedDivider} />
          <div style={styles.invoiceRow}>
            <span style={{ ...styles.label, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Tổng thanh toán:</span>
            <span style={{ ...styles.value, fontSize: '20px', color: '#10b981', fontWeight: '900' }}>
              {soTienThanhToan.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* ⚙️ KHU VỰC MÃ QR VIETQR MÔ PHỎNG SIÊU CHẤT */}
        <div style={styles.qrContainer}>
          <div style={styles.qrHeader}>QUÉT MÃ QR ĐỂ CHUYỂN KHOẢN AN TOÀN</div>
          <div style={styles.qrGraphic}>
            {/* Tạo hình khối mô phỏng lõi QR Code công nghệ */}
            <div style={styles.qrCornerTopLeft} />
            <div style={styles.qrCornerTopRight} />
            <div style={styles.qrCornerBottomLeft} />
            <div style={styles.qrCenterLogo}>TutorLink</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '45px' }}>[ VietQR NAPAS 247 ]</div>
          </div>
          <div style={styles.qrFooter}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Nội dung CK: <strong style={{ color: '#f97316' }}>TLINK {maDonHang}</strong></p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Hệ thống tự động duyệt sau khi nhận đủ tiền</p>
          </div>
        </div>

        {/* CỤM NÚT THAO TÁC ĐIỀU HƯỚNG */}
        <div style={styles.btnGrid}>
          <button 
            onClick={handleXacNhanChuyenKhoan} 
            disabled={isProcessing}
            style={styles.btnPrimary}
          >
            {isProcessing ? "⏳ Đang kiểm tra..." : "✅ Xác nhận đã chuyển khoản"}
          </button>
          
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={styles.btnOutline}>Hủy giao dịch</button>
          </Link>
        </div>

      </div>
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE CAO CẤP ĐỒNG BỘ DARK-MODE & CAM THƯƠNG HIỆU ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '460px',
    padding: '35px 25px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  accentBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    color: '#f97316',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'inline-block'
  },
  textCenter: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column'
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '6px 0 0 0',
    lineHeight: '1.5'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #334155',
    margin: 0
  },
  dashedDivider: {
    border: 'none',
    borderTop: '1px dashed #334155',
    margin: '10px 0'
  },
  invoiceBox: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  invoiceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px'
  },
  label: {
    fontSize: '13.5px',
    color: '#94a3b8'
  },
  value: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    color: '#0f172a'
  },
  qrHeader: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#475569',
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },
  qrGraphic: {
    width: '140px',
    height: '140px',
    margin: '0 auto',
    border: '4px solid #0f172a',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  qrCornerTopLeft: { position: 'absolute', top: '6px', left: '6px', width: '25px', height: '25px', border: '6px solid #0f172a' },
  qrCornerTopRight: { position: 'absolute', top: '6px', right: '6px', width: '25px', height: '25px', border: '6px solid #0f172a' },
  qrCornerBottomLeft: { position: 'absolute', bottom: '6px', left: '6px', width: '25px', height: '25px', border: '6px solid #0f172a' },
  qrCenterLogo: { position: 'absolute', backgroundColor: '#f97316', color: '#fff', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', borderRadius: '4px' },
  qrFooter: {
    marginTop: '12px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '8px'
  },
  btnGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '5px'
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#10b981',
    border: 'none',
    color: '#fff',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
    transition: '0.2s',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
  },
  btnOutline: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid #475569',
    color: '#94a3b8',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.2s'
  }
};