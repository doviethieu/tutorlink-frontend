import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Trash2 } from 'lucide-react';
import { favoriteService } from '../../services/favorite.service';
import { getErrorMessage } from '../../lib/api';

function getTutor(item) {
  return item?.tutor || item?.tutorId || item;
}

function getTutorId(tutor) {
  return tutor?._id || tutor?.id;
}

export default function GiaSuYeuThich() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState('');

  useEffect(() => {
    let alive = true;

    async function loadFavorites() {
      setLoading(true);
      setError('');

      try {
        const data = await favoriteService.list();
        const items = Array.isArray(data) ? data : data?.items || data?.favorites || [];
        if (alive) setFavorites(items);
      } catch (err) {
        if (alive) setError(getErrorMessage(err, 'Không tải được danh sách gia sư yêu thích.'));
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      alive = false;
    };
  }, []);

  async function handleRemove(tutorId) {
    if (!tutorId) return;

    try {
      setRemovingId(tutorId);
      await favoriteService.remove(tutorId);
      setFavorites((current) => current.filter((item) => getTutorId(getTutor(item)) !== tutorId));
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể xoá gia sư khỏi danh sách yêu thích.'));
    } finally {
      setRemovingId('');
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <span style={styles.badge}><Heart size={15} fill="#C05A3E" /> Học viên</span>
          <h1 style={styles.title}>Gia sư yêu thích</h1>
          <p style={styles.subtitle}>Lưu lại các hồ sơ phù hợp để đặt lịch nhanh hơn trong lần sau.</p>
        </div>
        <Link to="/tutors" style={styles.primaryLink}>Tìm thêm gia sư</Link>
      </section>

      {loading && <div style={styles.stateBox}>Đang tải danh sách yêu thích...</div>}
      {!loading && error && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && favorites.length === 0 && (
        <div style={styles.emptyBox}>
          <h2 style={styles.emptyTitle}>Chưa có gia sư yêu thích</h2>
          <p style={styles.emptyText}>Bạn có thể bấm lưu yêu thích trong trang hồ sơ gia sư.</p>
          <Link to="/tutors" style={styles.primaryLink}>Xem danh sách gia sư</Link>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && (
        <section style={styles.grid}>
          {favorites.map((item, index) => {
            const tutor = getTutor(item);
            const tutorId = getTutorId(tutor);
            const rating = Number(tutor?.averageRating || tutor?.rating || 0);

            return (
              <article key={item?._id || item?.id || tutorId || index} style={styles.card}>
                <div style={styles.cardTop}>
                  <img
                    src={tutor?.avatarUrl || tutor?.image || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop'}
                    alt={tutor?.name || tutor?.fullName || 'Gia sư'}
                    style={styles.avatar}
                  />
                  <div style={{ minWidth: 0 }}>
                    <h2 style={styles.cardTitle}>{tutor?.name || tutor?.fullName || 'Gia sư TutorLink'}</h2>
                    <p style={styles.cardSub}>{tutor?.headline || tutor?.title || 'Gia sư đang hoạt động'}</p>
                    <div style={styles.rating}>
                      <Star size={17} fill="#FBBF24" color="#FBBF24" />
                      <span>{rating ? rating.toFixed(1) : 'Chưa có đánh giá'}</span>
                    </div>
                  </div>
                </div>

                <p style={styles.description}>
                  {tutor?.description || tutor?.bio || 'Hồ sơ gia sư đang được cập nhật.'}
                </p>

                <div style={styles.actions}>
                  <Link to={`/giasu/${tutorId}`} style={styles.viewLink}>Xem hồ sơ</Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(tutorId)}
                    disabled={removingId === tutorId}
                    style={styles.removeButton}
                  >
                    <Trash2 size={16} />
                    {removingId === tutorId ? 'Đang xoá...' : 'Bỏ lưu'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '32px 24px 56px',
    background: '#FAF7F0',
    color: '#1E293B',
    fontFamily: "'Inter', sans-serif",
  },
  hero: {
    maxWidth: 1120,
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    padding: 28,
    border: '1px solid #E7DED2',
    borderRadius: 16,
    background: '#FFFFFF',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(192, 90, 62, 0.12)',
    color: '#C05A3E',
    fontWeight: 800,
    fontSize: 13,
  },
  title: {
    margin: '12px 0 6px',
    fontSize: 34,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: '#5F6B7A',
  },
  primaryLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: '11px 16px',
    background: '#C05A3E',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  grid: {
    maxWidth: 1120,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 18,
  },
  card: {
    border: '1px solid #E7DED2',
    borderRadius: 16,
    padding: 18,
    background: '#FFFFFF',
    boxShadow: '0 14px 36px rgba(30, 41, 59, 0.08)',
  },
  cardTop: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 14,
    objectFit: 'cover',
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
    color: '#1E293B',
  },
  cardSub: {
    margin: '4px 0 8px',
    color: '#5F6B7A',
    fontSize: 14,
  },
  rating: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#1E293B',
    fontWeight: 800,
  },
  description: {
    margin: '16px 0',
    color: '#334155',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewLink: {
    color: '#C05A3E',
    fontWeight: 800,
    textDecoration: 'none',
  },
  removeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    border: '1px solid #E7DED2',
    borderRadius: 10,
    padding: '9px 12px',
    background: '#FAF7F0',
    color: '#1E293B',
    cursor: 'pointer',
    fontWeight: 800,
  },
  stateBox: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: 24,
    borderRadius: 14,
    background: '#FFFFFF',
    border: '1px solid #E7DED2',
  },
  errorBox: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: 18,
    borderRadius: 14,
    background: '#FFF1F0',
    border: '1px solid #F1A79B',
    color: '#B42318',
    fontWeight: 800,
  },
  emptyBox: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 32,
    textAlign: 'center',
    borderRadius: 16,
    background: '#FFFFFF',
    border: '1px solid #E7DED2',
  },
  emptyTitle: {
    margin: '0 0 8px',
    color: '#1E293B',
  },
  emptyText: {
    margin: '0 0 18px',
    color: '#5F6B7A',
  },
};
