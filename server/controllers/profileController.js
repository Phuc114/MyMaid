// controllers/profileController.js
const db = require('../config/db');

exports.getProfile = async (req, res) => {
  const { email, mat_khau } = req.body;

  try {
    const result = await db.query('SELECT * FROM khach_hang WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    const user = result.rows[0];

    if (mat_khau !== user.mat_khau) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    res.json({
      ho_ten: user.ho_ten,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai,
      ngay_sinh: user.ngay_sinh,
    });
  } catch (err) {
    console.error('Lỗi lấy profile:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Cập nhật và trả về lại profile mới
exports.updateProfile = async (req, res) => {
  const { email, ho_ten, so_dien_thoai, ngay_sinh, oldEmail } = req.body;

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    const query = `
      UPDATE khach_hang
      SET ho_ten = $1, email = $2, so_dien_thoai = $3, ngay_sinh = $4
      WHERE email = $5
    `;

    await db.query(query, [ho_ten, email, so_dien_thoai, ngay_sinh, oldEmail]);

    // ✅ Trả về lại dữ liệu mới
    res.json({
      ho_ten,
      email,
      so_dien_thoai,
      ngay_sinh,
    });
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};
