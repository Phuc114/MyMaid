import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Xóa lỗi tạm thời khi người dùng gõ lại
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    const newErrors = { ...errors };

    if (name === 'name' && !value.trim()) {
      newErrors.name = 'Vui lòng nhập đầy đủ thông tin';
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        newErrors.email = 'Vui lòng nhập email hợp lệ.';
      }
    }

    if (name === 'password' && value.length < 8) {
      newErrors.password = 'Mật khẩu cần tối thiểu 8 ký tự';
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập đầy đủ thông tin';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Vui lòng nhập email hợp lệ.';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu cần tối thiểu 8 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, password: true });
    } else {
      alert('Đăng ký thành công!');
      // Gửi dữ liệu đến server tại đây nếu cần
    }
  };

  return (
    <div className="register-page">
      <Header />

      <div className="register-container">
        <div className="register-form">
          <h1>Tạo tài khoản MyMaid của bạn</h1>
          <p className="sub-title">
            Bắt đầu trải nghiệm dịch vụ dọn dẹp chuyên nghiệp & tiện lợi cùng MyMaid!
          </p>

          <form onSubmit={handleSubmit}>
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên đầy đủ của bạn"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.name && errors.name && (
              <p className="input-error">{errors.name}</p>
            )}

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email của bạn"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && (
              <p className="input-error">{errors.email}</p>
            )}

            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="Tối thiểu 8 ký tự"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.password && errors.password && (
              <p className="input-error">{errors.password}</p>
            )}

            <button type="submit" className="register-button">
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
