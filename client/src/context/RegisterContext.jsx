// src/context/RegisterContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useVerifyEmail } from "./VerifyEmailContext";

const RegisterCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function RegisterProvider({ children }) {
  // lấy đúng 2 hàm này: KHÔNG dùng startVerification để tránh gửi OTP lần nữa
  const { goToVerifyOnly, primePendingInfo } = useVerifyEmail();
  const [loading, setLoading] = useState(false);

  const register = async ({ name, email, password }) => {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201 || data?.ok) {
        // LƯU THÔNG TIN TẠM ĐỂ PREFILL BƯỚC SAU
        primePendingInfo({ name: cleanName, email: cleanEmail, password });
        // CHỈ CHUYỂN TRANG NHẬP MÃ, KHÔNG GỬI OTP LẠI
        goToVerifyOnly(cleanEmail);
        return { ok: true };
      }

      return { ok: false, message: data?.message || "Đăng ký không thành công." };
    } catch (_e) {
      return { ok: false, message: "Không thể kết nối máy chủ." };
    } finally {
      setLoading(false);
    }
  };

  // kiểm tra email trùng (giữ nguyên)
  const checkEmailAvailability = async (email, { signal } = {}) => {
    try {
      const url = `${API_BASE}/api/auth/check-email?email=${encodeURIComponent(
        (email || "").trim().toLowerCase()
      )}`;
      const res = await fetch(url, { signal, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, message: data?.message || "Không kiểm tra được email" };
      return { ok: true, exists: !!data.exists };
    } catch (e) {
      if (e.name === "AbortError") return { ok: false, message: "Đã hủy" };
      return { ok: false, message: "Không kiểm tra được email" };
    }
  };

  return (
    <RegisterCtx.Provider value={{ register, loading, checkEmailAvailability }}>
      {children}
    </RegisterCtx.Provider>
  );
}

export const useRegister = () => useContext(RegisterCtx);
