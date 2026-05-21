import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { SimpleBars } from '../components/SimpleBars'; // 🔥 ĐÃ TÍCH HỢP: Đưa biểu đồ cột vào dự án

export default function ThuNhapGiaSu() {
  // --- STATE QUẢN LÝ DỮ LIỆU THỐNG KÊ DOANH THU ---
  const [dataThongKe, setDataThongKe] = useState([]);

  useEffect(() => {
    // Luồng xử lý gọi API thực tế từ backend
    const fetchDoanhThu = async () => {
      try {
        const token = localStorage.getItem('tutorlinkToken');
        const res = await axios.get('http://localhost:8000/api/tutor/earnings-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) setDataThongKe(res.data);
      } catch (err) {
        console.log("Kích hoạt Mock Data thu nhập để sếp test đồ thị trực quan:");
        // DỮ LIỆU GIẢ LẬP DOANH THU 5 THÁNG GẦN NHẤT
        setDataThongKe([
          { label: 'Tháng 1', value: 1200000 },
          { label: 'Tháng 2', value: 3500000 },
          { label: 'Tháng 3', value: 2400000 },
          { label: 'Tháng 4', value: 5800000 },
          { label: 'Tháng 5', value: 4200000 }
        ]);
      }
    };
    fetchDoanhThu();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* KHỐI TIÊU ĐỀ */}
        <div style={styles.headerArea}>
          <span style={styles.topBadge}>Gia sư</span>
          <h1 style={styles.title}>Thống kê thu nhập</h1>
          <p style={styles.subtitle}>
            Cổng kết nối tài chính và số dư tài khoản của sếp. Nhóm chức năng payout hiện đang được bảo trì để nâng cấp bảo mật hệ thống.
          </p>
        </div>

        {/* 🔥 KHỐI 1: HIỂN THỊ ĐỒ THỊ BIỂU ĐỒ CỘT DOANH THU (MỚI THÊM) */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            📊 Xu hướng tổng thu nhập tích lũy năm 2026
          </h3>
          <div style={{ marginTop: '16px' }}>
            <SimpleBars data={dataThongKe} height={200} />
          </div>
        </div>

        {/* KHỐI 2: THÔNG BÁO TRẠNG THÁI VÍ */}
        <div style={styles.card}>
          <div style={styles.cardFlex}>
            
            {/* ICON VÍ TIỀN */}
            <div style={styles.iconBox}>
              💳
            </div>
            
            {/* NỘI DUNG CHI TIẾT */}
            <div style={styles.infoContent}>
              <h2 style={styles.cardTitle}>Hệ thống ví điện tử chưa bật dữ liệu thật</h2>
              <p style={styles.cardText}>
                Trong phiên bản API hiện tại, sếp hoàn toàn có thể chủ động cài đặt lịch trống, tiếp nhận các yêu cầu đặt lịch từ học viên, tham gia giảng dạy và bấm nghiệm thu hoàn thành buổi học. 
              </p>
              <p style={styles.cardTextHighlight}>
                💡 <b>Ghi chú từ hệ thống:</b> Toàn bộ doanh thu tích lũy từ các lớp học đã dạy sẽ được ghi nhận vào cơ sở dữ liệu tạm thời và tự động hiển thị đầy đủ ngay khi endpoint xử lý rút tiền <code style={styles.codeStyle}>/payouts</code> được backend kích hoạt mở sóng.
              </p>
              
              {/* CỤM NÚT ĐIỀU HƯỚNG NHANH */}
              <div style={styles.btnGroup}>
                <Link to="/tutor/availability" style={styles.btnPrimary}>
                  📅 Thiết lập lịch trống
                </Link>
                <Link to="/tutor/bookings" style={styles.btnOutline}>
                  📑 Kiểm tra lịch dạy
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// --- HỆ THỐNG CSS INLINE STYLE PREMIUM DARK MODE ---
const styles = {
  container: {
    backgroundColor: '#0f172a',
    minHeight: 'calc(100vh - 70px)', // Khớp hoàn hảo với chiều cao Navbar
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
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
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    color: '#3498db',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '5px 12px',
    borderRadius: '6px',
    display: 'inline-block'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '12px 0 8px 0',
    color: '#f8fafc'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5'
  },
  // Style riêng cho khung bọc biểu đồ cột
  chartCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  chartTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(52, 152, 219, 0.2)', // Viền ánh xanh nhẹ tạo điểm nhấn accent nhẹ nhàng
    borderRadius: '12px',
    padding: '28px'
  },
  cardFlex: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  iconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px'
  },
  infoContent: {
    flex: 1,
    minWidth: '280px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#f8fafc'
  },
  cardText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 12px 0',
    lineHeight: '1.6'
  },
  cardTextHighlight: {
    fontSize: '14px',
    color: '#cbd5e1',
    margin: '0 0 24px 0',
    lineHeight: '1.6',
    backgroundColor: '#0f172a',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  codeStyle: {
    fontFamily: 'Courier New, monospace',
    backgroundColor: '#334155',
    color: '#e74c3c',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  btnPrimary: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center'
  },
  btnOutline: {
    backgroundColor: 'transparent',
    color: '#cbd5e1',
    border: '1px solid #475569',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
    transition: 'all 0.2s'
  }
};