const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateProfileWithAvatar,
  getAvatarUrl,
} = require('../controllers/profileController');

// Multer để nhận file avatar (buffer upload lên Supabase)
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file) return cb(null, true);
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.mimetype);
    cb(ok ? null : new Error('Chỉ hỗ trợ jpg/png/webp'), ok);
  },
});

// LẤY AVATAR (public/signed URL)
if (typeof getAvatarUrl === 'function') {
  router.get('/avatar', getAvatarUrl);
}

// CẬP NHẬT THÔNG TIN + (tùy chọn) AVATAR
if (typeof updateProfileWithAvatar === 'function') {
  router.put('/update-with-avatar', upload.single('avatar'), updateProfileWithAvatar);
}

// LẤY PROFILE (không kèm file)
if (typeof getProfile === 'function') {
  router.post('/', getProfile);
}

// CẬP NHẬT PROFILE (không kèm file)
if (typeof updateProfile === 'function') {
  router.put('/update', updateProfile);
}

module.exports = router;
