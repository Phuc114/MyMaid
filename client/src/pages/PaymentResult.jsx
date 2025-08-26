import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function PaymentResult() {
  const [msg, setMsg] = useState('Đang xác nhận thanh toán...');
  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const resultCode = params.get('resultCode');  // MoMo = '0' là OK
        const status = params.get('status');          // Stripe (fallback)
        const method = params.get('method') || (resultCode !== null ? 'MOMO' : 'STRIPE');

        // Lấy orderId đã lưu khi user bấm thanh toán
        const orderId = sessionStorage.getItem('orderId');
        if (!orderId) {
          setMsg('Không tìm thấy orderId để xác nhận.');
          return;
        }
        const idFromQuery   = params.get('id_lich_dat');
        const idFromSession = sessionStorage.getItem('currentOrderId');
        const id_lich_dat   = Number(idFromQuery || idFromSession) || null;

        // Thành công (MoMo: resultCode===0; Stripe: status==='success' hoặc không có tham số nhưng đã confirm client)
        const isSuccess = (resultCode === '0') || (status === 'success') || !params.size;

        if (isSuccess) {
          const resp = await fetch(`${API_BASE}/api/pay/mark-paid`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
              orderId,
              method,
              amount: Number(sessionStorage.getItem('amount')) || 0,
              transactionId: params.get('payment_intent') || params.get('transId') || null,
              id_lich_dat   // ✅ truyền cho BE để cập nhật đúng đơn
            })
          }).then(r=>r.json());

          if (resp?.ok) {
            setMsg('Thanh toán thành công! Đơn của bạn đã được xác nhận.');
          } else {
            setMsg(resp?.message || 'Không xác nhận được thanh toán.');
          }
        } else {
          setMsg('Thanh toán không thành công hoặc bị huỷ.');
        }
      } catch (e) {
        setMsg('Lỗi: ' + e.message);
      }
    };
    run();
  }, []);

  return (
    <div style={{maxWidth:640,margin:'40px auto',padding:20,fontFamily:'system-ui'}}>
      <h2>Kết quả thanh toán</h2>
      <p>{msg}</p>
      <a href="/">Về trang chủ</a>
    </div>
  );
}
