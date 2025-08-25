import React from 'react';

export default function PaymentResult(){
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') || params.get('resultCode') === '0' ? 'success' : 'pending';

  return (
    <div style={{maxWidth:680,margin:'40px auto'}}>
      <h2>Kết quả thanh toán</h2>
      <p>Trạng thái: <strong>{status}</strong></p>
      <p>Nếu là MoMo sandbox, `resultCode=0` nghĩa là thành công. Stripe sẽ redirect hoặc trả về trong trang tuỳ phương thức.</p>
      <a href="/order-history">Về Lịch sử đặt</a>
    </div>
  );
}
