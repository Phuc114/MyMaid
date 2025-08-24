// controllers/profileController.js
const db = require('../config/db');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const BUCKET = process.env.SUPABASE_BUCKET || 'avatars';

// ========== GET PROFILE ==========
exports.getProfile = async (req, res) => {
  try {
    const { email, mat_khau } = req.body;
    const result = await db.query(
      `SELECT ho_ten, email, so_dien_thoai, ngay_sinh, anh_ho_so_url, mat_khau
         FROM khach_hang
        WHERE email = $1`,
      [email]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Email không tồn tại' });

    const user = result.rows[0];
    if (mat_khau && mat_khau !== user.mat_khau) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    res.json({
      ho_ten: user.ho_ten,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai,
      ngay_sinh: user.ngay_sinh,
      anh_ho_so_url: user.anh_ho_so_url || null,
    });
  } catch (err) {
    console.error('Lỗi lấy profile:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ========== UPDATE PROFILE (không kèm file) ==========
exports.updateProfile = async (req, res) => {
  try {
    const { email, ho_ten, so_dien_thoai, ngay_sinh, oldEmail } = req.body;

    const lookupEmail = (oldEmail && oldEmail.trim()) || (email && email.trim());
    if (!lookupEmail) return res.status(400).json({ message: 'Thiếu email' });

    // Lấy id theo email hiện tại trong DB (oldEmail nếu có)
    const u = await db.query('SELECT id_khach_hang FROM khach_hang WHERE email = $1', [lookupEmail]);
    if (u.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });
    const id = u.rows[0].id_khach_hang;

    // Nếu FE gửi email mới thì cập nhật; nếu không thì giữ nguyên
    await db.query(
      `UPDATE khach_hang
          SET ho_ten = $1,
              email = COALESCE($2, email),
              so_dien_thoai = $3,
              ngay_sinh = $4
        WHERE id_khach_hang = $5`,
      [ho_ten, email || null, so_dien_thoai, ngay_sinh || null, id]
    );

    const rs = await db.query(
      `SELECT ho_ten, email, so_dien_thoai, ngay_sinh, anh_ho_so_url
         FROM khach_hang
        WHERE id_khach_hang = $1`,
      [id]
    );
    res.json(rs.rows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};

// ========== LẤY URL AVATAR ==========
exports.getAvatarUrl = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Thiếu email' });

    const rs = await db.query('SELECT anh_ho_so_url FROM khach_hang WHERE email = $1', [email]);
    if (rs.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });

    const stored = rs.rows[0].anh_ho_so_url;
    if (!stored) return res.json({ url: null });

    // Nếu đã là URL public thì trả thẳng
    if (/^https?:\/\//i.test(stored)) return res.json({ url: stored });

    // Nếu là đường dẫn trong bucket private -> tạo signed URL
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(stored, 60 * 10);
    if (error) return res.status(500).json({ message: 'Tạo signed URL thất bại' });
    return res.json({ url: data.signedUrl });
  } catch (e) {
    console.error('getAvatarUrl lỗi:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ========== UPDATE PROFILE + (TÙY CHỌN) AVATAR ==========
exports.updateProfileWithAvatar = async (req, res) => {
  try {
    const { email, ho_ten, so_dien_thoai, ngay_sinh, oldEmail } = req.body;

    // Email để tra user hiện tại trong DB (ưu tiên oldEmail)
    const lookupEmail = (oldEmail && oldEmail.trim()) || (email && email.trim());
    if (!lookupEmail) return res.status(400).json({ message: 'Thiếu email' });

    // Email mới (nếu FE muốn đổi)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Lấy id user theo lookupEmail
    const u = await db.query('SELECT id_khach_hang FROM khach_hang WHERE email = $1', [lookupEmail]);
    if (u.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });
    const id = u.rows[0].id_khach_hang;

    // Upload avatar lên Supabase nếu có file
    let avatarUrlToSave = null;
    if (req.file) {
      const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `users/${id}/avatar_${id}_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });
      if (upErr) {
        console.error(upErr);
        return res.status(500).json({ message: 'Upload ảnh thất bại' });
      }

      // Bucket public -> publicUrl; private -> lưu path
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      avatarUrlToSave = pub?.publicUrl || filePath;
    }

    // Cập nhật theo id (không dùng WHERE email)
    if (avatarUrlToSave) {
      await db.query(
        `UPDATE khach_hang
            SET ho_ten = $1,
                email = COALESCE($2, email),
                so_dien_thoai = $3,
                ngay_sinh = $4,
                anh_ho_so_url = $5
          WHERE id_khach_hang = $6`,
        [ho_ten, email || null, so_dien_thoai, ngay_sinh || null, avatarUrlToSave, id]
      );
    } else {
      await db.query(
        `UPDATE khach_hang
            SET ho_ten = $1,
                email = COALESCE($2, email),
                so_dien_thoai = $3,
                ngay_sinh = $4
          WHERE id_khach_hang = $5`,
        [ho_ten, email || null, so_dien_thoai, ngay_sinh || null, id]
      );
    }

    // Trả về dữ liệu mới
    const rs = await db.query(
      `SELECT ho_ten, email, so_dien_thoai, ngay_sinh, anh_ho_so_url
         FROM khach_hang
        WHERE id_khach_hang = $1`,
      [id]
    );
    return res.json(rs.rows[0]);
  } catch (e) {
    console.error('updateProfileWithAvatar lỗi:', e);
    res.status(500).json({ message: 'Lỗi server khi cập nhật!' });
  }
};
