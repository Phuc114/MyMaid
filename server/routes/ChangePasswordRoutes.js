// routes/ChangePasswordRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { changePassword } = require('../controllers/ChangePasswordController');

router.put('/change-password', authenticate, changePassword);

module.exports = router;
