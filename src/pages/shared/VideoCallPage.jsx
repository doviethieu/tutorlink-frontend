import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { videoService } from '../../services/video.service';
import { getErrorMessage } from '../../lib/api';

export default function VideoCall() {
    // Lấy ID phòng từ thanh địa chỉ URL động
    const { roomId } = useParams();
    const navigate = useNavigate();
    const meetingRef = useRef(null);
    const zegoRef = useRef(null);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    
    // Lấy thông tin người dùng đang đăng nhập hệ thống
    const userString = localStorage.getItem('tutorlinkUser') || localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    // Định danh người dùng bảo mật cao
    const userName = user?.fullName || user?.name || user?.user?.name || user?.email || 'Khách vãng lai';

    // Phòng hộ kịch bản sếp quên hoặc truyền thiếu tham số roomId trên URL
    useEffect(() => {
        if (!roomId) {
            alert("🛑 Mã phòng học trực tuyến (Room ID) không hợp lệ hoặc đã hết hạn!");
            navigate('/dashboard');
        }
    }, [roomId, navigate]);

    useEffect(() => {
        let alive = true;

        async function joinMeeting() {
            if (!roomId || !meetingRef.current) return;

            try {
                setStatus('loading');
                setError('');

                const { token } = await videoService.createToken(roomId);
                if (!alive) return;

                const zp = ZegoUIKitPrebuilt.create(token);
                zegoRef.current = zp;

                zp.joinRoom({
                    container: meetingRef.current,
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showPreJoinView: false,
                    turnOnMicrophoneWhenJoining: true,
                    turnOnCameraWhenJoining: true,
                    showMyCameraToggleButton: true,
                    showMyMicrophoneToggleButton: true,
                    showAudioVideoSettingsButton: true,
                    showScreenSharingButton: true,
                    showUserList: true,
                    maxUsers: 2,
                    onLeaveRoom: () => {
                        navigate('/chat');
                    }
                });

                setStatus('ready');
            } catch (err) {
                if (!alive) return;
                setStatus('error');
                setError(getErrorMessage(err, 'Không thể khởi tạo phòng học video.'));
            }
        }

        joinMeeting();

        return () => {
            alive = false;
            zegoRef.current?.destroy?.();
            zegoRef.current = null;
        };
    }, [roomId, navigate]);

    const leaveRoom = () => {
        zegoRef.current?.destroy?.();
        zegoRef.current = null;
        navigate('/chat');
    };

    return (
        <div style={styles.videoContainer}>
            
            {/* Thanh Taskbar nhỏ tối ưu trải nghiệm lớp học */}
            <div style={styles.topControlBar}>
                <div style={styles.roomBadge}>
                    <span style={styles.pulseDot}></span>
                    PHÒNG HỌC REALTIME ĐANG BẬT · ID: <span style={{ color: '#C05A3E', fontWeight: '700' }}>{roomId}</span>
                </div>
                <button type="button" onClick={leaveRoom} style={styles.btnExit}>
                    🚪 Rời Phòng Học
                </button>
            </div>

            {status === 'loading' && (
                <div style={styles.missingConfig}>
                    <h2 style={styles.missingTitle}>Đang mở phòng học video</h2>
                    <p style={styles.missingText}>
                        TutorLink đang lấy token ZegoCloud bảo mật từ backend cho {userName}.
                    </p>
                </div>
            )}

            {status === 'error' && (
                <div style={styles.missingConfig}>
                    <h2 style={styles.missingTitle}>Không mở được video call</h2>
                    <p style={styles.missingText}>{error}</p>
                    <button type="button" onClick={leaveRoom} style={styles.btnExit}>
                        Quay lại
                    </button>
                </div>
            )}

            <div ref={meetingRef} style={{ ...styles.sdkZone, display: status === 'error' ? 'none' : 'block' }} />
            
        </div>
    );
}

// --- 🛠️ BỘ KHUNG DESIGN SYSTEM KHÔNG GIAN ĐIỆN TỬ SLATE DARK MODE ---
const styles = {
  videoContainer: { 
    width: '100vw', 
    height: '100vh', 
    backgroundColor: '#FAF7F0', // Màu Slate Dark chủ đạo của hệ thống
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Khử hoàn toàn thanh cuộn răng cưa của trình duyệt
    fontFamily: "'Inter', sans-serif"
  },
  topControlBar: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E7DED2',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10000,
    pointerEvents: 'auto'
  },
  roomBadge: {
    color: '#1E293B',
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
    position: 'relative',
    zIndex: 10001,
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
    backgroundColor: '#FAF7F0'
  },
  missingConfig: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E293B',
    padding: '24px',
    textAlign: 'center'
  },
  missingTitle: {
    margin: '0 0 10px',
    color: '#1E293B',
    fontSize: '24px'
  },
  missingText: {
    margin: '0 0 18px',
    color: '#5F6B7A',
    maxWidth: '560px',
    lineHeight: 1.6
  },
};
