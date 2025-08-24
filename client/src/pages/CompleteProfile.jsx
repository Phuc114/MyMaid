// src/pages/CompleteProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useVerifyEmail } from "../context/VerifyEmailContext";
import { useOnboarding } from "../context/OnboardingContext";
import "./CompleteProfile.css";

const CompleteProfile = () => {
  const { pendingName, pendingEmail } = useVerifyEmail();
  const { submitting, submitProfile } = useOnboarding();

  const [name, setName] = useState(pendingName || "");
  const [email] = useState(pendingEmail || "");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const fileRef = useRef();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview("");
  }, [file]);

  const canSubmit = !!file && /^0\d{9,10}$/.test(phone.trim());

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await submitProfile({
      name,
      email,
      phone,
      dob,
      file,
      redirectTo: "/",
    });
    if (ok) alert("Đã đăng ký tài khoản thành công");
  };

  return (
    <div className="complete-profile-page">{/* flex column, min-height: 100dvh */}
      <Header />

      <main className="cp-main">{/* flex:1 để đẩy Footer xuống đáy */}
        <div className="cp-container">
          {/* FORM */}
          <div className="cp-left">
            <h1>Thông tin cá nhân của bạn</h1>
            <p>Hãy đảm bảo thông tin của bạn luôn chính xác để MyMaid phục vụ tốt hơn.</p>

            <div className="avatar-row">
              <div className="avatar">
                {preview ? <img src={preview} alt="avatar" /> : <div className="placeholder">avatar</div>}
              </div>
              <button type="button" className="upload-btn" onClick={() => fileRef.current?.click()}>
                Tải ảnh
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="hint">
                Dung lượng tối đa <b>2MB</b>. Định dạng hỗ trợ: JPG, PNG, WEBP.
              </div>
            </div>

            <form onSubmit={onSubmit} className="cp-form">
              <label>Họ và tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ tên" />

              <label>Email</label>
              <input value={email} disabled placeholder="Email đã xác minh" />

              <label>Số điện thoại *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
              />

              <label>Ngày sinh</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />

              <button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
              {!file && <div className="note">(*) Vui lòng tải ảnh đại diện.</div>}
              {!/^0\d{9,10}$/.test(phone || "") && phone && (
                <div className="note">(*) Số điện thoại không hợp lệ.</div>
              )}
            </form>
          </div>

          {/* ILLUSTRATION */}
          <div className="cp-right">
            <img src="/images/vacum.png" alt="Minh họa" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompleteProfile;
