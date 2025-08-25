import React, { useMemo, useState } from 'react';
import './PaymentModal.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const STRIPE_PK =
  process.env.REACT_APP_STRIPE_PK ||
  'pk_test_51RyBcM1iJN4YB2gYTBkD2mswf7rnFHpdhbesoc22rqoOLKkKde2tZSNDdDBtxtgxFiVfKBVtAdcABvyAiWr5vgzS00tMXFTJaj';

const genOrderId = () => 'ORDER_' + Date.now();

const authHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------- Visa (Stripe) child ----------
function VisaForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/payment-result' },
        redirect: 'if_required'
      });

      if (error) {
        alert(error.message || 'Thanh toán lỗi');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        window.location.assign('/payment-result?status=success&payment_intent=' + paymentIntent.id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PaymentElement />
      <button className="pay-btn" onClick={handlePay} disabled={!stripe || loading}>
        {loading ? 'Đang xử lý...' : 'Thanh toán Visa (Stripe)'}
      </button>
    </div>
  );
}

export default function PaymentModal({ amount, onClose }) {
  const [tab, setTab] = useState('momo'); // 'momo' | 'visa'
  const [msg, setMsg] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const stripePromise = useMemo(() => loadStripe(STRIPE_PK), []);

  // GÁN orderId vào đơn pending mới nhất của user
  const attachOrderId = async (orderId) => {
    const id_lich_dat = sessionStorage.getItem('currentOrderId'); // lưu ở bước đặt lịch
    const res = await fetch(`${API_BASE}/api/orders/attach-order-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ orderId, amount, id_lich_dat })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.message || 'Không gán được orderId cho đơn (có thể chưa đăng nhập)');
    }
    return res.json();
  };

  // Stripe: khởi tạo intent (SAU KHI gán orderId)
  const initStripe = async () => {
    try {
      setMsg('');
      const orderId = genOrderId();
      sessionStorage.setItem('orderId', orderId);
      sessionStorage.setItem('amount', String(amount));

      await attachOrderId(orderId); // quan trọng

      const res = await fetch(`${API_BASE}/api/pay/stripe/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'vnd',
          metadata: { orderId }
        })
      }).then(r => r.json());

      if (res?.clientSecret) setClientSecret(res.clientSecret);
      else setMsg(res?.message || 'Không tạo được PaymentIntent');
    } catch (e) {
      setMsg(e.message);
    }
  };

  // MoMo: tạo payUrl (SAU KHI gán orderId)
  const payWithMomo = async () => {
    try {
      setMsg('Đang chuyển tới MoMo...');
      const orderId = genOrderId();
      sessionStorage.setItem('orderId', orderId);
      sessionStorage.setItem('amount', String(amount));

      await attachOrderId(orderId); // quan trọng

      const res = await fetch(`${API_BASE}/api/pay/momo/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId,
          orderInfo: `Thanh toan don hang ${orderId}`
        })
      }).then(r => r.json());

      if (res?.payUrl) window.location.href = res.payUrl;
      else setMsg(res?.message || 'Không nhận được payUrl từ MoMo.');
    } catch (e) {
      setMsg(e.message);
    }
  };

  // DEV ONLY: Giả lập thanh toán thành công (mô phỏng redirect từ MoMo)
  const mockMomoSuccess = async () => {
    try {
      setMsg('');
      const orderId = genOrderId();
      sessionStorage.setItem('orderId', orderId);
      sessionStorage.setItem('amount', String(amount));

      await attachOrderId(orderId); // quan trọng

      const res = await fetch(`${API_BASE}/api/pay/momo/mock-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount })
      }).then(r => r.json());

      if (res?.redirectUrl) window.location.href = res.redirectUrl;
      else setMsg('Mock không trả về redirectUrl.');
    } catch (e) {
      setMsg(e.message);
    }
  };

  const visaPanel = clientSecret ? (
    <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
      <VisaForm />
    </Elements>
  ) : (
    <button className="pay-btn" onClick={initStripe}>Khởi tạo thanh toán Visa</button>
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-head">
          <h3>Thanh toán</h3>
          <button className="close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button className={tab==='momo'?'active':''} onClick={()=>setTab('momo')}>MoMo</button>
            <button className={tab==='visa'?'active':''} onClick={()=>setTab('visa')}>Visa</button>
          </div>

          <div className="summary">
            <div>Tổng tiền:</div>
            <strong>{amount.toLocaleString('vi-VN')} đ</strong>
          </div>

          <div className="tab-content">
            {tab === 'momo' ? (
              <div>
                <p>Thanh toán bằng ví MoMo (sandbox).</p>
                <button className="pay-btn" onClick={payWithMomo}>Thanh toán MoMo</button>
                {process.env.NODE_ENV !== 'production' && (
                  <button
                    className="pay-btn"
                    style={{ marginTop: 8, background: '#6b7280' }}
                    onClick={mockMomoSuccess}
                    title="Giả lập thanh toán thành công (dev only)"
                  >
                    Giả lập thanh toán thành công
                  </button>
                )}
              </div>
            ) : (visaPanel)}
          </div>

          {msg && <div className="msg">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
