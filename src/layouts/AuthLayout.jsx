import { Link } from 'react-router-dom';

export default function AuthLayout({ children }) {
  return (
    <main style={styles.main}>
      {/* Các lớp hiệu ứng nền tạo chiều sâu (Glow Effect) */}
      <div style={styles.gridPattern} aria-hidden="true" />
      <div style={{ ...styles.glow, top: '-160px', left: '-128px', opacity: 0.6 }} aria-hidden="true" />
      <div style={{ ...styles.glow, bottom: '0', right: '0', opacity: 0.4 }} aria-hidden="true" />

      <div style={styles.wrapper}>
        {/* Thanh tiêu đề trên đầu Form */}
        <div style={styles.header}>
          <Link to="/" style={styles.logoLink}>
            <span style={styles.logoBadge}>
              🎓
            </span>
            <span style={{ color: '#1E293B' }}>Tutor</span>
            <span style={styles.logoTextAccent}>Link</span>
          </Link>
          
          <Link to="/" style={styles.backLink}>
            ⬅️ Quay lại
          </Link>
        </div>

        {/* Khung nội dung kính mờ bọc lõi Form (Children) */}
        <section style={styles.cardSection}>
          {children}
        </section>
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// BỘ CSS INLINE LUXURY - ĐỒNG BỘ HIỆU ỨNG KHÔNG GIAN TỐI
// -------------------------------------------------------------
const styles = {
  main: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FAF7F0', // Màu nền Slate-900 cực sang
    padding: '32px 16px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },
  gridPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
    backgroundSize: '24px 24px',
    opacity: 0.6,
  },
  glow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    backgroundColor: '#C05A3E',
    filter: 'blur(120px)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  wrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    zIndex: 2, // Đẩy content lên trên các đốm sáng nền
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  logoLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '22px',
    fontWeight: 'bold',
    textDecoration: 'none',
    letterSpacing: '-0.025em',
  },
  logoBadge: {
    display: 'flex',
    height: '36px',
    width: '36px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #C05A3E 0%, #2ecc71 100%)',
    boxShadow: '0 4px 14px rgba(52, 152, 219, 0.4)',
  },
  logoTextAccent: {
    background: 'linear-gradient(135deg, #C05A3E 0%, #2ecc71 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginLeft: '-2px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5F6B7A',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  cardSection: {
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(30, 41, 59, 0.7)', // Slate-800 kết hợp Opacity
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)', // Kính mờ thời thượng
    WebkitBackdropFilter: 'blur(16px)',
    boxSizing: 'border-box',
  },
};