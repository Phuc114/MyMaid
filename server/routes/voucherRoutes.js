// server/routes/voucherRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// ✅ Lấy voucher còn hiệu lực
router.get('/available', verifyToken, async (req, res) => {
  try {
    const sql = `
      SELECT id_khuyen_mai, ma_code, mo_ta, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc
      FROM khuyen_mai
      WHERE LOWER(trang_thai) = 'active'
        AND (ngay_bat_dau IS NULL OR NOW() >= ngay_bat_dau)
        AND (ngay_ket_thuc IS NULL OR NOW() <= ngay_ket_thuc)
        AND (so_luong IS NULL OR so_luong > 0)
      ORDER BY id_khuyen_mai DESC
    `;
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
