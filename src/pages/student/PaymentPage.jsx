import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../../services/payment.service';
import { bookingService } from '../../services/booking.service';

export default function CongThanhToan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadedBooking, setLoadedBooking] = useState(null);

  const { bookingInfo, totalAmount, tutorName } = location.state || {};
  const displayBooking = bookingInfo || loadedBooking;

  const fallbackOrderCode = useMemo(() => `DH_TEST_${Math.random().toString(36).slice(2, 8).toUpperCase()}`, []);
  const bookingIdFromQuery = searchParams.get('bookingId');
  const activeBookingId = displayBooking?._id || displayBooking?.id || bookingIdFromQuery;
  const soTienThanhToan = totalAmount || displayBooking?.amount || 250000;
  const tenGiaSuHienThi = tutorName || displayBooking?.tutor?.name || "Gia sư hệ thống";
  const maDonHang = activeBookingId || fallbackOrderCode;
  const cacCaHoc = displayBooking?.selectedSchedule?.length
    ? displayBooking.selectedSchedule
    : [displayBooking?.date && displayBooking?.time ? `${displayBooking.date} ${displayBooking.time}` : "Ca học thử nghiệm"];

  useEffect(() => {
    const loadBooking = async () => {
      if (bookingInfo || !bookingIdFromQuery) return;
      try {
        const booking = await bookingService.get(bookingIdFromQuery);
        setLoadedBooking(booking);
      } catch (error) {
        console.error('Không tải được booking thanh toán:', error);
      }
    };

    loadBooking();
  }, [bookingIdFromQuery, bookingInfo]);

  // HÀM MÔ PHỎNG KIỂM TRA IPN / XÁC NHẬN THANH TOÁN THÀNH CÔNG LÊN MONGODB
  const handleXacNhanChuyenKhoan = async () => {
    setIsProcessing(true);
    try {
      let paymentId = null;
      let bookingId = activeBookingId;

      if (!bookingId) {
        alert('Không tìm thấy mã booking để thanh toán.');
        return;
      }

      const created = await paymentService.create(bookingId, 'bank_transfer');
      paymentId = created?.payment?._id || created?.payment?.id;

      if (created?.booking?.paymentStatus === 'paid') {
        alert('Booking này đã được thanh toán trước đó.');
        navigate('/bookings');
        return;
      }

      await paymentService.confirm({ paymentId, bookingId });

      alert("Cổng thanh toán TutorLink xác nhận: giao dịch thành công. Học phí đã được giữ trong escrow.");
      navigate('/bookings');
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Không thể xác nhận thanh toán. Vui lòng thử lại.';
      alert(message);
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
            <span style={{ ...styles.value, color: '#C05A3E' }}>{maDonHang}</span>
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
            <span style={{ ...styles.label, fontSize: '16px', fontWeight: 'bold', color: '#1E293B' }}>Tổng thanh toán:</span>
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
            <div style={{ color: '#8A7D72', fontSize: '12px', marginTop: '45px' }}>[ VietQR NAPAS 247 ]</div>
          </div>
          <div style={styles.qrFooter}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Nội dung CK: <strong style={{ color: '#C05A3E' }}>TLINK {maDonHang}</strong></p>
            <p style={{ margin: 0, fontSize: '11px', color: '#8A7D72' }}>Hệ thống tự động duyệt sau khi nhận đủ tiền</p>
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
    backgroundColor: '#FAF7F0',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DED2',
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
    backgroundColor: 'rgba(192, 90, 62, 0.15)',
    color: '#C05A3E',
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
    color: '#1E293B',
    margin: 0
  },
  subtitle: {
    fontSize: '13px',
    color: '#5F6B7A',
    margin: '6px 0 0 0',
    lineHeight: '1.5'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #E7DED2',
    margin: 0
  },
  dashedDivider: {
    border: 'none',
    borderTop: '1px dashed #E7DED2',
    margin: '10px 0'
  },
  invoiceBox: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #E7DED2',
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
    color: '#5F6B7A'
  },
  value: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E293B'
  },
  qrContainer: {
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    color: '#FAF7F0'
  },
  qrHeader: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7C6F64',
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },
  qrGraphic: {
    width: '140px',
    height: '140px',
    margin: '0 auto',
    border: '4px solid #FAF7F0',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  qrCornerTopLeft: { position: 'absolute', top: '6px', left: '6px', width: '25px', height: '25px', border: '6px solid #FAF7F0' },
  qrCornerTopRight: { position: 'absolute', top: '6px', right: '6px', width: '25px', height: '25px', border: '6px solid #FAF7F0' },
  qrCornerBottomLeft: { position: 'absolute', bottom: '6px', left: '6px', width: '25px', height: '25px', border: '6px solid #FAF7F0' },
  qrCenterLogo: { position: 'absolute', backgroundColor: '#C05A3E', color: '#FAF7F0', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', borderRadius: '4px' },
  qrFooter: {
    marginTop: '12px',
    borderTop: '1px solid #1E293B',
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
    color: '#1E293B',
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
    border: '1px solid #7C6F64',
    color: '#5F6B7A',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.2s'
  }
};
