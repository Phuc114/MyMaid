// controller/AdminController.js
const pool = require("../config/db"); // adjust path to your db connection


async function getDashboardStats(req, res) {
try {
	// popular service by most bookings
	const popularService = await pool.query(`
	SELECT dv.ten_dich_vu, COUNT(ld.id_dich_vu) as total
	FROM lich_dat ld
	JOIN dich_vu dv ON ld.id_dich_vu = dv.id_dich_vu
	GROUP BY dv.ten_dich_vu
	ORDER BY total DESC
	LIMIT 1;
	`);

	// total revenue
	const revenue = await pool.query(`
	SELECT COALESCE(SUM(tong_tien),0) as total_revenue
	FROM lich_dat
	WHERE trang_thai = 'completed';
	`);

	// total orders
	const orders = await pool.query(`SELECT COUNT(*) FROM lich_dat;`);

	// total users
	const users = await pool.query(`SELECT COUNT(*) FROM khach_hang;`);

	// revenue by month (example last 6 months)
	const revenueByMonth = await pool.query(`
	SELECT TO_CHAR(ngay_lam_viec, 'Mon') AS month,
			SUM(tong_tien) AS revenue
	FROM lich_dat
	WHERE trang_thai = 'completed'
	GROUP BY TO_CHAR(ngay_lam_viec, 'Mon'), EXTRACT(MONTH FROM ngay_lam_viec)
	ORDER BY EXTRACT(MONTH FROM ngay_lam_viec);
	`);

	res.json({
	popularService: popularService.rows[0]?.ten_dich_vu || "N/A",
	revenue: revenue.rows[0].total_revenue,
	orders: orders.rows[0].count,
	users: users.rows[0].count,
	revenueByMonth: revenueByMonth.rows,
	});
} catch (err) {
	console.error(err);
	res.status(500).json({ error: "Internal Server Error" });
}
}

async function getRevenueChart(req, res) {
	try {
		const { period } = req.query;
		let query;

		if (period === "month") {
		query = `
			WITH months AS (
			SELECT generate_series(
				date_trunc('month', CURRENT_DATE) - interval '11 months',
				date_trunc('month', CURRENT_DATE),
				'1 month'
			)::date AS d
			)
			SELECT TO_CHAR(d, 'Mon YYYY') AS label,
				COALESCE(SUM(ld.tong_tien), 0) AS "Doanh thu"
			FROM months
			LEFT JOIN lich_dat ld
			ON date_trunc('month', ld.ngay_lam_viec) = d
			AND ld.trang_thai='completed'
			GROUP BY d
			ORDER BY d;
		`;
		} else if (period === "quarter") {
		query = `
			WITH quarters AS (
			SELECT generate_series(
				date_trunc('quarter', CURRENT_DATE) - interval '33 months',
				date_trunc('quarter', CURRENT_DATE),
				'3 months'
			)::date AS d
			)
			SELECT 'Q' || EXTRACT(quarter FROM d)::int || ' ' || EXTRACT(year FROM d)::int AS label,
				COALESCE(SUM(ld.tong_tien), 0) AS "Doanh thu"
			FROM quarters
			LEFT JOIN lich_dat ld
			ON date_trunc('quarter', ld.ngay_lam_viec) = d
			AND ld.trang_thai='completed'
			GROUP BY d
			ORDER BY d;
		`;
		} else { // year
		query = `
			WITH years AS (
			SELECT generate_series(
				date_trunc('year', CURRENT_DATE) - interval '11 years',
				date_trunc('year', CURRENT_DATE),
				'1 year'
			)::date AS d
			)
			SELECT EXTRACT(year FROM d)::int AS label,
				COALESCE(SUM(ld.tong_tien), 0) AS "Doanh thu"
			FROM years
			LEFT JOIN lich_dat ld
			ON date_trunc('year', ld.ngay_lam_viec) = d
			AND ld.trang_thai='completed'
			GROUP BY d
			ORDER BY d;
		`;
		}

		const result = await pool.query(query);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal Server Error" });
	}
}

async function getServiceRevenue(req, res) {
	try {
	const result = await pool.query(`
		SELECT dm.ten_danh_muc AS category,
			COALESCE(SUM(ld.tong_tien), 0) AS revenue
		FROM danh_muc_dich_vu dm
		LEFT JOIN dich_vu dv ON dv.id_danh_muc = dm.id_danh_muc
		LEFT JOIN lich_dat ld 
			ON dv.id_dich_vu = ld.id_dich_vu 
		AND ld.trang_thai = 'completed'
		GROUP BY dm.ten_danh_muc
		ORDER BY revenue DESC;
	`);
	res.json(result.rows);
	} catch (err) {
	console.error(err);
	res.status(500).json({ error: "Internal Server Error" });
	}
}

// -------------------- Service CRUD -------------------- //
async function getAllServices(req, res) {
  try {
    const result = await db.query(`
      SELECT dv.*, dm.ten_danh_muc 
      FROM dich_vu dv 
      LEFT JOIN danh_muc dm ON dv.id_danh_muc = dm.id_danh_muc 
      ORDER BY dv.id_dich_vu ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

async function createService(req, res) {
  try {
    const { ten_dich_vu, gia, id_danh_muc, mo_ta, anh_minh_hoa } = req.body;
    const result = await db.query(
      `INSERT INTO dich_vu (ten_dich_vu, gia, id_danh_muc, mo_ta, anh_minh_hoa) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ten_dich_vu, gia, id_danh_muc, mo_ta, anh_minh_hoa]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { ten_dich_vu, gia, id_danh_muc, mo_ta, anh_minh_hoa } = req.body;
    const result = await db.query(
      `UPDATE dich_vu 
       SET ten_dich_vu=$1, gia=$2, id_danh_muc=$3, mo_ta=$4, anh_minh_hoa=$5 
       WHERE id_dich_vu=$6 RETURNING *`,
      [ten_dich_vu, gia, id_danh_muc, mo_ta, anh_minh_hoa, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

async function updateServiceStatus(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;
    const result = await db.query(
      "UPDATE dich_vu SET trang_thai=$1 WHERE id_dich_vu=$2 RETURNING *",
      [trang_thai, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating service status:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

async function deleteService(req, res) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM dich_vu WHERE id_dich_vu=$1", [id]);
    res.json({ message: "Dịch vụ đã được xóa thành công" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT dv.*, dm.ten_danh_muc 
      FROM dich_vu dv 
      LEFT JOIN danh_muc dm ON dv.id_danh_muc = dm.id_danh_muc 
      WHERE dv.id_dich_vu=$1
    `, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching service by ID:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

async function getCategoryList(req, res) {
  try {
    const result = await db.query("SELECT * FROM danh_muc ORDER BY id_danh_muc ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

// -------------------- Customer Management -------------------- //
async function getAllCustomers(req, res) {
  try {
    const { search, sort } = req.query;
    
    let query = `
      SELECT kh.*, COUNT(dh.id_don_hang) AS so_don_hang
      FROM khach_hang kh
      LEFT JOIN don_hang dh ON kh.id_khach_hang = dh.id_khach_hang
    `;
    let params = [];
    let paramCount = 0;

    // Add search filter if provided
    if (search) {
      paramCount++;
      query += ` WHERE 
        kh.ho_ten ILIKE $${paramCount} OR 
        kh.email ILIKE $${paramCount} OR 
        kh.so_dien_thoai ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    query += ' GROUP BY kh.id_khach_hang';

    // Add sorting
    if (sort === 'oldest') {
      query += ' ORDER BY kh.ngay_tao ASC';
    } else {
      query += ' ORDER BY kh.ngay_tao DESC'; // default: newest
    }
    
    const { rows } = await db.query(query, params);
    res.json(rows);
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
}

async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT kh.*, 
             COUNT(dh.id_don_hang) AS so_don_hang,
             SUM(tt.tong_tien) AS tong_chi_tieu
      FROM khach_hang kh
      LEFT JOIN don_hang dh ON kh.id_khach_hang = dh.id_khach_hang
      LEFT JOIN thanh_toan tt ON dh.id_don_hang = tt.id_don_hang
      WHERE kh.id_khach_hang = $1
      GROUP BY kh.id_khach_hang
    `, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching customer by ID:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
}

// -------------------- Exports -------------------- //
module.exports = {
  getDashboardStats,
  getRevenueChart,
  getServiceRevenue,
  getAllServices,
  createService,
  updateService,
  updateServiceStatus,
  deleteService,
  getServiceById,
  getCategoryList,
  getAllCustomers,
  getCustomerById
};
