// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const { getMe } = require("../controllers/userController");

// ⬇️ Dùng đúng path + đúng export
const verifyToken = require("../middleware/authMiddleware");

router.get("/me", verifyToken, getMe);

module.exports = router;
