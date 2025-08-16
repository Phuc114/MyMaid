// controllers/authController.js
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// util gửi mail (đã có trong project của bạn)
const sendEmail = require('../utils/sendEmail'); // đảm bảo tồn tại utils/sendEmail.js

// ===== helpers =====
const genOTP = () => (Math.floor(1000 + Math.random() * 9000)).toString(); // 4 số
const OTP_TTL_MIN = 10; // OTP hết hạn sau 10 phút

// ===== Đăng ký: tạo user (nếu chưa có), sinh OTP, gửi qua email =====
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: 'Thiếu name/email/password' });
    }

    // có thể hash mật khẩu nếu muốn
    const rs = await pool.query('SELECT * FROM khach_hang WHERE email = $1', [email]);

    const otp = genOTP();
    const expires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000); // now + 10'
    const mailSubject = 'Mã xác minh MyMaid';
    const mailText = `Mã xác minh của bạn là: ${otp}. Mã có hiệu lực trong ${OTP_TTL_MIN} phút.`;

    if (rs.rowCount > 0) {
      const user = rs.rows[0];
      if (user.email_verified) {
        return res.status(409).json({ ok: false, message: 'Email đã tồn tại và đã xác minh.' });
      }
      // cập nhật lại thông tin tối thiểu + OTP mới
      await pool.query(
        `UPDATE khach_hang
         SET ho_ten = $1, mat_khau = $2, otp_code = $3, otp_expires = $4
         WHERE email = $5`,
        [name, password, otp, expires, email]
      );
      await sendEmail(email, mailSubject, mailText);
      return res.status(201).json({ ok: true, message: 'Đã gửi mã xác minh đến email.' });
    }

    // tạo mới user chưa verify
    await pool.query(
      `INSERT INTO khach_hang (ho_ten, email, mat_khau, email_verified, otp_code, otp_expires)
       VALUES ($1, $2, $3, false, $4, $5)`,
      [name, email, password, otp, expires]
    );
    await sendEmail(email, mailSubject, mailText);
    return res.status(201).json({ ok: true, message: 'Đăng ký thành công. Vui lòng xác minh email.' });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ ok: false, message: 'Lỗi server.' });
  }
};

// ===== Gửi lại OTP theo email =====
exports.requestVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, message: 'Thiếu email' });

    const rs = await pool.query('SELECT id_khach_hang, email_verified FROM khach_hang WHERE email = $1', [email]);
    if (rs.rowCount === 0) return res.status(404).json({ ok: false, message: 'Email chưa đăng ký' });
    if (rs.rows[0].email_verified) return res.status(200).json({ ok: true, message: 'Email đã xác minh.' });

    const otp = genOTP();
    const expires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
    await pool.query(
      `UPDATE khach_hang SET otp_code = $1, otp_expires = $2 WHERE email = $3`,
      [otp, expires, email]
    );

    await sendEmail(
      email,
      'Mã xác minh MyMaid',
      `Mã xác minh của bạn là: ${otp}. Mã có hiệu lực trong ${OTP_TTL_MIN} phút.`
    );

    res.json({ ok: true, message: 'Đã gửi lại mã xác minh.' });
  } catch (err) {
    console.error('requestVerifyEmail error:', err);
    res.status(500).json({ ok: false, message: 'Lỗi server.' });
  }
};

// ===== Xác minh email bằng OTP (4 số) =====
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ ok: false, message: 'Thiếu email hoặc mã OTP' });

    const rs = await pool.query(
      'SELECT otp_code, otp_expires FROM khach_hang WHERE email = $1',
      [email]
    );
    if (rs.rowCount === 0) return res.status(404).json({ ok: false, message: 'Email không tồn tại' });

    const { otp_code, otp_expires } = rs.rows[0];
    if (!otp_code || !otp_expires) return res.status(400).json({ ok: false, message: 'Chưa yêu cầu mã OTP' });

    if (otp_code !== code) return res.status(400).json({ ok: false, message: 'Mã OTP không đúng' });
    if (new Date(otp_expires).getTime() < Date.now()) {
      return res.status(400).json({ ok: false, message: 'Mã OTP đã hết hạn' });
    }

    await pool.query(
      `UPDATE khach_hang
       SET email_verified = true, otp_code = NULL, otp_expires = NULL
       WHERE email = $1`,
      [email]
    );

    res.json({ ok: true, message: 'Xác minh email thành công.' });
  } catch (err) {
    console.error('verifyEmail error:', err);
    res.status(500).json({ ok: false, message: 'Lỗi server.' });
  }
};

// ===== Hoàn tất hồ sơ (tùy chọn) – nếu muốn finalize qua auth thay vì profile =====
exports.registerFinalize = async (req, res) => {
  try {
    const { email, ho_ten, so_dien_thoai, ngay_sinh, anh_ho_so_url } = req.body || {};
    if (!email || !so_dien_thoai) return res.status(400).json({ ok: false, message: 'Thiếu email hoặc số điện thoại' });

    const rs = await pool.query('SELECT email_verified FROM khach_hang WHERE email = $1', [email]);
    if (rs.rowCount === 0) return res.status(404).json({ ok: false, message: 'Không tìm thấy người dùng' });
    if (!rs.rows[0].email_verified) {
      return res.status(403).json({ ok: false, message: 'Email chưa xác minh' });
    }

    await pool.query(
      `UPDATE khach_hang
       SET ho_ten = COALESCE($2, ho_ten),
           so_dien_thoai = $3,
           ngay_sinh = $4,
           anh_ho_so_url = COALESCE($5, anh_ho_so_url)
       WHERE email = $1`,
      [email, ho_ten || null, so_dien_thoai, ngay_sinh || null, anh_ho_so_url || null]
    );

    res.json({ ok: true, message: 'Đã hoàn tất hồ sơ.' });
  } catch (err) {
    console.error('registerFinalize error:', err);
    res.status(500).json({ ok: false, message: 'Lỗi server.' });
  }
};

// ===== Đăng nhập (giữ logic nhiều bảng) – chặn KH chưa verify =====
exports.login = async (req, res) => {
  const { email, mat_khau } = req.body;

  try {
    const tables = ['khach_hang', 'maid', 'admin'];

    for (let table of tables) {
      const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];

        // So sánh mật khẩu (plain-text theo code gốc của bạn)
        if (mat_khau === user.mat_khau) {
          // Chặn KH chưa verify
          if (table === 'khach_hang' && !user.email_verified) {
            return res.status(403).json({ success: false, message: 'Vui lòng xác minh email trước khi đăng nhập.' });
          }

          const idField =
            table === 'khach_hang' ? 'id_khach_hang' :
            table === 'maid' ? 'id_maid' : 'id_admin';

          const token = jwt.sign(
            { id: user[idField], role: table, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
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

    res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

// ===== NEW: kiểm tra trùng email =====
exports.checkEmail = async (req, res) => {
  try {
    const emailRaw = (req.query.email || req.body?.email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRaw) return res.status(400).json({ message: 'Thiếu email' });
    if (!emailRegex.test(emailRaw)) return res.status(400).json({ message: 'Email không hợp lệ' });

    // dùng pool.query thay vì db.query
    const rs = await pool.query('SELECT 1 FROM khach_hang WHERE email = $1 LIMIT 1', [emailRaw]);
    return res.json({ exists: rs.rowCount > 0 });
  } catch (e) {
    console.error('checkEmail error:', e);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
