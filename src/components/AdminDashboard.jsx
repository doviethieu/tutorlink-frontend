import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTutors: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Tổng quan Hệ thống</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Thẻ 1: Tổng Học viên */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Tổng Học Viên</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</p>
                </div>

                {/* Thẻ 2: Tổng Gia sư */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Tổng Gia Sư</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTutors}</p>
                </div>

                {/* Thẻ 3: Đơn đặt lịch */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Đơn Đặt Lịch</h3>
                    <div className="flex justify-between items-end mt-2">
                        <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
                        <p className="text-sm text-yellow-600 font-medium">({stats.pendingBookings} chờ duyệt)</p>
                    </div>
                </div>

                {/* Thẻ 4: Doanh thu */}
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Tổng Doanh Thu</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {stats.totalRevenue.toLocaleString('vi-VN')} đ
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;