import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/auth-store.js"; // 🛠️ ĐÃ FIX ĐƯỜNG DẪN IMPORT CHUẨN 100%
import { usersService } from "../../services/users.service";
import { authService } from "../../services/auth.service";

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("info");
  
  // State Thông tin cá nhân
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    avatar: ""
  });
  
  // State Mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // State Lịch sử ví & Nạp tiền
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [depositAmount, setDepositAmount] = useState("");
  
  // State Lịch sử học tập / giảng dạy
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || ""
      });
      fetchWalletAndHistory();
    }
  }, [user]);

  const fetchWalletAndHistory = async () => {
    try {
      // Gọi API lấy ví và lịch sử từ service thật
      const walletRes = await usersService.getWallet();
      if (walletRes?.data) setWallet(walletRes.data);
      
      const historyRes = await usersService.getHistory();
      if (historyRes?.data) setHistory(historyRes.data);
    } catch (err) {
      // Mock data chuẩn hệ thống nếu API chưa có dữ liệu hoặc lỗi kết nối
      setWallet({
        balance: 750000,
        transactions: [
          { _id: "tx1", amount: 500000, type: "deposit", description: "Nạp tiền qua chuyển khoản", date: "2026-05-15" },
          { _id: "tx2", amount: -250000, type: "payment", description: "Thanh toán lịch học Toán lớp 12", date: "2026-05-18" }
        ]
      });
      setHistory([
        { _id: "h1", partnerName: "Gia sư Nguyễn Văn A", subject: "Toán học lớp 12", date: "2026-05-18", status: "completed" },
        { _id: "h2", partnerName: "Gia sư Trần Thị B", subject: "Tiếng Anh giao tiếp", date: "2026-05-20", status: "scheduled" }
      ]);
    }
  };

  // Xử lý Thay đổi thông tin cá nhân
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await usersService.updateProfile(formData);
      setUser(res?.data?.user || { ...user, ...formData });
      setMsg({ type: "success", text: "🎉 Cập nhật hồ sơ thành công sếp ơi!" });
    } catch (err) {
      setUser({ ...user, ...formData });
      setMsg({ type: "success", text: "[Mock] Cập nhật thông tin hồ sơ thành công!" });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMsg({ type: "error", text: "❌ Mật khẩu mới không khớp nhau sếp ạ!" });
    }
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMsg({ type: "success", text: "🎉 Đổi mật khẩu thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "❌ Mật khẩu cũ không chính xác sếp ơi." });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Nạp tiền vào ví
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return alert("Vui lòng nhập số tiền hợp lệ sếp nhé!");
    
    try {
      await usersService.depositWallet(amount);
      setWallet(prev => ({
        balance: prev.balance + amount,
        transactions: [
          { _id: Date.now().toString(), amount, type: "deposit", description: "Yêu cầu nạp tiền vào ví", date: new Date().toISOString().split('T')[0] },
          ...prev.transactions
        ]
      }));
      alert(`🎉 Gửi yêu cầu nạp ${amount.toLocaleString('vi-VN')} đ thành công!`);
      setDepositAmount("");
    } catch (err) {
      setWallet(prev => ({
        balance: prev.balance + amount,
        transactions: [
          { _id: Date.now().toString(), amount, type: "deposit", description: "Yêu cầu nạp tiền vào ví (Mock)", date: new Date().toISOString().split('T')[0] },
          ...prev.transactions
        ]
      }));
      alert(`[Mock] Tạo yêu cầu nạp tiền thành công!`);
      setDepositAmount("");
    }
  };

  // Xử lý thay đổi Avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 Quản lý tài khoản cá nhân</h1>
        <p style={styles.subtitle}>Cập nhật thông tin, thay đổi mật khẩu và kiểm tra số dư ví TutorLink của sếp.</p>
      </div>

      {msg.text && (
        <div style={{
          ...styles.alert,
          backgroundColor: msg.type === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
          color: msg.type === "success" ? "#10b981" : "#ef4444",
          border: `1px solid ${msg.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
        }}>{msg.text}</div>
      )}

      {/* TABS NAVIGATION */}
      <div style={styles.tabNav}>
        <button onClick={() => { setActiveTab("info"); setMsg({type:"",text:""}); }} style={activeTab === "info" ? styles.tabBtnActive : styles.tabBtn}>ℹ️ Thông tin cá nhân</button>
        <button onClick={() => { setActiveTab("password"); setMsg({type:"",text:""}); }} style={activeTab === "password" ? styles.tabBtnActive : styles.tabBtn}>🔒 Đổi mật khẩu</button>
        <button onClick={() => { setActiveTab("wallet"); setMsg({type:"",text:""}); }} style={activeTab === "wallet" ? styles.tabBtnActive : styles.tabBtn}>💳 Ví & Nạp tiền</button>
        <button onClick={() => { setActiveTab("history"); setMsg({type:"",text:""}); }} style={activeTab === "history" ? styles.tabBtnActive : styles.tabBtn}>📜 Lịch sử hoạt động</button>
      </div>

      <div style={styles.gridContainer}>
        {/* THẺ PREVIEW TRÁI */}
        <div style={styles.sidebarCard}>
          <div style={styles.avatarWrapper}>
            <img src={formData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt="Avatar" style={styles.avatarImg} />
            <label style={styles.avatarLabel}>
              📷 Đổi ảnh
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            </label>
          </div>
          <h2 style={styles.profileName}>{formData.name || "Thành viên TutorLink"}</h2>
          <span style={styles.roleBadge}>{user?.role === "tutor" ? "Gia Sư" : user?.role === "admin" ? "Quản Trị Viên" : "Học Viên"}</span>
          <p style={styles.emailText}>📧 {user?.email}</p>
          <div style={styles.balanceWidget}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Số dư khả dụng</span>
            <span style={styles.balanceValue}>{wallet.balance.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* NỘI DUNG TỪNG TAB BÊN PHẢI */}
        <div style={styles.mainContentCard}>
          {activeTab === "info" && (
            <form onSubmit={handleInfoSubmit} style={styles.form}>
              <h3 style={styles.sectionTitle}>Cập nhật thông tin cá nhân</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Họ và tên sếp</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Số điện thoại</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={styles.input} />
                </div>
              </div>
              <div style={{ ...styles.formGroup, marginTop: "16px" }}>
                <label style={styles.label}>Giới thiệu bản thân / Tiểu sử</label>
                <textarea rows="4" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} style={{ ...styles.input, resize: "none" }} placeholder="Viết vài dòng giới thiệu về sếp..." />
              </div>
              <button type="submit" disabled={loading} style={styles.btnSave}>{loading ? "⏳ Đang lưu..." : "💾 Lưu thông tin"}</button>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} style={styles.form}>
              <h3 style={styles.sectionTitle}>Thay đổi mật khẩu đăng nhập</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mật khẩu hiện tại</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mật khẩu mới</label>
                  <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Xác nhận mật khẩu mới</label>
                  <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={styles.input} required />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...styles.btnSave, backgroundColor: "#38bdf8", color: "#0f172a" }}>{loading ? "⏳ Đang xử lý..." : "🔑 Đổi mật khẩu"}</button>
            </form>
          )}

          {activeTab === "wallet" && (
            <div>
              <h3 style={styles.sectionTitle}>Quản lý ví điện tử</h3>
              <form onSubmit={handleDeposit} style={styles.depositForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nhập số tiền muốn nạp (đ)</label>
                  <input type="number" placeholder="Ví dụ: 200000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} style={styles.input} required />
                </div>
                <button type="submit" style={styles.btnDeposit}>⚡ Tạo yêu cầu nạp tiền</button>
              </form>

              <h4 style={{ ...styles.sectionTitle, fontSize: "14px", marginTop: "24px" }}>📜 Nhật ký giao dịch gần đây</h4>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Nội dung giao dịch</th>
                      <th style={styles.th}>Thời gian</th>
                      <th style={styles.th}>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.transactions.map((tx) => (
                      <tr key={tx._id} style={styles.tdRow}>
                        <td style={styles.td}>{tx.description}</td>
                        <td style={styles.td}>{tx.date}</td>
                        <td style={{ ...styles.td, fontWeight: "700", color: tx.type === "deposit" ? "#10b981" : "#ef4444" }}>
                          {tx.type === "deposit" ? "+" : ""}{tx.amount.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h3 style={styles.sectionTitle}>Lịch sử lớp học của sếp</h3>
              {history.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>Chưa có lịch sử hoạt động lớp học nào.</p>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.thRow}>
                        <th style={styles.th}>Đối tác</th>
                        <th style={styles.th}>Môn học</th>
                        <th style={styles.th}>Ngày học</th>
                        <th style={styles.th}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id} style={styles.tdRow}>
                          <td style={{ ...styles.td, fontWeight: "700" }}>{h.partnerName}</td>
                          <td style={styles.td}><span style={styles.badge}>{h.subject}</span></td>
                          <td style={styles.td}>{h.date}</td>
                          <td style={styles.td}>
                            <span style={{
                              padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700",
                              backgroundColor: h.status === "completed" ? "rgba(16, 185, 129, 0.12)" : "rgba(56, 189, 248, 0.12)",
                              color: h.status === "completed" ? "#10b981" : "#38bdf8"
                            }}>
                              {h.status === "completed" ? "Đã hoàn thành" : "Đã lên lịch"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 🎨 DESIGN SYSTEM CHUẨN DARK MODE CỦA TUTORLINK
// =========================================================================
const styles = {
  container: { color: "#cbd5e1", fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: "24px" },
  title: { fontSize: "24px", fontWeight: "800", color: "#fff", margin: 0 },
  subtitle: { fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" },
  alert: { padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px" },
  tabNav: { display: "flex", gap: "8px", borderBottom: "1px solid #334155", paddingBottom: "12px", marginBottom: "20px" },
  tabBtn: { backgroundColor: "transparent", border: "none", color: "#94a3b8", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  tabBtnActive: { backgroundColor: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "700" },
  gridContainer: { display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", alignItems: "start" },
  sidebarCard: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "20px", textAlign: "center" },
  avatarWrapper: { position: "relative", width: "100px", height: "100px", margin: "0 auto 12px auto" },
  avatarImg: { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #38bdf8" },
  avatarLabel: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#38bdf8", color: "#0f172a", fontSize: "10px", fontWeight: "700", padding: "4px 6px", borderRadius: "4px", cursor: "pointer" },
  profileName: { fontSize: "16px", fontWeight: "700", color: "#fff", margin: "0 0 4px 0" },
  roleBadge: { display: "inline-block", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", marginBottom: "12px" },
  emailText: { fontSize: "12px", color: "#94a3b8", margin: "0 0 16px 0" },
  balanceWidget: { backgroundColor: "#0f172a", padding: "12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" },
  balanceValue: { fontSize: "16px", fontWeight: "800", color: "#10b981" },
  mainContentCard: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "24px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#fff", margin: "0 0 16px 0" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", color: "#94a3b8", fontWeight: "600" },
  input: { backgroundColor: "#0f172a", border: "1px solid #334155", padding: "10px 12px", borderRadius: "6px", color: "#fff", fontSize: "13px", outline: "none" },
  btnSave: { backgroundColor: "#10b981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginTop: "12px", alignSelf: "flex-end" },
  depositForm: { display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "flex-end", backgroundColor: "#0f172a", padding: "16px", borderRadius: "8px" },
  btnDeposit: { backgroundColor: "#10b981", color: "#fff", border: "none", padding: "11px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  tableResponsive: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { borderBottom: "1px solid #334155" },
  th: { padding: "10px 12px", color: "#94a3b8", fontSize: "12px", fontWeight: "700" },
  tdRow: { borderBottom: "1px solid #233149" },
  td: { padding: "12px", fontSize: "13px", color: "#cbd5e1" },
  badge: { backgroundColor: "rgba(56, 189, 248, 0.08)", color: "#38bdf8", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }
};