const pool = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, mat_khau } = req.body;

  try {
    const tables = ['khach_hang', 'maid', 'admin'];

    for (let table of tables) {
      const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];

        // So sánh mật khẩu
        if (mat_khau === user.mat_khau) {
          const idField =
            table === 'khach_hang' ? 'id_khach_hang' :
            table === 'maid' ? 'id_maid' : 'id_admin';

          const token = jwt.sign(
            { id: user[idField], role: table, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
          );

          return res.json({
            success: true,
            token,
            role: table,
            user
          });
        }
      }
    }

    // Nếu không khớp
    res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};
