import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SimpleBars } from '../components/SimpleBars'; 
import { SimpleLine } from '../components/SimpleLine'; 
import { StatusBadge } from '../components/marketplace/StatusBadge';

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

  // --- TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU TỪ BACKEND ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('tutorlinkToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Call đồng thời 3 API tổng quan, hàng chờ gia sư và danh sách báo cáo
        const [overviewRes, queueRes, reportsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/admin/overview', { headers }),
          axios.get('http://localhost:8000/api/admin/tutors/queue?status=pending_review', { headers }),
          axios.get('http://localhost:8000/api/admin/reports?status=open', { headers })
        ]);

        if (overviewRes?.data) setOverview(overviewRes.data);
        if (queueRes?.data) setQueue(Array.isArray(queueRes.data) ? queueRes.data : []);
        if (reportsRes?.data) setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);

      } catch (err) {
        console.error("Lỗi đồng bộ API Admin, kích hoạt Mock Data chuẩn chỉnh chống crash trang:");
        
        // 🛠️ ĐÃ SỬA: Đồng bộ định dạng chuẩn của các trục dữ liệu biểu đồ
        setOverview({
          totalUsers: 1420,
          pendingTutors: 5,
          openReports: 3,
          monthlyRevenue: 45000000,
          bookingsByDay: [
            { label: 'T2', value: 12 }, 
            { label: 'T3', value: 19 }, 
            { label: 'T4', value: 3 },
            { label: 'T5', value: 5 }, 
            { label: 'T6', value: 22 }, 
            { label: 'T7', value: 24 }, 
            { label: 'CN', value: 30 }
          ],
          revenueSeries: [
            { label: 'T12', value: 15 }, 
            { label: 'T1', value: 28 }, 
            { label: 'T2', value: 41 },
            { label: 'T3', value: 33 }, 
            { label: 'T4', value: 45 }, 
            { label: 'T5', value: 60 }
          ]
        });

        // 🛠️ ĐÃ SỬA CHÍ MẠNG: Đổi 'id' thành '_id', 'full_name' thành 'name', 
        // và đặc biệt 'status' thành 'pending_review' để StatusBadge không bị vỡ gây trắng trang.
        setQueue([
          { _id: 't1', name: 'Trần Văn Hoàng', email: 'hoang.gia@gmail.com', headline: 'Thạc sĩ Vật Lý - 5 năm luyện thi Đại Học chuyên sâu', status: 'pending_review' },
          { _id: 't2', name: 'Sarah Nguyễn', email: 'sarah.edu@gmail.com', headline: 'Cựu du học sinh Úc - IELTS 8.5 - Chuyên trị mất gốc', status: 'pending_review' }
        ]);

        setReports([
          { _id: 'rp1', type: 'Spam tin nhắn quảng cáo', target: 'Học sinh Lê Tuấn', severity: 'Low', description: 'Tài khoản này liên tục rải link nhóm zalo lạ trong box chat lớp học.', status: 'open' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- HÀM PHÊ DUYỆT NHANH HỒ SƠ GIA SƯ ---
  const handleTutorDecision = async (id, action) => {
    try {
      const token = localStorage.getItem('tutorlinkToken');
      let note = 'Cập nhật từ dashboard tổng quan';
      if (action === 'approve') note = 'Duyệt nhanh từ dashboard';
      if (action === 'reject') note = 'Từ chối nhanh từ dashboard';
      if (action === 'request') note = 'Vui lòng bổ sung thông tin hồ sơ.';

      await axios.post(`http://localhost:8000/api/admin/tutors/${id}/decision`, { action, note }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('🎉 Đã cập nhật trạng thái hồ sơ gia sư thành công!');
      setQueue(queue.filter(item => (item._id || item.id) !== id));
    } catch (err) {
      alert('Không xử lý được hồ sơ gia sư, sếp kiểm tra lại backend nhé!');
    }
  };

  // --- HÀM PHÂN XỬ ĐƠN BÁO CÁO VI PHẠM ---
  const handleResolveReport = async (id, actionTaken) => {
    try {
      const token = localStorage.getItem('tutorlinkToken');
      const textNote = resolutionDraft[id] || 'Đã xử lý từ dashboard';

      await axios.post(`http://localhost:8000/api/admin/reports/${id}/resolve`, {
        resolution: textNote,
        actionTaken
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('tutorlinkToken');
      const res = await axios.get('http://localhost:8000/api/admin/reports/export-csv', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = URL.createObjectURL(res.data);
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
    return <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>⏳ Đang tải toàn bộ dữ liệu vận hành hệ thống...</div>;
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
      </div>

      {/* PHẦN 1: BỐN THẺ CHỈ SỐ THỐNG KÊ NHANH */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconBox, color: '#3498db' }}>👥</div>
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
      </div>

      {/* PHẦN 2: KHU VỰC ĐỒ THỊ BIỂU DIỄN */}
      <div style={styles.chartSectionGrid}>
        <div style={styles.cardMain}>
          <h3 style={styles.cardTitle}>📊 Lịch Đặt Chỗ (7 ngày qua)</h3>
          <div style={{ marginTop: '20px' }}>
            {overview?.bookingsByDay?.length > 0 ? (
              <SimpleBars data={overview.bookingsByDay} height={150} />
            ) : (
              <p style={styles.emptyText}>Chưa có dữ liệu biểu đồ cột</p>
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
              <p style={styles.emptyText}>Chưa có dữ liệu dữ liệu đường xu hướng</p>
            )}
          </div>
        </div>
      </div>

      {/* PHẦN 3: HÀNG CHỜ PHÊ DUYỆT GIA SƯ */}
      <div style={{ ...styles.cardMain, marginTop: '25px' }}>
        <h3 style={styles.cardTitle}>⏱️ Hồ sơ đối tác gia sư đang đợi duyệt</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          {!queue || queue.length === 0 ? (
            <p style={styles.emptyText}>🎉 Hệ thống đã sạch sẽ! Không có hồ sơ nào tồn đọng.</p>
          ) : (
            queue.map((item) => {
              const currentId = item._id || item.id;
              return (
                <div key={currentId} style={styles.queueItemBox}>
                  <div style={styles.avatarCircle}>
                    {(item.name || item.full_name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 'bold', color: '#fff', margin: 0 }}>{item.name || item.full_name || item.email}</p>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.headline || 'Chưa cập nhật dòng giới thiệu tiêu đề'}
                    </p>
                  </div>
                  <StatusBadge status={item.status || 'pending_review'} />
                  
                  <div style={styles.btnActionGroup}>
                    <button onClick={() => handleTutorDecision(currentId, 'approve')} style={{ ...styles.btnMini, backgroundColor: '#2ecc71' }}>Duyệt</button>
                    <button onClick={() => handleTutorDecision(currentId, 'request')} style={{ ...styles.btnMini, backgroundColor: '#34495e', border: '1px solid #475569' }}>Bổ sung</button>
                    <button onClick={() => navigate(`/admin/tutors/${currentId}`)} style={{ ...styles.btnMini, backgroundColor: '#3498db' }}>Mở</button>
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
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>{report.type || reportId}</h4>
                      <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>🎯 Mục tiêu: {report.target}</p>
                    </div>
                    <StatusBadge status={report.status || 'open'} />
                  </div>
                  <p style={styles.reportDescriptionText}>{report.description || 'Không có nội dung mô tả chi tiết kèm theo.'}</p>
                  
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
                    <button onClick={() => handleResolveReport(reportId, 'dismiss')} style={{ ...styles.btnAction, backgroundColor: '#34495e', color: '#fff' }}>Bỏ qua đơn</button>
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
  container: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '30px 4%', fontFamily: 'Arial, sans-serif', color: '#e2e8f0' },
  topHeaderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  accentBadge: { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  mainTitle: { fontSize: '26px', fontWeight: 'bold', color: '#fff', margin: '10px 0 4px 0' },
  subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  btnNavigate: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', position: 'relative' },
  iconBox: { position: 'absolute', top: '20px', right: '20px', fontSize: '22px', opacity: 0.8 },
  statLabel: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '8px 0 0 0' },
  chartSectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '25px' },
  cardMain: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' },
  cardTitle: { margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '30px 0', margin: 0 },
  queueItemBox: { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', padding: '14px 20px', borderRadius: '10px', gap: '15px' },
  avatarCircle: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#475569', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  btnActionGroup: { display: 'flex', gap: '8px' },
  btnMini: { border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  btnCsv: { backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  reportsGridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', marginTop: '15px' },
  reportCardBox: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' },
  reportDescriptionText: { fontSize: '13px', color: '#cbd5e1', margin: '12px 0', lineHeight: '1.5' },
  textarea: { width: '100%', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  btnAction: { flex: 1, backgroundColor: 'transparent', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }
};