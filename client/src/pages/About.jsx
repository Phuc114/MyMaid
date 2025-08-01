// About.jsx
import React from 'react';
import './About.css';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';


const About = () => {
  const navigate = useNavigate();


  return (
    <div className="about-page">
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
        <li><Link to="/">Trang chủ</Link></li>
          <li className="dropdown">
          <Link to="/service">Dịch vụ</Link>
            <ul className="dropdown-menu">
              <li><a href="#">Dọn dẹp nhà</a></li>
              <li><a href="#">Dọn dẹp văn phòng</a></li>
              <li><a href="#">Vệ sinh sofa, rèm nệm</a></li>
              <li><a href="#">Giặt ủi</a></li>
            </ul>
          </li>
          <li><a href="#">Pages</a></li>
          <li><Link to="/about">Giới thiệu</Link></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
        <div className="nav-icons">
          <span>🔍</span>
          <span>|</span>
          <span>👤</span>
        </div>
      </nav>

      {/* Company Info */}
      <section className="about-info">
        <div className="info-text">
          <h2>Chúng tôi cung cấp dịch vụ dọn dẹp chất lượng hàng đầu</h2>
          <p>
            Đội ngũ nhân viên chuyên nghiệp, tận tâm cùng trang thiết bị hiện đại giúp bạn tiết kiệm thời gian và công sức.
          </p>
          <p>
            Dù bạn là hộ gia đình, văn phòng, hay cửa hàng – MyMaid luôn sẵn sàng phục vụ bạn.
          </p>
          <button className="btn-primary">Reach Us Online</button>
        </div>
        <div className="info-image">
          <img src="/images/about-maid.png" alt="Maid Cleaning" />
        </div>
      </section>

      {/* Popular Services */}
      <section className="popular-services">
        <h2>Hãy thử những dịch vụ thịnh hành của chúng tôi</h2>
        <div className="service-cards">
          <div className="card">
            <h4>🧽 Dọn dẹp văn phòng</h4>
            <p>Giữ môi trường làm việc luôn gọn gàng và sạch sẽ mỗi ngày.</p>
          </div>
          <div className="card">
            <h4>🏡 Dọn dẹp nhà ở</h4>
            <p>Nhà cửa thơm tho, không gian thoáng mát – giúp bạn thư giãn hơn.</p>
          </div>
          <div className="card">
            <h4>👕 Giặt ủi & quần áo</h4>
            <p>Dịch vụ giặt ủi tiện lợi, nhanh chóng, trả đồ đúng hẹn.</p>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="review">
        <img className="avatar" src="/images/avatar.png" alt="User" />
        <blockquote>
          “Tôi rất hài lòng với dịch vụ của MyMaid. Nhân viên cực kỳ dễ thương và làm sạch rất kỹ!”
        </blockquote>
        <p className="user">— Ánh Bùi 🌟🌟🌟🌟🌟</p>
      </section>

      {/* CTA - Register Offer */}
      <section className="subscribe">
        <div className="subscribe-content">
          <h3>Đăng ký nhận ưu đãi & thông tin mới nhất từ MyMaid!</h3>
          <p>Chúng tôi sẽ gửi bạn những mã giảm giá, ưu đãi và mẹo dọn nhà hay ho!</p>
          <form className="subscribe-form">
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
        <img src="/images/about-subscribe.png" alt="Subscribe Maid" className="subscribe-img" />
      </section>

      {/* Footer (giống trang chủ) */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 MyMaid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
