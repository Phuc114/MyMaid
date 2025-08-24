// controllers/categoryAdminController.js
const db = require('../config/db');

// Lấy tất cả danh mục dịch vụ
const getAllCategories = async (req, res) => {
    // ✅ DEBUG: In ra khi có yêu cầu
    console.log('[DEBUG] Nhận yêu cầu GET /api/admin/categories');
    try {
        const query = `
            SELECT 
                dm.id_danh_muc, 
                dm.ten_danh_muc, 
                dm.anh_minh_hoa, 
                dm.mo_ta,
                COUNT(dv.id_dich_vu) AS so_luong_dich_vu
            FROM danh_muc_dich_vu dm
            LEFT JOIN dich_vu dv ON dm.id_danh_muc = dv.id_danh_muc
            GROUP BY dm.id_danh_muc
            ORDER BY dm.id_danh_muc ASC`;
        const { rows } = await db.query(query);
        
        // ✅ DEBUG: In ra số lượng danh mục tìm thấy
        console.log(`[DEBUG] Tìm thấy ${rows.length} danh mục.`);
        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy tất cả dịch vụ thuộc một danh mục cụ thể
const getServicesByCategoryId = async (req, res) => {
    const { categoryId } = req.params;
    // ✅ DEBUG: In ra ID danh mục đang được yêu cầu
    console.log(`[DEBUG] Nhận yêu cầu GET /api/admin/categories/${categoryId}/services`);
    try {
        const query = 'SELECT * FROM dich_vu WHERE id_danh_muc = $1 ORDER BY id_dich_vu ASC';
        const { rows } = await db.query(query, [categoryId]);
        
        // ✅ DEBUG: In ra số lượng dịch vụ tìm thấy
        console.log(`[DEBUG] Tìm thấy ${rows.length} dịch vụ cho danh mục ID ${categoryId}.`);
        res.json(rows);
    } catch (error) {
        console.error(`Lỗi khi lấy dịch vụ cho danh mục ID ${categoryId}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = {
    getAllCategories,
    getServicesByCategoryId,
};
