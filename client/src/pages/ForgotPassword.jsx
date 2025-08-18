import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ForgotPassword.css"; // giữ style hiện tại của bạn
import { useNavigate } from "react-router-dom";
import { useForgotPassword } from "../context/ForgotPasswordContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { checkEmail, requestOtp, email, setEmail, loading } = useForgotPassword();

  // Trạng thái inline giống trang Đăng ký
  // - 'idle'     : chưa đủ điều kiện kiểm tra
  // - 'checking' : đang kiểm tra
  // - 'ok'       : HỢP LỆ (ở quên mật khẩu == email TỒN TẠI)
  // - 'notfound' : KHÔNG TỒN TẠI (lỗi)
  const [status, setStatus] = useState("idle");
  const [touched, setTouched] = useState(false);
  //const showOk = status === "ok";
  //const showChecking = status === "checking";
  const showError = status === "notfound";

  // debounceId dùng để hủy lần kiểm tra cũ nếu người dùng gõ tiếp
  const debounceMs = 350;
  useEffect(() => {
    // reset khi chuỗi rỗng hoặc format sai
    if (!email || !emailRegex.test(email)) {
      setStatus("idle");
      return;
    }

    let alive = true;
    setStatus("checking");
    const id = setTimeout(async () => {
      const exists = await checkEmail(email.trim());
      if (!alive) return;
      // Ở quên mật khẩu: email TỒN TẠI mới là hợp lệ
      setStatus(exists ? "ok" : "notfound");
    }, debounceMs);

    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [email, checkEmail]);

  const canSubmit = useMemo(() => {
    // Không re-check khi submit — chỉ cho submit khi status đang 'ok'
    return emailRegex.test(email || "") && status === "ok" && !loading;
  }, [email, status, loading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    // Chặn submit nếu chưa hợp lệ (giống đăng ký: phải pass inline trước)
    if (!canSubmit) return;

    const rs = await requestOtp(email.trim());
    if (!rs.ok) {
      // Lỗi server/network hiển thị nhã nhặn — không đổi inline status đã có
      alert(rs.message || "Không gửi được OTP. Vui lòng thử lại.");
      return;
    }
    navigate("/forgot-verify-otp");
  };

  return (
    <div className="forgot-wrapper">
      <Header />

      <main className="forgot-hero">
        {/* LEFT: form giống bố cục trước */}
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

            {/* Trạng thái inline: giống cách hiển thị ở trang Đăng ký */}
            {touched && showError && (
              <div className="input-error">Email không tồn tại.</div>
            )}
            

            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {loading ? "Đang gửi..." : "Gửi yêu cầu đặt lại mật khẩu"}
            </button>
          </form>
        </section>

        {/* RIGHT: minh hoạ như trước */}
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
