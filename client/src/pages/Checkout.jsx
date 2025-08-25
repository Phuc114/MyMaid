// client/src/pages/Checkout.jsx
import React, { useState } from 'react';
import './Checkout.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/PaymentModal';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const Checkout = () => {
  // === Modal thanh toán ===
  const [showPay, setShowPay] = useState(false);

  // === Form fields (giữ layout, bổ sung state để gửi server) ===
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [note, setNote] = useState('');

  // Tổng tiền demo (sau này thay bằng tính theo dịch vụ/m2/giờ...)
  const amountVnd = 150000; // 150,000 VND

  // Lấy token từ localStorage (tùy dự án của em đang lưu key nào)
  const getAuthHeaders = () => {
    const t =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      '';
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

    // Gọi API tạo đơn 'pending' trước khi mở modal thanh toán
  const handleConfirm = async () => {
    try {
      if (!selectedDate || !startTime) {
        alert('Vui lòng chọn ngày và giờ bắt đầu.');
        return;
      }

      const body = {
        id_dich_vu: 1,    // TODO: thay bằng id dịch vụ user chọn
        id_dia_chi: 1,    // TODO: thay bằng id địa chỉ user chọn
        ngay_lam_viec: selectedDate, // 'YYYY-MM-DD'
        gio_bat_dau: startTime,      // 'HH:mm'
        ghi_chu: note,
        tong_tien: amountVnd,
      };

      const res = await fetch(`${API_BASE}/api/orders/create-pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data?.id_lich_dat) {
        throw new Error(data?.message || 'Tạo đơn pending thất bại');
      }

      sessionStorage.setItem('currentOrderId', String(data.id_lich_dat));
      setShowPay(true);
    } catch (err) {
      console.error('handleConfirm error:', err);
      alert(err.message || 'Có lỗi khi tạo đơn pending');
    }
  };


  return (
    <div className="checkout-container">
      <Header />

      <div className="checkout-banner">
        <h1>Trang thanh toán</h1>
      </div>

      <div className="checkout-main">
        {/* Left: Dịch vụ giới thiệu */}
        <div className="checkout-left">
          <h2>Dịch vụ Dọn Dẹp Nhà</h2>
          <p>
            MyMaid cung cấp dịch vụ dọn dẹp nhà cửa chuyên nghiệp cho hộ gia đình, căn hộ, và văn phòng.
            Nhân viên được đào tạo bài bản, phục vụ tận tâm và đúng giờ.
          </p>
          <img src="/images/service-cleaning.png" alt="Cleaning" />

          <h3>Chi tiết dịch vụ:</h3>
          <ul>
            <li>Vệ sinh sàn nhà, nhà tắm, nhà bếp</li>
            <li>Dọn rác, lau bụi, hút bụi</li>
            <li>Khử mùi và khử khuẩn</li>
          </ul>

          <div className="review-section">
            <h3>Đánh giá từ khách hàng</h3>
            <div className="review">
              <strong>Ngọc Trinh:</strong> Rất sạch sẽ, nhân viên thân thiện. 10 điểm!
            </div>
            <div className="review">
              <strong>Hữu Tín:</strong> Dịch vụ đáng tiền, nhà cửa sáng bóng luôn!
            </div>

            <form className="review-form" onSubmit={(e) => e.preventDefault()}>
              <textarea
                placeholder="Viết đánh giá của bạn..."
                rows="3"
              />
              <button type="submit">Gửi đánh giá</button>
            </form>
          </div>
        </div>

        {/* Right: Đơn hàng */}
        <div className="checkout-right">
          <div className="order-box">
            <h3>Thông tin đơn hàng</h3>

            <label>Ngày dọn:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <label>Giờ bắt đầu:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <label>Ghi chú:</label>
            <textarea
              placeholder="Ghi chú thêm..."
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {/* Bấm để tạo đơn pending + mở modal thanh toán */}
            <button onClick={handleConfirm}>Xác nhận đặt lịch</button>

            {/* (tuỳ chọn) Hiển thị tổng tiền cho rõ */}
            <div style={{ marginTop: 8, opacity: 0.8 }}>
              Tổng tiền tạm tính: {amountVnd.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal thanh toán */}
      {showPay && (
        <PaymentModal
          amount={amountVnd}
          onClose={() => setShowPay(false)}
        />
      )}
    </div>
  );
};

export default Checkout;
