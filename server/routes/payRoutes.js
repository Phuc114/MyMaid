// server/routes/payRoutes.js
const express = require('express');
const router = express.Router();

const {
  createMomoPayment,
  momoIPN,
  createStripePaymentIntent,
  // NEW: controller cập nhật trạng thái đơn khi thanh toán thành công
  markPaid,
} = require('../controllers/payController');

const db = require('../config/db');

const MOMO_REDIRECT_URL =
  process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment-result';
const DEV_PAY_MOCK = process.env.DEV_PAY_MOCK === 'true';

// ===== MoMo (thật) =====
router.post('/momo/create', createMomoPayment);
router.post('/momo/ipn', momoIPN);

// ===== Stripe (Visa) =====
router.post('/stripe/create-intent', createStripePaymentIntent);

// ===== NEW: API chung để FE báo "đã thanh toán thành công" =====
// Body: { orderId: string, method: 'MOMO' | 'STRIPE', amount?: number, transactionId?: string }
router.post('/mark-paid', markPaid);

// ===== DEV ONLY: Giả lập thanh toán MoMo thành công để test nhanh =====
// FE gọi: POST /api/pay/momo/mock-success { orderId, amount }
// Trả về: { redirectUrl } để FE chuyển về /payment-result như MoMo thật
router.post('/momo/mock-success', async (req, res) => {
  try {
    if (!DEV_PAY_MOCK) {
      return res
        .status(403)
        .json({ message: 'Mock payment disabled. Set DEV_PAY_MOCK=true in server .env' });
    }

    const { orderId, amount = 0 } = req.body || {};
    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    // OPTIONAL: cập nhật DB để flow hoàn chỉnh trên local
    try {
      const { rows } = await db.query(
        'SELECT id_lich_dat FROM lich_dat WHERE ma_don_hang = $1 LIMIT 1',
        [orderId]
      );
      if (rows?.length) {
        const id = rows[0].id_lich_dat;
        await db.query('UPDATE lich_dat SET trang_thai = $1 WHERE id_lich_dat = $2', [
          'confirmed',
          id,
        ]);
        await db.query(
          `INSERT INTO thanh_toan (id_lich_dat, phuong_thuc, so_tien, trang_thai, ma_giao_dich, ngay_thanh_toan)
           VALUES ($1,$2,$3,$4,$5, NOW())
           ON CONFLICT (id_lich_dat) DO UPDATE
             SET so_tien = EXCLUDED.so_tien,
                 trang_thai = EXCLUDED.trang_thai,
                 ma_giao_dich = EXCLUDED.ma_giao_dich`,
          [id, 'MOMO', amount, 'successful', `MOCK_${Date.now()}`]
        );
      }
    } catch (e) {
      console.warn('Mock success DB update skipped:', e.message);
    }

    // Trả redirect URL giống format của MoMo (resultCode=0 là success)
    const redirectUrl = `${MOMO_REDIRECT_URL}?resultCode=0&orderId=${encodeURIComponent(
      orderId
    )}&message=Success`;
    return res.json({ redirectUrl });
  } catch (e) {
    console.error('mock-success error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
