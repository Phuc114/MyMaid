// Home.jsx
import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="homepage">
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
          <li><a href="#">Trang chủ</a></li>
          <li className="dropdown">
            <a href="#">Dịch Vụ ▾</a>
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
        <div className="nav-icons">
          <span>🔍</span>
          <span>|</span>
          <span>👤</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Nhà Sạch Thì Mát</h1>
          <p>Giúp bạn tận hưởng không gian sạch sẽ mỗi ngày</p>
          <button className="btn-primary">Khám phá dịch vụ</button>
        </div>
        <div className="hero-image">
          <img src="/images/hero-vacuum.png" alt="Vacuum" />
        </div>
      </section>

      {/* Service Highlights */}
      <section className="services">
        <h2>Dịch vụ nổi bật</h2>
        <div className="service-cards">
          <div className="card">Vệ sinh nhà cửa</div>
          <div className="card">Tổng vệ sinh định kỳ</div>
          <div className="card">Vệ sinh sau xây dựng</div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-text">
          <h3>Giúp cho nhà của bạn đẹp dễ dàng hơn</h3>
          <p>Tiện lợi - Nhanh chóng - Chuyên nghiệp</p>
        </div>
        <div className="benefits-img">
          <img src="/images/cleaning-illustration.png" alt="Benefits" />
        </div>
      </section>

      {/* Statistics */}
      <section className="stats">
        <div className="stat">500+ Khách hàng</div>
        <div className="stat">800+ Lượt đánh giá</div>
        <div className="stat">18+ Nhân viên</div>
        <div className="stat">600+ Dịch vụ hoàn thành</div>
      </section>

      {/* Meet Our Team */}
      <section className="team">
        <h2>Gặp gỡ đội ngũ chúng tôi</h2>
        <div className="team-cards">
          <div className="member">Nguyễn An - Nhân viên vệ sinh</div>
          <div className="member">Trần Bình - Điều phối viên</div>
          <div className="member">Lê Cúc - Quản lý dịch vụ</div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact">
        <div className="contact-img">
          <img src="/images/contact-cleaner.png" alt="Contact" />
        </div>
        <form className="contact-form">
          <h3>Nếu bạn có thắc mắc?</h3>
          <input type="text" placeholder="Họ và tên" />
          <input type="email" placeholder="Email" />
          <input type="text" placeholder="Số điện thoại" />
          <button type="submit">Liên hệ ngay</button>
        </form>
      </section>

      {/* Latest News */}
      <section className="news">
        <h2>Our Latest News</h2>
        <div className="news-items">
          <div className="news-card">Tips dọn nhà nhanh 15 phút mỗi ngày</div>
          <div className="news-card">Vì sao bạn nên vệ sinh máy lạnh thường xuyên</div>
          <div className="news-card">5 lý do nên chọn dịch vụ MyMaid</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 MyMaid. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;