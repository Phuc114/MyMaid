import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderAdmin from '../components/HeaderAdmin';
import './CustomerManagement.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi song song: danh sách khách hàng + thống kê
        const [customersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/customers`),
        ]);

        const customersData = customersRes.data || [];
        setCustomers(customersData);

      } catch (e) {
        console.error('Error details:', e);
        console.error('Response data:', e.response?.data);
        console.error('Response status:', e.response?.status);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return '';
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="customer-management">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-management">
        <div className="error">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="customer-management">
      <HeaderAdmin />

      <div className="header-container">
        <h1>Tất cả khách hàng</h1>
        
        <div className="controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          
          <div className="sort-dropdown">
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên khách hàng</th>
              <th>Mật khẩu</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Ngày sinh</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id_khach_hang}>
                <td><strong>{customer.ho_ten}</strong></td>
                <td>{customer.mat_khau.substring(0, 6)}...</td>
                <td>{formatPhone(customer.so_dien_thoai)}</td>
                <td>{customer.email}</td>
                <td>{formatDate(customer.ngay_sinh)}</td>
                <td>
                  <span className={`status ${customer.status === "active" ? "active" : "inactive"}`}>
                    {customer.status === "active" ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="data-info">
        Dữ liệu từ 1 đến {customers.length} của {customers.length} khách hàng
      </div>
    </div>
  );
};

export default CustomerManagement;