const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateProfileWithAvatar,   // NEW
  getAvatarUrl               // NEW (tiện cho FE lấy avatar)
} = require('../controllers/profileController');

// ===== Avatar + update profile (NEW) =====
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.mimetype);
    cb(ok ? null : new Error('Chỉ hỗ trợ jpg/png/webp'), ok);
  }
});

// Lấy URL avatar theo email (public/signed) — dùng để render khi load trang
router.get('/avatar', getAvatarUrl);

// Cập nhật thông tin + (tùy chọn) avatar
router.put('/update-with-avatar', upload.single('avatar'), updateProfileWithAvatar);

// ===== Route cũ giữ nguyên =====
router.post('/', getProfile);             // lấy thông tin
router.put('/update', updateProfile);     // cập nhật thông tin (không kèm file)

module.exports = router;
