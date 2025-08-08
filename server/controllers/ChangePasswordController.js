// controllers/ChangePasswordController.js
const pool = require('../config/db');

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  console.log("✅ REQ.USER:", req.user); // Kiểm tra xem middleware gửi gì lên

  let tableName, idColumn;
  if (role === 'khach_hang') {
    tableName = 'khach_hang';
    idColumn = 'id_khach_hang';
  } else if (role === 'maid') {
    tableName = 'maid';
    idColumn = 'id_maid';
  } else if (role === 'admin') {
    tableName = 'admin';
    idColumn = 'id_admin';
  } else {
    return res.status(400).json({ message: 'Vai trò không hợp lệ' });
  }

  try {
    const result = await pool.query(
      `SELECT mat_khau FROM ${tableName} WHERE ${idColumn} = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.log("❌ Không tìm thấy user trong DB");
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const currentPassword = result.rows[0].mat_khau;

    if (oldPassword !== currentPassword) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    await pool.query(
      `UPDATE ${tableName} SET mat_khau = $1 WHERE ${idColumn} = $2`,
      [newPassword, userId]
    );

    console.log("✅ Đổi mật khẩu thành công");
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('❌ Lỗi đổi mật khẩu:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
