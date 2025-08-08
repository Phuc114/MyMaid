const express = require('express');
const cors = require('cors');
require('dotenv').config();         // Đọc biến môi trường từ .env
require('./config/db');             // Kết nối PostgreSQL

const authRoutes = require('./routes/authRoutes'); 
const profileRoutes = require('./routes/profileRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const changePasswordRoutes = require('./routes/ChangePasswordRoutes');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', serviceRoutes);
app.use('/api', changePasswordRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
