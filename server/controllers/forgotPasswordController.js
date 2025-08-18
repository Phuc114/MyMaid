// server/controllers/forgotPasswordController.js
const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

const OTP_TTL_MIN = 5; // OTP hết hạn sau 5 phút
const genOTP = () => (Math.floor(1000 + Math.random() * 9000)).toString(); // 4 số

// POST /api/auth/forgot/request-otp
exports.requestOtp = async (req, res) => {
  try {
    const emailRaw = req.body?.email || '';
    const email = emailRaw.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Thiếu email' });

    const u = await pool.query(
      'SELECT id_khach_hang FROM khach_hang WHERE email = $1',
      [email]
    );
    if (u.rowCount === 0) return res.status(404).json({ message: 'Email không tồn tại' });

    const otp = genOTP();
    const expires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    await pool.query(
      `UPDATE khach_hang
          SET otp_code = $1,
              otp_expires = $2
        WHERE email = $3`,
      [otp, expires, email]
    );

    await sendEmail(
      email,
      'Mã OTP đặt lại mật khẩu',
      `Mã OTP của bạn là: ${otp}. Hiệu lực trong ${OTP_TTL_MIN} phút.`
    );

    return res.json({ message: 'OTP sent' });
  } catch (e) {
    console.error('requestOtp error:', e);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/auth/forgot/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const emailRaw = req.body?.email || '';
    const otpRaw = req.body?.otp || '';
    const email = emailRaw.trim().toLowerCase();
    const otp = otpRaw.trim();
    if (!email || !otp) return res.status(400).json({ message: 'Thiếu email/otp' });

    const r = await pool.query(
      `SELECT otp_code, otp_expires
         FROM khach_hang
        WHERE email = $1`,
      [email]
    );
    if (r.rowCount === 0) return res.status(404).json({ message: 'Email không tồn tại' });

    const row = r.rows[0];
    if (!row.otp_code) return res.status(400).json({ message: 'Chưa yêu cầu OTP' });
    if (row.otp_code !== otp) return res.status(400).json({ message: 'OTP không đúng' });
    if (new Date(row.otp_expires) < new Date()) return res.status(400).json({ message: 'OTP đã hết hạn' });

    // đánh dấu đã xác minh bằng cách xóa mã
    await pool.query(
      `UPDATE khach_hang
          SET otp_code = NULL
        WHERE email = $1`,
      [email]
    );

    return res.json({ message: 'OTP verified' });
  } catch (e) {
    console.error('verifyOtp error:', e);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/auth/forgot/reset
exports.resetPassword = async (req, res) => {
  try {
    const emailRaw = req.body?.email || '';
    const newPassword = req.body?.newPassword || '';
    const email = emailRaw.trim().toLowerCase();

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Thiếu email/mật khẩu mới' });
    }

    // chỉ cho reset khi đã verify OTP (otp_code đã null)
    const chk = await pool.query(
      `SELECT 1
         FROM khach_hang
        WHERE email = $1
          AND otp_code IS NULL
          AND otp_expires IS NOT NULL
        LIMIT 1`,
      [email]
    );
    if (chk.rowCount === 0) {
      return res.status(400).json({ message: 'Chưa xác minh OTP' });
    }

    // KHÔNG HASH – lưu plain text theo yêu cầu
    await pool.query(
      `UPDATE khach_hang
          SET mat_khau = $1,
              otp_expires = NULL
        WHERE email = $2`,
      [newPassword, email]
    );

    return res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (e) {
    console.error('resetPassword error:', e);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
