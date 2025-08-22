// Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Login.css';
import { useLogin } from '../context/LoginContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useLogin();

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, matKhau); 
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Lỗi đăng nhập!');
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-form">
          <h1>Đăng nhập tài khoản</h1>
          <p className="sub-title">
            Tiếp tục trải nghiệm MyMaid và quản lý dịch vụ dọn dẹp dễ dàng!
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email của bạn"
              required
            />

            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="password-input"
                required
              />
              <span className="password-toggle-icon" onClick={togglePassword}>
                {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
              </span>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="options-row">
              <label className="checkbox-label">
                <input type="checkbox" />
                Lưu mật khẩu
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="form-login-button">Đăng nhập</button>
          </form>

          <p className="register-link">
            Bạn chưa có tài khoản? <Link to="/register">Tạo tài khoản mới</Link>
          </p>

          <div className="divider">Hoặc đăng nhập bằng</div>

          <button className="google-button">
            <img src="/images/LogoGG.png" alt="Google" />
            Đăng nhập bằng Google
          </button>
        </div>

        <div className="login-illustration">
          <img src="/images/vacum.png" alt="Login illustration" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
