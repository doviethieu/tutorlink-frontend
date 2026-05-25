import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { reviewService } from '../../services/review.service';

export function ReviewDialog({ open, onClose, tutorName, subject, bookingId, tutorId, onReviewSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Nếu flag open = false thì đóng, không render giao diện
  if (!open) return null;

  // Hàm xử lý gửi đánh giá lên API Backend của sếp
  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao trước khi gửi đánh giá bạn ơi!');
      return;
    }

    if (!bookingId || !tutorId) {
      alert('Thiếu thông tin lịch học hoặc mã gia sư, không thể đánh giá!');
      return;
    }

    setIsPending(true);
    try {
      const review = await reviewService.create({
        bookingId,
        tutorId,
        rating,
        body: comment
      });

      alert('🎉 Cảm ơn bạn đã gửi đánh giá cho gia sư!');
      
      // Reset form trạng thái ban đầu
      setRating(0);
      setComment('');
      
      // Kích hoạt callback nếu có (để trang cha tự động cập nhật lại danh sách)
      if (onReviewSuccess) onReviewSuccess(review);
      
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      alert(error.response?.data?.error?.message || error.response?.data?.message || 'Không thể gửi đánh giá, bạn kiểm tra lại backend nhé!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-[#1e293b] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-start justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Đánh giá buổi học
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Gia sư: <span className="text-sky-400 font-semibold">{tutorName}</span> · Lớp: {subject}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="space-y-5 p-6">
          {/* Khu vực chọn số Sao (Rating) */}
          <div>
            <p className="text-sm font-semibold text-slate-200">Mức độ hài lòng của bạn</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="rounded-lg p-1 transition hover:scale-110 active:scale-95 outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors duration-150 ${
                      (hover || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-xs font-semibold text-amber-400">
                👉 {['Cần cải thiện 🌟', 'Tạm được ⭐⭐', 'Khá tốt ⭐⭐⭐', 'Rất tốt ⭐⭐⭐⭐', 'Tuyệt vời dịch vụ 5 sao! 🔥'][rating - 1]}
              </p>
            )}
          </div>

          {/* Khu vực nhập nội dung bình luận (Comment) */}
          <div>
            <label className="text-sm font-semibold text-slate-200" htmlFor="comment">
              Nhận xét chi tiết
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn để giúp gia sư và cộng đồng học viên khác nhé..."
              className="mt-2 w-full h-28 px-3 py-2 text-sm rounded-xl bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition resize-none"
            />
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="flex justify-end gap-2 border-t border-slate-800 bg-slate-900/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-xl text-slate-300 font-semibold text-sm hover:bg-slate-800 transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className={`px-4 h-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 ${
              isPending ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
