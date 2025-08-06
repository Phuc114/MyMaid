const pool = require('../config/db');

const getIdColumn = (role) => {
  switch (role) {
    case 'khach_hang': return 'id_khach_hang';
    case 'maid': return 'id_maid';
    case 'admin': return 'id_admin';
    default: throw new Error('Vai trò không hợp lệ');
  }
};

exports.getProfile = async (req, res) => {
  const { id, role } = req.user;

  try {
    const idCol = getIdColumn(role);
    const result = await pool.query(`SELECT * FROM ${role} WHERE ${idCol} = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy hồ sơ' });
  }
};

exports.updateProfile = async (req, res) => {
  const { id, role } = req.user;
  const { ho_ten, email, so_dien_thoai, ngay_sinh } = req.body;

  try {
    const idCol = getIdColumn(role);
    const query = `
      UPDATE ${role}
      SET ho_ten = $1, email = $2, so_dien_thoai = $3, ngay_sinh = $4
      WHERE ${idCol} = $5
      RETURNING *
    `;
    const values = [ho_ten, email, so_dien_thoai, ngay_sinh, id];
    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ' });
  }
};
