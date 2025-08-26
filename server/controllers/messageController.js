// controllers/messageController.js
const db = require('../config/db');

exports.createMessage = async (req, res) => {
  try {
    const { ho_ten = '', email = '', loai_dich_vu = '', ghi_chu = '' } = req.body || {};

    if (!ho_ten.trim() || !email.trim() || !loai_dich_vu.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên, email và loại dịch vụ.' });
    }

    const sql = `
      INSERT INTO tin_nhan (ho_ten, email, loai_dich_vu, ghi_chu)
      VALUES ($1, $2, $3, $4)
      RETURNING id_tin_nhan
    `;
    const vals = [ho_ten.trim(), email.trim(), loai_dich_vu.trim(), ghi_chu || null];

    const { rows } = await db.query(sql, vals);

    return res.status(201).json({
      message: 'Đã gửi tin nhắn thành công!',
      id_tin_nhan: rows?.[0]?.id_tin_nhan,
    });
  } catch (err) {
    console.error('createMessage error:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại sau.' });
  }
};
