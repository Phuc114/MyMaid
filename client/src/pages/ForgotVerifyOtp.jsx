import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useForgotPassword } from "../context/ForgotPasswordContext";
import Notification from "../components/Notification";
import "./VerifyEmail.css";

const RESEND_SECONDS = 60;

const ForgotVerifyOtp = () => {
  const { email, requestOtp, verifyOtp, loading } = useForgotPassword();

  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const focusAt = (idx) => inputsRef.current[idx]?.focus();

  const [notif, setNotif] = useState(null);

  const setDigit = (i, v) => {
    const val = v.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 3) focusAt(i + 1);
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      focusAt(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) focusAt(i - 1);
    if (e.key === "ArrowRight" && i < 3) focusAt(i + 1);
  };

  const onPaste = (e) => {
    const s = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 4);
    if (!s) return;
    const next = s.padEnd(4).split("").slice(0, 4);
    setDigits(next);
    setTimeout(() => focusAt(3), 0);
    e.preventDefault();
  };

  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const resendDisabled = cooldown > 0;

  useEffect(() => {
    focusAt(0);
    setCooldown(RESEND_SECONDS);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || resendDisabled) return;
    const rs = await requestOtp(email);
    if (rs?.ok) {
      setNotif({ type: "success", message: "Đã gửi lại OTP." });
      setCooldown(RESEND_SECONDS);
    } else {
      setNotif({ type: "error", message: rs?.message || "Gửi lại OTP thất bại." });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 4) {
      setNotif({ type: "error", message: "Vui lòng nhập đủ 4 chữ số OTP." });
      return;
    }
    const rs = await verifyOtp(code);
    if (!rs?.ok) {
      if (rs.reason === "expired") {
        setNotif({ type: "error", message: "Mã OTP đã hết hạn. Vui lòng bấm Gửi lại OTP để nhận mã mới." });
        setCooldown(0); // mở khóa nút gửi lại ngay
      } else {
        setNotif({ type: "error", message: rs?.message || "OTP không đúng." });
      }
      return;
    }
    setNotif({ type: "success", message: "Xác minh OTP thành công!" });
    window.location.href = "/reset-password";
  };

  return (
    <div className="verify-page">
      <Header />

      {notif && (
        <Notification
          type={notif.type}
          message={notif.message}
          duration={3000}
          onClose={() => setNotif(null)}
        />
      )}

      <main className="verify-main">
        <section className="verify-hero">
          <div className="verify-left">
            <h1 className="verify-title">Xác nhận OTP</h1>
            <p className="verify-desc">
              Chúng tôi đã gửi mã OTP (4 chữ số) tới email: <b>{email || "email của bạn"}</b>
            </p>

            <form className="code-form" onSubmit={submit} onPaste={onPaste}>
              <div className="code-boxes">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={digits[i]}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Ký tự OTP ${i + 1}`}
                  />
                ))}
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleResend}
                  disabled={resendDisabled || loading}
                >
                  {resendDisabled ? `Gửi lại OTP (${cooldown}s)` : "Gửi lại OTP"}
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Đang kiểm tra..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>

          <div className="verify-right" aria-hidden="true">
            <img src="/images/vacum.png" alt="" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotVerifyOtp;
