const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Đăng ký → gửi OTP
router.post('/register', auth.register);

// Gửi lại OTP
router.post('/request-verify-email', auth.requestVerifyEmail);

// Xác minh email bằng OTP
router.post('/verify-email', auth.verifyEmail);

// Đăng nhập
router.post('/login', auth.login);

// Kiểm tra trùng email
router.get('/check-email', auth.checkEmail);

// 🚑 Sửa ở đây: dùng auth thay vì ctrl
router.post('/abandon', auth.abandonRegistration);

module.exports = router;
