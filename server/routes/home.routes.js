// server/routes/home.routes.js
const express = require("express");
const HomeController = require("../controllers/home.controller");

const router = express.Router();

router.get("/services", HomeController.popularServices);
router.get("/maids", HomeController.topMaids);
router.get("/testimonials", HomeController.testimonials);

module.exports = router;
