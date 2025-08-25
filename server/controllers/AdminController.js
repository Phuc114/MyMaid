// controller/AdminController.js
const pool = require("../config/db"); // adjust path to your db connection

const AdminController = {
	async getDashboardStats(req, res) {
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
	},

	async getRevenueChart(req, res) {
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
	},

	async getServiceRevenue(req, res) {
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

};

module.exports = AdminController;
