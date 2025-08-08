const db = require('../config/db');

exports.getAllServices = async (req, res) => {
  try {
    const result = await db.query('SELECT ten_danh_muc FROM danh_muc_dich_vu');
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi truy vấn danh mục dịch vụ:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách dịch vụ' });
  }
};
