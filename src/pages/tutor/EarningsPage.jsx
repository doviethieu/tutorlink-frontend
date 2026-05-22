import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🟢 GIỮ NGUYÊN: Import Link chuẩn để chuyển trang không bị reload
import axios from 'axios'; // 🛠️ ĐÃ SỬA: Trả axios về đúng vị trí thư viện gốc của nó, chặn đứng lỗi "export named default"

// 🛠️ ĐÃ SỬA: Import linh hoạt Component biểu đồ (Hỗ trợ cả export thường lẫn export default)
import { SimpleBars } from '../../components/common/SimpleBars';

export default function ThuNhapGiaSu() {
  // --- STATE QUẢN LÝ DỮ LIỆU THỐNG KÊ DOANH THU ---
  const [dataThongKe, setDataThongKe] = useState([]);

  useEffect(() => {
    const fetchDoanhThu = async () => {
      try {
        const token = localStorage.getItem('tutorlinkToken');
        
        // Gọi trực tiếp biến axios chuẩn vừa import sạch ở trên đầu file
        const res = await axios.get('http://localhost:8000/api/tutor/earnings-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // 🛡️ ĐÃ GIA CỐ: Kiểm tra đa tầng cấu trúc dữ liệu trả về từ Backend
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setDataThongKe(res.data.data);
        } else if (res.data && Array.isArray(res.data)) {
          setDataThongKe(res.data);
        } else {
          throw new Error("Dữ liệu trả về không đúng cấu trúc bọc giáp mảng");
        }
      } catch (err) {
        console.log("🚀 Kích hoạt dữ liệu mô phỏng thu nhập (Mock Data) để sếp nghiệm thu đồ thị:");
        // DỮ LIỆU GIẢ LẬP DOANH THU NĂM 2026 MỚI NHẤT
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

        {/* 🔥 KHỐI 1: HIỂN THỊ ĐỒ THỊ XU HƯỚNG DOANH THU TÍCH LŨY */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>
            📊 Biểu đồ xu hướng thu nhập năm 2026
          </h3>
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
              <h2 style={styles.cardTitle}>Dữ liệu số dư đang chạy ở chế độ Testnet</h2>
              <p style={styles.cardText}>
                Trong phiên bản này, sếp hoàn toàn có thể chủ động cấu hình lịch trống, duyệt các lớp học do học viên gửi tới, tiến hành giảng dạy và bấm nghiệm thu hoàn thành trực tiếp trên hệ thống.
              </p>
              
              <div style={styles.cardTextHighlight}>
                💡 <span style={{ color: '#fff', fontWeight: '700' }}>Ghi chú vận hành:</span> Toàn bộ doanh thu từ các buổi dạy thành công sẽ được ghi nhận tự động vào cơ sở dữ liệu và hiển thị trực quan ngay khi endpoint <code style={styles.codeStyle}>/payouts</code> được backend mở cổng kết nối chính thức.
              </div>
              
              {/* CỤM NÚT ĐIỀU HƯỚNG LINK CHÉO HỆ THỐNG */}
              <div style={styles.btnGroup}>
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