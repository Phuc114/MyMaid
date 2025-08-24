import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate('/contact');
  };

  return (
    <div className="homepage">
      <Header />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Nhà Sạch Thì Mát</h1>
          <p>Giúp bạn tận hưởng không gian sạch sẽ mỗi ngày</p>
          <button className="btn-primary" onClick={() => navigate('/service')}>Khám phá dịch vụ</button>
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

      {/* Team Section */}
      <section className="team">
        <h2>Gặp gỡ đội ngũ chúng tôi</h2>
        <div className="team-cards">
          <div className="member">Nguyễn An - Nhân viên vệ sinh</div>
          <div className="member">Trần Bình - Điều phối viên</div>
          <div className="member">Lê Cúc - Quản lý dịch vụ</div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <div className="contact-img">
          <img src="/images/contact-cleaner.png" alt="Contact" />
        </div>
        <form className="contact-form" onSubmit={e => { e.preventDefault(); handleContact(); }}>
          <h3>Nếu bạn có thắc mắc?</h3>
          <input type="text" placeholder="Họ và tên" required />
          <input type="email" placeholder="Email" required />
          <input type="text" placeholder="Số điện thoại" required />
          <button type="submit">Liên hệ ngay</button>
        </form>
      </section>

      {/* News Section */}
      <section className="news">
        <h2>Tin tức mới</h2>
        <div className="news-items">
          <div className="news-card">Tips dọn nhà nhanh 15 phút mỗi ngày</div>
          <div className="news-card">Vì sao bạn nên vệ sinh máy lạnh thường xuyên</div>
          <div className="news-card">5 lý do nên chọn dịch vụ MyMaid</div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
