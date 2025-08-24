// client/src/context/OnboardingContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const OnboardingCtx = createContext(null);
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function OnboardingProvider({ children }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * PUT /api/profile/update-with-avatar (multipart/form-data)
   * Payload: ho_ten, email, oldEmail, so_dien_thoai, ngay_sinh, avatar
   */
  const submitProfile = async ({
    name,
    email,
    phone,
    dob,
    file,
    oldEmail,
    redirectTo = "/",
  }) => {
    const finalEmail =
      (email || "").trim() ||
      localStorage.getItem("pending_email") ||
      localStorage.getItem("verify_email") ||
      "";

    if (!finalEmail) return { ok: false, message: "Thiếu email đã xác minh." };
    if (!phone || !/^0\d{9,10}$/.test(phone.trim())) {
      return { ok: false, message: "Số điện thoại không hợp lệ." };
    }
    if (!file) return { ok: false, message: "Vui lòng chọn ảnh đại diện." };

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("ho_ten", (name || "").trim());
      fd.append("email", finalEmail);                // email mới (có thể trùng cũ)
      fd.append("oldEmail", oldEmail || finalEmail); // để BE tra id chắc
      fd.append("so_dien_thoai", phone.trim());
      if (dob) fd.append("ngay_sinh", dob);
      fd.append("avatar", file);

      const res = await fetch(`${API_BASE}/api/profile/update-with-avatar`, {
        method: "PUT",
        body: fd,
        credentials: "include", // giữ vì server đã bật CORS credentials
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) {
        console.error("update-with-avatar failed:", res.status, text);
        return { ok: false, message: "Không thể lưu thông tin. Vui lòng thử lại." };
      }

      try { JSON.parse(text); } catch (_) {}
      navigate(redirectTo, { replace: true });
      return { ok: true };
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
