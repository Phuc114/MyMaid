// server/controllers/favoriteController.js
const pool = require('../config/db');

/** Lấy id_khach_hang từ req.user (đã qua verifyToken) */
function getCustomerId(req) {
  const u = req.user || {};
  return u.id_khach_hang || u.id || null;
}

/** ======== SERVICES ======== */

// GET /api/favorites/services
exports.getFavServices = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });

    const q = `
      SELECT s.id_dich_vu, s.ten_dich_vu, s.gia_co_ban, s.don_vi
      FROM dich_vu_yeu_thich f
      JOIN dich_vu s ON s.id_dich_vu = f.id_dich_vu
      WHERE f.id_khach_hang = $1
      ORDER BY s.id_dich_vu DESC
    `;
    const { rows } = await pool.query(q, [idKH]);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// POST /api/favorites/services/:id  (add)
exports.addFavService = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    const idDV = Number(req.params.id);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (!idDV) return res.status(400).json({ message: 'Thiếu id dịch vụ' });

    await pool.query(
      `INSERT INTO dich_vu_yeu_thich (id_khach_hang, id_dich_vu)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [idKH, idDV]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// DELETE /api/favorites/services/:id  (remove)
exports.removeFavService = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    const idDV = Number(req.params.id);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });

    await pool.query(
      `DELETE FROM dich_vu_yeu_thich WHERE id_khach_hang=$1 AND id_dich_vu=$2`,
      [idKH, idDV]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// GET /api/favorites/services/:id  (check exists)
exports.isFavService = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    const idDV = Number(req.params.id);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });

    const { rows } = await pool.query(
      `SELECT 1 FROM dich_vu_yeu_thich WHERE id_khach_hang=$1 AND id_dich_vu=$2`,
      [idKH, idDV]
    );
    return res.json({ favorite: rows.length > 0 });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/** ======== MAIDS ======== */

// GET /api/favorites/maids
exports.getFavMaids = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });

    const q = `
      SELECT m.id_maid, m.ho_ten, m.anh_dai_dien, m.mo_ta
      FROM maid_yeu_thich f
      JOIN maid m ON m.id_maid = f.id_maid
      WHERE f.id_khach_hang = $1
      ORDER BY m.id_maid DESC
    `;
    const { rows } = await pool.query(q, [idKH]);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// POST /api/favorites/maids/:id
exports.addFavMaid = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    const idM = Number(req.params.id);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });

    await pool.query(
      `INSERT INTO maid_yeu_thich (id_khach_hang, id_maid)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [idKH, idM]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// DELETE /api/favorites/maids/:id
exports.removeFavMaid = async (req, res) => {
  try {
    const idKH = getCustomerId(req);
    const idM = Number(req.params.id);
    if (!idKH) return res.status(401).json({ message: 'Chưa đăng nhập' });

    await pool.query(
      `DELETE FROM maid_yeu_thich WHERE id_khach_hang=$1 AND id_maid=$2`,
      [idKH, idM]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
