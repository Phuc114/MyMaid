// server/controllers/orderController.js
const db = require('../config/db');

// ===== Lịch sử đơn =====
exports.getOrderHistory = async (req, res) => {
  const idKh = req.user?.id_khach_hang; // từ token
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);
  const offset = (page - 1) * pageSize;

  if (!idKh) return res.status(401).json({ message: 'Thiếu id_khach_hang trong token' });

  try {
    const sql = `
      SELECT
        ld.id_lich_dat,
        dv.ten_dich_vu,
        ld.ngay_lam_viec,
        ld.gio_lam_viec,
        ld.ghi_chu,
        ld.tong_tien,
        ld.trang_thai,
        dc.dia_chi_day_du,
        llv.gio_ket_thuc,
        (CASE
          WHEN llv.gio_bat_dau IS NOT NULL AND llv.gio_ket_thuc IS NOT NULL
          THEN EXTRACT(EPOCH FROM (llv.gio_ket_thuc - llv.gio_bat_dau))/3600
          ELSE NULL
        END) AS so_gio
      FROM lich_dat ld
      JOIN dich_vu dv ON dv.id_dich_vu = ld.id_dich_vu
      JOIN dia_chi_da_luu dc ON dc.id_dia_chi = ld.id_dia_chi
      LEFT JOIN lich_lam_viec llv
        ON llv.id_maid = ld.id_maid
       AND llv.ngay_lam = ld.ngay_lam_viec
       AND llv.gio_bat_dau = ld.gio_lam_viec
      WHERE ld.id_khach_hang = $1
      ORDER BY ld.ngay_lam_viec DESC, ld.gio_lam_viec DESC
      LIMIT $2 OFFSET $3
    `;
    const countSql = `SELECT COUNT(*)::int AS total FROM lich_dat WHERE id_khach_hang = $1`;

    const [list, cnt] = await Promise.all([
      db.query(sql, [idKh, pageSize, offset]),
      db.query(countSql, [idKh]),
    ]);

    res.json({
      data: list.rows.map(r => ({
        id: r.id_lich_dat,
        serviceName: r.ten_dich_vu,
        date: r.ngay_lam_viec,
        startTime: r.gio_lam_viec,
        endTime: r.gio_ket_thuc,
        hours: r.so_gio,
        address: r.dia_chi_day_du,
        note: r.ghi_chu,
        amount: r.tong_tien,
        status: r.trang_thai,
      })),
      page,
      pageSize,
      total: cnt.rows[0].total,
    });
  } catch (err) {
    console.error('Lỗi lấy lịch sử đơn:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo một đơn pending và trả về id_lich_dat
exports.createPending = async (req, res) => {
  try {
    const idKh = req.user?.id_khach_hang;
    if (!idKh) return res.status(401).json({ message: 'Thiếu id_khach_hang trong token' });

    const {
      id_dich_vu,
      id_dia_chi,
      ngay_lam_viec, // 'YYYY-MM-DD'
      gio_bat_dau,   // 'HH:mm'
      ghi_chu,
      tong_tien
    } = req.body || {};

    if (!id_dich_vu || !id_dia_chi || !ngay_lam_viec || !gio_bat_dau || !tong_tien) {
      return res.status(400).json({
        message: 'Thiếu dữ liệu: id_dich_vu, id_dia_chi, ngay_lam_viec, gio_bat_dau, tong_tien'
      });
    }

    const q = `
      INSERT INTO lich_dat (
        id_khach_hang, id_dich_vu, id_dia_chi,
        thoi_gian_dat, ngay_lam_viec, gio_lam_viec,
        ghi_chu, tong_tien, trang_thai
      )
      VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,'pending')
      RETURNING id_lich_dat
    `;
    const { rows } = await db.query(q, [
      idKh, id_dich_vu, id_dia_chi,
      ngay_lam_viec, gio_bat_dau,
      ghi_chu ?? null, tong_tien
    ]);

    return res.json({ ok: true, id_lich_dat: rows[0].id_lich_dat });
  } catch (e) {
    console.error('createPending error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};


// ===== Gắn orderId (ma_don_hang) cho đơn pending =====
// Body: { orderId: string, amount?: number, id_lich_dat?: number }
exports.attachOrderIdToPending = async (req, res) => {
  try {
    const idKh = req.user?.id_khach_hang;
    if (!idKh) return res.status(401).json({ message: 'Thiếu id_khach_hang trong token' });

    const { orderId, amount, id_lich_dat } = req.body || {};
    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    let targetId = id_lich_dat;

    // Nếu client không gửi id_lich_dat thì lấy đơn pending mới nhất
    if (!targetId) {
      const pending = await db.query(
        `SELECT id_lich_dat
           FROM lich_dat
          WHERE id_khach_hang = $1 AND trang_thai = 'pending'
          ORDER BY id_lich_dat DESC
          LIMIT 1`,
        [idKh]
      );
      if (!pending.rows.length) {
        return res.status(404).json({ message: 'Không tìm thấy đơn pending để gắn orderId' });
      }
      targetId = pending.rows[0].id_lich_dat;
    } else {
      // Bảo vệ: kiểm tra id_lich_dat có thuộc user & còn hợp lệ
      const chk = await db.query(
        `SELECT 1 FROM lich_dat
          WHERE id_lich_dat = $1 AND id_khach_hang = $2
            AND trang_thai IN ('pending','created','draft')`,
        [targetId, idKh]
      );
      if (!chk.rows.length) {
        return res.status(404).json({ message: 'Đơn không hợp lệ để gắn orderId' });
      }
    }

    try {
      const upd = await db.query(
        `UPDATE lich_dat
            SET ma_don_hang = $1,
                tong_tien   = COALESCE($2, tong_tien)
          WHERE id_lich_dat = $3
          RETURNING id_lich_dat, ma_don_hang`,
        [orderId, amount ?? null, targetId]
      );
      return res.json({ ok: true, id_lich_dat: upd.rows[0].id_lich_dat, orderId });
    } catch (uerr) {
      // Nếu DB chưa có cột ma_don_hang thì báo lỗi "thiếu cột"
      if (uerr?.code === '42703') {
        return res.status(409).json({
          message: "Thiếu cột 'ma_don_hang' trong bảng lich_dat. Hãy chạy lệnh SQL để thêm cột trước khi gắn orderId."
        });
      }
      throw uerr;
    }
  } catch (e) {
    console.error('attachOrderIdToPending error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};
