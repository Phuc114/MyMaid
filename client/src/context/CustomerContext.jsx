// context/CustomerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
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

      const response = await fetch(`http://localhost:5000/api/customers?${queryParams}`);
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      console.error('Error fetching customers:', err);
      setError(err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Update customer status
  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh the customer list
      fetchCustomers(pagination.currentPage);
      
    } catch (err) {
      console.error('Error updating status:', err);
      throw new Error('Cập nhật status thất bại');
    }
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    return phone;
  };

  // Effects
  useEffect(() => {
    fetchCustomers(1);
  }, [searchTerm, sortOrder]);

  const value = {
    customers,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    loading,
    error,
    pagination,
    fetchCustomers,
    updateCustomerStatus,
    formatDate,
    formatPhone
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};