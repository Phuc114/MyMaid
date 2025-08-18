// server/routes/forgotPasswordRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/forgotPasswordController');

// /api/auth/forgot/*
router.post('/request-otp', ctrl.requestOtp);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/reset', ctrl.resetPassword);

module.exports = router;
