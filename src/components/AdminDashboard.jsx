import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = ({ allTutors = [], handleDuyet, handleXoa }) => {
    const navigate = useNavigate();

    // 1. STATE THỐNG KÊ HỆ THỐNG
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTutors: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0
    });

    // 2. FETCH DATA THỐNG KÊ GỐC
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('tutorlinkToken');
                const res = await axios.get('http://localhost:8000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            }
        };
        fetchStats();
    }, []);

    // 3. LOGIC LỌC GIA SƯ THEO TRẠNG THÁI
    const giaSuChoDuyet = allTutors.filter(nguoi => nguoi.status !== 'Đã duyệt' && nguoi.status !== 'approved');
    const giaSuDaLenSong = allTutors.filter(nguoi => nguoi.status === 'Đã duyệt' || nguoi.status === 'approved');

    return (
        <div style={styles.container}>
            {/* TIÊU ĐỀ & NÚT ĐIỀU HƯỚNG NHANH */}
            <div style={styles.topHeader}>
                <div>
                    <h2 style={styles.mainTitle}>👑 TỔNG QUAN HỆ THỐNG QUẢN TRỊ</h2>
                    <p style={styles.subtitle}>Số liệu thống kê tự động theo thời gian thực và quản lý phê duyệt đối tác.</p>
                </div>
                {/* 🔥 NÚT CHUYỂN SANG TRANG NGƯỜI DÙNG & TỐ CÁO MỚI TÍCH HỢP */}
                <button 
                    onClick={() => navigate('/admin/users')} 
                    style={styles.btnNavigateUsers}
                >
                    🚨 Quản Lý Thành Viên & Khiếu Nại
                </button>
            </div>
            
            {/* ========================================================= */}
            {/* KHU VỰC 1: BỐN THẺ THỐNG KÊ CHỈ SỐ LỚN (STATS) */}
            {/* ========================================================= */}
            <div style={styles.statsGrid}>
                {/* Thẻ 1: Tổng Học viên */}
                <div style={{ ...styles.statsCard, borderLeft: '4px solid #3498db' }}>
                    <h3 style={styles.statsLabel}>Tổng Học Viên</h3>
                    <p style={styles.statsNumber}>{stats.totalStudents}</p>
                </div>

                {/* Thẻ 2: Tổng Gia sư */}
                <div style={{ ...styles.statsCard, borderLeft: '4px solid #2ecc71' }}>
                    <h3 style={styles.statsLabel}>Tổng Gia Sư</h3>
                    <p style={styles.statsNumber}>{stats.totalTutors}</p>
                </div>

                {/* Thẻ 3: Đơn đặt lịch */}
                <div style={{ ...styles.statsCard, borderLeft: '4px solid #f1c40f' }}>
                    <h3 style={styles.statsLabel}>Đơn Đặt Lịch</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                        <p style={styles.statsNumber}>{stats.totalBookings}</p>
                        <p style={styles.statsHint}>({stats.pendingBookings} chờ duyệt)</p>
                    </div>
                </div>

                {/* Thẻ 4: Doanh thu */}
                <div style={{ ...styles.statsCard, borderLeft: '4px solid #e74c3c' }}>
                    <h3 style={styles.statsLabel}>Tổng Doanh Thu</h3>
                    <p style={{ ...styles.statsNumber, color: '#e74c3c' }}>
                        {stats.totalRevenue.toLocaleString('vi-VN')} đ
                    </p>
                </div>
            </div>

            <hr style={styles.divider} />

            {/* ========================================================= */}
            {/* KHU VỰC 2: QUẢN LÝ PHÊ DUYỆT HỒ SƠ GIA SƯ */}
            {/* ========================================================= */}
            <div style={styles.managementSection}>
                
                {/* DANH SÁCH CHỜ PHÊ DUYỆT */}
                <h3 style={styles.sectionTitlePending}>⏳ Hồ sơ đang chờ phê duyệt ({giaSuChoDuyet.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px', marginTop: '15px' }}>
                    {giaSuChoDuyet.length === 0 ? (
                        <div style={styles.emptyBox}>🎉 Tuyệt vời! Hiện tại không có hồ sơ gia sư nào tồn đọng chờ duyệt.</div>
                    ) : (
                        giaSuChoDuyet.map(nguoi => (
                            <div key={nguoi._id} style={styles.cardPending}>
                                <div style={{ textAlign: 'left' }}>
                                    <strong style={styles.tutorName}>{nguoi.name}</strong> 
                                    <span style={styles.tutorSubject}> — Dạy môn: {nguoi.subject || 'Chưa cập nhật'}</span>
                                    
                                    <div style={styles.contactBox}>
                                        <div style={{ marginBottom: '4px' }}>📞 SĐT: <strong>{nguoi.phone || 'Chưa có'}</strong></div>
                                        <div>📧 Email: <strong>{nguoi.contactEmail || nguoi.email}</strong></div>
                                    </div>
                                </div>

                                <div style={styles.btnGroupVertical}>
                                    <button onClick={() => navigate(`/admin/tutors/${nguoi._id}`)} style={styles.btnDetails}>
                                        👁️ Xem chi tiết & Duyệt
                                    </button>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleDuyet(nguoi._id)} style={styles.btnApprove}>Duyệt nhanh</button>
                                        <button onClick={() => handleXoa(nguoi._id)} style={styles.btnReject}>Từ chối</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* DANH SÁCH ĐÃ LÊN SÓNG */}
                <h3 style={styles.sectionTitleActive}>🚀 Gia sư đã kích hoạt lên sóng ({giaSuDaLenSong.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                    {giaSuDaLenSong.length === 0 ? (
                        <div style={styles.emptyBox}>Chưa có gia sư nào được cấp quyền hiển thị công khai.</div>
                    ) : (
                        giaSuDaLenSong.map(nguoi => (
                            <div key={nguoi._id} style={styles.cardActive}>
                                <div style={{ textAlign: 'left' }}>
                                    <strong style={{ fontSize: '16px', color: '#fff' }}>{nguoi.name}</strong> 
                                    <span style={{ color: '#a7f3d0', fontSize: '14px' }}> — {nguoi.subject}</span>
                                    <div style={styles.contactTextMini}>
                                        📞 {nguoi.phone || 'N/A'}  |  ✉️ {nguoi.contactEmail || nguoi.email}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => navigate(`/admin/tutors/${nguoi._id}`)} style={styles.btnCheckMini}>
                                        🔍 Xem hồ sơ
                                    </button>
                                    <button onClick={() => handleXoa(nguoi._id)} style={styles.btnDeleteMini}>Hạ sóng</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

// -------------------------------------------------------------
// BỘ STYLE CSS INLINE TOÀN DIỆN
// -------------------------------------------------------------
const styles = {
    container: {
        backgroundColor: '#0f172a',
        padding: '35px 4%',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        color: '#e2e8f0'
    },
    topHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '30px'
    },
    mainTitle: {
        color: '#fff',
        fontSize: '30px',
        fontWeight: 'bold',
        margin: 0,
        letterSpacing: '-0.025em'
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '14px',
        margin: '6px 0 0 0'
    },
    btnNavigateUsers: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
        transition: 'background-color 0.2s'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '35px'
    },
    statsCard: {
        backgroundColor: '#1e293b',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)'
    },
    statsLabel: {
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0
    },
    statsNumber: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#fff',
        margin: '10px 0 0 0'
    },
    statsHint: {
        fontSize: '13px',
        color: '#f59e0b',
        fontWeight: '500',
        marginBottom: '6px'
    },
    divider: {
        border: '0',
        height: '1px',
        backgroundColor: '#334155',
        margin: '40px 0'
    },
    sectionTitlePending: {
        color: '#f59e0b',
        fontSize: '19px',
        fontWeight: 'bold',
        margin: 0
    },
    sectionTitleActive: {
        color: '#10b981',
        fontSize: '19px',
        fontWeight: 'bold',
        margin: 0
    },
    emptyBox: {
        backgroundColor: '#1e293b',
        color: '#94a3b8',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        fontSize: '14px',
        border: '1px dashed #334155'
    },
    cardPending: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid #334155'
    },
    cardActive: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        padding: '16px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(16, 185, 129, 0.2)'
    },
    tutorName: {
        fontSize: '19px',
        color: '#fff'
    },
    tutorSubject: {
        color: '#94a3b8',
        fontSize: '15px'
    },
    contactBox: {
        marginTop: '10px',
        fontSize: '13px',
        color: '#cbd5e1',
        backgroundColor: '#0f172a',
        padding: '10px 14px',
        borderRadius: '6px',
        borderLeft: '3px solid #f59e0b',
        display: 'inline-block'
    },
    contactTextMini: {
        marginTop: '4px',
        fontSize: '13px',
        color: '#94a3b8'
    },
    btnGroupVertical: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '210px'
    },
    btnDetails: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px'
    },
    btnApprove: {
        flex: 1,
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        padding: '8px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px'
    },
    btnReject: {
        backgroundColor: 'transparent',
        color: '#ef4444',
        border: '1px solid #ef4444',
        padding: '7px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px'
    },
    btnCheckMini: {
        backgroundColor: '#475569',
        color: 'white',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    },
    btnDeleteMini: {
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    }
};

export default AdminDashboard;