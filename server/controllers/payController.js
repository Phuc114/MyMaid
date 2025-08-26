const crypto = require('crypto');
const axios = require('axios');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

exports.markPaid = async (req, res) => {
  try {
    // Có thể được truyền qua query (payment-result redirect) hoặc body (fetch từ FE)
    const q = req.query || {};
    const b = req.body || {};
    const idKh = req.user?.id_khach_hang || null;

    const id_lich_dat_in = Number(b.id_lich_dat || q.id_lich_dat) || null;
    const amount = b.amount || q.amount || null;
    const provider = b.method || q.method || 'MoMo'; // mặc định MoMo

    // 1) Xác định đơn cần đánh dấu đã thanh toán
    let targetId = id_lich_dat_in;

    if (!targetId) {
      if (!idKh) {
        return res.status(400).json({
          message: 'Thiếu id_lich_dat và không có user để suy ra đơn pending',
        });
      }
      const r = await db.query(
        `SELECT id_lich_dat
           FROM lich_dat
          WHERE id_khach_hang = $1
            AND trang_thai = 'pending'
            AND id_thanh_toan IS NOT NULL
          ORDER BY id_lich_dat DESC
          LIMIT 1`,
        [idKh]
      );
      if (!r.rows.length) {
        return res.status(404).json({
          message: 'Không tìm thấy đơn pending đã gắn thanh toán để xác nhận',
        });
      }
      targetId = r.rows[0].id_lich_dat;
    }

    // 2) Lấy id_thanh_toan của đơn
    const g = await db.query(
      `SELECT id_thanh_toan FROM lich_dat WHERE id_lich_dat = $1`,
      [targetId]
    );
    if (!g.rows.length || !g.rows[0].id_thanh_toan) {
      return res.status(400).json({ message: 'Đơn chưa gắn thanh toán' });
    }
    const paymentId = g.rows[0].id_thanh_toan;

    // 3) Cập nhật bảng thanh_toan
    await db.query(
      `UPDATE thanh_toan
          SET trang_thai = 'paid',
              so_tien    = COALESCE($1, so_tien),
              phuong_thuc= COALESCE($2, phuong_thuc)
        WHERE id_thanh_toan = $3`,
      [amount ?? null, provider, paymentId]
    );

    // 4) Cập nhật trạng thái đơn
    await db.query(
      `UPDATE lich_dat SET trang_thai = 'paid' WHERE id_lich_dat = $1`,
      [targetId]
    );

    return res.json({ ok: true, id_lich_dat: targetId, id_thanh_toan: paymentId });
  } catch (e) {
    console.error('markPaid error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};


// ====== MoMo: Create Payment ======
exports.createMomoPayment = async (req, res, next) => {
  try {
    const { amount, orderId: clientOrderId, orderInfo } = req.body;

    const partnerCode = process.env.MOMO_PARTNER_CODE; // 'MOMO'
    const accessKey   = process.env.MOMO_ACCESS_KEY;
    const secretKey   = process.env.MOMO_SECRET_KEY;
    const redirectUrl = process.env.MOMO_REDIRECT_URL;

    // BẮT BUỘC có ipnUrl: fallback về redirectUrl nếu chưa cấu hình
    const ipnUrl      = process.env.MOMO_IPN_URL || redirectUrl;

    const orderId   = clientOrderId || `ORDER_${Date.now()}`;
    const requestId = `${orderId}_${Math.random().toString(36).slice(2,8)}`;
    const requestType = 'captureWallet';
    const extraData = '';
    const lang = 'vi';
    const amt = String(parseInt(amount, 10));

    // CHUỖI KÝ (đúng thứ tự tham số của MoMo v2)
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amt}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature).digest('hex');

    const payload = {
      partnerCode, accessKey, requestId,
      amount: amt, orderId, orderInfo,
      redirectUrl, ipnUrl,                 // <== GỬI ipnUrl
      requestType, extraData, lang, signature
    };

    const momoRes = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('MoMo create response:', momoRes.data);

    return res.json({
      ok: momoRes.data?.resultCode === 0,
      payUrl: momoRes.data?.payUrl || null,
      deeplink: momoRes.data?.deeplink || null,
      qrCodeUrl: momoRes.data?.qrCodeUrl || null,
      resultCode: momoRes.data?.resultCode,
      message: momoRes.data?.message
    });
  } catch (err) {
    console.error('MoMo create error:', err?.response?.data || err.message);
    next(err);
  }
};

// ====== MoMo: IPN (dev local có thể chưa cần) ======
exports.momoIPN = async (req, res) => {
  // TODO: xác thực signature, cập nhật trạng thái đơn hàng theo orderId
  // Trả 200 để MoMo dừng retry
  res.json({ result: 0, message: 'received' });
};

// ====== Stripe: Create PaymentIntent ======
exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'vnd', metadata } = req.body;
    // Stripe hỗ trợ VND với thẻ (dev/test OK). Amount tính bằng đơn vị "đồng".
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true }, // dùng Payment Element
      metadata
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    next(err);
  }
};
