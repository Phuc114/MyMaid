import React from 'react';
import AdminHeader from '../components/HeaderAdmin';
import './DashboardAdmin.css';

const DashboardAdmin = () => {
    const stats = [
        { label: 'Tổng Doanh Thu', value: '150,000,000đ', icon: 'fas fa-dollar-sign' },
        { label: 'Lịch Đặt Mới', value: '25', icon: 'fas fa-calendar-plus' },
        { label: 'Khách Hàng', value: '1,200', icon: 'fas fa-users' },
        { label: 'Nhân Viên (Maid)', value: '75', icon: 'fas fa-user-shield' }
    ];
    const recentBookings = [
        { id: '#1234', customer: 'Nguyễn Văn A', service: 'Tổng vệ sinh', total: '500,000đ', status: 'Hoàn thành' },
        { id: '#1235', customer: 'Trần Thị B', service: 'Giặt sofa', total: '350,000đ', status: 'Đang xử lý' },
        { id: '#1236', customer: 'Lê Văn C', service: 'Vệ sinh nhà cửa', total: '400,000đ', status: 'Đã hủy' },
    ];

    return (
        <div className="admin-dashboard-page">
            <AdminHeader />
            <main className="admin-dashboard-main">
                <h1 className="dashboard-title">Bảng Điều Khiển</h1>
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">
                                <i className={stat.icon}></i>
                            </div>
                            <div className="stat-info">
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="recent-bookings-container">
                    <h2 className="recent-bookings-title">Lịch Đặt Gần Đây</h2>
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Mã Đơn</th>
                                <th>Khách Hàng</th>
                                <th>Dịch Vụ</th>
                                <th>Tổng Tiền</th>
                                <th>Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>{booking.id}</td>
                                    <td>{booking.customer}</td>
                                    <td>{booking.service}</td>
                                    <td>{booking.total}</td>
                                    <td><span className={`status-badge status-${booking.status.toLowerCase().replace(' ', '-')}`}>{booking.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default DashboardAdmin;