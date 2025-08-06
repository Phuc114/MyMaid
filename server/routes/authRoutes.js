const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ handler phải là hàm như thế này
router.post('/login', authController.login);

module.exports = router;
