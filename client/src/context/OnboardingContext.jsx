// client/src/context/OnboardingContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

const OnboardingCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function OnboardingProvider({ children }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { optimisticUpdateProfile, refresh } = useUser();

  const submitProfile = async ({ name, email, phone, dob, file, oldEmail, redirectTo = "/" }) => {
    const finalEmail =
      (email || "").trim() ||
      localStorage.getItem("pending_email") ||
      localStorage.getItem("verify_email") ||
      "";
    if (!finalEmail) return { ok: false, message: "Thiếu email đã xác minh." };
    if (!phone || !/^0\d{9,10}$/.test(phone.trim())) return { ok: false, message: "Số điện thoại không hợp lệ." };
    if (!file) return { ok: false, message: "Vui lòng chọn ảnh đại diện." };

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("ho_ten", (name || "").trim());
      fd.append("email", finalEmail);
      fd.append("oldEmail", oldEmail || finalEmail);
      fd.append("so_dien_thoai", phone.trim());
      if (dob) fd.append("ngay_sinh", dob);
      fd.append("avatar", file);

      // Lấy token mới nhất mỗi lần gọi
      const headers = (() => {
        const local = localStorage.getItem("token");
        const reg = sessionStorage.getItem("reg_token");
        const finalToken = local || reg || "";
        return finalToken ? { Authorization: `Bearer ${finalToken}` } : {};
      })();

      const res = await fetch(`${API_BASE}/api/profile/update-with-avatar`, {
        method: "PUT",
        body: fd,
        credentials: "include",
        headers,
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error("update-with-avatar failed:", res.status, text);
        return { ok: false, message: "Không thể lưu thông tin. Vui lòng thử lại." };
      }

      let payload = null;
      try { payload = JSON.parse(text); } catch {}

      // Promote reg_token -> token, clear flags
      const reg = sessionStorage.getItem("reg_token");
      if (reg) {
        localStorage.setItem("token", reg);
        sessionStorage.removeItem("reg_token");
      }
      sessionStorage.setItem("reg_finalized", "1");
      localStorage.removeItem("reg_in_progress");
      localStorage.removeItem("reg_email");
      localStorage.removeItem("verify_email");
      localStorage.removeItem("pending_name");
      localStorage.removeItem("pending_email");

      optimisticUpdateProfile?.({
        name: name || undefined,
        avatarUrl: payload?.avatarUrl || undefined,
        phone: phone.trim(),
        ngay_sinh: dob || undefined,
      });
      await refresh?.();

      navigate(redirectTo, { replace: true });
      return { ok: true, message: "Đã cập nhật hồ sơ thành công." };
    } catch (e) {
      console.error("submitProfile error:", e);
      return { ok: false, message: "Không thể lưu thông tin. Vui lòng thử lại." };
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingCtx.Provider value={{ submitting, submitProfile }}>
      {children}
    </OnboardingCtx.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingCtx);
