const crypto = require('crypto');
const axios = require('axios');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');

exports.markPaid = async (req, res) => {
  try {
    const { orderId, method, amount, transactionId } = req.body || {};
    if (!orderId || !method) {
      return res.status(400).json({ message: 'orderId & method required' });
    }

    // 1) Tìm lịch đặt theo ma_don_hang
    const { rows } = await db.query(
      'SELECT id_lich_dat FROM lich_dat WHERE ma_don_hang = $1 LIMIT 1',
      [orderId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Order not found' });

    const idLichDat = rows[0].id_lich_dat;

    // 2) Tạo/ghi bản thanh toán
    const payIns = await db.query(
      `INSERT INTO thanh_toan (phuong_thuc, so_tien, trang_thai, ma_giao_dich, ngay_thanh_toan)
       VALUES ($1,$2,'successful',$3, NOW())
       RETURNING id_thanh_toan`,
      [method, amount || 0, transactionId || null]
    );
    const idThanhToan = payIns.rows[0].id_thanh_toan;

    // 3) Gắn vào lịch đặt + đổi trạng thái đơn
    await db.query(
      'UPDATE lich_dat SET id_thanh_toan=$1, trang_thai=$2 WHERE id_lich_dat=$3',
      [idThanhToan, 'confirmed', idLichDat]
    );

    return res.json({ ok: true, id_lich_dat: idLichDat, id_thanh_toan: idThanhToan });
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
