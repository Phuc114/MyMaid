// config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Đảm bảo các biến môi trường được tải

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Thêm kiểm tra để đảm bảo các biến môi trường tồn tại
if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Lỗi: Biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_KEY chưa được thiết lập trong file .env!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
