// controllers/profileController.js
const db = require('../config/db');

// ==== Supabase client (NEW) ====
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const BUCKET = process.env.SUPABASE_BUCKET || 'avatars';

// ====== HÀM CŨ GIỮ NGUYÊN ======
exports.getProfile = async (req, res) => {
  const { email, mat_khau } = req.body;

  try {
    const result = await db.query('SELECT * FROM khach_hang WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }

    const user = result.rows[0];

    if (mat_khau !== user.mat_khau) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    res.json({
      ho_ten: user.ho_ten,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai,
      ngay_sinh: user.ngay_sinh,
    });
  } catch (err) {
    console.error('Lỗi lấy profile:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateProfile = async (req, res) => {
  const { email, ho_ten, so_dien_thoai, ngay_sinh, oldEmail } = req.body;

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    const query = `
      UPDATE khach_hang
      SET ho_ten = $1, email = $2, so_dien_thoai = $3, ngay_sinh = $4
      WHERE email = $5
    `;

    await db.query(query, [ho_ten, email, so_dien_thoai, ngay_sinh, oldEmail]);

    res.json({ ho_ten, email, so_dien_thoai, ngay_sinh });
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};

// ====== NEW: trả URL avatar theo email (public hoặc signed) ======
exports.getAvatarUrl = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Thiếu email' });

    const rs = await db.query('SELECT anh_ho_so_url FROM khach_hang WHERE email = $1', [email]);
    if (rs.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });

    const stored = rs.rows[0].anh_ho_so_url;
    if (!stored) return res.json({ url: null });

    // Nếu đã là URL http(s) → bucket public
    if (/^https?:\/\//i.test(stored)) return res.json({ url: stored });

    // Ngược lại là đường dẫn trong bucket private → tạo signed URL 10'
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(stored, 60 * 10);
    if (error) return res.status(500).json({ message: 'Tạo signed URL thất bại' });
    return res.json({ url: data.signedUrl });
  } catch (e) {
    console.error('getAvatarUrl lỗi:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ====== NEW: cập nhật profile + (tùy chọn) upload avatar ======
exports.updateProfileWithAvatar = async (req, res) => {
  try {
    // Lấy field text từ multipart/form-data
    const { email, ho_ten, so_dien_thoai, ngay_sinh, oldEmail } = req.body;

    // Validate email format nhanh
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Tìm id_khach_hang theo oldEmail (user hiện tại)
    const u = await db.query('SELECT id_khach_hang FROM khach_hang WHERE email = $1', [oldEmail]);
    if (u.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });
    const id = u.rows[0].id_khach_hang;

    let avatarUrlToSave = null;

    // Nếu có file avatar, upload lên Supabase Storage
    if (req.file) {
      const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `users/${id}/avatar_${id}_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
      if (upErr) {
        console.error(upErr);
        return res.status(500).json({ message: 'Upload ảnh thất bại' });
      }

      // Nếu bucket public → có publicURL; nếu private → lưu path
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      avatarUrlToSave = pub?.publicUrl || filePath;
    }

    // Cập nhật DB (có hoặc không có avatar)
    if (avatarUrlToSave) {
      await db.query(
        `UPDATE khach_hang
         SET ho_ten = $1, email = $2, so_dien_thoai = $3, ngay_sinh = $4, anh_ho_so_url = $5
         WHERE email = $6`,
        [ho_ten, email, so_dien_thoai, ngay_sinh || null, avatarUrlToSave, oldEmail]
      );
    } else {
      await db.query(
        `UPDATE khach_hang
         SET ho_ten = $1, email = $2, so_dien_thoai = $3, ngay_sinh = $4
         WHERE email = $5`,
        [ho_ten, email, so_dien_thoai, ngay_sinh || null, oldEmail]
      );
    }

    // Trả về dữ liệu mới (không ép FE đổi cấu trúc cũ)
    const rs = await db.query('SELECT ho_ten, email, so_dien_thoai, ngay_sinh, anh_ho_so_url FROM khach_hang WHERE email = $1', [email]);
    const row = rs.rows[0];

    return res.json({
      ho_ten: row.ho_ten,
      email: row.email,
      so_dien_thoai: row.so_dien_thoai,
      ngay_sinh: row.ngay_sinh,
      anh_ho_so_url: row.anh_ho_so_url
    });
  } catch (e) {
    console.error('updateProfileWithAvatar lỗi:', e);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};
