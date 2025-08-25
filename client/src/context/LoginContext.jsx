// context/LoginContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const LoginContext = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const LoginProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  // Kết nối với UserContext để cập nhật Header ngay
  const { setUser, refresh } = useUser();

  // Map user từ backend -> shape của UserContext
  const mapToUserCtx = (raw) => {
    if (!raw) return null;
    const id =
      raw.id_khach_hang ??
      raw.id_maid ??
      raw.id_admin ??
      raw.id ??
      null;
    const name =
      raw.ho_ten || (raw.email ? raw.email.split("@")[0] : "Người dùng");
    return {
      id,
      name,
      email: raw.email || "",
      avatarUrl: raw.anh_ho_so_url || null,
    };
  };

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const storedRole = localStorage.getItem("role");
      const storedToken = localStorage.getItem("token");

      if (storedRole && storedToken) {
        setRole(storedRole);
        setToken(storedToken);
        setAuthUser(storedUser || null);
        // Header sẽ tự refresh từ UserContext khi mount; vẫn gọi cho chắc
        refresh?.();
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Login
  const login = async (email, matKhau) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mat_khau: matKhau }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Email hoặc mật khẩu không đúng!");
    }

    const data = await res.json();
    const { user: rawUser, role, token } = data;

    // Lưu auth state (context này)
    setAuthUser(rawUser);
    setRole(role);
    setToken(token);

    // Lưu storage để các nơi khác dùng
    localStorage.setItem("user", JSON.stringify(rawUser || null));
    localStorage.setItem("role", role || "");
    localStorage.setItem("token", token || "");

    // Dọn cờ đăng ký dở (nếu có) để Header không chặn hiển thị login
    localStorage.removeItem("reg_in_progress");
    localStorage.removeItem("reg_email");
    localStorage.removeItem("verify_email");

    // *** QUAN TRỌNG: cập nhật ngay UserContext để Header re-render tức thì
    const optimistic = mapToUserCtx(rawUser);
    if (optimistic) setUser(optimistic);
    // Đồng bộ lại từ BE cho chắc (lấy tên/avatar mới nhất)
    refresh?.();
  };

  // ===== Logout
  const logout = () => {
    try {
      setAuthUser(null);
      setRole(null);
      setToken(null);

      // Xoá các key liên quan auth
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      sessionStorage.removeItem("reg_token");
      localStorage.removeItem("reg_in_progress");
      localStorage.removeItem("reg_email");
      localStorage.removeItem("verify_email");

      // Phát tín hiệu đa tab (tuỳ chọn)
      try {
        localStorage.setItem("logout_at", String(Date.now()));
      } catch {}
    } finally {
      // Xoá luôn state UserContext để Header đổi ngay
      setUser(null);
    }
  };

  return (
    <LoginContext.Provider
      value={{ user: authUser, role, token, login, logout }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);
