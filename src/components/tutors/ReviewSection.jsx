import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const ReviewSection = ({ tutorId, studentId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/reviews/tutor/${tutorId}`);
                setReviews(res.data);
            } catch (error) {
                console.error("Lỗi khi tải đánh giá:", error);
            }
        };
        if (tutorId) fetchReviews();
    }, [tutorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!studentId) return alert("Vui lòng đăng nhập!");
        
        try {
            const res = await axios.post('http://localhost:8000/api/reviews', {
                tutorId,
                studentId,
                rating,
                comment
            });
            setReviews([res.data.review, ...reviews]);
            setComment('');
            setRating(5);
            alert("Gửi đánh giá thành công!");
        } catch (error) {
            alert(error.response?.data?.message || "Bạn đã đánh giá gia sư này rồi!");
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold mb-6">Đánh giá từ Học viên ({reviews.length})</h3>

            {studentId ? (
                <form onSubmit={handleSubmit} className="mb-8 p-5 border rounded-xl bg-gray-50">
                    <p className="font-medium mb-2">Để lại cảm nghĩ của bạn:</p>
                    <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => {
                            const starValue = i + 1;
                            return (
                                <FaStar
                                    key={i}
                                    className="cursor-pointer transition-colors"
                                    size={24}
                                    color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    onClick={() => setRating(starValue)}
                                    onMouseEnter={() => setHover(starValue)}
                                    onMouseLeave={() => setHover(null)}
                                />
                            );
                        })}
                    </div>
                    <textarea
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Bạn thấy gia sư này dạy thế nào?..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                    <button type="submit" className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                        Gửi đánh giá
                    </button>
                </form>
            ) : (
                <div className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg mb-8">
                    🔑 Đăng nhập để viết đánh giá cho gia sư này.
                </div>
            )}

            <div className="space-y-4">
                {reviews.map((rv) => (
                    <div key={rv._id} className="p-4 border rounded-lg shadow-sm bg-white">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">{rv.studentId?.name || "Học viên"}</span>
                            <div className="flex text-yellow-400">
                                {[...Array(rv.rating)].map((_, i) => <FaStar key={i} size={14} />)}
                            </div>
                        </div>
                        <p className="text-gray-600">{rv.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewSection;