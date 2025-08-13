const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) return res.status(401).json({ message: 'Token không tồn tại' });

  jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' });

    const normalized = { ...userInfo };
    if (!normalized.id_khach_hang && normalized.role === 'khach_hang' && normalized.id) {
      normalized.id_khach_hang = normalized.id;
    }

    req.user = normalized;
    next();
  });
};

module.exports = verifyToken;
