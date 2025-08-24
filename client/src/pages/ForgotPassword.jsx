import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../context/ForgotPasswordContext";
import Notification from "../components/Notification";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { checkEmail, requestOtp, email, setEmail, loading } = useForgotPassword();

  // 'idle' | 'checking' | 'ok' | 'notfound'
  const [status, setStatus] = useState("idle");
  const [touched, setTouched] = useState(false);
  const showError = status === "notfound";
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    if (!email || !emailRegex.test(email)) {
      setStatus("idle");
      return;
    }
    let alive = true;
    setStatus("checking");
    const id = setTimeout(async () => {
      const exists = await checkEmail(email.trim());
      if (!alive) return;
      setStatus(exists ? "ok" : "notfound");
    }, 350);
    return () => { alive = false; clearTimeout(id); };
  }, [email, checkEmail]);

  const canSubmit = useMemo(
    () => emailRegex.test(email || "") && status === "ok" && !loading,
    [email, status, loading]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const rs = await requestOtp(email.trim());
    if (!rs.ok) {
      setNotif({ type: "error", message: rs.message || "Không gửi được OTP. Vui lòng thử lại." });
      return;
    }
    setNotif({ type: "success", message: `Đã gửi mã OTP tới ${email}.` });
    navigate("/forgot-verify-otp");
  };

  return (
    <div className="forgot-wrapper">
      <Header />

      {notif && (
        <Notification
          type={notif.type}
          message={notif.message}
          duration={3000}
          onClose={() => setNotif(null)}
        />
      )}

      <main className="forgot-hero">
        <section className="forgot-left">
          <h1 className="forgot-title">Quên mật khẩu?</h1>
          <p className="forgot-sub">Nhập email đã đăng ký để nhận mã OTP.</p>

          <form onSubmit={onSubmit} className="forgot-form">
            <label htmlFor="email" className="forgot-label">Email</label>
            <div className="input-wrap">
              <input
                id="email"
                type="email"
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                autoComplete="email"
                required
              />
            </div>

            {/* Chỉ giữ lỗi inline: email không tồn tại */}
            {touched && showError && (
              <div className="input-error">Email không tồn tại.</div>
            )}

            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {loading ? "Đang gửi..." : "Gửi yêu cầu đặt lại mật khẩu"}
            </button>
          </form>
        </section>

        <aside className="forgot-right" aria-hidden="true">
          <div className="illus-card">
            <img src="/images/vacum.png" alt="" />
            <div className="dots dots-top" />
            <div className="dots dots-bottom" />
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
