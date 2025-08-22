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

			if (period === "week") {
			query = `
				WITH days AS (
				SELECT generate_series(date_trunc('week', CURRENT_DATE),
										date_trunc('week', CURRENT_DATE) + interval '6 days',
										'1 day')::date AS d
				)
				SELECT TO_CHAR(d, 'Dy') AS label,
					COALESCE(SUM(ld.tong_tien), 0) AS "Doanh thu"
				FROM days
				LEFT JOIN lich_dat ld ON ld.ngay_lam_viec = d AND ld.trang_thai='completed'
				GROUP BY d
				ORDER BY d;
			`;
			} else if (period === "month") {
			query = `
				WITH days AS (
				SELECT generate_series(date_trunc('month', CURRENT_DATE),
										(date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
										'1 day')::date AS d
				)
				SELECT TO_CHAR(d, 'DD') AS label,
					COALESCE(SUM(ld.tong_tien), 0) AS "Doanh thu"
				FROM days
				LEFT JOIN lich_dat ld ON ld.ngay_lam_viec = d AND ld.trang_thai='completed'
				GROUP BY d
				ORDER BY d;
			`;
			} else { // year
			query = `
				WITH months AS (
				SELECT generate_series(date_trunc('year', CURRENT_DATE),
										date_trunc('year', CURRENT_DATE) + interval '11 months',
										'1 month')::date AS d
				)
				SELECT TO_CHAR(d, 'Mon') AS label,
					COALESCE(SUM(ld.tong_tien), 0) AS "Doanh thu"
				FROM months
				LEFT JOIN lich_dat ld
				ON date_trunc('month', ld.ngay_lam_viec) = d
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

};

module.exports = AdminController;
