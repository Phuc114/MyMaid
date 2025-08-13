// controllers/orderController.js
const db = require('../config/db');

exports.getOrderHistory = async (req, res) => {
  const idKh = req.user?.id_khach_hang; // lấy từ token decode
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
