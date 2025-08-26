const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/maids
router.get('/', verifyToken, async (req, res) => {
  try {
    const q = `SELECT id_maid, ho_ten, mo_ta, anh_dai_dien FROM maid ORDER BY id_maid DESC`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const q = `
      SELECT id_maid, ho_ten, mo_ta, anh_dai_dien
      FROM maid
      WHERE (trang_thai ILIKE 'active' OR status ILIKE 'active')
      ORDER BY id_maid DESC
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
