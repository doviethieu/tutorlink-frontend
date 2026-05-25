import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { reviewService } from '../../services/review.service';

const ReviewSection = ({ tutorId, studentId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await reviewService.listByTutor(tutorId);
                setReviews(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi khi tải đánh giá:", error);
                setReviews([]);
            }
        };
        if (tutorId) fetchReviews();
    }, [tutorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentId) return alert("Vui lòng đăng nhập!");
        
        try {
            const review = await reviewService.create({
                tutorId,
                studentId,
                rating,
                comment
            });
            setReviews([review, ...reviews]);
            setComment('');
            setRating(5);
            alert("Gửi đánh giá thành công!");
        } catch (error) {
            alert(error.response?.data?.error?.message || error.response?.data?.message || "Bạn chỉ có thể đánh giá sau buổi học đã hoàn thành.");
        }
    };

    return (
        <div className="w-full text-slate-100">
            <h3 className="mb-6 text-xl font-bold text-white">Đánh giá từ Học viên ({reviews.length})</h3>

            {studentId ? (
                <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                    <p className="mb-2 font-semibold text-slate-200">Để lại cảm nghĩ của bạn:</p>
                    <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => {
                            const starValue = i + 1;
                            return (
                                <FaStar
                                    key={i}
                                    className="cursor-pointer transition-colors"
                                    size={24}
                                    color={starValue <= (hover || rating) ? "#f97316" : "#475569"}
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHover(starValue)}
                                    onMouseLeave={() => setHover(null)}
                                />
                            );
                        })}
                    </div>
                    <textarea
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                        placeholder="Bạn thấy gia sư này dạy thế nào?..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                    <button type="submit" className="mt-3 rounded-lg bg-orange-600 px-6 py-2 font-bold text-white transition hover:bg-orange-500">
                        Gửi đánh giá
                    </button>
                </form>
            ) : (
                <div className="mb-8 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-orange-100">
                    Đăng nhập để viết đánh giá cho gia sư này.
                </div>
            )}

            <div className="space-y-4">
                {reviews.map((rv) => (
                    <div key={rv._id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="font-bold text-white">{rv.student || rv.studentId?.name || "Học viên"}</span>
                            <div className="flex text-orange-500">
                                {[...Array(rv.rating)].map((_, i) => <FaStar key={i} size={14} />)}
                            </div>
                        </div>
                        <p className="text-slate-300">{rv.body || rv.comment}</p>
                        {rv.tutorReply?.body && (
                            <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
                                <strong>Phản hồi của gia sư:</strong> {rv.tutorReply.body}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;
