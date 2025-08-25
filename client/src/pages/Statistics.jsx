import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line,
  PieChart, Pie, Cell,
} from "recharts";
import HeaderAdmin from '../components/HeaderAdmin';
import "./Statistics.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FFBB28"];

const Statistics = () => {
  const [period, setPeriod] = useState("month");
  const [chartData, setChartData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [popularService, setPopularService] = useState({ service: "N/A", revenue: 0 });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/revenue-chart?period=${period}`);
        const data = await res.json();
        setChartData(data);
      } catch (err) {
        console.error("Failed to fetch revenue chart:", err);
      }
    };
    fetchRevenue();
  }, [period]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/admin/service-revenue`)
      .then(res => res.json())
      .then(data => {
		const normalized = data.map(item => ({
			...item,
			revenue: Number(item.revenue)   // ✅ ensure numeric
		}));
		setServiceData(normalized);

		if (normalized.length > 0) {
			setPopularService({ 
			service: normalized[0].category, 
			revenue: normalized[0].revenue 
			});
		}
	  })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="statistics-container">
      <HeaderAdmin />
      <h2>Thống kê</h2>

      {/* Picker */}
      <div className="picker">
        <button onClick={() => setPeriod("month")} className={period==="month" ? "active-btn" : ""}>Tháng</button>
        <button onClick={() => setPeriod("quarter")} className={period==="quarter" ? "active-btn" : ""}>Quý</button>
        <button onClick={() => setPeriod("year")} className={period==="year" ? "active-btn" : ""}>Năm</button>
      </div>

      {/* Revenue Line Chart */}
      <div className="chart-block">
        <h3>Doanh thu ({period})</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" interval={0} angle={-30} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Doanh thu" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Service Revenue Pie Chart */}
      <div className="chart-block">
        <h3>Dịch vụ phổ biến: {popularService.service}</h3>
        <h3>Doanh thu: {popularService.revenue} đ</h3>
        <ResponsiveContainer width="100%" height={500}>
          <PieChart>
            <Pie
              data={serviceData}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {serviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistics;
