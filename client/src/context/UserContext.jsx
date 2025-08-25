// src/context/UserContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const UserCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

const getToken = () => localStorage.getItem("token") || null;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // { id, name, ho_ten, email, avatarUrl, phone, ngay_sinh }
  const [loading, setLoading] = useState(false);

  const bust = (url) => {
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}t=${Date.now()}`;
  };

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) { setUser(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/me`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Không lấy được thông tin người dùng");

      const next = {
        id: data.id,
        name: data.name,
        ho_ten: data.ho_ten || data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || null,
        so_dien_thoai: data.so_dien_thoai || data.phone || "",
        phone: data.so_dien_thoai || data.phone || "",
        ngay_sinh: data.ngay_sinh || ""
      };
      setUser(next);
      localStorage.setItem("user", JSON.stringify(next));
    } catch (e) {
      console.error("UserContext refresh:", e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // cập nhật tức thì trên UI (và giữ đồng bộ field alias)
  const applyProfilePatch = useCallback(({ name, avatarUrl, phone, ngay_sinh } = {}) => {
    setUser((prev) => prev ? {
      ...prev,
      ...(name != null ? { name, ho_ten: name } : {}),
      ...(avatarUrl != null ? { avatarUrl: bust(avatarUrl) } : {}),
      ...(phone != null ? { phone, so_dien_thoai: phone } : {}),
      ...(ngay_sinh != null ? { ngay_sinh } : {}),
    } : prev);
  }, []);

  // cập nhật lạc quan rồi gọi refresh để đồng bộ từ BE
  const optimisticUpdateProfile = useCallback(({ name, avatarUrl, phone, ngay_sinh } = {}) => {
    applyProfilePatch({ name, avatarUrl, phone, ngay_sinh });
    refresh();
  }, [applyProfilePatch, refresh]);

  useEffect(() => {
    refresh();
    const onStorage = (e) => { if (e.key === "token") refresh(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const token = getToken();

  return (
    <UserCtx.Provider value={{ user, loading, token, refresh, setUser, applyProfilePatch, optimisticUpdateProfile }}>
      {children}
    </UserCtx.Provider>
  );
};

export const useUser = () => useContext(UserCtx);
