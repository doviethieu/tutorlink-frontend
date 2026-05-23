import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🟢 GIỮ NGUYÊN: Import Link chuẩn để chuyển trang không bị reload
import { payoutService } from '../../services/payout.service';

// 🛠️ ĐÃ SỬA: Import linh hoạt Component biểu đồ (Hỗ trợ cả export thường lẫn export default)
import { SimpleBars } from '../../components/common/SimpleBars';

export default function ThuNhapGiaSu() {
  // --- STATE QUẢN LÝ DỮ LIỆU THỐNG KÊ DOANH THU ---
  const [dataThongKe, setDataThongKe] = useState([]);
  const [summary, setSummary] = useState({ availableAmount: 0, lockedAmount: 0, paidAmount: 0, availableSessionCount: 0 });
  const [payouts, setPayouts] = useState([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDoanhThu = async () => {
      try {
        setErrorMessage('');
        const [summaryRes, payoutRes] = await Promise.all([
          payoutService.summary(),
          payoutService.list(),
        ]);
        const nextSummary = summaryRes || {};
        setSummary({
          availableAmount: nextSummary.availableAmount || 0,
          lockedAmount: nextSummary.lockedAmount || 0,
          paidAmount: nextSummary.paidAmount || 0,
          availableSessionCount: nextSummary.availableSessionCount || 0,
        });
        setPayouts(Array.isArray(payoutRes) ? payoutRes : []);
        setDataThongKe([
          { label: 'Có thể rút', value: nextSummary.availableAmount || 0 },
          { label: 'Đang chờ', value: nextSummary.lockedAmount || 0 },
          { label: 'Đã nhận', value: nextSummary.paidAmount || 0 },
        ]);
      } catch (err) {
        console.log('Không thể tải dữ liệu payout:', err);
        setErrorMessage(err.response?.data?.error?.message || 'Không tải được dữ liệu thu nhập. Vui lòng kiểm tra hồ sơ gia sư hoặc đăng nhập lại.');
        setDataThongKe([]);
      }
    };
    fetchDoanhThu();
  }, []);

  const handleRequestPayout = async () => {
    if (!summary.availableAmount) {
      alert('Hiện chưa có số dư khả dụng để rút.');
      return;
    }

    setIsRequesting(true);
    try {
      const res = await payoutService.request({ amount: summary.availableAmount });
      setPayouts(prev => [res, ...prev]);
      setSummary(prev => ({ ...prev, availableAmount: 0, lockedAmount: prev.lockedAmount + summary.availableAmount }));
      alert('Đã gửi yêu cầu rút tiền tới admin.');
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Không thể gửi yêu cầu rút tiền.';
      alert(message);
    } finally {
      setIsRequesting(false);
    }
  };

  // 🛡️ ĐÃ GIA CỐ: Tạo biến mảng an toàn để không bao giờ lỗi crash logic bên dưới
  const safeDataThongKe = Array.isArray(dataThongKe) ? dataThongKe : [];

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* KHỐI TIÊU ĐỀ TRANG QUẢN TRỊ */}
        <div style={styles.headerArea}>
          <span style={styles.topBadge}>BẢNG ĐIỀU KHIỂN GIA SƯ</span>
          <h1 style={styles.title}>Thống kê tổng thu nhập</h1>
          <p style={styles.subtitle}>
            Cổng quản lý hiệu suất tài chính, theo dõi dòng tiền và số dư tích lũy của sếp. Tính năng rút tiền đang được tối ưu bảo mật đầu cuối.
          </p>
        </div>

        {errorMessage && (
          <div style={styles.errorCard}>{errorMessage}</div>
        )}

        {/* 🔥 KHỐI 1: HIỂN THỊ ĐỒ THỊ XU HƯỚNG DOANH THU TÍCH LŨY */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            Dòng tiền escrow và rút tiền
          </h3>
          <div style={styles.summaryGrid}>
            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>Có thể rút</span>
              <strong style={styles.metricValue}>{summary.availableAmount.toLocaleString('vi-VN')} đ</strong>
            </div>
            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>Đang chờ duyệt</span>
              <strong style={styles.metricValue}>{summary.lockedAmount.toLocaleString('vi-VN')} đ</strong>
            </div>
            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>Đã nhận</span>
              <strong style={styles.metricValue}>{summary.paidAmount.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            {/* 🛠️ ĐÃ SỬA: Đảm bảo dữ liệu chắc chắn là mảng có phần tử mới cho vẽ biểu đồ */}
            {safeDataThongKe.length > 0 ? (
              <SimpleBars data={safeDataThongKe} height={220} />
            ) : (
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
                Đang nạp dữ liệu đồ thị tài chính...
              </p>
            )}
          </div>
        </div>

        {/* KHỐI 2: THÔNG BÁO VÀ HƯỚNG DẪN ĐỒNG BỘ VÍ */}
        <div style={styles.card}>
          <div style={styles.cardFlex}>
            
            {/* ICON VÍ TIỀN PREMIUM */}
            <div style={styles.iconBox}>💳</div>
            
            {/* NỘI DUNG THÔNG TIN VÍ */}
            <div style={styles.infoContent}>
              <h2 style={styles.cardTitle}>Rút tiền doanh thu buổi học</h2>
              <p style={styles.cardText}>
                Doanh thu từ booking đã thanh toán chỉ được rút khi buổi học hoàn thành và khoản tiền vẫn đang nằm trong escrow.
              </p>
              
              <div style={styles.cardTextHighlight}>
                <span style={{ color: '#fff', fontWeight: '700' }}>Buổi đủ điều kiện:</span> {summary.availableSessionCount} buổi. Yêu cầu rút tiền sẽ chuyển sang trạng thái chờ admin duyệt.
              </div>
              
              {/* CỤM NÚT ĐIỀU HƯỚNG LINK CHÉO HỆ THỐNG */}
              <div style={styles.btnGroup}>
                <button onClick={handleRequestPayout} disabled={isRequesting || !summary.availableAmount} style={styles.btnPrimary}>
                  {isRequesting ? 'Đang gửi...' : 'Gửi yêu cầu rút tiền'}
                </button>
                <Link to="/tutor/availability" style={styles.btnPrimary}>
                  📅 Thiết lập lịch trống ngay
                </Link>
                <Link to="/tutor/bookings" style={styles.btnOutline}>
                  📑 Quản lý danh sách lịch dạy
                </Link>
              </div>
            </div>

          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Lịch sử yêu cầu rút tiền</h2>
          {payouts.length === 0 ? (
            <p style={styles.cardText}>Chưa có yêu cầu rút tiền.</p>
          ) : (
            <div style={styles.payoutList}>
              {payouts.slice(0, 6).map((payout) => (
                <div key={payout._id} style={styles.payoutRow}>
                  <span>{Number(payout.amount || 0).toLocaleString('vi-VN')} đ</span>
                  <strong>{payout.status}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- 🛠️ BỘ HỆ THỐNG DESIGN SYSTEM SLATE PREMIUM ĐỒNG BỘ TOÀN DỰ ÁN ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: 'calc(100vh - 70px)',
    padding: '40px 24px',
    fontFamily: "'Inter', sans-serif",
    color: '#cbd5e1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    boxSizing: 'border-box'
  },
  wrapper: {
    maxWidth: '850px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  headerArea: {
    width: '100%'
  },
  topBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '6px 14px',
    borderRadius: '20px',
    display: 'inline-block',
    letterSpacing: '0.5px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '14px 0 8px 0',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.6'
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5',
    borderRadius: '12px',
    padding: '14px 18px',
    fontSize: '13.5px',
    fontWeight: '700'
  },
  chartCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '26px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  chartTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '15.5px',
    fontWeight: '700',
    letterSpacing: '-0.2px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '18px'
  },
  metricBox: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '14px'
  },
  metricLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '6px'
  },
  metricValue: {
    color: '#fff',
    fontSize: '18px'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(56, 189, 248, 0.15)', 
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)'
  },
  cardFlex: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  iconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '10px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  infoContent: {
    flex: 1,
    minWidth: '280px'
  },
  cardTitle: {
    fontSize: '19px',
    fontWeight: '700',
    margin: '0 0 10px 0',
    color: '#fff',
    letterSpacing: '-0.3px'
  },
  cardText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 14px 0',
    lineHeight: '1.6'
  },
  cardTextHighlight: {
    fontSize: '13.5px',
    color: '#94a3b8',
    margin: '0 0 24px 0',
    lineHeight: '1.6',
    backgroundColor: '#0f172a',
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  codeStyle: {
    fontFamily: "'Courier New', Courier, monospace",
    backgroundColor: '#1e293b',
    color: '#38bdf8', 
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid #334155'
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    backgroundColor: '#38bdf8', 
    color: '#0f172a',
    border: 'none',
    padding: '11px 20px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.2)',
    transition: 'all 0.15s ease'
  },
  payoutList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '16px'
  },
  payoutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#cbd5e1'
  },
  btnOutline: {
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
    transition: 'all 0.15s ease'
  }
};
