const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');

router.post('/', getProfile);             // lấy thông tin
router.put('/update', updateProfile);     // cập nhật thông tin

module.exports = router;
