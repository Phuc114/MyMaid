// server/controllers/home.controller.js
// Dùng pool từ config/db.js của bạn
const pool = require("../config/db");

const normalizeUrl = (u) => (typeof u === "string" && u.trim() ? u : null);

const HomeController = {
  // GET /api/home/services?limit=3
  // Lấy 3 danh mục "thịnh hành" theo số lần đặt (lich_dat -> dich_vu -> danh_muc_dich_vu)
  async popularServices(req, res) {
    const client = await pool.connect();
    try {
      const limit = Number(req.query.limit || 3);
      const sql = `
        SELECT
          dm.id_danh_muc,
          dm.ten_danh_muc,
          dm.anh_minh_hoa,
          dm.mo_ta,
          COUNT(ld.id_lich_dat) AS so_lan_dat
        FROM danh_muc_dich_vu dm
        LEFT JOIN dich_vu dv ON dv.id_danh_muc = dm.id_danh_muc
        LEFT JOIN lich_dat ld ON ld.id_dich_vu = dv.id_dich_vu
        GROUP BY dm.id_danh_muc
        ORDER BY so_lan_dat DESC NULLS LAST, dm.id_danh_muc ASC
        LIMIT $1;
      `;
      const { rows } = await client.query(sql, [limit]);

      res.json(
        rows.map((r) => ({
          id: r.id_danh_muc,
          title: r.ten_danh_muc,
          desc: r.mo_ta || "",
          icon: normalizeUrl(r.anh_minh_hoa) || "/images/placeholder.png",
          booked_count: Number(r.so_lan_dat || 0),
        }))
      );
    } catch (err) {
      console.error("popularServices error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      client.release();
    }
  },

  // GET /api/home/maids?limit=4
  // Lấy maid nổi bật theo điểm TB
  async topMaids(req, res) {
    const client = await pool.connect();
    try {
      const limit = Number(req.query.limit || 4);
      const sql = `
        SELECT
          m.id_maid,
          m.ho_ten,
          COALESCE(m.vai_tro, 'Cleaner') AS vai_tro,
          COALESCE(m.diem_danh_gia_tb, 0) AS rating,
          m.anh_ho_so_url
        FROM maid m
        WHERE m.trang_thai = 'active'
        ORDER BY rating DESC, m.id_maid ASC
        LIMIT $1;
      `;
      const { rows } = await client.query(sql, [limit]);

      res.json(
        rows.map((r) => ({
          id: r.id_maid,
          name: r.ho_ten,
          role: r.vai_tro || "Cleaner",
          avatar: normalizeUrl(r.anh_ho_so_url) || "/images/avatar-placeholder.png",
          rating: Number(r.rating || 0),
        }))
      );
    } catch (err) {
      console.error("topMaids error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      client.release();
    }
  },

  // GET /api/home/testimonials?limit=6
  // Lấy đánh giá: tên + avatar KH & nội dung + số sao
  async testimonials(req, res) {
    const client = await pool.connect();
    try {
      const limit = Number(req.query.limit || 6);
      const sql = `
        SELECT
          dg.id_danh_gia AS id,
          kh.ho_ten      AS name,
          kh.anh_ho_so_url AS avatar,
          dg.binh_luan   AS comment,
          dg.so_sao      AS rating,
          dg.ngay_danh_gia
        FROM danh_gia dg
        JOIN khach_hang kh ON kh.id_khach_hang = dg.id_khach_hang
        ORDER BY dg.ngay_danh_gia DESC, dg.id_danh_gia DESC
        LIMIT $1;
      `;
      const { rows } = await client.query(sql, [limit]);

      res.json(
        rows.map((r) => ({
          id: r.id,
          name: r.name || "Khách hàng",
          avatar: normalizeUrl(r.avatar) || "/images/avatar-placeholder.png",
          comment: r.comment || "",
          rating: Number(r.rating || 5),
          created_at: r.ngay_danh_gia,
        }))
      );
    } catch (err) {
      console.error("testimonials error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      client.release();
    }
  },
};

module.exports = HomeController;