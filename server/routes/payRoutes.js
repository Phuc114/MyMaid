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

// routes/payRoutes.js
router.post('/momo/mock-success', async (req, res) => {
  try {
    // Bật/tắt mock qua .env DEV_PAY_MOCK=true
    if (!process.env.DEV_PAY_MOCK || process.env.DEV_PAY_MOCK === 'false') {
      return res.status(403).json({ message: 'Mock payment disabled. Set DEV_PAY_MOCK=true in server .env' });
    }

    const { orderId, amount = 0 } = req.body || {};
    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    // ✅ Lấy id_lich_dat từ body trước, nếu không có thì lấy từ query
    const idLichDat = Number(req.body?.id_lich_dat ?? req.query?.id_lich_dat) || null;

    if (idLichDat) {
      try {
        // Xác nhận lịch đặt
        await db.query('UPDATE lich_dat SET trang_thai = $1 WHERE id_lich_dat = $2', [
          'confirmed',
          idLichDat,
        ]);

        // Ghi/Upsert thanh toán
        await db.query(
          `INSERT INTO thanh_toan (id_lich_dat, phuong_thuc, so_tien, trang_thai, ma_giao_dich, ngay_thanh_toan)
           VALUES ($1,$2,$3,$4,$5, NOW())
           ON CONFLICT (id_lich_dat) DO UPDATE
             SET so_tien = EXCLUDED.so_tien,
                 trang_thai = EXCLUDED.trang_thai,
                 ma_giao_dich = EXCLUDED.ma_giao_dich`,
          [idLichDat, 'MOMO', amount, 'successful', `MOCK_${Date.now()}`]
        );
      } catch (e) {
        console.warn('Mock success DB update skipped:', e.message);
      }
    } else {
      console.warn('Mock success DB update skipped: missing id_lich_dat in body/query');
    }

    const redirectBase = process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment-result';
    const redirectUrl =
      `${redirectBase}?resultCode=0` +
      `&orderId=${encodeURIComponent(orderId)}` +
      `&id_lich_dat=${idLichDat ?? ''}` +
      `&message=Success`;

    return res.json({ redirectUrl });
  } catch (e) {
    console.error('mock-success error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
