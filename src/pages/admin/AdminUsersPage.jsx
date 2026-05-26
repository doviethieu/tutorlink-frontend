import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';

export default function AdminNguoiDung() {
  const navigate = useNavigate();

  // --- CÁC STATE QUẢN LÝ DỮ LIỆU ---
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  // --- STATE BỘ LỌC & TÌM KIẾM ---
  const [tuKhoa, setTuKhoa] = useState('');
  const [vaiTroTab, setVaiTroTab] = useState('all'); 

  const roleLabels = { student: 'Học sinh', tutor: 'Gia sư', admin: 'Admin' };

  // 1. LẤY DANH SÁCH TỪ DATABASE THẬT
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        if (vaiTroTab === 'waiting_tutor') {
          const tutors = await adminService.tutorQueue({ status: 'pending_review', limit: 50 });
          setUsers(Array.isArray(tutors) ? tutors : []);
        } else {
          const params = { q: tuKhoa };
          if (vaiTroTab !== 'all') params.role = vaiTroTab;
          const rows = await adminService.users(params);
          setUsers(Array.isArray(rows) ? rows : []);
        }
      } catch (err) {
        console.error("❌ Lỗi kéo dữ liệu thật:", err.message);
        // 🛠️ ĐÃ FIX: Xóa sổ Mock Data. Lỗi thì cho list rỗng luôn để dễ debug
        setUsers([]); 
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
        const rows = await adminService.reports({ status: 'open', limit: 50 });
        setReports(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setReports([]); // Xóa sổ Mock data
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  // 3. HÀM XỬ LÝ DUYỆT NHANH TỪ BẢNG TỔNG
  const handleDuyetGiaSu = async (id, action) => {
    if (!window.confirm(`Sếp có chắc chắn muốn ${action === 'pass' ? 'DUYỆT' : 'TỪ CHỐI'} gia sư này không?`)) return;
    try {
      if (action === 'pass') {
        await adminService.approveTutor(id);
      } else {
        await adminService.rejectTutor(id, 'Admin từ chối hồ sơ từ màn hình người dùng');
      }
      
      // Lọc người vừa duyệt ra khỏi danh sách đang chờ
      setUsers(users.filter(u => (u._id || u.id) !== id));
      alert("🎉 Thao tác cập nhật trạng thái vào Database thành công!");
    } catch (err) {
      console.error("Lỗi thao tác duyệt:", err.message);
      alert("❌ Lỗi API duyệt. Sếp kiểm tra lại Backend nhé!");
    }
  };

  // 4. Hàm Khóa / Mở khóa tài khoản thông thường
  const handleToggleLock = async (user) => {
    const currentId = user?._id || user?.id;
    const isLocked = user?.status === 'banned' || user?.status === 'locked';
    try {
      if (isLocked) {
        await adminService.unlockUser(currentId);
      } else {
        await adminService.lockUser(currentId);
      }
      setUsers(users.map(u => (u._id || u.id) === currentId ? { ...u, status: isLocked ? 'active' : 'banned' } : u));
      alert("🎉 Đã thay đổi trạng thái tài khoản thật!");
    } catch (err) {
      alert("❌ Có lỗi xảy ra, không thể thay đổi trạng thái!");
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
                    backgroundColor: vaiTroTab === item.id ? (item.id === 'waiting_tutor' ? '#e67e22' : '#C05A3E') : 'transparent',
                    color: vaiTroTab === item.id ? '#1E293B' : '#5F6B7A'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loadingUsers ? (
            <div style={styles.loadingText}>⏳ Đang đồng bộ dữ liệu MongoDB...</div>
          ) : !users || users.length === 0 ? (
            <p style={styles.emptyText}>Tuyệt vời! Không có hồ sơ nào đang tồn đọng.</p>
          ) : vaiTroTab === 'waiting_tutor' ? (
            
            /* GIAO DIỆN DUYỆT GIA SƯ (MỚI HỢP NHẤT - DARK MODE ĐỒNG BỘ) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {users.map(nguoi => {
                const uid = nguoi?._id || nguoi?.id;
                return (
                  <div key={uid} style={styles.tutorRow}>
                    <div>
                      {/* 🛠️ ĐÃ FIX: Chuyển sang map đúng full_name và contactEmail từ Form đăng ký */}
                      <strong style={{ fontSize: '16px', color: '#1E293B' }}>{nguoi?.full_name || nguoi?.name}</strong>
                      <span style={{ color: '#C05A3E', fontSize: '14px', marginLeft: '10px' }}>⚡ Đăng ký dạy: {nguoi?.subject}</span>
                      <div style={styles.tutorContactBox}>
                        <div>📞 SĐT: <strong>{nguoi?.phone || 'Chưa cập nhật'}</strong></div>
                        <div>📧 Email: <strong>{nguoi?.contactEmail || nguoi?.email}</strong></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/admin/tutors/${uid}`)} style={{ ...styles.btnMini, backgroundColor: '#A94730' }}>👁️ Xem CV</button>
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
                              <div style={{ fontWeight: 'bold', color: '#1E293B' }}>{displayName}</div>
                              <div style={{ fontSize: '12px', color: '#8A7D72' }}>{user?.email}</div>
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
                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#5F6B7A' }}>🎯 Đối tượng: {report?.target}</p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1E293B' }}>{report?.description || report?.body || report?.message || 'Không có nội dung mô tả.'}</p>
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
  container: { backgroundColor: '#FAF7F0', minHeight: '100vh', padding: '35px 4%', fontFamily: 'Arial, sans-serif', color: '#1E293B' },
  topBadge: { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#C05A3E', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  btnBack: { backgroundColor: 'transparent', border: '1px solid #7C6F64', color: '#5F6B7A', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginBottom: '10px' },
  mainTitle: { fontSize: '28px', fontWeight: 'bold', margin: '6px 0', color: '#1E293B' },
  subtitle: { fontSize: '14px', color: '#5F6B7A', margin: 0 },
  gridContainer: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', alignItems: 'start' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '12px', padding: '24px' },
  cardSectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1E293B', marginTop: 0, marginBottom: '15px' },
  toolbar: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' },
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', padding: '0 15px', borderRadius: '8px', height: '44px', color: '#1E293B', gap: '8px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#1E293B', width: '100%', outline: 'none' },
  tabGroup: { display: 'flex', backgroundColor: '#FAF7F0', padding: '4px', borderRadius: '8px', border: '1px solid #E7DED2', alignSelf: 'flex-start', flexWrap: 'wrap', gap: '4px' },
  tabBtn: { border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  loadingText: { textAlign: 'center', color: '#5F6B7A', padding: '20px 0' },
  emptyText: { textAlign: 'center', color: '#5F6B7A', padding: '20px 0', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  thRow: { backgroundColor: '#FAF7F0' },
  th: { padding: '12px 16px', color: '#5F6B7A', fontWeight: 'bold', fontSize: '12px' },
  trRow: { borderBottom: '1px solid #E7DED2' },
  td: { padding: '16px', color: '#1E293B' },
  avatarMock: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#7C6F64', color: '#1E293B', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnLockToggle: { backgroundColor: 'transparent', border: '1px solid', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  reportBox: { backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', borderRadius: '10px', padding: '16px' },
  reportType: { margin: 0, fontSize: '15px', color: '#1E293B', fontWeight: 'bold' },
  severityBadge: { backgroundColor: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  tutorRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF7F0', padding: '16px', borderRadius: '10px', border: '1px solid #E7DED2' },
  tutorContactBox: { marginTop: '8px', fontSize: '13px', color: '#5F6B7A', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #e67e22', display: 'flex', gap: '15px' },
  btnMini: { color: '#FAF7F0', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
};
