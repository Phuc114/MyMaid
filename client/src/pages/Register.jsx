// src/pages/Register.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Register.css";
import { useRegister } from "../context/RegisterContext";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const { register, loading, checkEmailAvailability } = useRegister();

  // ===== kiểm tra email khi nhập =====
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const abortRef = useRef(null);

  // ✅ sau khi bấm submit, đóng băng cơ chế kiểm tra email (không check nữa)
  const [suppressEmailCheck, setSuppressEmailCheck] = useState(false);

  useEffect(() => {
    if (suppressEmailCheck) return; // không kiểm tra sau khi đã bấm submit

    const value = (formData.email || "").trim().toLowerCase();

    // reset mỗi khi người dùng thay đổi email
    setEmailMsg("");
    setEmailExists(false);
    setEmailChecked(false);

    if (!value) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailMsg("Vui lòng nhập email hợp lệ.");
      return;
    }

    // debounce check
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      const { ok, exists, message } = await checkEmailAvailability(value, { signal: controller.signal });
      if (!ok) {
        if (message !== "Đã hủy") {
          setEmailMsg(message || "Không kiểm tra được email");
          setEmailExists(false);
          setEmailChecked(true);
        }
      } else {
        setEmailExists(Boolean(exists));
        setEmailMsg(exists ? "Email đã tồn tại, vui lòng dùng email khác" : "Email hợp lệ.");
        setEmailChecked(true);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [formData.email, checkEmailAvailability, suppressEmailCheck]);

  // ===== form handlers =====
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    // người dùng vừa thay đổi email => cho phép check lại (nếu đã từng bấm submit trước đó)
    if (e.target.name === "email") setSuppressEmailCheck(false);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    const next = { ...errors };
    if (name === "name" && !value.trim()) next.name = "Vui lòng nhập đầy đủ thông tin";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) next.email = "Vui lòng nhập email hợp lệ.";
    }
    if (name === "password" && value.length < 8) next.password = "Mật khẩu cần tối thiểu 8 ký tự";
    setErrors(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ❌ KHÔNG kiểm tra email nữa từ đây về sau
    if (abortRef.current) abortRef.current.abort(); // hủy request đang chờ (nếu có)
    setSuppressEmailCheck(true);                    // đóng băng cơ chế check

    // validate cơ bản
    const next = {};
    if (!formData.name.trim()) next.name = "Vui lòng nhập đầy đủ thông tin";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) next.email = "Vui lòng nhập email hợp lệ.";
    if (formData.password.length < 8) next.password = "Mật khẩu cần tối thiểu 8 ký tự";

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setTouched({ name: true, email: true, password: true });
      return;
    }

    // chỉ cho submit nếu trước đó đã check OK (không trùng)
    if (!emailChecked || emailExists) {
      setTouched((t) => ({ ...t, email: true }));
      return;
    }

    const { ok, message } = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });

    if (!ok) {
      alert(message || "Đăng ký thất bại.");
    }
  };

  // nút bật khi: đã check xong & không trùng; các trường hợp lệ; không đang loading
  const submitDisabled =
    loading ||
    !emailChecked ||
    emailExists ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    formData.password.length < 8 ||
    !!errors.name ||
    !!errors.email ||
    !!errors.password;

  return (
    <div className="register-page">
      <Header />

      <div className="register-container">
        <div className="register-form">
          <h1>Tạo tài khoản MyMaid của bạn</h1>
          <p className="sub-title">Bắt đầu trải nghiệm dịch vụ dọn dẹp chuyên nghiệp & tiện lợi cùng MyMaid!</p>

          <form onSubmit={handleSubmit}>
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên đầy đủ của bạn"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
            {touched.name && errors.name && <p className="input-error">{errors.name}</p>}

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email của bạn"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
            {/* chỉ hiện sau khi có kết quả check hoặc lỗi định dạng */}
            {touched.email && errors.email ? (
              <p className="input-error">{errors.email}</p>
            ) : (
              !!formData.email &&
              emailChecked &&
              !!emailMsg && (
                <p className={`input-hint ${emailExists ? "input-hint--error" : "input-hint--ok"}`}>
                  {emailMsg}
                </p>
              )
            )}

            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="Tối thiểu 8 ký tự"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
            {touched.password && errors.password && <p className="input-error">{errors.password}</p>}

            <button type="submit" className="register-button" disabled={submitDisabled}>
              Đăng ký tài khoản
            </button>
          </form>

          <p className="login-link">
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>

        <div className="register-illustration">
          <img src="/images/vacum.png" alt="Đăng ký" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
