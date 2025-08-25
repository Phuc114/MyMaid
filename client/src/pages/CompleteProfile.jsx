import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useVerifyEmail } from "../context/VerifyEmailContext";
import { useOnboarding } from "../context/OnboardingContext";
import { useUser } from "../context/UserContext";
import Notification from "../components/Notification";
import "./CompleteProfile.css";

const CompleteProfile = () => {
  const { pendingName, pendingEmail } = useVerifyEmail();
  const { submitting, submitProfile } = useOnboarding();
  const { user, refresh } = useUser();

  const [name, setName]   = useState(pendingName || "");
  const [email, setEmail] = useState(pendingEmail || "");
  const [phone, setPhone] = useState("");
  const [dob, setDob]     = useState("");
  const [file, setFile]   = useState(null);
  const [preview, setPreview] = useState("");
  const [notif, setNotif] = useState(null); // {type, title, message}

  const fileRef = useRef();

  // Prefill từ server/pending
  useEffect(() => {
    if (user?.name || user?.email) {
      setName((prev)  => prev  || user.name || user.ho_ten || "");
      setEmail((prev) => prev  || user.email || "");
      setPhone((prev) => prev  || user.so_dien_thoai || user.phone || "");
      setDob((prev)   => prev  || (user.ngay_sinh ? String(user.ngay_sinh).slice(0,10) : ""));
    } else {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Avatar preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview("");
  }, [file]);

  const validPhone = /^0\d{9,10}$/.test((phone || "").trim());
  const canSubmit = !!file && validPhone;

  const onSubmit = async (e) => {
    e.preventDefault();
    const rs = await submitProfile({ name, email, phone, dob, file, redirectTo: "/" });
    if (rs?.ok) {
      setNotif({ type: "success", title: "Thành công", message: rs.message || "Đã cập nhật hồ sơ." });
      localStorage.removeItem("pending_name");
      localStorage.removeItem("pending_email");
    } else {
      setNotif({ type: "error", title: "Thất bại", message: rs?.message || "Không thể lưu thông tin." });
    }
  };

  return (
    <div className="complete-profile-page">
      <Header />

      <main className="cp-main">
        <div className="cp-container">
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
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0901234567" />

              <label>Ngày sinh</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />

              <div className="cp-actions">
                <button type="submit" disabled={!canSubmit || submitting}>
                  {submitting ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>

              {!file && <div className="note">(*) Vui lòng tải ảnh đại diện.</div>}
              {!validPhone && phone && <div className="note">(*) Số điện thoại không hợp lệ.</div>}
            </form>
          </div>

          <div className="cp-right">
            <img src="/images/vacum.png" alt="Minh họa" />
          </div>
        </div>
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

export default CompleteProfile;
