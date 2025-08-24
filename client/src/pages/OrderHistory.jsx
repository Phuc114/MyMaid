import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './OrderHistory.css';
import { OrderHistoryProvider, useOrderHistory } from '../context/OrderHistoryContext';

function OrderHistoryView() {
  const {
    orders, loading, error,
    // page, pageSize, total, load, setPage, setPageSize, refresh
  } = useOrderHistory();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const getMenuOptions = (statusLabel) => {
    switch (statusLabel) {
      case 'Đang chờ':
      case 'Đã xác nhận':
      case 'Đang làm':
        return ['Chi tiết công việc', 'Thay đổi ngày giờ', 'Hủy đơn hàng này'];
      case 'Hoàn thành':
        return ['Đánh giá Maid'];
      case 'Đã hủy':
        return ['Chi tiết công việc'];
      default:
        return [];
    }
  };

  return (
    <div className="order-history-page">
      <Header />
      <PageBanner title="Lịch sử đơn hàng" />

      <div className="order-history-container">
        <p className="breadcrumb">Tôi &gt; Lịch sử đơn hàng</p>
        <div className="title-row">
          <h1>Đơn hàng gần đây</h1>
          <button className="new-service-btn">+ Đặt dịch vụ mới</button>
        </div>

        {loading && <div className="loading">Đang tải...</div>}
        {!loading && error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="order-list">
            {orders.length === 0 ? (
              <div className="empty-state">Bạn chưa có đơn hàng nào.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={`order-card ${order.statusClass}`}>
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
                      <button
                        className="menu-btn"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === order.id}
                        onClick={() => toggleMenu(order.id)}
                      >
                        ⋮
                      </button>

                      {openMenuId === order.id && (
                        <div className="oh-dropdown-surface" role="menu" aria-label="Order actions">
                          {getMenuOptions(order.status).map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              className="oh-dropdown-option"
                              onClick={() => {
                                // TODO: gắn handler thực tế cho từng option
                                setOpenMenuId(null);
                              }}
                            >
                              {opt}
                            </button>
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
                      {order.status === 'Hoàn thành' && (
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
              ))
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Popup Đánh Giá */}
      {showRatingPopup && (
        <div className="modal-overlay" onClick={() => setShowRatingPopup(false)}>
          {favoriteMessage && <div className="favorite-toast-outer">{favoriteMessage}</div>}

          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="favorite-btn"
              onClick={() => {
                const message = !isFavorite ? 'Đã thêm vào Maid yêu thích' : 'Đã bỏ khỏi Maid yêu thích';
                setIsFavorite(!isFavorite);
                setFavoriteMessage(message);
                setTimeout(() => setFavoriteMessage(''), 2500);
              }}
              aria-label="Yêu thích maid"
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
}

export default function OrderHistory() {
  return (
    <OrderHistoryProvider>
      <OrderHistoryView />
    </OrderHistoryProvider>
  );
}
