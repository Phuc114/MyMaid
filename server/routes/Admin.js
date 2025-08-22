// routes/Admin.js
const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");

router.get("/dashboard", AdminController.getDashboardStats);
router.get("/revenue-chart", AdminController.getRevenueChart);

module.exports = router;
