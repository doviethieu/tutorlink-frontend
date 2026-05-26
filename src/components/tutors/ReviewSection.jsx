import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import { getErrorMessage } from '../../lib/api';
import { reviewService } from '../../services/review.service';

const STAR_COLOR = '#FBBF24';

function getReviewerName(review) {
  return review?.student?.fullName
    || review?.student?.name
    || review?.studentName
    || review?.user?.fullName
    || review?.user?.name
    || 'Học viên';
}

function getReviewId(review, index) {
  return review?._id || review?.id || `${getReviewerName(review)}-${index}`;
}

function RatingStars({ value = 0, onChange, size = 22 }) {
  const normalized = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div style={styles.stars} aria-label={`${normalized} sao`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= normalized;
        const icon = (
          <Star
            size={size}
            fill={active ? STAR_COLOR : 'transparent'}
            color={active ? STAR_COLOR : '#CDBFAB'}
            strokeWidth={2.2}
          />
        );

        if (!onChange) {
          return <span key={star}>{icon}</span>;
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={styles.starButton}
            aria-label={`Chọn ${star} sao`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewSection({ tutorId, studentId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    async function loadReviews() {
      if (!tutorId) return;
      setLoading(true);
      setError('');

      try {
        const data = await reviewService.listByTutor(tutorId);
        const items = Array.isArray(data) ? data : data?.items || data?.reviews || [];
        if (alive) setReviews(items);
      } catch (err) {
        if (alive) setError(getErrorMessage(err, 'Không tải được đánh giá.'));
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      alive = false;
    };
  }, [tutorId]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!studentId) {
      alert('Bạn cần đăng nhập bằng tài khoản học viên để đánh giá.');
      return;
    }

    if (!comment.trim()) {
      alert('Vui lòng nhập cảm nhận của bạn.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await reviewService.create({
        tutorId,
        studentId,
        rating,
        comment: comment.trim(),
      });

      setReviews((current) => [created, ...current]);
      setComment('');
      setRating(5);
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể gửi đánh giá.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Đánh giá từ Học viên ({reviews.length})</h2>
          <div style={styles.summary}>
            <RatingStars value={Math.round(average)} size={20} />
            <span>{average ? average.toFixed(1) : 'Chưa có đánh giá'}</span>
          </div>
        </div>
      </div>

      {loading && <p style={styles.muted}>Đang tải đánh giá...</p>}
      {!loading && error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <div style={styles.list}>
          {reviews.length === 0 ? (
            <p style={styles.muted}>Chưa có đánh giá nào cho gia sư này.</p>
          ) : (
            reviews.map((review, index) => (
              <article key={getReviewId(review, index)} style={styles.reviewItem}>
                <div style={styles.reviewTop}>
                  <strong>{getReviewerName(review)}</strong>
                  <RatingStars value={review.rating} size={19} />
                </div>
                <p style={styles.comment}>{review.comment || review.body || 'Học viên chưa để lại nhận xét.'}</p>
                {review.reply && (
                  <p style={styles.reply}>
                    <strong>Phản hồi của gia sư:</strong> {review.reply}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.formLabel}>Để lại cảm nghĩ của bạn:</label>
        <RatingStars value={rating} onChange={setRating} size={30} />
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Bạn thấy gia sư này dạy thế nào?..."
          style={styles.textarea}
          rows={4}
        />
        <button type="submit" disabled={submitting} style={styles.submitButton}>
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </section>
  );
}

const styles = {
  section: {
    background: '#FFFDF8',
    border: '1px solid #E8DDCD',
    borderRadius: 16,
    padding: 28,
    color: '#1E293B',
    boxShadow: '0 16px 40px rgba(30, 41, 59, 0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.15,
    color: '#1E293B',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    color: '#5F6B7A',
    fontWeight: 700,
  },
  stars: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  },
  starButton: {
    border: 0,
    padding: 0,
    background: 'transparent',
    cursor: 'pointer',
    lineHeight: 0,
  },
  list: {
    display: 'grid',
    gap: 14,
  },
  reviewItem: {
    border: '1px solid #EFE5D8',
    borderRadius: 12,
    padding: 16,
    background: '#FAF7F0',
  },
  reviewTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    color: '#1E293B',
  },
  comment: {
    margin: '10px 0 0',
    color: '#334155',
    lineHeight: 1.6,
  },
  reply: {
    margin: '12px 0 0',
    padding: 12,
    borderLeft: '3px solid #C05A3E',
    borderRadius: 8,
    background: '#FFF7ED',
    color: '#334155',
  },
  form: {
    display: 'grid',
    gap: 12,
    marginTop: 24,
    paddingTop: 22,
    borderTop: '1px solid #E8DDCD',
  },
  formLabel: {
    fontWeight: 800,
    color: '#1E293B',
  },
  textarea: {
    width: '100%',
    resize: 'vertical',
    border: '1px solid #D8C8B6',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 16,
    color: '#1E293B',
    background: '#FFFFFF',
    outlineColor: '#C05A3E',
    boxSizing: 'border-box',
  },
  submitButton: {
    justifySelf: 'start',
    border: 0,
    borderRadius: 10,
    padding: '11px 18px',
    background: '#C05A3E',
    color: '#FFFFFF',
    fontWeight: 800,
    cursor: 'pointer',
  },
  muted: {
    color: '#64748B',
    margin: 0,
  },
  error: {
    color: '#B42318',
    margin: 0,
    fontWeight: 700,
  },
};
