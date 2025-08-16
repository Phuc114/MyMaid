// src/context/VerifyEmailContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyEmailCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const RESEND_SECONDS = 60;

export function VerifyEmailProvider({ children }) {
  const navigate = useNavigate();

  // email cần verify
  const [email, setEmail] = useState(localStorage.getItem("verify_email") || "");

  // lưu tạm info từ bước đăng ký để prefill ở bước sau (không lưu DB)
  const [pendingName, setPendingName] = useState(localStorage.getItem("pending_name") || "");
  const [pendingEmail, setPendingEmail] = useState(localStorage.getItem("pending_email") || "");
  const [pendingPassword, setPendingPassword] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSendAtRef = useRef(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /** Lưu tạm info từ Register */
  const primePendingInfo = ({ name, email, password }) => {
    setPendingName(name || "");
    setPendingEmail(email || "");
    setPendingPassword(password || "");
    localStorage.setItem("pending_name", name || "");
    localStorage.setItem("pending_email", email || "");
  };

  /** Khi backend đã gửi OTP tại /register -> FE chỉ chuyển qua trang verify */
  const goToVerifyOnly = (userEmail) => {
    setEmail(userEmail);
    localStorage.setItem("verify_email", userEmail);
    setCooldown(RESEND_SECONDS);
    navigate("/verify-email", { replace: true });
  };

  /** Trường hợp muốn FE tự gửi OTP (không dùng /register) */
  const startVerification = async (userEmail) => {
    setEmail(userEmail);
    localStorage.setItem("verify_email", userEmail);

    const now = Date.now();
    if (now - lastSendAtRef.current > 1800) {
      try {
        await fetch(`${API_BASE}/api/auth/request-verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        lastSendAtRef.current = Date.now();
        setCooldown(RESEND_SECONDS);
      } catch (e) {
        console.error(e);
      }
    }
    navigate("/verify-email", { replace: true });
  };

  /** Gửi lại OTP */
  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    try {
      await fetch(`${API_BASE}/api/auth/request-verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      lastSendAtRef.current = Date.now();
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      console.error(e);
    }
  };

  /** Nộp mã 4 số */
  const handleSubmitCode = async (code) => {
    if (!email || code.length !== 4) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error("VERIFY_FAILED");

      localStorage.removeItem("verify_email");
      navigate("/complete-profile", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Mã không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = {
    // states
    email,
    cooldown,
    isSubmitting,
    resendDisabled: !email || cooldown > 0,
    pendingName,
    pendingEmail,
    pendingPassword,
    // actions
    primePendingInfo,
    goToVerifyOnly,
    startVerification,
    handleResend,
    handleSubmitCode,
  };

  return <VerifyEmailCtx.Provider value={value}>{children}</VerifyEmailCtx.Provider>;
}

export const useVerifyEmail = () => useContext(VerifyEmailCtx);
