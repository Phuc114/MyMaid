// src/context/ChangePasswordContext.jsx
import { createContext, useContext } from "react";
import axios from "axios";

export const ChangePasswordContext = createContext(null);

// Tạo 1 instance axios có sẵn baseURL (đỡ phụ thuộc vào proxy)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  // withCredentials: true, // nếu bạn dùng cookie thì bật
});

export const ChangePasswordProvider = ({ children }) => {
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Bạn chưa đăng nhập." };
      }

      const res = await api.put(
        "/api/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return {
        success: Boolean(res.data?.success),
        message: res.data?.message || "Đổi mật khẩu thành công",
      };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Đổi mật khẩu thất bại";
      return { success: false, message };
    }
  };

  return (
    <ChangePasswordContext.Provider value={{ changePassword }}>
      {children}
    </ChangePasswordContext.Provider>
  );
};

export const useChangePassword = () => useContext(ChangePasswordContext);
