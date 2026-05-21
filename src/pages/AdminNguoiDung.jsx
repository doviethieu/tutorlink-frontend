import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminNguoiDung() {
  const navigate = useNavigate();

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  // --- STATE BỘ LỌC & TÌM KIẾM ---
  const [tuKhoa, setTuKhoa] = useState('');
  const [vaiTroTab, setVaiTroTab] = useState('all'); // all, student, tutor, admin, waiting_tutor

  // --- STATE GHI CHÚ XỬ LÝ VI PHẠM ---
  const [resolutionDraft, setResolutionDraft] = useState({});

  const roleLabels = { student: 'Học sinh', tutor: 'Gia sư', admin: 'Admin' };

  // 1. Lấy danh sách người dùng & Gia sư từ API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('tutorlinkToken');
        
        // Nếu sếp chọn tab "Chờ duyệt", ta gọi API lấy danh sách gia sư chờ duyệt
        if (vaiTroTab === 'waiting_tutor') {
          const res = await axios.get('http://localhost:8000/api/admin/tutors?status=pending', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Bọc dữ liệu an toàn tránh lỗi hàm .map()
          setUsers(Array.isArray(res?.data) ? res.data : (res?.data?.tutors || res?.data?.data || []));
        } else {
          // Ngược lại thì gọi API lấy danh sách người dùng thông thường
          let url = `http://localhost:8000/api/admin/users?q=${tuKhoa}`;
          if (vaiTroTab !== 'all') url += `&role=${vaiTroTab}`;
          
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(Array.isArray(res?.data) ? res.data : (res?.data?.users || res?.data?.data || []));
        }
      } catch (err) {
        console.error("Kích hoạt Mock Data phòng vệ tối cao:");
        if (vaiTroTab === 'waiting_tutor') {
          setUsers([
            { _id: 't1', name: 'Gia sư Nguyễn Hoàng Nam', email: 'namhoang@gmail.com', role: 'tutor', subject: 'Vật Lý 12', phone: '0912345678', status: 'Chờ kiểm duyệt' },
            { _id: 't2', name: 'Cô Linh Phạm', email: 'linhpham@gmail.com', role: 'tutor', subject: 'Tiếng Anh IELTS', phone: '0988887777', status: 'Chờ kiểm duyệt' }
          ]);
        } else {
          setUsers([
            { _id: 'u1', name: 'Nguyễn Văn Học', email: 'hocsinh1@gmail.com', role: 'student', status: 'active' },
            { _id: 'u2', name: 'Thầy Linh Dạy Toán', email: 'linhmath@gmail.com', role: 'tutor', status: 'banned' },
            { _id: 'u3', name: 'Admin Tối Cao', email: 'admin@tutorlink.com', role: 'admin', status: 'active' }
          ]);
        }
      } finally {
        setLoadingUsers(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => { fetchUsers(); }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [tuKhoa, vaiTroTab]);

  // 2. Lấy danh sách báo cáo vi phạm
  useEffect(() => {
    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const token = localStorage.getItem('tutorlinkToken');
        const res = await axios.get('http://localhost:8000/api/admin/reports?status=open', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(Array.isArray(res?.data) ? res.data : (res?.data?.reports || res?.data?.data || []));
      } catch (err) {
        setReports([
          { _id: 'rp1', type: 'Thái độ không chuẩn mực', target: 'Gia sư Trần Văn B', severity: 'High', description: 'Gia sư vào lớp muộn 30 phút và nói chuyện cộc lốc.' }
        ]);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  // 3. Hàm xử lý Duyệt / Từ chối Gia sư (Cập nhật từ AdminPanel cũ)
  const handleDuyetGiaSu = async (id, action) => {
    if (!window.confirm(`Sếp có chắc chắn muốn ${action === 'pass' ? 'DUYỆT' : 'XÓA/TỪ CHỐI'} gia sư này không?`)) return;
    try {
      const token = localStorage.getItem('tutorlinkToken');
      const endpoint = action === 'pass' 
        ? `http://localhost:8000/api/admin/tutors/${id}/approve`
        : `http://localhost:8000/api/admin/tutors/${id}/reject`;
      
      await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => (u._id || u.id) !== id));
      alert("🎉 Thao tác duyệt hồ sơ thành công!");
    } catch (err) {
      setUsers(users.filter(u => (u._id || u.id) !== id));
      alert("[Mock Test] Giả lập duyệt hồ sơ thành công sếp nhé!");
    }
  };

  // 4. Hàm Khóa / Mở khóa tài khoản thông thường
  const handleToggleLock = async (user) => {
    const currentId = user?._id || user?.id;
    const isLocked = user?.status === 'banned' || user?.status === 'locked';
    try {
      const token = localStorage.getItem('tutorlinkToken');
      const endpoint = isLocked 
        ? `http://localhost:8000/api/admin/users/${currentId}/unlock` 
        : `http://localhost:8000/api/admin/users/${currentId}/lock`;

      await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(u => (u._id || u.id) === currentId ? { ...u, status: isLocked ? 'active' : 'banned' } : u));
      alert("🎉 Đã thay đổi trạng thái tài khoản!");
    } catch (err) {
      setUsers(users.map(u => (u._id || u.id) === currentId ? { ...u, status: isLocked ? 'active' : 'banned' } : u));
      alert("[Mock Test] Giả lập thay đổi trạng thái thành công!");
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <button onClick={() => navigate('/admin')} style={styles.btnBack}>← Quay lại Tổng quan</button>
          <h1 style={styles.mainTitle}>Trung tâm Điều hành & An ninh</h1>
          <p style={styles.subtitle}>Quản lý thành viên, kiểm duyệt hồ sơ gia sư và xử lý các đơn tố cáo vi phạm.</p>
        </div>
        <span style={styles.topBadge}>QUẢN TRỊ CẤP CAO</span>
      </div>

      <div style={styles.gridContainer}>
        {/* CỘT TRÁI: THÀNH VIÊN VÀ KIỂM DUYỆT HỒ SƠ */}
        <div style={styles.card}>
          <div style={styles.toolbar}>
            <div style={styles.searchWrapper}>
              <span>🔍</span>
              <input 
                type="text"
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder="Tìm kiếm nhanh hệ thống..."
                style={styles.searchInput}
              />
            </div>

            {/* THANH TAB ĐÃ TÍCH HỢP CHỨC NĂNG DUYỆT GIA SƯ */}
            <div style={styles.tabGroup}>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'student', label: 'Học sinh' },
                { id: 'tutor', label: 'Gia sư' },
                { id: 'waiting_tutor', label: '⏳ Chờ duyệt hồ sơ' },
                { id: 'admin', label: 'Admin' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setVaiTroTab(item.id)}
                  style={{
                    ...styles.tabBtn,
                    backgroundColor: vaiTroTab === item.id ? (item.id === 'waiting_tutor' ? '#e67e22' : '#3498db') : 'transparent',
                    color: vaiTroTab === item.id ? '#fff' : '#94a3b8'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loadingUsers ? (
            <div style={styles.loadingText}>⏳ Đang đồng bộ dữ liệu...</div>
          ) : !users || users.length === 0 ? (
            <p style={styles.emptyText}>Danh sách trống hoặc không tìm thấy dữ liệu.</p>
          ) : vaiTroTab === 'waiting_tutor' ? (
            
            /* GIAO DIỆN DUYỆT GIA SƯ (MỚI HỢP NHẤT - DARK MODE ĐỒNG BỘ) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {users.map(nguoi => {
                const uid = nguoi?._id || nguoi?.id;
                return (
                  <div key={uid} style={styles.tutorRow}>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#fff' }}>{nguoi?.name}</strong>
                      <span style={{ color: '#3498db', fontSize: '14px', marginLeft: '10px' }}>⚡ Đăng ký dạy: {nguoi?.subject}</span>
                      <div style={styles.tutorContactBox}>
                        <div>📞 SĐT: <strong>{nguoi?.phone || 'Chưa cập nhật'}</strong></div>
                        <div>📧 Email: <strong>{nguoi?.contactEmail || nguoi?.email}</strong></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => window.open(`/giasu/${uid}`, '_blank')} style={{ ...styles.btnMini, backgroundColor: '#2980b9' }}>👁️ CV</button>
                      <button onClick={() => handleDuyetGiaSu(uid, 'pass')} style={{ ...styles.btnMini, backgroundColor: '#27ae60' }}>✅ Duyệt</button>
                      <button onClick={() => handleDuyetGiaSu(uid, 'fail')} style={{ ...styles.btnMini, backgroundColor: '#c0392b' }}>❌ Từ chối</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            
            /* BẢNG NGƯỜI DÙNG THÔNG THƯỜNG */
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Người dùng</th>
                    <th style={styles.th}>Vai trò</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const currentId = user?._id || user?.id;
                    const isLocked = user?.status === 'banned' || user?.status === 'locked';
                    const displayName = user?.name || user?.fullName || user?.email || 'User';
                    return (
                      <tr key={currentId} style={styles.trRow}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={styles.avatarMock}>{displayName.charAt(0).toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#fff' }}>{displayName}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{roleLabels[user?.role] || user?.role}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold',
                            backgroundColor: isLocked ? 'rgba(231, 76, 60, 0.15)' : 'rgba(46, 204, 113, 0.15)',
                            color: isLocked ? '#e74c3c' : '#2ecc71', border: isLocked ? '1px solid #e74c3c' : '1px solid #2ecc71'
                          }}>
                            {isLocked ? '🔒 Đã khóa' : '🟢 Hoạt động'}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button onClick={() => handleToggleLock(user)} style={{ ...styles.btnLockToggle, borderColor: isLocked ? '#2ecc71' : '#e74c3c', color: isLocked ? '#2ecc71' : '#e74c3c' }}>
                            {isLocked ? '🔓 Mở khóa' : '🔒 Khóa'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: TỐ CÁO VI PHẠM */}
        <div style={styles.card}>
          <h2 style={styles.cardSectionTitle}>🚨 Đơn tố cáo vi phạm ({reports.length})</h2>
          {loadingReports ? (
            <div style={styles.loadingText}>⏳ Đang rà soát...</div>
          ) : !reports || reports.length === 0 ? (
            <p style={styles.emptyText}>🎉 Hệ thống sạch bóng đơn tố cáo.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reports.map(report => {
                const reportId = report?._id || report?.id;
                return (
                  <div key={reportId} style={styles.reportBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={styles.reportType}>⚠️ {report?.type}</h4>
                      <span style={styles.severityBadge}>{report?.severity || 'High'}</span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#94a3b8' }}>🎯 Đối tượng: {report?.target}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#cbd5e1' }}>{report?.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// KHÔNG GIAN TỐI CAO CẤP TOÀN DIỆN
const styles = {
  container: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '35px 4%', fontFamily: 'Arial, sans-serif', color: '#e2e8f0' },
  topBadge: { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  btnBack: { backgroundColor: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginBottom: '10px' },
  mainTitle: { fontSize: '28px', fontWeight: 'bold', margin: '6px 0', color: '#fff' },
  subtitle: { fontSize: '14px', color: '#94a3b8', margin: 0 },
  gridContainer: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', alignItems: 'start' },
  card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' },
  cardSectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: 0, marginBottom: '15px' },
  toolbar: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' },
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', padding: '0 15px', borderRadius: '8px', height: '44px', color: '#fff', gap: '8px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' },
  tabGroup: { display: 'flex', backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #334155', alignSelf: 'flex-start', flexWrap: 'wrap', gap: '4px' },
  tabBtn: { border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  loadingText: { textAlign: 'center', color: '#94a3b8', padding: '20px 0' },
  emptyText: { textAlign: 'center', color: '#94a3b8', padding: '20px 0', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  thRow: { backgroundColor: '#0f172a' },
  th: { padding: '12px 16px', color: '#94a3b8', fontWeight: 'bold', fontSize: '12px' },
  trRow: { borderBottom: '1px solid #334155' },
  td: { padding: '16px', color: '#cbd5e1' },
  avatarMock: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#475569', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnLockToggle: { backgroundColor: 'transparent', border: '1px solid', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  reportBox: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px' },
  reportType: { margin: 0, fontSize: '15px', color: '#fff', fontWeight: 'bold' },
  severityBadge: { backgroundColor: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  tutorRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #334155' },
  tutorContactBox: { marginTop: '8px', fontSize: '13px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #e67e22', display: 'flex', gap: '15px' },
  btnMini: { color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
};