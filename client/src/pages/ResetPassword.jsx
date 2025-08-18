import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ChangePassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForgotPassword } from "../context/ForgotPasswordContext";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { email, resetPassword, loading, clearForgotFlow } = useForgotPassword();

  // Guard: chỉ kiểm tra email 1 LẦN khi mount (tránh bị đá ngược sau khi reset)
  const initialEmailRef = useRef(email);
  useEffect(() => {
    if (!initialEmailRef.current) navigate("/forgot-password");
  }, [navigate]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    if (!newPassword || !confirm) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu phải từ 6 ký tự.");
      return;
    }
    if (newPassword !== confirm) {
      setErrorMessage("Xác nhận mật khẩu không khớp.");
      return;
    }

    const rs = await resetPassword({ password: newPassword });
    if (!rs.ok) {
      setErrorMessage(rs.message || "Đặt lại mật khẩu thất bại.");
      return;
    }

    alert("Đặt lại mật khẩu thành công!");
    clearForgotFlow && clearForgotFlow();
    navigate("/", { replace: true });
  };

  return (
    <div className="change-password-page">
      <Header />
      <div className="change-container">
        <div className="change-form">
          <h1>Đặt lại mật khẩu</h1>
          <p className="note">Nhập và xác nhận mật khẩu mới cho tài khoản của bạn.</p>

          <form onSubmit={onSubmit}>
            <label>Mật khẩu mới</label>
            <div className="input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <span onClick={() => setShowNew((v) => !v)}>
                {showNew ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <label>Xác nhận mật khẩu</label>
            <div className="input-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              <span onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="confirm-button" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>

        <div className="change-illustration" aria-hidden="true">
          <img src="/images/vacum.png" alt="Reset Password Illustration" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
