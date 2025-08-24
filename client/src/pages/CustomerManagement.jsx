import HeaderAdmin from '../components/HeaderAdmin';
import React, { useState, useEffect } from 'react';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch customers from API
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
	  setError(null);

      const queryParams = new URLSearchParams({
        search: searchTerm,
        sort: sortOrder,
        page: page,
        limit: 10
      });

      const response = await fetch(`/api/customers?${queryParams}`);
      
	  // Check if response is HTML (error page) instead of JSON
	  const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [searchTerm, sortOrder]);

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
    
    // Format based on length (Vietnamese phone numbers)
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
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
        {error && (
        <div className="error-message">
          <h3>Lỗi kết nối</h3>
          <p>{error}</p>
          <p>Vui lòng kiểm tra:</p>
          <ul>
            <li>Backend server có đang chạy trên port 5000 không?</li>
            <li>API endpoint /api/customers có tồn tại không?</li>
            <li>Kiểm tra console để xem chi tiết lỗi</li>
          </ul>
          <button onClick={() => fetchCustomers(1)}>Thử lại</button>
        </div>
        )}
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
				<th>Hành động</th>
			</tr>
			</thead>
			<tbody>
			{customers.map((customer) => (
				<tr key={customer.id}>
				<td><strong>{customer.name}</strong></td>
				<td>{customer.password?.substring(0, 6)}...</td>
				<td>{formatPhone(customer.phone)}</td>
				<td>{customer.email}</td>
				<td>{formatDate(customer.dob)}</td>
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
      
      <div className="pagination">
        <button 
          disabled={!pagination.hasPrev}
          onClick={() => fetchCustomers(pagination.currentPage - 1)}
        >
          Trước
        </button>
        
        <span>Trang {pagination.currentPage} / {pagination.totalPages}</span>
        
        <button 
          disabled={!pagination.hasNext}
          onClick={() => fetchCustomers(pagination.currentPage + 1)}
        >
          Sau
        </button>
      </div>
      
      <div className="data-info">
        Hiển thị {customers.length} của {pagination.totalCount} khách hàng
      </div>
    </div>
  );
};

export default CustomerManagement;