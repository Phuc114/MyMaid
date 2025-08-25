// src/context/VerifyEmailContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmailCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const RESEND_SECONDS = 60;

const isRegRoute = (p) => p === "/verify-email" || p === "/complete-profile";

export function VerifyEmailProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // email đang cần verify
  const [email, setEmail] = useState(localStorage.getItem("verify_email") || "");

  // lưu tạm info từ bước đăng ký để prefill
  const [pendingName, setPendingName] = useState(localStorage.getItem("pending_name") || "");
  const [pendingEmail, setPendingEmail] = useState(localStorage.getItem("pending_email") || "");
  const [pendingPassword, setPendingPassword] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSendAtRef = useRef(0);

  // for route-change detection
  const prevPathRef = useRef(location.pathname);

  // cooldown timer
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // ===== helpers =====
  const setFlash = (payload) => {
    try {
      sessionStorage.setItem("flash", JSON.stringify(payload));
    } catch {}
  };

  const markInProgress = (em) => {
    localStorage.setItem("verify_email", em);
    localStorage.setItem("reg_in_progress", "1");
    localStorage.setItem("reg_email", em);
  };

  const clearAllRegState = (wipePending = true) => {
    // token tạm
    sessionStorage.removeItem("reg_token");
    sessionStorage.removeItem("reg_internal_transition");
    sessionStorage.removeItem("reg_finalized");
    // flags
    localStorage.removeItem("verify_email");
    localStorage.removeItem("reg_in_progress");
    localStorage.removeItem("reg_email");
    // dữ liệu form tạm
    if (wipePending) {
      localStorage.removeItem("pending_name");
      localStorage.removeItem("pending_email");
    }
  };

  const abandonRegistration = useCallback(async () => {
    try {
      const em =
        localStorage.getItem("reg_email") ||
        localStorage.getItem("verify_email") ||
        email;
      if (em) {
        const payload = JSON.stringify({ email: em });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(`${API_BASE}/api/auth/abandon`, blob);
        } else {
          await fetch(`${API_BASE}/api/auth/abandon`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          });
        }
      }
    } catch {}
    clearAllRegState(true);
  }, [email]);

  // ===== public actions =====
  const primePendingInfo = ({ name, email, password }) => {
    setPendingName(name || "");
    setPendingEmail(email || "");
    setPendingPassword(password || "");
    localStorage.setItem("pending_name", name || "");
    localStorage.setItem("pending_email", email || "");
  };

  // Sau khi /register (BE đã gửi OTP) → chỉ chuyển trang
  const goToVerifyOnly = (userEmail) => {
    setEmail(userEmail);
    markInProgress(userEmail);
    setCooldown(RESEND_SECONDS);
    navigate("/verify-email", { replace: true });
  };

  // FE tự yêu cầu BE gửi OTP (khi không đi qua /register)
  const startVerification = async (userEmail) => {
    setEmail(userEmail);
    markInProgress(userEmail);

    const now = Date.now();
    if (now - lastSendAtRef.current > 30_000) {
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

  /** Nộp mã 4 số — KHÔNG login ở đây: chỉ lưu reg_token tạm */
  const handleSubmitCode = async (code) => {
    if (!email || code.length !== 4) {
      return { ok: false, message: "Mã OTP không hợp lệ." };
    }
    let data = null;
    try {
      setIsSubmitting(true);
      // đánh dấu chuyển tiếp nội bộ (OTP → CompleteProfile)
      sessionStorage.setItem("reg_internal_transition", "1");

      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.message || "Xác minh thất bại");

      if (data.token) sessionStorage.setItem("reg_token", data.token);
      // KHÔNG set localStorage.token ở đây → Header vẫn coi là chưa login

      navigate("/complete-profile", { replace: true });
      return { ok: true, message: "Xác minh email thành công." };
    } catch (e) {
      // verify thất bại → bỏ cờ chuyển tiếp
      sessionStorage.removeItem("reg_internal_transition");
      console.error(e);
      return {
        ok: false,
        message: data?.message || "Mã không hợp lệ hoặc đã hết hạn.",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== Global guards (không cần code trong Page) =====

  // 1) Đóng tab / refresh
  useEffect(() => {
    const onBeforeUnload = (e) => {
      const inProgress = localStorage.getItem("reg_in_progress") === "1";
      const finalized = sessionStorage.getItem("reg_finalized") === "1";
      if (!inProgress || finalized) return;
      const msg = "Bạn chưa hoàn tất đăng ký. Nếu thoát, thông tin sẽ bị xoá.";
      e.preventDefault();
      e.returnValue = msg;
      // flash cho trang kế tiếp
      setFlash({
        type: "error",
        title: "Đăng ký chưa hoàn tất",
        message: "Thông tin của bạn đã được xoá.",
      });
      // hủy đăng ký (sendBeacon)
      abandonRegistration();
      return msg;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [abandonRegistration]);

  // 2) Chuyển route trong SPA
  useEffect(() => {
    const prev = prevPathRef.current;
    const curr = location.pathname;

    // Nếu đi từ Verify → CompleteProfile: cho phép, chỉ xoá cờ internal khi đã vào trang đích
    if (curr === "/complete-profile") {
      sessionStorage.removeItem("reg_internal_transition");
    }

    const inProgress = localStorage.getItem("reg_in_progress") === "1";
    const finalized = sessionStorage.getItem("reg_finalized") === "1";
    const internal = sessionStorage.getItem("reg_internal_transition") === "1";

    // Rời khỏi một trong các trang đăng ký (Verify/Complete) sang nơi khác
    if (isRegRoute(prev) && !isRegRoute(curr) && inProgress && !finalized && !internal) {
      setFlash({
        type: "error",
        title: "Đăng ký chưa hoàn tất",
        message: "Thông tin của bạn đã được xoá.",
      });
      // fire-and-forget
      abandonRegistration();
    }

    prevPathRef.current = curr;
  }, [location.pathname, abandonRegistration]);

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
    // expose để nơi khác có thể gọi chủ động (ít dùng)
    abandonRegistration,
    // tiện dùng trong Header để show flash (tuỳ chọn)
    consumeFlash: () => {
      try {
        const raw = sessionStorage.getItem("flash");
        if (raw) {
          sessionStorage.removeItem("flash");
          return JSON.parse(raw);
        }
      } catch {}
      return null;
    },
  };

  return <VerifyEmailCtx.Provider value={value}>{children}</VerifyEmailCtx.Provider>;
}

export const useVerifyEmail = () => useContext(VerifyEmailCtx);
