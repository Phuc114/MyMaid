// controllers/userController.js
// Lấy thông tin user (tên + avatar + phone + dob) cho Header/Profile
const pool = require("../config/db");

/**
 * GET /api/user/me
 * Yêu cầu middleware auth gắn req.user (có id hoặc id_khach_hang)
 */
exports.getMe = async (req, res) => {
  try {
    const userId =
      req.user?.id_khach_hang ||
      req.user?.id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `SELECT id_khach_hang, ho_ten, email, anh_ho_so_url, so_dien_thoai, ngay_sinh
       FROM khach_hang
       WHERE id_khach_hang = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const row = result.rows[0];
    const name = row.ho_ten || (row.email ? row.email.split("@")[0] : "Người dùng");

    return res.json({
      id: row.id_khach_hang,
      name,
      ho_ten: row.ho_ten || name,                // alias cho FE cũ
      email: row.email,
      avatarUrl: row.anh_ho_so_url || null,
      so_dien_thoai: row.so_dien_thoai || "",
      phone: row.so_dien_thoai || "",
      ngay_sinh: row.ngay_sinh || null
    });
  } catch (e) {
    console.error("getMe error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};
