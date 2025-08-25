// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Lấy middleware (default export là function)
const requireAuth = require('../middleware/authMiddleware');

// Controller
const orderController = require('../controllers/orderController');

// Lịch sử đơn
router.get('/history', requireAuth, orderController.getOrderHistory);

// Gán ma_don_hang (orderId) cho đơn pending mới nhất của user
router.post('/attach-order-id', requireAuth, orderController.attachOrderIdToPending);

// thêm route tạo đơn pending
router.post('/create-pending', requireAuth, orderController.createPending);


module.exports = router;
