import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';

const statusLabels = {
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  paid: 'Đã chi',
  rejected: 'Từ chối',
  succeeded: 'Thành công',
  refunded: 'Đã hoàn',
  held: 'Đang giữ',
  released: 'Đã giải ngân',
};

function money(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

export default function AdminFinancePage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');

  const totals = useMemo(() => ({
    escrowHeld: payments
      .filter((payment) => payment.type === 'charge' && payment.status === 'succeeded' && payment.escrowStatus === 'held')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    pendingPayout: payouts
      .filter((payout) => payout.status === 'pending')
      .reduce((sum, payout) => sum + Number(payout.amount || 0), 0),
    paidPayout: payouts
      .filter((payout) => payout.status === 'paid')
      .reduce((sum, payout) => sum + Number(payout.amount || 0), 0),
  }), [payments, payouts]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentRes, payoutRes, configRes] = await Promise.all([
        adminService.payments({ limit: 50 }),
        adminService.payouts({ limit: 50 }),
        adminService.systemConfigs(),
      ]);
      setPayments(Array.isArray(paymentRes) ? paymentRes : []);
      setPayouts(Array.isArray(payoutRes) ? payoutRes : []);
      setConfigs(Array.isArray(configRes) ? configRes : []);
    } catch (error) {
      alert(error?.message || 'Không thể tải dữ liệu tài chính admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayoutStatus = async (id, status) => {
    const adminNote = status === 'rejected' ? window.prompt('Lý do từ chối?') || '' : '';
    if (!window.confirm(`Xác nhận chuyển payout sang trạng thái ${status}?`)) return;

    const updated = await adminService.updatePayout(id, { status, adminNote });
    setPayouts((prev) => prev.map((payout) => payout._id === id ? updated : payout));
  };

  const handleConfigChange = (key, value) => {
    setConfigs((prev) => prev.map((config) => config.key === key ? { ...config, value } : config));
  };

  const handleSaveConfig = async (config) => {
    setSavingKey(config.key);
    try {
      const value = Number(config.value);
      const updated = await adminService.updateSystemConfig(config.key, {
        value: Number.isFinite(value) ? value : config.value,
        description: config.description,
      });
      setConfigs((prev) => prev.map((item) => item.key === config.key ? updated : item));
    } finally {
      setSavingKey('');
    }
  };

  if (loading) {
    return <div style={styles.container}>Đang tải dữ liệu tài chính...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <span style={styles.badge}>Tài chính hệ thống</span>
          <h1 style={styles.title}>Escrow, payout và cấu hình tự động</h1>
          <p style={styles.subtitle}>Theo dõi dòng tiền thanh toán, duyệt rút tiền và chỉnh cron policy.</p>
        </div>
        <button onClick={() => navigate('/admin')} style={styles.secondaryBtn}>Quay lại tổng quan</button>
      </div>

      <div style={styles.metrics}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Escrow đang giữ</span>
          <strong style={styles.metricValue}>{money(totals.escrowHeld)}</strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Payout chờ duyệt</span>
          <strong style={styles.metricValue}>{money(totals.pendingPayout)}</strong>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Đã giải ngân</span>
          <strong style={styles.metricValue}>{money(totals.paidPayout)}</strong>
        </div>
      </div>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Yêu cầu rút tiền</h2>
        <div style={styles.table}>
          {payouts.length === 0 ? (
            <p style={styles.empty}>Chưa có yêu cầu rút tiền.</p>
          ) : payouts.map((payout) => (
            <div key={payout._id} style={styles.row}>
              <div>
                <strong>{payout.tutorUserId?.fullName || payout.tutorId?.fullName || payout.tutorId?.full_name || 'Gia sư'}</strong>
                <p style={styles.muted}>{new Date(payout.createdAt || payout.requestedAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>{money(payout.amount)}</div>
              <div style={styles.status}>{statusLabels[payout.status] || payout.status}</div>
              <div style={styles.actions}>
                {payout.status === 'pending' && (
                  <>
                    <button onClick={() => handlePayoutStatus(payout._id, 'approved')} style={styles.primaryBtn}>Duyệt</button>
                    <button onClick={() => handlePayoutStatus(payout._id, 'rejected')} style={styles.dangerBtn}>Từ chối</button>
                  </>
                )}
                {payout.status === 'approved' && (
                  <button onClick={() => handlePayoutStatus(payout._id, 'paid')} style={styles.primaryBtn}>Đánh dấu đã chi</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Giao dịch gần đây</h2>
        <div style={styles.table}>
          {payments.length === 0 ? (
            <p style={styles.empty}>Chưa có giao dịch thanh toán.</p>
          ) : payments.slice(0, 12).map((payment) => (
            <div key={payment._id} style={styles.row}>
              <div>
                <strong>{payment.bookingId?.subject || payment.transactionRef || payment._id}</strong>
                <p style={styles.muted}>{payment.gateway} • {payment.type}</p>
              </div>
              <div>{money(payment.amount)}</div>
              <div style={styles.status}>{statusLabels[payment.status] || payment.status}</div>
              <div style={styles.status}>{statusLabels[payment.escrowStatus] || payment.escrowStatus}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Cấu hình cron policy</h2>
        <div style={styles.configGrid}>
          {configs.map((config) => (
            <div key={config.key} style={styles.configItem}>
              <label style={styles.label}>{config.key}</label>
              <input
                value={config.value}
                onChange={(event) => handleConfigChange(config.key, event.target.value)}
                style={styles.input}
              />
              <p style={styles.muted}>{config.description}</p>
              <button onClick={() => handleSaveConfig(config)} disabled={savingKey === config.key} style={styles.primaryBtn}>
                {savingKey === config.key ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#FAF7F0', minHeight: '100vh', padding: '30px 4%', color: '#1E293B', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '12px', padding: '24px', marginBottom: '22px', flexWrap: 'wrap' },
  badge: { color: '#C05A3E', backgroundColor: 'rgba(56,189,248,0.12)', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' },
  title: { margin: '12px 0 6px', color: '#1E293B', fontSize: '26px' },
  subtitle: { margin: 0, color: '#5F6B7A', fontSize: '14px' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' },
  metricCard: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '10px', padding: '18px' },
  metricLabel: { display: 'block', color: '#5F6B7A', fontSize: '13px', marginBottom: '8px' },
  metricValue: { color: '#1E293B', fontSize: '24px' },
  card: { backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', borderRadius: '12px', padding: '22px', marginBottom: '22px' },
  sectionTitle: { margin: '0 0 16px', fontSize: '17px', color: '#1E293B' },
  table: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'grid', gridTemplateColumns: 'minmax(220px, 1.5fr) 140px 130px minmax(160px, auto)', gap: '12px', alignItems: 'center', backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', borderRadius: '8px', padding: '12px 14px' },
  muted: { margin: '4px 0 0', color: '#5F6B7A', fontSize: '12px' },
  status: { color: '#1E293B', fontSize: '13px', fontWeight: 700 },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  primaryBtn: { backgroundColor: '#C05A3E', color: '#FAF7F0', border: 'none', borderRadius: '7px', padding: '8px 12px', fontWeight: 700, cursor: 'pointer' },
  dangerBtn: { backgroundColor: '#ef4444', color: '#FAF7F0', border: 'none', borderRadius: '7px', padding: '8px 12px', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { backgroundColor: 'transparent', color: '#1E293B', border: '1px solid #7C6F64', borderRadius: '7px', padding: '9px 14px', fontWeight: 700, cursor: 'pointer' },
  empty: { color: '#5F6B7A', textAlign: 'center', margin: 0, padding: '20px' },
  configGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  configItem: { backgroundColor: '#FAF7F0', border: '1px solid #E7DED2', borderRadius: '8px', padding: '16px' },
  label: { display: 'block', color: '#1E293B', fontWeight: 700, fontSize: '13px', marginBottom: '8px' },
  input: { width: '100%', boxSizing: 'border-box', backgroundColor: '#FFFFFF', border: '1px solid #E7DED2', color: '#1E293B', borderRadius: '7px', padding: '10px 12px' },
};
