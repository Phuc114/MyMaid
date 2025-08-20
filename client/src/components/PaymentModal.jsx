import React, { useMemo, useState } from 'react';
import './PaymentModal.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// ---- wrap Stripe element in a child so modal có 2 tab gọn gàng ----
function VisaForm({ amount, onSuccess, onFail }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-result'
        },
        redirect: 'if_required'
      });

      if (error) {
        onFail(error.message || 'Thanh toán lỗi');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        // Một số phương thức sẽ redirect – trường hợp này FE sẽ chuyển sang /payment-result
      }
    } catch (e) {
      onFail(e.message);
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

  // Lấy publishable key từ Stripe dashboard (test)
  const stripePromise = useMemo(() => loadStripe('pk_test_51RyBcM1iJN4YB2gYTBkD2mswf7rnFHpdhbesoc22rqoOLKkKde2tZSNDdDBtxtgxFiVfKBVtAdcABvyAiWr5vgzS00tMXFTJaj'), []);

  const [clientSecret, setClientSecret] = useState(null);

  const initStripe = async () => {
    setMsg('');
    // gọi server tạo PaymentIntent
    const res = await fetch(`${API_BASE}/api/pay/stripe/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount, currency: 'vnd',
        metadata: { orderId: 'ORDER_' + Date.now() }
      })
    }).then(r => r.json());
    setClientSecret(res.clientSecret);
  };

  const payWithMomo = async () => {
    try {
      setMsg('Đang chuyển tới MoMo...');
      const orderId = 'ORDER_' + Date.now();
      const res = await fetch(`${API_BASE}/api/pay/momo/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount, orderId,
          orderInfo: `Thanh toan don hang ${orderId}`
        })
      }).then(r => r.json());

      if (res?.payUrl) {
        window.location.href = res.payUrl; // mở trang thanh toán MoMo
      } else {
        setMsg('Không nhận được payUrl từ MoMo.');
      }
    } catch (e) {
      setMsg('Lỗi MoMo: ' + e.message);
    }
  };

  const visaPanel = (
    clientSecret ? (
      <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
        <VisaForm
          amount={amount}
          onSuccess={() => window.location.assign('/payment-result?status=success')}
          onFail={(m) => setMsg(m)}
        />
      </Elements>
    ) : (
      <button className="pay-btn" onClick={initStripe}>Khởi tạo thanh toán Visa</button>
    )
  );

return (
  <div className="modal-overlay">
    <div className="modal">
      <div className="modal-head">
        <h3>Thanh toán</h3>
        <button className="close" onClick={onClose}>×</button>
      </div>

      {/* NEW: thân modal cuộn được */}
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
            </div>
          ) : visaPanel}
        </div>

        {msg && <div className="msg">{msg}</div>}
      </div>
    </div>
  </div>
);
}
