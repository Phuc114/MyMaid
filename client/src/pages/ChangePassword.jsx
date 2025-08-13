// src/pages/ChangePassword.jsx
import React, { useState } from "react";
import "./ChangePassword.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useChangePassword } from "../context/ChangePasswordContext";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { changePassword } = useChangePassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage("");

    // Validate cơ bản (UI only)
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        alert("Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(res.message || "Đổi mật khẩu thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="change-password-page">
      <Header />

      <div className="change-container">
        <div className="change-form">
          <h1>Tạo mật khẩu mới</h1>
          <p className="note">
            Mật khẩu mới phải khác với mật khẩu đã sử dụng trước đó
          </p>

          <form onSubmit={handleSubmit}>
            <label>Mật khẩu cũ</label>
            <div className="input-wrapper">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Nhập mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <span onClick={() => setShowOld((v) => !v)}>
                {showOld ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <label>Mật khẩu mới</label>
            <div className="input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Tối thiểu 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="confirm-button" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>
        </div>

        <div className="change-illustration">
          <img src="/images/vacum.png" alt="Change Password" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ChangePassword;
