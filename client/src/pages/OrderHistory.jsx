import React from 'react';
import './OrderHistory.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrderHistory = () => {
  const orders = [
    {
      id: 1,
      service: "Dọn dẹp nhà cửa",
      owner: "Chủ",
      time: "Thay đổi ngày giờ",
      note: "Hủy do vắng mặt",
      address: "227 Nguyễn Văn Cừ, Phường 3, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
      status: "Đang chờ"
    },
    {
      id: 2,
      service: "Dọn dẹp nhà cửa",
      time: "Thứ sáu, 26/07/2025 - 14:00",
      duration: "3 tiếng, 14:00 - 17:00",
      address: "227 Nguyễn Văn Cừ, Phường 3, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
      status: "Hoàn thành"
    },
    {
      id: 3,
      service: "Dọn dẹp văn phòng",
      time: "Thứ năm, 24/07/2025 - 14:00",
      duration: "3 tiếng, 14:00 - 17:00",
      address: "227 Nguyễn Văn Cừ, Phường 3, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
      status: "Đã huỷ"
    }
  ];

  return (
    <div className="order-history-page">
      <Header />

      <div className="breadcrumb">Tôi &gt; Lịch sử đơn hàng</div>

      <div className="order-history-header">
        <h1>Đơn hàng gần đây</h1>
        <button className="new-service-btn">+ Đặt dịch vụ mới</button>
      </div>

      <div className="order-list">
        {orders.map(order => (
          <div className={`order-card ${order.status}`} key={order.id}>
            <div className="order-info">
              <h3>{order.service}</h3>
              {order.owner && <p><strong>Người đặt:</strong> {order.owner}</p>}
              {order.time && <p><strong>Thời gian:</strong> {order.time}</p>}
              {order.duration && <p><strong>Làm trong:</strong> {order.duration}</p>}
              <p><strong>Địa chỉ:</strong> {order.address}</p>
              {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
              <p className={`status status-${order.status}`}>Trạng thái: {order.status}</p>
            </div>
            <div className="order-actions">
              <button>Đặt lần nữa</button>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default OrderHistory;
