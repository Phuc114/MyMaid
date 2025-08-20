// client/src/pages/Checkout.jsx
import React, { useState } from 'react';
import './Checkout.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
  // === NEW: bật/tắt modal thanh toán ===
  const [showPay, setShowPay] = useState(false);

  // Tổng tiền demo (sau này thay bằng tính theo dịch vụ/m2/giờ...)
  const amountVnd = 150000; // 150,000 VND

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

            <form className="review-form">
              <textarea placeholder="Viết đánh giá của bạn..." rows="3" />
              <button type="submit">Gửi đánh giá</button>
            </form>
          </div>
        </div>

        {/* Right: Đơn hàng */}
        <div className="checkout-right">
          <div className="order-box">
            <h3>Thông tin đơn hàng</h3>
            <label>Ngày dọn:</label>
            <input type="date" />
            <label>Giờ bắt đầu:</label>
            <input type="time" />
            <label>Ghi chú:</label>
            <textarea placeholder="Ghi chú thêm..." rows="3" />
            {/* NEW: mở modal thanh toán */}
            <button onClick={() => setShowPay(true)}>Xác nhận đặt lịch</button>
          </div>
        </div>
      </div>

      <Footer />

      {/* NEW: Modal thanh toán */}
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
