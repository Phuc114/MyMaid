// app.js
const express = require('express');
require('dotenv').config();
require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const changePasswordRoutes = require('./routes/ChangePasswordRoutes');
const orderRoutes = require('./routes/orderRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const customers = require('./routes/customers');
const adminRoutes = require("./routes/Admin");

const app = express();

/**
 * ===================== CORS (thủ công, không tạo route) =====================
 * - Không dùng app.options(...). Trả preflight trực tiếp trong middleware.
 * - Hợp với credentials và Express 5 (path-to-regexp v6).
 */
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_ORIGIN);
  res.header('Vary', 'Origin'); // để tránh cache sai khi Origin thay đổi
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // preflight OK, KHÔNG đăng ký route nào cả
  }
  next();
});

// Body parser
app.use(express.json());

// Mount routes (KHÔNG dùng pattern '*' hay '(.*)' ở đâu nữa)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', serviceRoutes);
app.use('/api', changePasswordRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customers);
app.use("/api/admin", adminRoutes);
// Health check
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

// Global error handler (kể cả lỗi từ multer fileFilter)
app.use((err, req, res, next) => {
  if (err && err.message) {
    console.error('GLOBAL ERROR:', err);
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

app.use('/api/auth/forgot', forgotPasswordRoutes);

// Phòng khi có lỗi chưa bắt khiến process thoát mà không có log
process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION:', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION:', e));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
