// server/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const svc = require('../controllers/serviceController');

// Mount đúng chuẩn dưới /api/services
router.get('/', svc.getAllCategories);          // GET /api/services
router.get('/grouped', svc.getCategoriesGrouped); // GET /api/services/grouped
router.get('/by-category/:id', svc.getServicesByCategory);

module.exports = router;
