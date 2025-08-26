// client/src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './Checkout.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/PaymentModal';
import { useLocation } from 'react-router-dom';
import { MdFavorite, MdFavoriteBorder } from "react-icons/md"; // ở đầu file

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const LS_FAV_SERVICES = "favServices";
function readFavServices() {
  try { return JSON.parse(localStorage.getItem(LS_FAV_SERVICES)) || []; }
  catch { return []; }
}
function writeFavServices(list) {
  localStorage.setItem(LS_FAV_SERVICES, JSON.stringify(list || []));
}

const Checkout = () => {
  // === Modal thanh toán ===
  const [showPay, setShowPay] = useState(false);

  // === Form fields ===
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [note, setNote] = useState('');

  // === Lấy id danh mục truyền từ trang trước ===
  const location = useLocation();
  const state = location.state || {};
  const urlParams = new URLSearchParams(location.search);
  const danhMucId =
    state.danhMucId ||
    state.id_danh_muc ||
    Number(urlParams.get('danh_muc')) ||
    Number(sessionStorage.getItem('danhMucId')) ||
    null;

  // === Danh sách dịch vụ theo danh mục + lựa chọn và số lượng ===
  const [services, setServices] = useState([]);         // [{id_dich_vu, ten_dich_vu, don_vi, gia_co_ban}]
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [qty, setQty] = useState(1);

  // === Yêu thích (localStorage) ===
  const [favServices, setFavServices] = useState(readFavServices());
  const isSelectedFav = useMemo(
    () => !!favServices.find(s => s.id_dich_vu === Number(selectedServiceId)),
    [favServices, selectedServiceId]
  );
  function toggleFavSelected() {
    if (!selectedServiceId) return;
    const found = services.find(s => s.id_dich_vu === Number(selectedServiceId));
    if (!found) return;
    const exists = favServices.find(s => s.id_dich_vu === Number(selectedServiceId));
    const next = exists
      ? favServices.filter(s => s.id_dich_vu !== Number(selectedServiceId))
      : [...favServices, {
          id_dich_vu: found.id_dich_vu,
          ten_dich_vu: found.ten_dich_vu,
          gia_co_ban: found.gia_co_ban,
          don_vi: found.don_vi
        }];
    setFavServices(next);
    writeFavServices(next);
  }

  // Lấy token từ localStorage (giữ logic sẵn có của em)
  const getAuthHeaders = () => {
    const t =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      '';
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  // === Tải list dịch vụ theo danh mục ===
  useEffect(() => {
    if (!danhMucId) return;
    sessionStorage.setItem('danhMucId', String(danhMucId));
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/services/by-category/${danhMucId}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setServices(list);
        if (list.length > 0) setSelectedServiceId(list[0].id_dich_vu);
      } catch (e) {
        console.error('Load services error:', e);
      }
    })();
  }, [danhMucId]);

  const selectedService = useMemo(
    () => services.find(s => s.id_dich_vu === Number(selectedServiceId)) || null,
    [services, selectedServiceId]
  );

  const unit = selectedService?.don_vi || '';
  const price = selectedService?.gia_co_ban ?? null; // INTEGER (VND/đơn vị)
  const total = useMemo(() => {
    const q = Number(qty) || 0;
    if (!price || q < 1) return 0;
    return price * q;
  }, [price, qty]);

  // === Gọi API tạo đơn 'pending' trước khi mở modal thanh toán ===
  const handleConfirm = async () => {
    try {
      if (!selectedDate || !startTime) {
        alert('Vui lòng chọn ngày và giờ bắt đầu.');
        return;
      }
      if (!selectedServiceId) {
        alert('Hãy chọn một dịch vụ.');
        return;
      }
      if (!price) {
        alert('Dịch vụ này chưa có giá. Vui lòng chọn dịch vụ khác hoặc liên hệ.');
        return;
      }
      if (!qty || qty < 1) {
        alert('Số lượng phải >= 1');
        return;
      }

      const body = {
        id_dich_vu: Number(selectedServiceId),
        id_dia_chi: 1,              // TODO: thay bằng id địa chỉ thật khi có UI
        ngay_lam_viec: selectedDate,
        gio_bat_dau: startTime,     // BE map qua cột giờ làm việc
        ghi_chu: note,
        tong_tien: total,
      };

      const res = await fetch(`${API_BASE}/api/orders/create-pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
              <textarea placeholder="Viết đánh giá của bạn..." rows="3" />
              <button type="submit">Gửi đánh giá</button>
            </form>
          </div>
        </div>

        {/* Right: Đơn hàng */}
        <div className="checkout-right">
          <div className="order-box">
            <h3>Thông tin đơn hàng</h3>

            {/* Chọn dịch vụ + trái tim yêu thích */}
            <div className="label-row">
              <label>Chọn dịch vụ:</label>
              <button
                type="button"
                className={`heart-btn ${isSelectedFav ? 'is-fav' : ''}`}
                onClick={toggleFavSelected}
                title={isSelectedFav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                aria-label="Yêu thích dịch vụ"
              >
                ♥
              </button>
            </div>

            <select
              value={selectedServiceId || ''}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            >
              {services.map(s => (
                <option key={s.id_dich_vu} value={s.id_dich_vu}>
                  {s.ten_dich_vu} {s.gia_co_ban ? `— ${Number(s.gia_co_ban).toLocaleString('vi-VN')} đ/${s.don_vi || ''}` : '— Liên hệ'}
                </option>
              ))}
            </select>

            {/* Số lượng */}
            <label>Số lượng {unit ? `(${unit})` : ''}:</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />

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

            {/* Tổng tiền */}
            <div style={{ marginTop: 8, opacity: 0.9, fontWeight: 700 }}>
              Tổng tiền tạm tính: {price ? `${total.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
            </div>

            {/* Bấm để tạo đơn pending + mở modal thanh toán */}
            <button onClick={handleConfirm} disabled={!selectedServiceId || !price}>
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal thanh toán */}
      {showPay && (
        <PaymentModal
          amount={total}
          onClose={() => setShowPay(false)}
        />
      )}
    </div>
  );
};

export default Checkout;
