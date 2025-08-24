// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // chính là file bạn gửi
const { getOrderHistory } = require('../controllers/orderController');

// GET /api/orders/history?page=&pageSize=
// Yêu cầu header: Authorization: Bearer <token>
router.get('/history', verifyToken, getOrderHistory);

module.exports = router;
