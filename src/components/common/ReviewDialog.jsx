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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1E293B]/35 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E7DED2] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-start justify-between border-b border-[#E7DED2] p-6">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              Đánh giá buổi học
            </h2>
            <p className="mt-1 text-sm text-[#5F6B7A]">
              Gia sư: <span className="text-[#C05A3E] font-semibold">{tutorName}</span> · Lớp: {subject}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6B7A] transition hover:bg-[#FAF7F0] hover:text-[#1E293B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="space-y-5 p-6">
          {/* Khu vực chọn số Sao (Rating) */}
          <div>
            <p className="text-sm font-semibold text-[#1E293B]">Mức độ hài lòng của bạn</p>
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
                        ? 'fill-[#C05A3E] text-[#C05A3E]'
                        : 'text-[#7C6F64]'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-xs font-semibold text-[#C05A3E]">
                👉 {['Cần cải thiện 🌟', 'Tạm được ⭐⭐', 'Khá tốt ⭐⭐⭐', 'Rất tốt ⭐⭐⭐⭐', 'Tuyệt vời dịch vụ 5 sao! 🔥'][rating - 1]}
              </p>
            )}
          </div>

          {/* Khu vực nhập nội dung bình luận (Comment) */}
          <div>
            <label className="text-sm font-semibold text-[#1E293B]" htmlFor="comment">
              Nhận xét chi tiết
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn để giúp gia sư và cộng đồng học viên khác nhé..."
              className="mt-2 w-full h-28 px-3 py-2 text-sm rounded-xl bg-[#FAF7F0] border border-[#E7DED2] text-[#1E293B] placeholder-[#7C6F64] focus:border-[#C05A3E] focus:ring-1 focus:ring-[#C05A3E] outline-none transition resize-none"
            />
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="flex justify-end gap-2 border-t border-[#E7DED2] bg-[#FAF7F0] p-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-xl text-[#1E293B] font-semibold text-sm hover:bg-[#E7DED2] transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className={`px-4 h-10 rounded-xl bg-[#C05A3E] hover:bg-[#A94730] text-[#FAF7F0] font-bold text-sm transition flex items-center justify-center gap-2 ${
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
