// routes/categoryAdminRoutes.js
const express = require('express');
const router = express.Router();

const {
    getAllCategories,
    getServicesByCategoryId,
} = require('../controllers/categoryAdminController');

// Route để lấy tất cả danh mục
router.get('/', getAllCategories);

// Route để lấy tất cả dịch vụ trong một danh mục
router.get('/:categoryId/services', getServicesByCategoryId);

module.exports = router;
