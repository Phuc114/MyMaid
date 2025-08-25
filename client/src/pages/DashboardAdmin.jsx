import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line,
} from "recharts";
import HeaderAdmin from '../components/HeaderAdmin';
import "./DashboardAdmin.css";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [period, setPeriod] = useState("month"); // default view

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/dashboard");
        const data = await res.json();
        setStats({
          popularService: data.popularService,
          revenue: data.revenue,
          orders: data.orders,
          users: data.users,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/revenue-chart?period=${period}`);
        const data = await res.json();
        setRevenueData(data);
      } catch (err) {
        console.error("Failed to fetch revenue chart:", err);
      }
    };
    fetchRevenue();
  }, [period]);

  return (
    <div className="dashboard-container">
      <HeaderAdmin />

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-block">
          <h3 className="kpi-title">Dịch vụ phổ biến</h3>
          <p className="kpi-value">{stats.popularService || "N/A"}</p>
        </div>
        <div className="kpi-block">
          <h3 className="kpi-title">Doanh thu</h3>
          <p className="kpi-value">{stats.revenue || 0} đ</p>
        </div>
        <div className="kpi-block">
          <h3 className="kpi-title">Đơn hàng</h3>
          <p className="kpi-value">{stats.orders || 0}</p>
        </div>
        <div className="kpi-block">
          <h3 className="kpi-title">Người dùng</h3>
          <p className="kpi-value">{stats.users || 0}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="kpi-block" style={{ marginTop: "2rem" }}>
        <h3 className="kpi-title">Doanh thu</h3>

        {/* Picker buttons */}
        <div style={{ marginBottom: "1rem" }}>
			<button onClick={() => setPeriod("month")} className={period==="month" ? "active-btn" : ""}>Tháng</button>
			<button onClick={() => setPeriod("quarter")} className={period==="quarter" ? "active-btn" : ""}>Quý</button>
			<button onClick={() => setPeriod("year")} className={period==="year" ? "active-btn" : ""}>Năm</button>
		</div>

        <ResponsiveContainer width="100%" height={300}>
			<LineChart data={revenueData}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis 
				dataKey="label" 
				interval={0}   // show all 12
				angle={-30} 
				textAnchor="end" 
				/>
				<YAxis />
				<Tooltip />
				<Legend />
				<Line 
				type="monotone" 
				dataKey="Doanh thu" 
				stroke="#8884d8" 
				strokeWidth={2} 
				/>
			</LineChart>
		</ResponsiveContainer>

      </div>
    </div>
  );
};

export default DashboardAdmin;
