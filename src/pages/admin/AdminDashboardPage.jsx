import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { SimpleBars } from '../../components/common/SimpleBars'; 
import { SimpleLine } from '../../components/common/SimpleLine'; 
import { StatusBadge } from '../../components/marketplace/StatusBadge';

export default function AdminTongQuan() {
  const navigate = useNavigate();

  // --- STATES CẤU TRÚC DỮ LIỆU CHÍNH ---
  const [overview, setOverview] = useState({
    totalUsers: 0,
    pendingTutors: 0,
    openReports: 0,
    monthlyRevenue: 0,
    bookingsByDay: [],
    revenueSeries: []
  });
  const [queue, setQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE GHI CHÚ XỬ LÝ BÁO CÁO VI PHẠM ---
  const [resolutionDraft, setResolutionDraft] = useState({});

  // --- TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU TỪ BACKEND THẬT ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [overviewRes, queueRes, reportsRes] = await Promise.all([
          adminService.overview(),
          adminService.tutorQueue({ status: 'pending_review', limit: 50 }),
          adminService.reports({ status: 'open', limit: 50 })
        ]);

        if (overviewRes) setOverview(overviewRes);
        
        if (queueRes) {
          const allTutors = Array.isArray(queueRes) ? queueRes : [];
          const pendingList = allTutors.filter(t => ['pending', 'pending_review', 'Chờ kiểm duyệt'].includes(t.status));
          setQueue(pendingList);
          
          // Cập nhật lại con số đếm trên badge thống kê cho chuẩn xác thực tế
          setOverview(prev => ({ ...prev, pendingTutors: pendingList.length }));
        }
        
        setReports(Array.isArray(reportsRes) ? reportsRes : []);

      } catch (err) {
        console.error("❌ Lỗi đồng bộ API Admin thật:", err.message);
        // 🛠️ ĐÃ FIX: Triệt tiêu Mock data. Nếu lỗi hệ thống hoặc trắng DB thì cho mảng rỗng để dễ kiểm soát lỗi.
        setQueue([]);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- HÀM PHÊ DUYỆT NHANH HỒ SƠ GIA SƯ (ĐỒNG BỘ ĐƯỜNG DẪN MONGODB THẬT) ---
  const handleTutorDecision = async (id, action) => {
    if (!window.confirm(`Sếp có chắc chắn muốn thực hiện hành động này nhanh không?`)) return;
    try {
      let payload = { ghiChuInternal: 'Duyệt nhanh từ bảng điều khiển tổng quan' };

      if (action === 'request') {
        payload.message = 'Vui lòng bổ sung thêm bằng cấp hoặc thông tin hồ sơ rõ ràng hơn.';
        await adminService.requestTutorInfo(id, payload.message);
      } else if (action === 'reject') {
        payload.message = 'Hồ sơ không đạt yêu cầu xét duyệt của hệ thống.';
        await adminService.rejectTutor(id, payload.message);
      } else {
        await adminService.approveTutor(id, payload.ghiChuInternal);
      }

      alert('🎉 Hệ thống đã ghi nhận và cập nhật trạng thái lên MongoDB thành công!');
      
      // Xóa người vừa xử lý khỏi danh sách hàng chờ giao diện ngay lập tức
      setQueue(queue.filter(item => (item._id || item.id) !== id));
      setOverview(prev => ({ ...prev, pendingTutors: Math.max(0, prev.pendingTutors - 1) }));
    } catch (err) {
      console.error("Lỗi thao tác xử lý nhanh:", err.message);
      alert('❌ Thao tác duyệt nhanh thất bại. Sếp vui lòng kiểm tra lại API Backend!');
    }
  };

  // --- HÀM PHÂN XỬ ĐƠN BÁO CÁO VI PHẠM ---
  const handleResolveReport = async (id, actionTaken) => {
    try {
      const textNote = resolutionDraft[id] || 'Đã xử lý từ dashboard';

      await adminService.resolveReport(id, {
        resolution: textNote,
        actionTaken
      });

      alert('✔️ Đã thực thi quyết định xử lý báo cáo!');
      setReports(reports.filter(rp => (rp._id || rp.id) !== id));
    } catch (err) {
      alert('Gặp lỗi khi xử lý báo cáo này sếp ạ!');
    }
  };

  // --- HÀM XUẤT CSV ---
  const handleExportCSV = async () => {
    try {
      const blob = await adminService.exportReportsCsv();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reports_overview.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi xuất dữ liệu CSV sếp ơi!');
    }
  };

  if (loading) {
    return <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>⏳ Đang kết nối cơ sở dữ liệu vận hành hệ thống...</div>;
  }

  return (
    <div style={styles.container}>
      {/* KHUNG PANEL ĐIỀU HƯỚNG ĐẦU TRANG */}
      <div style={styles.topHeaderCard}>
        <div>
          <span style={styles.accentBadge}>Hệ Thống Tối Cao</span>
          <h1 style={styles.mainTitle}>Tổng quan vận hành</h1>
          <p style={styles.subtitle}>Dữ liệu đồng bộ trực tiếp từ phân hệ quản trị lõi.</p>
        </div>
        <button onClick={() => navigate('/admin/users')} style={styles.btnNavigate}>
          👥 Quản lý người dùng →
        </button>
        <button onClick={() => navigate('/admin/finance')} style={styles.btnNavigate}>
          💳 Tài chính & Escrow →
        </button>
      </div>

      {/* PHẦN 1: BỐN THẺ CHỈ SỐ THỐNG KÊ NHANH */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#C05A3E' }}>👥</div>
          <p style={styles.statLabel}>Tổng người dùng</p>
          <p style={styles.statValue}>{overview?.totalUsers ?? 0}</p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#2ecc71' }}>⏱️</div>
          <p style={styles.statLabel}>Gia sư chờ duyệt</p>
          <p style={styles.statValue}>{overview?.pendingTutors ?? 0}</p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#e67e22' }}>⚠️</div>
          <p style={styles.statLabel}>Báo cáo mở</p>
          <p style={styles.statValue}>{overview?.openReports ?? 0}</p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#e74c3c' }}>💰</div>
          <p style={styles.statLabel}>Doanh thu tháng</p>
          <p style={styles.statValue}>{(overview?.monthlyRevenue ?? 0).toLocaleString('vi-VN')} đ</p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#C05A3E' }}>🏦</div>
          <p style={styles.statLabel}>Escrow đang giữ</p>
          <p style={styles.statValue}>{(overview?.escrowHeld ?? 0).toLocaleString('vi-VN')} đ</p>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#f59e0b' }}>📤</div>
          <p style={styles.statLabel}>Payout chờ duyệt</p>
          <p style={styles.statValue}>{overview?.pendingPayouts ?? 0}</p>
        </div>
      </div>

      {/* PHẦN 2: KHU VỰC ĐỒ THỊ BIỂU DIỄN */}
      <div style={styles.chartSectionGrid}>
        <div style={styles.cardMain}>
          <h3 style={styles.cardTitle}>📊 Lịch Đặt Chỗ (7 ngày qua)</h3>
          <div style={{ marginTop: '20px' }}>
            {overview?.bookingsByDay?.length > 0 ? (
              <SimpleBars data={overview.bookingsByDay} height={150} />
            ) : (
              <p style={styles.emptyText}>Chưa có dữ liệu biểu đồ đặt chỗ thực tế</p>
            )}
          </div>
        </div>

        <div style={styles.cardMain}>
          <h3 style={styles.cardTitle}>📈 Xu Hướng Doanh Thu (6 tháng)</h3>
          <div style={{ marginTop: '20px' }}>
            {overview?.revenueSeries?.length > 0 ? (
              <SimpleLine 
                data={overview.revenueSeries} 
                height={150} 
                formatValue={(val) => `${val} Triệu`} 
              />
            ) : (
              <p style={styles.emptyText}>Chưa có dữ liệu xu hướng doanh thu thực tế</p>
            )}
          </div>
        </div>
      </div>

      {/* PHẦN 3: HÀNG CHỜ PHÊ DUYỆT GIA SƯ THẬT */}
      <div style={{ ...styles.cardMain, marginTop: '25px' }}>
        <h3 style={styles.cardTitle}>⏱️ Hồ sơ đối tác gia sư đang đợi duyệt thực tế</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          {!queue || queue.length === 0 ? (
            <p style={styles.emptyText}>🎉 Hệ thống đã sạch sẽ! Không có hồ sơ gia sư nào tồn đọng dưới Database.</p>
          ) : (
            queue.map((item) => {
              const currentId = item._id || item.id;
              // 🛠️ ĐÃ FIX: Map chuẩn tên trường từ Form đăng ký CV (full_name)
              const displayName = item.full_name || item.name || item.email;
              return (
                <div key={currentId} style={styles.queueItemBox}>
                  <div style={styles.avatarCircle}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 'bold', color: '#1E293B', margin: 0 }}>{displayName}</p>
                    <p style={{ color: '#5F6B7A', fontSize: '13px', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.headline || 'Chưa thiết lập tiêu đề CV cá nhân'}
                    </p>
                  </div>
                  <StatusBadge status={item.status || 'pending'} />
                  
                  <div style={styles.btnActionGroup}>
                    <button onClick={() => handleTutorDecision(currentId, 'approve')} style={{ ...styles.btnMini, backgroundColor: '#2ecc71' }}>Duyệt nhanh</button>
                    <button onClick={() => handleTutorDecision(currentId, 'request')} style={{ ...styles.btnMini, backgroundColor: '#34495e', border: '1px solid #7C6F64' }}>Yêu cầu sửa</button>
                    {/* 🛠️ ĐÃ FIX BIẾN CỐ ĐIỀU HƯỚNG: Chuyển chuẩn sang trang chi tiết xét duyệt CV */}
                    <button onClick={() => navigate(`/admin/tutors/${currentId}`)} style={{ ...styles.btnMini, backgroundColor: '#C05A3E' }}>👁️ Mở Chi Tiết</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PHẦN 4: HỘP THƯ TỐ CÁO KHẨN CẤP */}
      <div style={{ ...styles.cardMain, marginTop: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={styles.cardTitle}>🚨 Đơn báo cáo vi phạm khẩn cấp cần xử lý</h3>
          <button onClick={handleExportCSV} style={styles.btnCsv}>📥 Xuất Excel/CSV</button>
        </div>
        <div style={styles.reportsGridContainer}>
          {!reports || reports.length === 0 ? (
            <p style={{ ...styles.emptyText, gridColumn: 'span 2' }}>🎉 Không có báo cáo vi phạm nào chưa giải quyết.</p>
          ) : (
            reports.slice(0, 4).map((report) => {
              const reportId = report._id || report.id;
              return (
                <div key={reportId} style={styles.reportCardBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#1E293B', fontSize: '15px' }}>{report.type || reportId}</h4>
                      <p style={{ margin: '4px 0 0 0', color: '#5F6B7A', fontSize: '12px' }}>🎯 Mục tiêu: {report.target}</p>
                    </div>
                    <StatusBadge status={report.status || 'open'} />
                  </div>
                  <p style={styles.reportDescriptionText}>{report.description || report.body || report.message || 'Không có nội dung mô tả chi tiết kèm theo.'}</p>
                  
                  <textarea
                    placeholder="Ghi chú phản hồi / Căn cứ đưa ra hình thức kỷ luật..."
                    rows={2}
                    value={resolutionDraft[reportId] || ''}
                    onChange={(e) => setResolutionDraft({ ...resolutionDraft, [reportId]: e.target.value })}
                    style={styles.textarea}
                  />

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => handleResolveReport(reportId, 'warn')} style={{ ...styles.btnAction, border: '1px solid #f39c12', color: '#f39c12' }}>⚠️ Cảnh báo</button>
                    <button onClick={() => handleResolveReport(reportId, 'lock')} style={{ ...styles.btnAction, border: '1px solid #e74c3c', color: '#e74c3c' }}>🚫 Khóa tài khoản</button>
                    <button onClick={() => handleResolveReport(reportId, 'dismiss')} style={{ ...styles.btnAction, backgroundColor: '#34495e', color: '#1E293B' }}>Bỏ qua đơn</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// HỆ THỐNG CSS INLINE CAO CẤP
const styles = {
  container: { backgroundColor: '#FAF7F0', minHeight: '100vh', padding: '30px 4%', fontFamily: 'Arial, sans-serif', color: '#1E293B' },
  topHeaderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', padding: '24px', borderRadius: '12px', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  accentBadge: { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#C05A3E', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  mainTitle: { fontSize: '26px', fontWeight: 'bold', color: '#1E293B', margin: '10px 0 4px 0' },
  subtitle: { fontSize: '14px', color: '#5F6B7A', margin: 0 },
  btnNavigate: { backgroundColor: '#C05A3E', color: '#FAF7F0', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '12px', padding: '20px', position: 'relative' },
  iconBox: { position: 'absolute', top: '20px', right: '20px', fontSize: '22px', opacity: 0.8 },
  statLabel: { fontSize: '13px', color: '#5F6B7A', margin: 0 },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: '#1E293B', margin: '8px 0 0 0' },
  chartSectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '25px' },
  cardMain: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '12px', padding: '24px' },
  cardTitle: { margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1E293B' },
  emptyText: { textAlign: 'center', color: '#5F6B7A', fontSize: '14px', padding: '30px 0', margin: 0 },
  queueItemBox: { display: 'flex', alignItems: 'center', backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', padding: '14px 20px', borderRadius: '10px', gap: '15px' },
  avatarCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#7C6F64', color: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  btnActionGroup: { display: 'flex', gap: '8px' },
  btnMini: { border: 'none', color: '#FAF7F0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnCsv: { backgroundColor: 'transparent', border: '1px solid #7C6F64', color: '#1E293B', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  reportsGridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', marginTop: '15px' },
  reportCardBox: { backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', borderRadius: '10px', padding: '16px' },
  reportDescriptionText: { fontSize: '13px', color: '#1E293B', margin: '12px 0', lineHeight: '1.5' },
  textarea: { width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', color: '#1E293B', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  btnAction: { flex: 1, backgroundColor: 'transparent', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }
};
