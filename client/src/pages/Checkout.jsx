// client/src/pages/Checkout.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './Checkout.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/PaymentModal';
import { useLocation } from 'react-router-dom';
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

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

  // === Maid & voucher ===
  const [maids, setMaids] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedMaidId, setSelectedMaidId] = useState('');
  const [selectedVoucherId, setSelectedVoucherId] = useState('');

  // === Yêu thích lưu DB ===
  const [favService, setFavService] = useState(false);
  const [favMaid, setFavMaid] = useState(false);

  const authHeaders = () => {
    const t =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      '';
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  // Lấy maid active + voucher còn hiệu lực
  useEffect(() => {
    const headers = authHeaders();
    fetch(`${API_BASE}/api/maids/active`, { headers, credentials: 'include' })
      .then(r => r.json())
      .then(data => setMaids(Array.isArray(data) ? data : []))
      .catch(() => setMaids([]));

    fetch(`${API_BASE}/api/vouchers/available`, { headers, credentials: 'include' })
      .then(r => r.json())
      .then(data => setVouchers(Array.isArray(data) ? data : []))
      .catch(() => setVouchers([]));
  }, []);

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

  // Đối tượng dịch vụ đang chọn
  const selectedService = useMemo(
    () => services.find(s => s.id_dich_vu === Number(selectedServiceId)) || null,
    [services, selectedServiceId]
  );

  const unit  = selectedService?.don_vi || '';
  const price = useMemo(() => {
    const v = selectedService?.gia_co_ban;
    return v == null ? null : Number(v);
  }, [selectedService]);

  // Tổng gốc = giá * số lượng
  const baseTotal = useMemo(() => {
    const q = Number(qty) || 0;
    if (!price || q < 1) return 0;
    return price * q;
  }, [price, qty]);

  // Áp dụng voucher theo 3 kiểu: 0–1 (tỉ lệ), 1–100 (phần trăm), >100 (giảm VND)
  const applyVoucherAmount = (base, v) => {
    if (!v || v <= 0) return base;
    if (v > 0 && v <= 1)   return Math.max(0, base * (1 - v));        // 0.1 = -10%
    if (v > 1 && v <= 100) return Math.max(0, base * (1 - v / 100));  // 10  = -10%
    return Math.max(0, base - v);                                      // 50000 = -50k
  };

  const selectedVoucher = useMemo(
    () => vouchers.find(v => String(v.id_khuyen_mai) === String(selectedVoucherId)),
    [vouchers, selectedVoucherId]
  );

  const totalAfterVoucher = useMemo(() => {
    if (!selectedVoucher) return baseTotal;
    const v = Number(selectedVoucher.gia_tri_giam);
    return applyVoucherAmount(baseTotal, v);
  }, [baseTotal, selectedVoucher]);

  // ==== Yêu thích: đọc trạng thái từ DB mỗi khi đổi chọn ====
  useEffect(() => {
    if (!selectedServiceId) { setFavService(false); return; }
    fetch(`${API_BASE}/api/favorites/services/${selectedServiceId}/status`, {
      headers: { ...authHeaders() }
    })
      .then(r => r.json())
      .then(d => setFavService(!!d.favorite))
      .catch(() => setFavService(false));
  }, [selectedServiceId]);

  useEffect(() => {
    if (!selectedMaidId) { setFavMaid(false); return; }
    fetch(`${API_BASE}/api/favorites/maids/${selectedMaidId}/status`, {
      headers: { ...authHeaders() }
    })
      .then(r => r.json())
      .then(d => setFavMaid(!!d.favorite))
      .catch(() => setFavMaid(false));
  }, [selectedMaidId]);

  // ==== Toggle yêu thích ====
  const toggleFavService = async () => {
    if (!selectedServiceId) return;
    try {
      const r = await fetch(`${API_BASE}/api/favorites/services/${selectedServiceId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.message || 'Toggle thất bại');
      setFavService(!!d.favorite);
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleFavMaid = async () => {
    if (!selectedMaidId) return;
    try {
      const r = await fetch(`${API_BASE}/api/favorites/maids/${selectedMaidId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() }
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.message || 'Toggle thất bại');
      setFavMaid(!!d.favorite);
    } catch (e) {
      alert(e.message);
    }
  };

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
      if (!selectedMaidId) {
        alert('Vui lòng chọn maid.');
        return;
      }

      const body = {
        id_dich_vu: Number(selectedServiceId),
        id_maid: Number(selectedMaidId),
        id_dia_chi: 1,              // TODO: thay bằng id địa chỉ thật khi có UI chọn địa chỉ
        ngay_lam_viec: selectedDate,
        gio_bat_dau: startTime,     // BE map qua cột giờ làm việc
        ghi_chu: note,
        tong_tien: Number(totalAfterVoucher),
        id_khuyen_mai: selectedVoucher ? Number(selectedVoucher.id_khuyen_mai) : null
      };

      const res = await fetch(`${API_BASE}/api/orders/create-pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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

            {/* Chọn dịch vụ + trái tim yêu thích (DB) */}
            <div className="label-row">
              <label>Chọn dịch vụ:</label>
              <button
                type="button"
                className={`heart-btn ${favService ? 'is-fav' : ''}`}
                onClick={toggleFavService}
                title={favService ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                aria-label="Yêu thích dịch vụ"
                disabled={!selectedServiceId}
              >
                {favService ? <MdFavorite /> : <MdFavoriteBorder />}
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

            {/* Chọn maid + trái tim yêu thích (DB) */}
            <div className="label-row" style={{ marginTop: 10 }}>
              <label>Chọn maid:</label>
              <button
                type="button"
                className={`heart-btn ${favMaid ? 'is-fav' : ''}`}
                onClick={toggleFavMaid}
                title={favMaid ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                aria-label="Yêu thích maid"
                disabled={!selectedMaidId}
              >
                {favMaid ? <MdFavorite /> : <MdFavoriteBorder />}
              </button>
            </div>
            <select
              value={selectedMaidId}
              onChange={(e) => setSelectedMaidId(e.target.value)}
            >
              <option value="">-- Chọn maid --</option>
              {maids.map(m => (
                <option key={m.id_maid} value={m.id_maid}>
                  {m.ho_ten}
                </option>
              ))}
            </select>

            {/* Chọn voucher */}
            <label>Chọn voucher:</label>
            <select
              value={selectedVoucherId}
              onChange={(e) => setSelectedVoucherId(e.target.value)}
            >
              <option value="">-- Không dùng voucher --</option>
              {vouchers.map(v => (
                <option key={v.id_khuyen_mai} value={v.id_khuyen_mai}>
                  {v.ma_code} — giảm {Number(v.gia_tri_giam)}
                  {Number(v.gia_tri_giam) > 0 && Number(v.gia_tri_giam) <= 1
                    ? ' (tỉ lệ)'
                    : (Number(v.gia_tri_giam) <= 100 ? '%' : ' đ')}
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
              {selectedVoucher
                ? (
                  <>
                    <div>Tiền gốc: {baseTotal.toLocaleString('vi-VN')} đ</div>
                    <div>Tạm tính sau voucher: {totalAfterVoucher.toLocaleString('vi-VN')} đ</div>
                  </>
                )
                : (
                  <div>Tổng tiền tạm tính: {price ? `${baseTotal.toLocaleString('vi-VN')} đ` : 'Liên hệ'}</div>
                )
              }
            </div>

            {/* Bấm để tạo đơn pending + mở modal thanh toán */}
            <button
              onClick={handleConfirm}
              disabled={!selectedServiceId || !price || !selectedMaidId}
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal thanh toán */}
      {showPay && (
        <PaymentModal
          amount={totalAfterVoucher}
          onClose={() => setShowPay(false)}
        />
      )}
    </div>
  );
};

export default Checkout;
