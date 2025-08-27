// server/routes/maidRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// Lấy toàn bộ maid (đã có)
router.get('/', verifyToken, async (req, res) => {
  try {
    const q = `SELECT id_maid, ho_ten, tieu_su AS mo_ta, anh_ho_so_url AS anh_dai_dien
               FROM maid
               ORDER BY id_maid DESC`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ✅ Lấy maid đang active
router.get('/active', verifyToken, async (req, res) => {
  try {
    const q = `SELECT id_maid, ho_ten, tieu_su AS mo_ta, anh_ho_so_url AS anh_dai_dien
               FROM maid
               WHERE LOWER(trang_thai) = 'active'
               ORDER BY id_maid DESC`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
