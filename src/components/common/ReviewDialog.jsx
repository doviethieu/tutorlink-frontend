import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { getErrorMessage } from '../../lib/api';
import { reviewService } from '../../services/review.service';

const STAR_COLOR = '#FBBF24';

export function ReviewDialog({
  open,
  onClose,
  bookingId,
  tutorId,
  tutorName = 'Gia sư',
  subject = 'Buổi học',
  onReviewSuccess,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!rating) {
      alert('Vui lòng chọn số sao đánh giá.');
      return;
    }

    if (!comment.trim()) {
      alert('Vui lòng nhập nhận xét trước khi gửi đánh giá.');
      return;
    }

    try {
      setSubmitting(true);
      const review = await reviewService.create({
        bookingId,
        tutorId,
        rating,
        comment: comment.trim(),
      });

      setComment('');
      setRating(5);
      onReviewSuccess?.(review);
      onClose?.();
    } catch (err) {
      alert(getErrorMessage(err, 'Không thể gửi đánh giá.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay} role="presentation">
      <div style={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="review-title">
        <button type="button" onClick={onClose} style={styles.closeButton} aria-label="Đóng">
          <X size={20} />
        </button>

        <h2 id="review-title" style={styles.title}>Đánh giá buổi học</h2>
        <p style={styles.subtitle}>
          {subject} với <strong>{tutorName}</strong>
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <span style={styles.label}>Mức độ hài lòng</span>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={styles.starButton}
                  aria-label={`Chọn ${star} sao`}
                >
                  <Star
                    size={32}
                    fill={star <= rating ? STAR_COLOR : 'transparent'}
                    color={star <= rating ? STAR_COLOR : '#CDBFAB'}
                  />
                </button>
              ))}
            </div>
          </div>

          <label style={styles.field}>
            <span style={styles.label}>Nhận xét chi tiết</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Bạn thấy buổi học này thế nào?"
              style={styles.textarea}
              rows={5}
            />
          </label>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewDialog;

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 80,
    display: 'grid',
    placeItems: 'center',
    padding: 20,
    background: 'rgba(15, 23, 42, 0.42)',
  },
  dialog: {
    position: 'relative',
    width: 'min(520px, 100%)',
    borderRadius: 18,
    padding: 28,
    background: '#FFFDF8',
    border: '1px solid #E8DDCD',
    color: '#1E293B',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    display: 'grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    border: '1px solid #E8DDCD',
    borderRadius: 10,
    background: '#FAF7F0',
    color: '#1E293B',
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    paddingRight: 40,
    fontSize: 26,
    lineHeight: 1.2,
    color: '#1E293B',
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#5F6B7A',
  },
  form: {
    display: 'grid',
    gap: 18,
    marginTop: 24,
  },
  field: {
    display: 'grid',
    gap: 8,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 800,
    color: '#1E293B',
  },
  stars: {
    display: 'flex',
    gap: 4,
  },
  starButton: {
    border: 0,
    padding: 0,
    background: 'transparent',
    cursor: 'pointer',
    lineHeight: 0,
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    border: '1px solid #D8C8B6',
    borderRadius: 12,
    padding: '12px 14px',
    background: '#FFFFFF',
    color: '#1E293B',
    fontSize: 15,
    outlineColor: '#C05A3E',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    border: '1px solid #D8C8B6',
    borderRadius: 10,
    padding: '10px 16px',
    background: '#FFFFFF',
    color: '#1E293B',
    fontWeight: 800,
    cursor: 'pointer',
  },
  submitButton: {
    border: 0,
    borderRadius: 10,
    padding: '10px 18px',
    background: '#C05A3E',
    color: '#FFFFFF',
    fontWeight: 800,
    cursor: 'pointer',
  },
};
