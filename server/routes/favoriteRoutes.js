// server/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');

// Lấy id_khach_hang từ token
async function getUserId(req) {
  const idKh = req.user?.id_khach_hang || req.user?.id || null;
  if (!idKh) throw new Error('Thiếu id_khach_hang trong token');
  return Number(idKh);
}

/* ====================== SERVICES ====================== */

// [GET] Danh sách dịch vụ yêu thích của user
router.get('/services', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    const sql = `
      SELECT dv.id_dich_vu,
             dv.ten_dich_vu,
             dv.gia_co_ban,
             dv.mo_ta AS don_vi      -- alias để FE dùng đúng field
      FROM dich_vu_yeu_thich yt
      JOIN dich_vu dv ON dv.id_dich_vu = yt.id_dich_vu
      WHERE yt.id_khach_hang = $1
      ORDER BY dv.id_dich_vu DESC
    `;
    const { rows } = await db.query(sql, [idKh]);
    res.json(rows);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// [DELETE] Bỏ thích 1 dịch vụ
router.delete('/services/:serviceId', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    await db.query(
      `DELETE FROM dich_vu_yeu_thich WHERE id_khach_hang=$1 AND id_dich_vu=$2`,
      [idKh, Number(req.params.serviceId)]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// [GET] Trạng thái yêu thích 1 dịch vụ
router.get('/services/:serviceId/status', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    const { rows } = await db.query(
      `SELECT 1 FROM dich_vu_yeu_thich WHERE id_khach_hang=$1 AND id_dich_vu=$2 LIMIT 1`,
      [idKh, Number(req.params.serviceId)]
    );
    res.json({ favorite: rows.length > 0 });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// [POST] Toggle yêu thích dịch vụ
router.post('/services/:serviceId/toggle', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    const idDv = Number(req.params.serviceId);
    const chk = await db.query(
      `SELECT 1 FROM dich_vu_yeu_thich WHERE id_khach_hang=$1 AND id_dich_vu=$2`,
      [idKh, idDv]
    );
    if (chk.rowCount > 0) {
      await db.query(
        `DELETE FROM dich_vu_yeu_thich WHERE id_khach_hang=$1 AND id_dich_vu=$2`,
        [idKh, idDv]
      );
      return res.json({ favorite: false });
    } else {
      await db.query(
        `INSERT INTO dich_vu_yeu_thich (id_khach_hang, id_dich_vu)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [idKh, idDv]
      );
      return res.json({ favorite: true });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

/* ====================== MAIDS ====================== */

// [GET] Danh sách maid yêu thích của user
router.get('/maids', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    const sql = `
      SELECT m.id_maid,
             m.ho_ten,
             m.tieu_su       AS mo_ta,         -- alias FE
             m.anh_ho_so_url AS anh_dai_dien   -- alias FE
      FROM maid_yeu_thich yt
      JOIN maid m ON m.id_maid = yt.id_maid
      WHERE yt.id_khach_hang = $1
      ORDER BY m.id_maid DESC
    `;
    const { rows } = await db.query(sql, [idKh]);
    res.json(rows);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// [DELETE] Bỏ thích 1 maid
router.delete('/maids/:maidId', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    await db.query(
      `DELETE FROM maid_yeu_thich WHERE id_khach_hang=$1 AND id_maid=$2`,
      [idKh, Number(req.params.maidId)]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// [GET] Trạng thái yêu thích 1 maid
router.get('/maids/:maidId/status', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    const { rows } = await db.query(
      `SELECT 1 FROM maid_yeu_thich WHERE id_khach_hang=$1 AND id_maid=$2 LIMIT 1`,
      [idKh, Number(req.params.maidId)]
    );
    res.json({ favorite: rows.length > 0 });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// [POST] Toggle yêu thích maid
router.post('/maids/:maidId/toggle', verifyToken, async (req, res) => {
  try {
    const idKh = await getUserId(req);
    const idMaid = Number(req.params.maidId);
    const chk = await db.query(
      `SELECT 1 FROM maid_yeu_thich WHERE id_khach_hang=$1 AND id_maid=$2`,
      [idKh, idMaid]
    );
    if (chk.rowCount > 0) {
      await db.query(
        `DELETE FROM maid_yeu_thich WHERE id_khach_hang=$1 AND id_maid=$2`,
        [idKh, idMaid]
      );
      return res.json({ favorite: false });
    } else {
      await db.query(
        `INSERT INTO maid_yeu_thich (id_khach_hang, id_maid)
         VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [idKh, idMaid]
      );
      return res.json({ favorite: true });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
