import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      {/* Top Info Bar */}
      <div className="top-info-bar">
        <span>Hotline: 1900 1234</span>
        <span>Email: cskh@mymaid.vn</span>
        <span>Địa chỉ: 123 Trần Hưng Đạo, Quận 1, TP.HCM</span>
      </div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="MyMaid Logo" />
          <span>MyMaid</span>
        </div>
        <ul className="nav-links">
          <li><a onClick={() => navigate('/')}>Trang chủ</a></li>
          <li className="dropdown">
            <a href="#">Dịch vụ </a>
            <ul className="dropdown-menu">
              <li><a href="#">Dọn dẹp nhà</a></li>
              <li><a href="#">Dọn dẹp văn phòng</a></li>
              <li><a href="#">Vệ sinh sofa, rèm nệm</a></li>
              <li><a href="#">Giặt ủi</a></li>
            </ul>
          </li>
          <li><a href="#">Pages</a></li>
          <li><a href="#">Giới thiệu</a></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
      </nav>

      {/* Login content */}
      <main className="login-container">
        <div className="login-form">
          <h2>Đăng nhập tài khoản</h2>
          <p>Tiếp tục trải nghiệm MyMaid và quản lý dịch vụ dọn dẹp dễ dàng!</p>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
                type="email"
                id="email"
                className="input-common"
                placeholder="Nhập địa chỉ email của bạn"
            />
            </div>

            <div className="form-group password-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="input-common"
                    placeholder="Tối thiểu 8 ký tự"
                />
                    <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                </div>
            </div>
            <div className="options">
                <label className="remember-line">
                    <input type="checkbox" />
                    <span>Lưu mật khẩu</span>
                </label>
                <a href="#">Quên mật khẩu?</a>
            </div>
          <button className="btn-login">Đăng nhập</button>
          <p>Bạn chưa có tài khoản? <a className="create-link" href="#">Tạo tài khoản mới</a></p>
          <div className="or">Hoặc đăng nhập bằng</div>
          <button className="btn-google">
            <img src="/images/LOgoGG.png" alt="Google" />
            Đăng nhập bằng Google
          </button>
        </div>

        <div className="login-image">
          <img src="/images/vacum.png" alt="Đăng nhập minh họa" />
        </div>
      </main>

      <footer className="footer">
        © 2025 MyMaid. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
