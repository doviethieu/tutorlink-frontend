import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';
import ReviewSection from '../../components/tutors/ReviewSection';
import { availabilityService } from '../../services/availability.service';
import { favoriteService } from '../../services/favorite.service';
import { tutorService } from '../../services/tutor.service';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=480&auto=format&fit=crop';

function readCurrentUser() {
  try {
    const raw = localStorage.getItem('tutorlinkUser') || localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function money(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'Chưa cập nhật';
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function formatMode(value) {
  const mode = String(value || '').toLowerCase();
  if (mode === 'online') return 'Online';
  if (mode === 'offline') return 'Trực tiếp';
  return 'Online hoặc trực tiếp';
}

function normalizeEducation(item) {
  if (typeof item === 'string') return { title: item, subtitle: '', year: '' };
  return {
    title: item.degree || item.cert || item.school || 'Bằng cấp/chứng chỉ',
    subtitle: [item.major, item.school].filter(Boolean).join(' - '),
    year: item.year || (item.years ? `${item.years} năm` : ''),
  };
}

function normalizeExperience(item) {
  if (typeof item === 'string') return { role: item, place: '', time: '', description: '' };
  return {
    role: item.role || 'Kinh nghiệm giảng dạy',
    place: item.company || '',
    time: [item.from, item.to].filter(Boolean).join(' - '),
    description: item.description || '',
  };
}

export default function ChiTietGiaSu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = readCurrentUser();
  const studentId = currentUser?._id || currentUser?.id || null;

  const [tutor, setTutor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadTutorProfile() {
      setLoading(true);
      setError('');

      try {
        const tutorData = await tutorService.get(id);
        const tutorId = tutorData?._id || tutorData?.id || id;
        const availabilityData = await availabilityService
          .getTutorAvailability(tutorId)
          .catch(() => []);

        if (!alive) return;
        setTutor(tutorData);
        setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
      } catch (err) {
        if (!alive) return;
        setTutor(null);
        setAvailability([]);
        setError(err.response?.data?.error?.message || 'Không tải được hồ sơ năng lực gia sư.');
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) loadTutorProfile();
    return () => {
      alive = false;
    };
  }, [id]);

  const tutorId = tutor?._id || tutor?.id || id;
  const subjects = asArray(tutor?.subjects);
  const levels = asArray(tutor?.levels);
  const languages = asArray(tutor?.languages);
  const certificates = asArray(tutor?.certificates);
  const skills = asArray(tutor?.skills);
  const education = asArray(tutor?.education).map(normalizeEducation);
  const experience = asArray(tutor?.experience).map(normalizeExperience);
  const availableSlots = useMemo(
    () => availability.flatMap((day) => (day.slots || [])
      .filter((slot) => slot.status !== 'booked')
      .map((slot) => ({ ...slot, date: day.date, day: day.day }))),
    [availability],
  );
  const firstOpenSlot = availableSlots[0];

  const handleBook = (slot = firstOpenSlot) => {
    if (!studentId) {
      navigate('/login');
      return;
    }

    const params = slot?.date && slot?.start
      ? `?date=${encodeURIComponent(slot.date)}&slot=${encodeURIComponent(slot.start)}`
      : '';
    navigate(`/giasu/${encodeURIComponent(tutorId)}/book${params}`);
  };

  const handleFavorite = async () => {
    if (!studentId) {
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      await favoriteService.add(tutorId);
      alert('Đã lưu gia sư vào danh sách yêu thích.');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Không thể lưu gia sư yêu thích.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.stateBox}>Đang tải hồ sơ năng lực gia sư...</div>
      </main>
    );
  }

  if (!tutor) {
    return (
      <main style={styles.page}>
        <div style={styles.stateBox}>
          <h2 style={{ margin: '0 0 8px' }}>Không tìm thấy hồ sơ</h2>
          <p style={{ margin: 0, color: '#94a3b8' }}>{error || 'Hồ sơ này chưa tồn tại hoặc chưa được duyệt.'}</p>
          <button type="button" onClick={() => navigate('/tutors')} style={{ ...styles.primaryButton, marginTop: 20 }}>
            Quay lại danh sách gia sư
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <Link to="/tutors" style={styles.backLink}>
          <ChevronLeft size={18} />
          Danh sách gia sư
        </Link>

        <section style={styles.hero}>
          <div style={styles.heroInfo}>
            <img src={tutor.avatarUrl || tutor.image || FALLBACK_AVATAR} alt={tutor.name} style={styles.avatar} />
            <div style={{ minWidth: 0 }}>
              <div style={styles.badgeRow}>
                {tutor.verified && <span style={styles.greenBadge}><ShieldCheck size={14} /> Đã xác minh</span>}
                {tutor.isPremium && <span style={styles.orangeBadge}><Award size={14} /> Gia sư nổi bật</span>}
              </div>
              <h1 style={styles.name}>{tutor.name || tutor.fullName}</h1>
              <p style={styles.headline}>{tutor.headline || tutor.title || 'Gia sư TutorLink'}</p>
              <div style={styles.metaRow}>
                <span><MapPin size={16} /> {tutor.location || 'Chưa cập nhật khu vực'}</span>
                <span><BookOpen size={16} /> {subjects.join(', ') || 'Chưa cập nhật môn học'}</span>
                <span><Star size={16} /> {Number(tutor.averageRating || tutor.rating || 0).toFixed(1)} ({tutor.totalReviews || tutor.reviews || 0} đánh giá)</span>
              </div>
            </div>
          </div>

          <aside style={styles.pricePanel}>
            <span style={styles.priceLabel}>Học phí</span>
            <strong style={styles.price}>{money(tutor.price)}</strong>
            <span style={styles.priceSub}>/ giờ học</span>
            <button type="button" onClick={() => handleBook()} style={styles.primaryButton}>
              <CalendarDays size={18} />
              Đặt lịch học
            </button>
            <button type="button" onClick={handleFavorite} disabled={favoriteLoading} style={styles.secondaryButton}>
              <Heart size={18} />
              {favoriteLoading ? 'Đang lưu...' : 'Lưu yêu thích'}
            </button>
          </aside>
        </section>

        <section style={styles.statsGrid}>
          <div style={styles.stat}><Wallet size={20} /><strong>{money(tutor.price)}</strong><span>Học phí mỗi giờ</span></div>
          <div style={styles.stat}><Clock size={20} /><strong>{tutor.responseTime || 'Trong ngày'}</strong><span>Phản hồi dự kiến</span></div>
          <div style={styles.stat}><CheckCircle2 size={20} /><strong>{tutor.session_count || tutor.sessions || 0}</strong><span>Buổi đã hoàn thành</span></div>
          <div style={styles.stat}><GraduationCap size={20} /><strong>{levels.length || 'Nhiều'}</strong><span>Cấp độ hỗ trợ</span></div>
        </section>

        <div style={styles.contentGrid}>
          <section style={styles.mainColumn}>
            <ProfileSection title="Giới Thiệu">
              <p style={styles.paragraph}>{tutor.description || tutor.bio || 'Gia sư chưa cập nhật phần giới thiệu chi tiết.'}</p>
            </ProfileSection>

            <ProfileSection title="Chuyên Môn Giảng Dạy">
              <TagGroup items={subjects} empty="Chưa cập nhật môn dạy" />
              <div style={{ height: 12 }} />
              <TagGroup items={levels} empty="Chưa cập nhật cấp độ" tone="blue" />
            </ProfileSection>

            <ProfileSection title="Kinh Nghiệm">
              {experience.length ? experience.map((item, index) => (
                <TimelineItem
                  key={`${item.role}-${index}`}
                  title={item.role}
                  subtitle={[item.place, item.time].filter(Boolean).join(' - ')}
                  body={item.description}
                />
              )) : <p style={styles.muted}>Chưa cập nhật kinh nghiệm giảng dạy.</p>}
            </ProfileSection>

            <ProfileSection title="Học Vấn Và Chứng Chỉ">
              {education.length ? education.map((item, index) => (
                <TimelineItem key={`${item.title}-${index}`} title={item.title} subtitle={item.subtitle} body={item.year} />
              )) : <p style={styles.muted}>Chưa cập nhật học vấn.</p>}
              {certificates.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <TagGroup items={certificates} tone="green" />
                </div>
              )}
            </ProfileSection>

            {tutor.videoIntroUrl && (
              <ProfileSection title="Video Giới Thiệu">
                <a href={tutor.videoIntroUrl} target="_blank" rel="noreferrer" style={styles.videoLink}>
                  <PlayCircle size={20} />
                  Mở video giới thiệu của gia sư
                </a>
              </ProfileSection>
            )}
          </section>

          <aside style={styles.sideColumn}>
            <ProfileSection title="Lịch Rảnh Gần Nhất">
              {availableSlots.length ? (
                <div style={styles.slotList}>
                  {availableSlots.slice(0, 8).map((slot) => (
                    <button
                      key={`${slot.date}-${slot.start}`}
                      type="button"
                      onClick={() => handleBook(slot)}
                      style={styles.slotButton}
                    >
                      <span>{slot.day}</span>
                      <strong>{slot.date}</strong>
                      <em>{slot.start} - {slot.end}</em>
                    </button>
                  ))}
                </div>
              ) : (
                <p style={styles.muted}>Gia sư chưa mở lịch rảnh trong tuần này.</p>
              )}
            </ProfileSection>

            <ProfileSection title="Ngôn Ngữ Và Kỹ Năng">
              <div style={styles.iconLine}><Languages size={18} /> {languages.join(', ') || 'Tiếng Việt'}</div>
              <div style={{ height: 14 }} />
              <TagGroup items={skills} empty="Chưa cập nhật kỹ năng" tone="blue" />
            </ProfileSection>

            <ProfileSection title="Hình Thức Học">
              <div style={styles.iconLine}><MapPin size={18} /> {formatMode(tutor.format)}</div>
              <p style={{ ...styles.muted, marginTop: 10 }}>Địa điểm: {tutor.location || 'Trao đổi sau khi đặt lịch'}</p>
            </ProfileSection>
          </aside>
        </div>

        <section style={styles.reviewPanel}>
          <ReviewSection tutorId={tutorId} studentId={studentId} />
        </section>
      </div>
    </main>
  );
}

function ProfileSection({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function TagGroup({ items, empty, tone = 'orange' }) {
  const color = tone === 'green' ? styles.greenTag : tone === 'blue' ? styles.blueTag : styles.orangeTag;
  if (!items?.length) return <p style={styles.muted}>{empty || 'Chưa cập nhật'}</p>;
  return (
    <div style={styles.tagGroup}>
      {items.map((item) => <span key={item} style={{ ...styles.tag, ...color }}>{item}</span>)}
    </div>
  );
}

function TimelineItem({ title, subtitle, body }) {
  return (
    <div style={styles.timelineItem}>
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
      {body && <p>{body}</p>}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    padding: '36px 20px 56px',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: { maxWidth: 1160, margin: '0 auto' },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: 700,
    marginBottom: 18,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 280px',
    gap: 22,
    border: '1px solid #334155',
    borderRadius: 12,
    background: '#111827',
    padding: 24,
  },
  heroInfo: { display: 'flex', gap: 22, alignItems: 'center', minWidth: 0 },
  avatar: { width: 150, height: 150, borderRadius: 12, objectFit: 'cover', border: '2px solid #f97316' },
  badgeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  greenBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, color: '#34d399', background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.24)', padding: '5px 9px', borderRadius: 999, fontSize: 12, fontWeight: 800 },
  orangeBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, color: '#fb923c', background: 'rgba(249,115,22,.12)', border: '1px solid rgba(249,115,22,.24)', padding: '5px 9px', borderRadius: 999, fontSize: 12, fontWeight: 800 },
  name: { margin: 0, color: '#fff', fontSize: 34, lineHeight: 1.15 },
  headline: { margin: '8px 0 14px', color: '#f97316', fontWeight: 800 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 14, color: '#cbd5e1', fontSize: 14 },
  pricePanel: { borderLeft: '1px solid #334155', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 },
  priceLabel: { color: '#94a3b8', fontSize: 13, fontWeight: 700 },
  price: { color: '#fff', fontSize: 30 },
  priceSub: { color: '#94a3b8', marginTop: -8 },
  primaryButton: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 0, borderRadius: 10, background: '#f97316', color: '#fff', fontWeight: 800, padding: '12px 16px', cursor: 'pointer', textDecoration: 'none' },
  secondaryButton: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: '1px solid #475569', borderRadius: 10, background: '#1e293b', color: '#e2e8f0', fontWeight: 800, padding: '12px 16px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, margin: '18px 0' },
  stat: { background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 7 },
  contentGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 18 },
  mainColumn: { display: 'flex', flexDirection: 'column', gap: 18 },
  sideColumn: { display: 'flex', flexDirection: 'column', gap: 18 },
  section: { background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 22 },
  sectionTitle: { margin: '0 0 16px', color: '#fff', fontSize: 18, textTransform: 'uppercase', letterSpacing: '.02em' },
  paragraph: { margin: 0, color: '#cbd5e1', lineHeight: 1.75, whiteSpace: 'pre-line' },
  muted: { color: '#94a3b8', margin: 0, lineHeight: 1.6 },
  tagGroup: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tag: { borderRadius: 999, padding: '7px 10px', fontSize: 13, fontWeight: 800 },
  orangeTag: { color: '#fed7aa', background: 'rgba(249,115,22,.13)', border: '1px solid rgba(249,115,22,.24)' },
  greenTag: { color: '#bbf7d0', background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.22)' },
  blueTag: { color: '#bae6fd', background: 'rgba(14,165,233,.12)', border: '1px solid rgba(14,165,233,.22)' },
  timelineItem: { borderLeft: '2px solid #f97316', padding: '0 0 2px 14px', marginBottom: 16, color: '#e2e8f0' },
  slotList: { display: 'grid', gap: 10 },
  slotButton: { textAlign: 'left', background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: 12, cursor: 'pointer' },
  iconLine: { display: 'flex', alignItems: 'center', gap: 8, color: '#e2e8f0', fontWeight: 700 },
  videoLink: { color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontWeight: 800 },
  reviewPanel: { marginTop: 18, background: '#111827', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: 22 },
  stateBox: { maxWidth: 720, margin: '80px auto', background: '#111827', border: '1px solid #334155', borderRadius: 12, padding: 28, textAlign: 'center' },
};
