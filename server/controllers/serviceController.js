// controllers/serviceController.js
const db = require('../config/db');

/**
 * GET /api/services
 * Trả danh sách phẳng các danh mục kèm thông tin phân loại
 */
exports.getAllCategories = async (req, res) => {
  try {
    const rs = await db.query(`
      SELECT
        d.id_danh_muc,
        d.ten_danh_muc,
        d.anh_minh_hoa,
        d.mo_ta,
        d.id_phan_loai,
        p.ten_phan_loai,
        p.anh_minh_hoa  AS anh_phan_loai,
        p.mo_ta         AS mo_ta_phan_loai
      FROM danh_muc_dich_vu d
      JOIN phan_loai_dich_vu p ON d.id_phan_loai = p.id_phan_loai
      ORDER BY d.id_danh_muc
    `);
    res.json(rs.rows);
  } catch (err) {
    console.error('getAllCategories error:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh mục' });
  }
};


/**
 * GET /api/services/grouped
 * Nhóm danh mục theo TÊN PHÂN LOẠI (p.ten_phan_loai)
 * Trả về:
 * {
 *   "Vệ sinh tổng quát": [{ id_danh_muc, ten_danh_muc, anh_minh_hoa, mo_ta }, ...],
 *   ...
 * }
 */
exports.getCategoriesGrouped = async (req, res) => {
  try {
    const rs = await db.query(`
      SELECT
        p.ten_phan_loai,
        json_agg(
          json_build_object(
            'id_danh_muc', d.id_danh_muc,
            'ten_danh_muc', d.ten_danh_muc,
            'anh_minh_hoa', d.anh_minh_hoa,
            'mo_ta', d.mo_ta
          )
          ORDER BY d.id_danh_muc
        ) AS danh_muc,
        MIN(d.id_danh_muc) AS min_id
      FROM danh_muc_dich_vu d
      JOIN phan_loai_dich_vu p ON d.id_phan_loai = p.id_phan_loai
      GROUP BY p.ten_phan_loai
      ORDER BY min_id
    `);

    const grouped = {};
    for (const row of rs.rows) {
      grouped[row.ten_phan_loai] = row.danh_muc;
    }
    res.json(grouped);
  } catch (err) {
    console.error('getCategoriesGrouped error:', err);
    res.status(500).json({ error: 'Lỗi server khi nhóm danh mục' });
  }
};

exports.getServicesByCategory = async (req, res) => {
  try {
    const idDanhMuc = Number(req.params.id);
    if (!idDanhMuc) return res.status(400).json({ message: 'Thiếu id danh mục' });

    const q = `
      SELECT id_dich_vu, ten_dich_vu, mo_ta AS don_vi, gia_co_ban
      FROM dich_vu
      WHERE id_danh_muc = $1
      ORDER BY ten_dich_vu ASC
    `;
    const { rows } = await db.query(q, [idDanhMuc]);
    return res.json(rows);
  } catch (e) {
    console.error('getServicesByCategory error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};