// routes/adminServiceRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // ✅ Import multer

// Cấu hình multer để lưu file trong bộ nhớ tạm
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    getAllServices, createService, updateService,
    updateServiceStatus, deleteService, getServiceById,
    uploadServiceImage // ✅ Import hàm mới
} = require('../controllers/adminServiceController');
router.get('/categories', getCategoryList);
// ... các routes cũ ...
router.get('/', getAllServices);
router.post('/', createService);

// ✅ THÊM ROUTE MỚI ĐỂ UPLOAD ẢNH
// Route này sẽ nhận file từ form có tên là 'serviceImage'
router.post('/upload', upload.single('serviceImage'), uploadServiceImage);

router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.put('/:id/status', updateServiceStatus);
router.delete('/:id', deleteService);

module.exports = router;
