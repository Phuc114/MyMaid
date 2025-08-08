// src/context/ChangePasswordContext.jsx
import { createContext, useContext } from 'react';
import axios from 'axios';

export const ChangePasswordContext = createContext();

export const ChangePasswordProvider = ({ children }) => {
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });      

      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại'
      };
    }
  };

  return (
    <ChangePasswordContext.Provider value={{ changePassword }}>
      {children}
    </ChangePasswordContext.Provider>
  );
};

export const useChangePassword = () => useContext(ChangePasswordContext);
