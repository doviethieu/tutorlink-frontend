import React from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export default function VideoCall() {
    // Lấy ID phòng từ thanh địa chỉ URL
    const { roomId } = useParams();
    
    // Lấy thông tin người dùng đang đăng nhập
    const userString = localStorage.getItem('tutorlinkUser');
    const user = userString ? JSON.parse(userString) : { name: 'Khách', email: 'khach' + Date.now() };

    const myMeeting = async (element) => {
        // MÃ API CỦA SẾP ĐÃ ĐƯỢC LẮP VÀO ĐÂY
        const appID = 1514632629; 
        const serverSecret = "6d02d5b6d007a51a65f014cda28176bc";
        
        // Tạo thẻ vào phòng
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomId, 
            user.email, // ID định danh
            user.name   // Tên hiển thị trong phòng video
        );

        // Khởi tạo và thiết lập phòng học 1-1
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall, 
            },
            showPreJoinView: false, // Bỏ qua bước test camera ở ngoài, vào thẳng luôn
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true, // BẬT TÍNH NĂNG CHIA SẺ MÀN HÌNH LUÔN CHO XỊN
        });
    };

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1c1f2e' }}>
            {/* Đây là vùng không gian mà ZegoCloud sẽ vẽ giao diện Video Call vào */}
            <div ref={myMeeting} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}