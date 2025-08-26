// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { createMessage } = require('../controllers/messageController');

// POST /api/messages
router.post('/', createMessage);

module.exports = router;
