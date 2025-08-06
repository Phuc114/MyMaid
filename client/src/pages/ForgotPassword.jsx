import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Vui lòng nhập email');
    } else {
      alert(`Đã gửi yêu cầu đặt lại mật khẩu đến: ${email}`);
      // Gửi yêu cầu về server tại đây
    }
  };

  return (
    <div className="forgot-password-page">
      <Header />

      <div className="forgot-container">
        <div className="forgot-form">
          <h1>Quên mật khẩu?</h1>
          <p className="sub-title">
            Đừng lo, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email đã đăng ký tài khoản"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit" className="forgot-button">
              Gửi yêu cầu đặt lại mật khẩu
            </button>
          </form>
        </div>

        <div className="forgot-illustration">
          <img src="/images/vacum.png" alt="Forgot password" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
