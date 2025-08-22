const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Đăng ký → gửi OTP
router.post('/register', auth.register);

// Gửi lại OTP (đúng tên hàm trong controller là requestVerifyEmail)
router.post('/request-verify-email', auth.requestVerifyEmail);

// Xác minh email bằng OTP
router.post('/verify-email', auth.verifyEmail);

// Đăng nhập
router.post('/login', auth.login);

// Kiểm tra trùng email (realtime check)
router.get('/check-email', auth.checkEmail);

module.exports = router;


// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. check in admin table
    const adminResult = await pool.query(
      "SELECT * FROM admin WHERE email=$1 AND mat_khau=$2 AND trang_thai='active'",
      [email, password]
    );

    if (adminResult.rows.length > 0) {
      return res.json({ success: true, role: "admin" });
    }

    // 2. fallback: check in users table (if you have one)
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND mat_khau=$2",
      [email, password]
    );

    if (userResult.rows.length > 0) {
      return res.json({ success: true, role: "user" });
    }

    res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;