// src/context/UserContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLogin } from "./LoginContext";

const UserCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export const UserProvider = ({ children }) => {
  const { token } = useLogin();
  const [user, setUser] = useState(null);   // { id, name, email, avatarUrl }
  const [loading, setLoading] = useState(false);

  // Cache-busting cho avatar để trình duyệt không dính ảnh cũ
  const bust = (url) => {
    if (!url) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}t=${Date.now()}`;
  };

  // --- Lấy lại từ BE (chuẩn) ---
  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Không lấy được thông tin người dùng");

      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || null,
      });
    } catch (e) {
      console.error("UserContext refresh:", e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- Cập nhật tức thì tại client ---
  const applyProfilePatch = useCallback(({ name, avatarUrl } = {}) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...(name != null ? { name } : {}),
        ...(avatarUrl != null ? { avatarUrl: bust(avatarUrl) } : {}),
      };
    });
  }, []);

  // --- Phương án A+ tối ưu: cập nhật ngay + đồng bộ lại từ BE ở hậu cảnh ---
  const optimisticUpdateProfile = useCallback(async ({ name, avatarUrl } = {}) => {
    // 1) Cho Header đổi NGAY
    applyProfilePatch({ name, avatarUrl });
    // 2) Rồi gọi refresh() để khớp hoàn toàn với server (không chặn UI)
    //    Không await để UI mượt, nhưng bạn có thể await nếu muốn.
    refresh(); 
  }, [applyProfilePatch, refresh]);

  // Tự refresh khi token đổi (login/logout) => Header đổi ngay
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserCtx.Provider
      value={{
        user,
        loading,
        // public APIs
        refresh,
        setUser,
        applyProfilePatch,
        optimisticUpdateProfile, // <-- dùng cái này là tối ưu nhất
      }}
    >
      {children}
    </UserCtx.Provider>
  );
};

export const useUser = () => useContext(UserCtx);
