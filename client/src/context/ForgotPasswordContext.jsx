// src/context/ForgotPasswordContext.jsx
import React, { createContext, useContext, useState } from "react";

const Ctx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function ForgotPasswordProvider({ children }) {
  const [email, setEmail] = useState(localStorage.getItem("forgot_email") || "");
  const [loading, setLoading] = useState(false);

  const checkEmail = async (value) => {
    try {
      const url = new URL(`${API_BASE}/api/auth/check-email`);
      url.searchParams.set("email", value.trim());
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Không kiểm tra được email");
      return !!data?.exists;
    } catch {
      return false;
    }
  };

  const requestOtp = async (value) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gửi OTP thất bại");
      localStorage.setItem("forgot_email", value);
      setEmail(value);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = (data?.message || "").toLowerCase();
        if (msg.includes("hết hạn") || msg.includes("expired")) {
          return { ok: false, reason: "expired", message: data?.message || "OTP đã hết hạn" };
        }
        return { ok: false, reason: "invalid", message: data?.message || "OTP không hợp lệ" };
      }
      return { ok: true };
    } catch (e) {
      const msg = (e?.message || "").toLowerCase();
      const reason = msg.includes("hết hạn") || msg.includes("expired") ? "expired" : "error";
      return { ok: false, reason, message: e.message || "Không xác minh được OTP" };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Đặt lại mật khẩu thất bại");
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    } finally {
      setLoading(false);
    }
  };

  const clearForgotFlow = () => {
    localStorage.removeItem("forgot_email");
    setEmail("");
  };

  return (
    <Ctx.Provider
      value={{
        email,
        setEmail,
        loading,
        checkEmail,
        requestOtp,
        verifyOtp,
        resetPassword,
        clearForgotFlow,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useForgotPassword = () => useContext(Ctx);
