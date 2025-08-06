const express = require('express');
const cors = require('cors');
require('dotenv').config();         // Đọc biến môi trường từ .env
require('./config/db');             // Kết nối PostgreSQL

const authRoutes = require('./routes/authRoutes'); 
const profileRoutes = require('./routes/profileRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Thêm route đăng nhập
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
