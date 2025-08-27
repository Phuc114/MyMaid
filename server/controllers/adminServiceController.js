// controllers/adminServiceController.js
const db = require('../config/db');
const supabase = require('../config/supabase'); // ✅ Import supabase client

// 1. LẤY TẤT CẢ DỊCH VỤ
const getAllServices = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM dich_vu ORDER BY id_dich_vu ASC');
        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// 2. THÊM DỊCH VỤ MỚI
const createService = async (req, res) => {
    const { id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban, trang_thai, anh_minh_hoa } = req.body;
    if (!ten_dich_vu || !gia_co_ban || !id_danh_muc) {
        return res.status(400).json({ message: 'Tên dịch vụ, giá và danh mục là bắt buộc' });
    }
    try {
        const query = `
            INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban, trang_thai, anh_minh_hoa) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id_dich_vu`;
        const values = [id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban, trang_thai || 'active', anh_minh_hoa];
        const { rows } = await db.query(query, values);
        res.status(201).json({ id: rows[0].id_dich_vu, message: 'Thêm dịch vụ thành công' });
    } catch (error) {
        console.error('Lỗi khi thêm dịch vụ:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// 3. CẬP NHẬT (CHỈNH SỬA) DỊCH VỤ
const updateService = async (req, res) => {
    const { id } = req.params;
    const { id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban, anh_minh_hoa } = req.body;
    if (!ten_dich_vu || !gia_co_ban || !id_danh_muc) {
        return res.status(400).json({ message: 'Tên dịch vụ, giá và danh mục là bắt buộc' });
    }
    try {
        // --- BƯỚC SỬA LỖI: CHUYỂN ĐỔI GIÁ TIỀN ---
        // Xóa các dấu chấm và chuyển chuỗi thành số nguyên
        const numericPrice = parseInt(gia_co_ban.toString().replace(/\./g, ''), 10);
        // ------------------------------------------

        const query = `
            UPDATE dich_vu 
            SET id_danh_muc = $1, ten_dich_vu = $2, mo_ta = $3, gia_co_ban = $4, anh_minh_hoa = $5 
            WHERE id_dich_vu = $6`;
            
        // Sử dụng giá tiền đã được chuyển đổi (numericPrice)
        const values = [id_danh_muc, ten_dich_vu, mo_ta, numericPrice, anh_minh_hoa, id];
        
        const { rowCount } = await db.query(query, values);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ để cập nhật' });
        }
        res.json({ message: 'Cập nhật dịch vụ thành công' });
    } catch (error) {
        console.error(`Lỗi khi cập nhật dịch vụ ID ${id}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// 4. CẬP NHẬT TRẠNG THÁI DỊCH VỤ
const updateServiceStatus = async (req, res) => {
    // --- BƯỚC 1: KIỂM TRA DỮ LIỆU ĐẦU VÀO ---
    console.log('--- BẮT ĐẦU CẬP NHẬT TRẠNG THÁI DỊCH VỤ ---');
    
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`ID nhận từ URL (req.params.id): ${id} (Kiểu: ${typeof id})`);
    console.log(`Trạng thái nhận từ Body (req.body.status): ${status}`);

    if (!status || !['active', 'inactive'].includes(status)) {
        console.log('[LỖI] Trạng thái không hợp lệ.');
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    try {
        // --- BƯỚC 2: THỰC THI CÂU LỆNH UPDATE ---
        const query = 'UPDATE dich_vu SET trang_thai = $1 WHERE id_dich_vu = $2';
        
        console.log(`Đang thực thi: UPDATE dich_vu SET trang_thai = '${status}' WHERE id_dich_vu = ${id}`);
        const result = await db.query(query, [status, id]);

        // --- BƯỚC 3: KIỂM TRA KẾT QUẢ ---
        console.log('Số dòng đã được cập nhật (result.rowCount):', result.rowCount);

        if (result.rowCount === 0) {
            console.log(`[CẢNH BÁO] Không tìm thấy dịch vụ nào có ID = ${id} để cập nhật trạng thái.`);
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }
        
        console.log('--- CẬP NHẬT TRẠNG THÁI THÀNH CÔNG ---');
        res.json({ message: 'Cập nhật trạng thái thành công' });

    } catch (error) {
        console.error(`[LỖI NGHIÊM TRỌNG] Lỗi khi cập nhật trạng thái cho ID ${id}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// 5. XOÁ DỊCH VỤ
const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM dich_vu WHERE id_dich_vu = $1';
        const { rowCount } = await db.query(query, [id]);
        if (rowCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ để xoá' });
        }
        res.json({ message: 'Xoá dịch vụ thành công' });
    } catch (error)
    {
        console.error(`Lỗi khi xoá dịch vụ ID ${id}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

/**
 * LẤY THÔNG TIN CHI TIẾT CỦA MỘT DỊCH VỤ DỰA VÀO ID
 */
const getServiceById = async (req, res) => {
    const { id } = req.params;
    
    console.log(`[DEBUG] Đang tìm kiếm dịch vụ với ID: ${id}`);

    try {
        // ✅ SỬA LỖI Ở ĐÂY: Xóa và gõ lại chuỗi query
        const query = `
            SELECT dv.*, dm.ten_danh_muc 
            FROM dich_vu dv
            LEFT JOIN danh_muc_dich_vu dm ON dv.id_danh_muc = dm.id_danh_muc
            WHERE dv.id_dich_vu = $1`;
        
        const { rows, rowCount } = await db.query(query, [id]);

        console.log(`[DEBUG] Kết quả truy vấn: tìm thấy ${rowCount} dòng.`);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Lỗi khi lấy dịch vụ ID ${id}:`, error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// ✅ THÊM HÀM MỚI NÀY
// TẢI ẢNH DỊCH VỤ LÊN SUPABASE STORAGE
const uploadServiceImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không có file nào được tải lên.' });
    }

    const file = req.file;
    const fileName = `services/${Date.now()}-${file.originalname}`;
    const bucketName = process.env.SUPABASE_BUCKET || 'avatars';

    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            throw error;
        }

        // Lấy URL công khai của ảnh vừa tải lên
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        res.status(200).json({ imageUrl: publicUrlData.publicUrl });
    } catch (error) {
        console.error('Lỗi khi tải ảnh lên Supabase:', error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên.' });
    }
};

// ✅ THÊM HÀM MỚI NÀY VÀO CUỐI FILE
// LẤY DANH SÁCH TÊN DANH MỤC ĐỂ DÙNG TRONG FORM
const getCategoryList = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id_danh_muc, ten_danh_muc FROM danh_muc_dich_vu ORDER BY ten_danh_muc ASC');
        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// ✅ CẬP NHẬT LẠI PHẦN EXPORT
module.exports = {
    getAllServices,
    createService,
    updateService,
    updateServiceStatus,
    deleteService,
    getServiceById,
	uploadServiceImage,
    getCategoryList // Thêm hàm mới vào đây
};
