import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Notification from "../components/Notification";
import { useVerifyEmail } from "../context/VerifyEmailContext";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const {
    email,
    cooldown,
    resendDisabled,
    handleResend,
    handleSubmitCode,
  } = useVerifyEmail();

  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const [notif, setNotif] = useState(null); // {type, title, message}

  const focusAt = (idx) => inputsRef.current[idx]?.focus();

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

  const submit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 4) {
      setNotif({ type: "error", title: "Lỗi", message: "Vui lòng nhập đủ 4 số." });
      return;
    }
    const rs = await handleSubmitCode(code);
    if (!rs?.ok) {
      setNotif({
        type: "error",
        title: "Xác minh thất bại",
        message: rs?.message || "Mã không hợp lệ hoặc đã hết hạn.",
      });
    }
  };

  useEffect(() => { focusAt(0); }, []);

  const onClickResend = async () => {
    await handleResend();
    setNotif({ type: "success", title: "Đã gửi", message: "Mã xác minh đã được gửi lại." });
  };

  return (
    <div className="verify-page">
      <Header />

      <main className="verify-main">
        <section className="verify-hero">
          <div className="verify-left">
            <h1 className="verify-title">Xác minh địa chỉ email của bạn</h1>
            <p className="verify-desc">
              Nhập mã xác thực gồm 4 chữ số đã được gửi đến <b>{email || "email của bạn"}</b>
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
                  onClick={onClickResend}
                  disabled={resendDisabled}
                >
                  {resendDisabled ? `Gửi lại mã (${cooldown}s)` : "Gửi lại mã"}
                </button>
                <button type="submit" className="btn btn-primary">Xác minh</button>
              </div>
            </form>
          </div>

          <div className="verify-right" aria-hidden="true">
            <img src="/images/vacum.png" alt="" />
          </div>
        </section>
      </main>

      <Footer />

      {notif && (
        <Notification
          type={notif.type}
          title={notif.title}
          message={notif.message}
          onClose={() => setNotif(null)}
        />
      )}
    </div>
  );
};

export default VerifyEmail;
