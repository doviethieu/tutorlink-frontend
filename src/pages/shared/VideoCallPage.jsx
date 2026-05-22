import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export default function VideoCall() {
    // Lấy ID phòng từ thanh địa chỉ URL động
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    // Lấy thông tin người dùng đang đăng nhập hệ thống
    const userString = localStorage.getItem('tutorlinkUser') || localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    const zegoAppId = Number(import.meta.env.VITE_ZEGO_APP_ID || 0);
    const zegoServerSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || '';

    // Định danh người dùng bảo mật cao
    const userEmail = user?.email || user?.user?.email || 'guest_' + Math.floor(Math.random() * 1000);
    const userName = user?.name || user?.user?.name || 'Khách vãng lai';

    // Phòng hộ kịch bản sếp quên hoặc truyền thiếu tham số roomId trên URL
    useEffect(() => {
        if (!roomId) {
            alert("🛑 Mã phòng học trực tuyến (Room ID) không hợp lệ hoặc đã hết hạn!");
            navigate('/dashboard');
        }
    }, [roomId, navigate]);

    const myMeeting = async (element) => {
        if (!element || !roomId) return;

        if (!zegoAppId || !zegoServerSecret) return;
        
        // Khởi tạo Token bảo mật cho lớp học trực tuyến
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            zegoAppId, 
            zegoServerSecret, 
            roomId, 
            userEmail, 
            userName   
        );

        // Khởi tạo thực thể phòng học công nghệ cao
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall, // Thiết lập luồng tối ưu cho cặp học 1-1
            },
            showPreJoinView: false, // Bỏ qua màn hình chờ, nhảy thẳng vào phòng học để tối ưu UX
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true, // Bật tính năng share màn hình phục vụ giảng dạy
            showUserList: true, // Bật danh sách thành viên phòng để dễ quản lý tương tác
            maxUsers: 2, // Khóa phòng học tối đa 2 người (1 gia sư - 1 học viên), chặn người lạ vào phá
            onLeaveRoom: () => {
                // Tự động điều hướng về không gian phòng chat hoặc trang chủ khi kết thúc ca học
                alert("🚪 Ca học trực tuyến đã kết thúc thành công!");
                navigate(-1);
            }
        });
    };

    return (
        <div style={styles.videoContainer}>
            
            {/* Thanh Taskbar nhỏ tối ưu trải nghiệm lớp học */}
            <div style={styles.topControlBar}>
                <div style={styles.roomBadge}>
                    <span style={styles.pulseDot}></span>
                    PHÒNG HỌC REALTIME ĐANG BẬT · ID: <span style={{ color: '#38bdf8', fontWeight: '700' }}>{roomId}</span>
                </div>
                <button onClick={() => navigate(-1)} style={styles.btnExit}>
                    🚪 Rời Phòng Học
                </button>
            </div>

            {/* Không gian render SDK lõi của ZegoCloud */}
            {zegoAppId && zegoServerSecret ? (
                <div ref={myMeeting} style={styles.sdkZone} />
            ) : (
                <div style={styles.missingConfig}>
                    <h2 style={styles.missingTitle}>Chưa cấu hình ZegoCloud</h2>
                    <p style={styles.missingText}>
                        Thêm `VITE_ZEGO_APP_ID` và `VITE_ZEGO_SERVER_SECRET` vào file `.env` của frontend rồi restart Vite để bật video call.
                    </p>
                    <code style={styles.codeBlock}>
                        VITE_ZEGO_APP_ID=your_app_id<br />
                        VITE_ZEGO_SERVER_SECRET=your_server_secret
                    </code>
                </div>
            )}
            
        </div>
    );
}

// --- 🛠️ BỘ KHUNG DESIGN SYSTEM KHÔNG GIAN ĐIỆN TỬ SLATE DARK MODE ---
const styles = {
  videoContainer: { 
    width: '100vw', 
    height: '100vh', 
    backgroundColor: '#0f172a', // Màu Slate Dark chủ đạo của hệ thống
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Khử hoàn toàn thanh cuộn răng cưa của trình duyệt
    fontFamily: "'Inter', sans-serif"
  },
  topControlBar: {
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10
  },
  roomBadge: {
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981', // Emerald Green trạng thái Live
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 8px #10b981'
  },
  btnExit: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: '700',
    transition: 'all 0.15s ease'
  },
  sdkZone: { 
    width: '100%', 
    flex: 1,
    backgroundColor: '#0f172a'
  },
  missingConfig: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#cbd5e1',
    padding: '24px',
    textAlign: 'center'
  },
  missingTitle: {
    margin: '0 0 10px',
    color: '#fff',
    fontSize: '24px'
  },
  missingText: {
    margin: '0 0 18px',
    color: '#94a3b8',
    maxWidth: '560px',
    lineHeight: 1.6
  },
  codeBlock: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    color: '#38bdf8',
    padding: '14px 18px',
    borderRadius: '8px',
    textAlign: 'left'
  }
};
