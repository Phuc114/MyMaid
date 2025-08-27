// Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Home.css";
import { useHome } from "../context/HomeContext";
import Notification from "../components/Notification"; // <= dùng cùng component thông báo

const placeholder = (src) => (src && String(src).trim() ? src : "/images/placeholder.png");

export default function Home() {
  const navigate = useNavigate();
  const { services, maids, testimonials, categories, sendMessage } = useHome();

  // ===== toast (thông báo) =====
  const [toast, setToast] = useState(null);
  const showToast = (type, message) => {
    setToast({ type, message });
    // auto close sau 2.5s
    setTimeout(() => setToast(null), 2500);
  };

  // ===== Testimonials carousel =====
  const [activeIdx, setActiveIdx] = useState(0);
  const goPrev = () =>
    setActiveIdx((i) => (i - 1 + (testimonials?.length || 1)) % (testimonials?.length || 1));
  const goNext = () => setActiveIdx((i) => (i + 1) % (testimonials?.length || 1));

  // ===== Feature icons under hero =====
  const FEATURE_ICONS = [
    {
      title: "Giá tốt nhất",
      desc: "Giá rẻ và tốt nhất",
      icon:
        "https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/image%2059.png",
    },
    {
      title: "Làm việc chuyên nghiệp",
      desc: "Nhân viên được đào tạo bài bản",
      icon:
        "https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/image%2060.png",
    },
    {
      title: "Bảo mật khách hàng",
      desc: "Khách hàng an tâm trải nghiệm",
      icon:
        "https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/image%2061.png",
    },
    {
      title: "Hỗ trợ cuộc sống",
      desc: "Để cuộc sống thật thảnh thơi",
      icon:
        "https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/image%2062.png",
    },
  ];

  // ===== Contact form (send message via Context) =====
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    loai_dich_vu: "",
    ghi_chu: "",
  });
  const [sending, setSending] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmitMessage = async (e) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    const { ok, message } = await sendMessage(form);
    setSending(false);

    if (ok) {
      showToast("success", message || "Đã gửi tin nhắn thành công!");
      setForm({ ho_ten: "", email: "", loai_dich_vu: "", ghi_chu: "" });
      setPickerOpen(false);
    } else {
      showToast("error", message || "Gửi thất bại, vui lòng thử lại!");
    }
  };

  // ===== Service picker (toggle to open list) =====
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close on click outside / ESC
  useEffect(() => {
    const onClose = (e) => {
      if (!pickerRef.current) return;
      if (e.type === "keydown" && e.key === "Escape") setPickerOpen(false);
      if (e.type === "mousedown" && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", onClose);
    document.addEventListener("keydown", onClose);
    return () => {
      document.removeEventListener("mousedown", onClose);
      document.removeEventListener("keydown", onClose);
    };
  }, []);

  // slug utils + route mapping cho 3 dịch vụ thịnh hành
  const slugify = (s = "") =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const SERVICE_ROUTES = {
    "Tổng vệ sinh": { category: "ve-sinh-tong-quat", service: "tong-ve-sinh" },
    "Vệ sinh nhà cửa": { category: "ve-sinh-tong-quat", service: "ve-sinh-nha-cua" },
    "Giặt sofa": { category: "ve-sinh-noi-that", service: "giat-sofa" },
  };

  return (
    <div className="home">
      {/* THÔNG BÁO */}
      {toast && (
        <Notification
          type={toast.type}            // "success" | "error" | "info"
          message={toast.message}      // nếu component của bạn dùng prop khác, đổi lại chỗ này
          onClose={() => setToast(null)}
        />
      )}

      <Header />

      {/* ========== HERO ========== */}
      <section className="hero hero--v1">
        <div className="container hero__wrap">
          <div className="hero__text">
            <span className="hero__eyebrow">THỬ NGAY HÔM NAY</span>
            <h1 className="hero__title hero__title--compact">Nhà Sạch Thì Mát</h1>
            <p className="hero__desc">
              Bạn đã sẵn sàng trải nghiệm MyMaid chưa? Bắt đầu ngay với việc đặt lịch đầu tiên của
              bạn.
            </p>

            <div className="hero__cta">
              <button className="btn btn--ghost" onClick={() => navigate("/about")}>
                Giới thiệu
              </button>
              <button className="btn btn--primary" onClick={() => navigate("/service")}>
                Đặt dịch vụ
              </button>
            </div>
          </div>

          <div className="hero__media">
            <img
              className="hero__img hero__img--v1"
              src="https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/hero-vacuum.png"
              alt="Vacuum"
            />
          </div>
        </div>

        {/* Hàng tính năng */}
        <div className="container hero__features-row">
          <ul className="hero__features hero__features--compact">
            {FEATURE_ICONS.map((f) => (
              <li key={f.title} className="feature feature--compact">
                <div className="ficon">
                  <img src={f.icon} alt={f.title} loading="lazy" decoding="async" />
                </div>
                <div className="ftext">
                  <div className="ftitle">{f.title}</div>
                  <div className="fsub">{f.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ========== DỊCH VỤ THỊNH HÀNH (3 mục) ========== */}
      <section className="section section--tight">
        <div className="container">
          <h2 className="section__title">Hãy thử những dịch vụ thịnh hành của chúng tôi</h2>

          <div className="grid cards cards--services">
            {(services || []).slice(0, 3).map((s) => {
              const title = s.title?.trim() || "";
              const route = SERVICE_ROUTES[title];
              const fallback = {
                category: slugify(s.category || "dich-vu"),
                service: slugify(title),
              };
              const categorySlug = route?.category || fallback.category;
              const serviceSlug = route?.service || fallback.service;

              return (
                <article
                  key={s.id || s.service_id || title}
                  className="card service"
                  onClick={() => navigate(`/service/${categorySlug}/${serviceSlug}`)}
                  role="button"
                  aria-label={`Xem ${title}`}
                >
                  <div className="service__icon">
                    <img src={placeholder(s.icon)} alt={title} />
                  </div>
                  <h3 className="service__title">{title}</h3>
                  <p className="service__desc">{s.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== BENEFITS ========== */}
      <section className="benefits">
        <div className="container benefits__wrap">
          <div className="benefits__text">
            <h3>Giúp cho nhà của bạn đẹp dễ</h3>
            <p>
              Dịch vụ của chúng tôi mang đến trải nghiệm dọn dẹp tuyệt vời ngay tại nhà! Bạn không
              còn phải lo lắng về bụi bẩn — hãy để MyMaid giúp bạn tận hưởng không gian sạch sẽ.
            </p>

            <ul className="ticks">
              <li><i className="fa-solid fa-check" /> Dịch vụ dọn dẹp nhà ở của bạn</li>
              <li><i className="fa-solid fa-check" /> Dịch vụ vệ sinh văn phòng, công ty</li>
              <li><i className="fa-solid fa-check" /> Dịch vụ giặt thảm &amp; lau sàn chuyên nghiệp</li>
            </ul>

            <button className="btn btn--outline" onClick={() => navigate("/service")}>
              Tìm hiểu thêm
            </button>
          </div>

          <div className="benefits__media">
            <img src="/images/vacum.png" alt="Cleaning illustration" />
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="stats">
        <div className="container stats__wrap">
          <div className="stat"><div className="stat__num">500+</div><div className="stat__label">Đơn hàng</div></div>
          <div className="stat"><div className="stat__num">800</div><div className="stat__label">Khách hàng</div></div>
          <div className="stat"><div className="stat__num">18+</div><div className="stat__label">Giải thưởng</div></div>
          <div className="stat"><div className="stat__num">600+</div><div className="stat__label">Nhân viên</div></div>
        </div>
      </section>

      {/* ========== TEAM ========== */}
      <section className="team section">
        <div className="container">
          <h2 className="section__title">Gặp gỡ đội ngũ chúng tôi</h2>
          <p className="section__subtitle">Những con người luôn niềm nở với khách hàng cũng như tận tâm với công việc</p>

          <div className="team__grid">
            {(maids || []).map((m) => (
              <div key={m.id || m.maid_id} className="team__card">
                <div className="team__avatar"><img src={placeholder(m.avatar)} alt={m.name} /></div>
                <div className="team__name">{m.name}</div>
                <div className="team__role">{m.role || "Cleaner"}</div>
                <div className="team__socials">
                  <i className="fa-brands fa-facebook-f" />
                  <i className="fa-brands fa-twitter" />
                  <i className="fa-brands fa-instagram" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      {Array.isArray(testimonials) && testimonials.length > 0 && (
        <section className="testimonials section">
          <div className="container">
            <div className="testi__wrap">
              <button className="testi__nav" onClick={goPrev} aria-label="Previous">
                <i className="fa-solid fa-chevron-left" />
              </button>

              <div className="testi__card">
                <div className="testi__avatars-center">
                  {testimonials.slice(0, 5).map((t) => (
                    <img key={t.id || t.customer_id} src={placeholder(t.avatar)} alt={t.name} />
                  ))}
                </div>
                <div className="testi__person--center">
                  <div className="testi__name">{testimonials[activeIdx].name}</div>
                  <div className="testi__stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={`fa-star ${
                          i < (testimonials[activeIdx].rating || 5) ? "fa-solid" : "fa-regular"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="testi__text testi__text--center">{testimonials[activeIdx].comment}</p>
              </div>

              <button className="testi__nav" onClick={goNext} aria-label="Next">
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>

            <div className="testi__dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testi__dot ${i === activeIdx ? "is-active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CONTACT (form) ========== */}
      <section className="contact">
        <div className="container contact__wrap">
          {/* Media + bubbles */}
          <div className="contact__media">
            <img
              src="https://edktkciruhfltbdugwte.supabase.co/storage/v1/object/public/avatars/home/Group%2036882.png"
              alt="Contact illustration"
            />
            <div className="bubble bubble--address">
              <div className="bubble__title"><i className="fa-solid fa-location-dot" /> Địa chỉ</div>
              <div className="bubble__text">123 Trần Hưng Đạo Quận 1<br />TP.HCM</div>
            </div>
            <div className="bubble bubble--phone">
              <div className="bubble__title"><i className="fa-solid fa-phone" /> Điện thoại</div>
              <div className="bubble__text">0912 345 765</div>
            </div>
          </div>

          {/* Form */}
          <form className="contact__form contact__form--v2" onSubmit={onSubmitMessage}>
            <h3 className="contact__heading contact__heading--v2">
              Nếu bạn có thắc mắc? <span>Liên hệ ngay nhé!</span>
            </h3>

            <label className="field">
              <span>Tên của bạn</span>
              <input
                name="ho_ten"
                value={form.ho_ten}
                onChange={onChange}
                className="input-pill"
                placeholder="Nhập tên của bạn"
                required
              />
            </label>

            <label className="field">
              <span>Email của bạn</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="input-pill"
                placeholder="Nhập email của bạn"
                required
              />
            </label>

            <label className="field" ref={pickerRef}>
              <span>Loại dịch vụ bạn cần</span>

              {/* Toggle giống một input; click để mở list */}
              <button
                type="button"
                className={`picker-toggle input-pill ${pickerOpen ? "is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((v) => !v)}
              >
                <span className={`picker-value ${form.loai_dich_vu ? "" : "is-placeholder"}`}>
                  {form.loai_dich_vu || "Chọn danh mục dịch vụ"}
                </span>
                <i className="fa-solid fa-angle-down picker-caret" />
              </button>

              {/* Dropdown list */}
              <div className={`picker-dropdown ${pickerOpen ? "show" : ""}`}>
                <div className="service-picker" role="listbox" aria-label="Chọn loại dịch vụ">
                  {(categories || []).length ? (
                    (categories || []).map((c) => {
                      const name = c.name || c.ten_danh_muc;
                      const active = form.loai_dich_vu === name;
                      return (
                        <button
                          type="button"
                          key={c.id || c.category_id || name}
                          role="option"
                          aria-selected={active}
                          className={`service-picker__item ${active ? "is-active" : ""}`}
                          onClick={() => {
                            setForm((p) => ({ ...p, loai_dich_vu: name }));
                            setPickerOpen(false);
                          }}
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

              {/* giữ giá trị khi submit */}
              <input type="hidden" name="loai_dich_vu" value={form.loai_dich_vu} />
            </label>

            <label className="field">
              <span>Ghi chú / thắc mắc của bạn</span>
              <textarea
                name="ghi_chu"
                value={form.ghi_chu}
                onChange={onChange}
                className="textarea-soft"
                rows={4}
                placeholder="Nhập câu hỏi hoặc mô tả nhu cầu của bạn..."
              />
            </label>

            <button
              className="btn btn--primary contact__submit"
              type="submit"
              disabled={sending || !form.loai_dich_vu}
            >
              {sending ? "Đang gửi..." : "Gửi"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}