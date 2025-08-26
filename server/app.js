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
const userRoutes = require('./routes/userRoutes');
// NEW
const homeRoutes = require('./routes/home.routes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

/** ============ CORS thủ công ============ */
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_ORIGIN);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Body parser
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api', changePasswordRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
// NEW
app.use('/api/home', homeRoutes);
app.use('/api/messages', messageRoutes);

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

app.use('/api/auth/forgot', forgotPasswordRoutes);

process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION:', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION:', e));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
