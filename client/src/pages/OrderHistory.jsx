import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderHistory.css';

const orders = [
  {
    id: 1,
    title: "Dọn dẹp nhà cửa",
    date: "Chủ nhật, 28/07/2025 - 14:00",
    time: "3 tiếng, 14:00 - 17:00",
    address: "227 Nguyễn Văn Cừ, Phường 4, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
    status: "Đang chờ",
    statusClass: "pending",
  },
  {
    id: 2,
    title: "Dọn dẹp nhà cửa",
    date: "Thứ sáu, 25/07/2025 - 14:00",
    time: "3 tiếng, 14:00 - 17:00",
    address: "227 Nguyễn Văn Cừ, Phường 4, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
    status: "Hoàn thành",
    statusClass: "completed",
  },
  {
    id: 3,
    title: "Dọn dẹp văn phòng",
    date: "Thứ năm, 24/07/2025 - 14:00",
    time: "3 tiếng, 14:00 - 17:00",
    address: "227 Nguyễn Văn Cừ, Phường 4, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
    status: "Đã hủy",
    statusClass: "cancelled",
  },
];

const OrderHistory = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getMenuOptions = (status) => {
    switch (status) {
      case "Đang chờ":
        return ["Chi tiết công việc", "Thay đổi ngày giờ", "Hủy đơn hàng này"];
      case "Hoàn thành":
        return ["Đánh giá Maid"];
      case "Đã hủy":
        return ["Chi tiết công việc"];
      default:
        return [];
    }
  };

  return (
    <div className="order-history-page">
      <Header />

      <div className="order-history-container">
        <p className="breadcrumb">Tôi &gt; Lịch sử đơn hàng</p>
        <h1>Đơn hàng gần đây</h1>
        <button className="new-service-btn">+ Đặt dịch vụ mới</button>

        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-top">
                <div className="order-left">
                  <h3>{order.title}</h3>
                  <p className="label-muted">Ngày làm việc</p>
                  <p>{order.date}</p>
                  <p className="label-muted">Làm trong</p>
                  <p>{order.time}</p>
                  <p className="label-muted">Địa chỉ</p>
                  <p className="bold-address">{order.address}</p>
                </div>

                <div className="order-right" ref={menuRef}>
                  <button className="menu-btn" onClick={() => toggleMenu(order.id)}>⋮</button>
                  {openMenuId === order.id && (
                    <div className="menu-dropdown">
                      {getMenuOptions(order.status).map((opt, index) => (
                        <div key={index} className="menu-item">{opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="order-footer">
                <div className="status-group">
                  <span className="label-muted">Trạng thái</span>
                  <span className={`status-badge ${order.statusClass}`}>{order.status}</span>
                </div>
                <div className="footer-buttons">
                  {order.status === "Hoàn thành" && (
                    <button
                      className="action-button"
                      onClick={() => setShowRatingPopup(true)}
                    >
                      Đánh giá
                    </button>
                  )}
                  <button className="action-button">Đặt lần nữa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {/* Popup Đánh Giá */}
      {showRatingPopup && (
        <div className="modal-overlay" onClick={() => setShowRatingPopup(false)}>
          {/* THÔNG BÁO NẰM TRÊN BOX */}
          {favoriteMessage && (
            <div className="favorite-toast-outer">{favoriteMessage}</div>
          )}

          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="favorite-btn"
              onClick={() => {
                const message = !isFavorite
                  ? 'Đã thêm vào Maid yêu thích'
                  : 'Đã bỏ khỏi Maid yêu thích';
                setIsFavorite(!isFavorite);
                setFavoriteMessage(message);
                setTimeout(() => setFavoriteMessage(''), 2500);
              }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>

            <img
              src="https://i.imgur.com/zYxDCQT.png"
              alt="maid-avatar"
              className="maid-avatar"
            />
            <h3 className="rating-title">Đánh giá</h3>
            <p className="rating-sub">Vui lòng đánh giá cho Maid</p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${selectedRating >= star ? 'filled' : ''}`}
                  onClick={() => setSelectedRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <button
              className="submit-rating-button"
              onClick={() => {
                alert(`Bạn đã đánh giá ${selectedRating} sao!`);
                setShowRatingPopup(false);
                setIsFavorite(false);
              }}
            >
              Đánh giá
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
