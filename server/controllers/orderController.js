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

// Tạo đơn pending và trả về id_lich_dat (có lưu id_maid)
exports.createPending = async (req, res) => {
  try {
    const idKh = req.user?.id_khach_hang;
    if (!idKh) {
      return res.status(401).json({ message: 'Thiếu id_khach_hang trong token' });
    }

    const {
      id_dich_vu,     // BẮT BUỘC
      id_maid,        // BẮT BUỘC theo yêu cầu (nếu muốn OPTIONAL thì bỏ check ở dưới)
      id_dia_chi,     // BẮT BUỘC
      ngay_lam_viec,  // 'YYYY-MM-DD'  BẮT BUỘC
      gio_bat_dau,    // 'HH:mm'       BẮT BUỘC -> lưu vào cột gio_lam_viec
      ghi_chu,
      tong_tien       // BẮT BUỘC (FE tính = giá * số lượng)
    } = req.body || {};

    // Validate bắt buộc
    if (!id_dich_vu || !id_maid || !id_dia_chi || !ngay_lam_viec || !gio_bat_dau || !tong_tien) {
      return res.status(400).json({ message: 'Thiếu tham số bắt buộc' });
    }
    // Nếu muốn cho phép không chọn maid:
    // if (!id_dich_vu || !id_dia_chi || !ngay_lam_viec || !gio_bat_dau || !tong_tien) {
    //   return res.status(400).json({ message: 'Thiếu tham số bắt buộc' });
    // }

    const q = `
      INSERT INTO lich_dat (
        id_khach_hang, id_dich_vu, id_maid, id_dia_chi,
        thoi_gian_dat, ngay_lam_viec, gio_lam_viec,
        ghi_chu, tong_tien, trang_thai
      )
      VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7,$8,'pending')
      RETURNING id_lich_dat
    `;

    const params = [
      idKh,
      Number(id_dich_vu),
      Number(id_maid) || null,      // nếu chuyển sang OPTIONAL thì cho phép null ở đây
      Number(id_dia_chi),
      ngay_lam_viec,
      gio_bat_dau,
      ghi_chu ?? null,
      Number(tong_tien),
    ];

    const { rows } = await db.query(q, params);
    return res.json({ ok: true, id_lich_dat: rows[0].id_lich_dat });
  } catch (e) {
    console.error('createPending error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Gắn payment cho đơn pending (giữ API cũ: vẫn nhận orderId nhưng chỉ dùng nội bộ)
exports.attachOrderIdToPending = async (req, res) => {
  try {
    const idKh = req.user?.id_khach_hang;
    if (!idKh) return res.status(401).json({ message: 'Thiếu id_khach_hang trong token' });

    const { orderId, amount, id_lich_dat, method = 'MoMo' } = req.body || {};
    // orderId có thể là mã từ cổng thanh toán; DB không có cột lưu, nên chỉ dùng để log/trace

    // 1) Xác định đơn pending cần gắn
    let targetId = id_lich_dat;
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
        return res.status(404).json({ message: 'Không tìm thấy đơn pending để gắn thanh toán' });
      }
      targetId = pending.rows[0].id_lich_dat;
    }

    // 2) Tạo bản ghi trong bảng thanh_toan
    const payIns = await db.query(
      `INSERT INTO thanh_toan (phuong_thuc, so_tien, trang_thai)
       VALUES ($1, $2, 'pending')
       RETURNING id_thanh_toan`,
      [method, amount ?? 0]
    );
    const newPaymentId = payIns.rows[0].id_thanh_toan;

    // 3) Gắn payment vào lich_dat (và có thể cập nhật tong_tien)
    const upd = await db.query(
      `UPDATE lich_dat
          SET id_thanh_toan = $1,
              tong_tien     = COALESCE($2, tong_tien)
        WHERE id_lich_dat = $3
        RETURNING id_lich_dat, id_thanh_toan`,
      [newPaymentId, amount ?? null, targetId]
    );

    // 4) Trả về cho FE; nếu cần lưu orderId, FE tự lưu local hoặc log server
    return res.json({
      ok: true,
      id_lich_dat: upd.rows[0].id_lich_dat,
      id_thanh_toan: newPaymentId,
      // echo lại để FE hiển thị nếu muốn
      orderId
    });
  } catch (e) {
    console.error('attachOrderIdToPending error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

