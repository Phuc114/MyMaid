import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBanner from "../components/PageBanner";
import { useHome } from "../context/HomeContext";
import Notification from "../components/Notification";
import "../components/Notification.css";
import "./Contact.css";

export default function Contact() {
  const { categories, sendMessage } = useHome(); // dùng chung từ context

  // ----- form state -----
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    loai_dich_vu: "",
    ghi_chu: "",
  });
  const [sending, setSending] = useState(false);
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ----- custom service picker (giống Home) -----
  const [openPicker, setOpenPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target)) setOpenPicker(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpenPicker(false);

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const pick = (name) => {
    setForm((p) => ({ ...p, loai_dich_vu: name }));
    setOpenPicker(false);
  };

  // ----- notification -----
  const [toast, setToast] = useState(null);

  // ----- submit -----
  const onSubmitMessage = async (e) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    const { ok, message } = await sendMessage(form);
    setSending(false);

    setToast({
      type: ok ? "success" : "error",
      title: ok ? "Đã gửi thông tin!" : "Gửi không thành công",
      message,
    });

    if (ok) setForm({ ho_ten: "", email: "", loai_dich_vu: "", ghi_chu: "" });
  };

  return (
    <div className="contact-page">
      <Header />
      <PageBanner title="Liên hệ" />

      <main className="contact-main">
        <section className="contact-wrap">
          {/* MEDIA + bubbles (nếu muốn thêm bubble như Home thì thêm markup ở đây) */}
          <div className="contact-media">
            <img
              src="https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/girl-cleaning-the-house%201.png"
              alt="Contact illustration"
            />
          </div>

          {/* FORM giống Home (picker dạng dropdown-list) */}
          <form className="contact-formV2" onSubmit={onSubmitMessage}>
            <h3 className="contact-heading">
              Nếu bạn có thắc mắc? <span>Liên hệ ngay nhé!</span>
            </h3>

            <label className="field">
              <span>Tên của bạn</span>
              <input
                className="input-pill"
                name="ho_ten"
                value={form.ho_ten}
                onChange={onChange}
                placeholder="Nhập tên của bạn"
                required
              />
            </label>

            <label className="field">
              <span>Email của bạn</span>
              <input
                className="input-pill"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Nhập email của bạn"
                required
              />
            </label>

            <label className="field" ref={pickerRef}>
              <span>Loại dịch vụ bạn cần</span>

              {/* toggle giống input */}
              <button
                type="button"
                className={`picker-toggle input-pill ${openPicker ? "is-open" : ""}`}
                onClick={() => setOpenPicker((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={openPicker}
              >
                <span className={`picker-value ${form.loai_dich_vu ? "" : "is-placeholder"}`}>
                  {form.loai_dich_vu || "Chọn danh mục dịch vụ"}
                </span>
                <i className="fa-solid fa-chevron-down picker-caret" />
              </button>

              {/* dropdown */}
              <div className={`picker-dropdown ${openPicker ? "show" : ""}`}>
                <div className="service-picker" role="listbox" aria-label="Chọn loại dịch vụ">
                  {(categories || []).length ? (
                    categories.map((c) => {
                      const name = c.name || c.ten_danh_muc;
                      const active = form.loai_dich_vu === name;
                      return (
                        <button
                          type="button"
                          key={c.id || c.category_id || name}
                          role="option"
                          aria-selected={active}
                          className={`service-picker__item ${active ? "is-active" : ""}`}
                          onClick={() => pick(name)}
                        >
                          {name}
                        </button>
                      );
                    })
                  ) : (
                    <div className="service-picker__empty">Chưa có danh mục dịch vụ</div>
                  )}
                </div>
              </div>

              {/* giữ value khi submit */}
              <input type="hidden" name="loai_dich_vu" value={form.loai_dich_vu} />
            </label>

            <label className="field">
              <span>Ghi chú / thắc mắc của bạn</span>
              <textarea
                className="textarea-soft"
                rows={4}
                name="ghi_chu"
                value={form.ghi_chu}
                onChange={onChange}
                placeholder="Nhập câu hỏi hoặc mô tả nhu cầu của bạn..."
              />
            </label>

            <button
              type="submit"
              className="btn-primary contact-submit"
              disabled={sending || !form.loai_dich_vu}
            >
              {sending ? "Đang gửi..." : "Gửi"}
            </button>
          </form>
        </section>
      </main>

      {/* Notification dùng chung */}
      {toast && (
        <Notification
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
          autoClose={3000}
        />
      )}

      <Footer />
    </div>
  );
}
