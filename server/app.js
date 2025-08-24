// app.js
const express = require('express');
require('dotenv').config();
require('./config/db');

// ===== 1. GOM TẤT CẢ CÁC ROUTES VÀO ĐÂY =====
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const serviceRoutes = require('./routes/serviceRoutes'); // Route cho người dùng xem dịch vụ
const changePasswordRoutes = require('./routes/ChangePasswordRoutes');
const orderRoutes = require('./routes/orderRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const userRoutes = require('./routes/userRoutes');
const adminServiceRoutes = require('./routes/adminServiceRoutes'); // Route cho admin quản lý dịch vụ
const categoryAdminRoutes = require('./routes/categoryAdminRoutes'); // ✅ Import route mới

const app = express();

// ===== 2. CÀI ĐẶT CORS =====
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', CLIENT_ORIGIN);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Body parser
app.use(express.json());

// ===== 3. GÁN CÁC ROUTES VÀO CÁC ĐƯỜNG DẪN API =====
app.use('/api/auth', authRoutes);
app.use('/api/auth/forgot', forgotPasswordRoutes); // Gộp chung vào nhóm auth
app.use('/api/profile', profileRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api', changePasswordRoutes);

// Gán route cho admin
app.use('/api/admin/services', adminServiceRoutes);
app.use('/api/admin/categories', categoryAdminRoutes); // Thêm route mới

// Health check
app.get('/', (req, res) => {
    res.send('Hello from Node.js backend!');
});

// Global error handler
app.use((err, req, res, next) => {
    if (err && err.message) {
        console.error('GLOBAL ERROR:', err);
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

// Process error handlers
process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION:', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION:', e));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
