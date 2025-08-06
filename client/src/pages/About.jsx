// src/pages/About.jsx
import React from 'react';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';

const About = () => {
  return (
    <div className="about-page">
      <Header />
      <PageBanner 
        title="Giới thiệu" 
        current="Giới thiệu" 
        image="/images/about-banner.png" 
      />

      {/* Intro Section */}
      <section className="about-intro">
        <div className="intro-text">
          <h2>Chúng tôi cung cấp dịch vụ dọn dẹp chất lượng hàng đầu</h2>
          <p>
            MyMaid là nền tảng kết nối giữa khách hàng và đội ngũ nhân viên vệ sinh chuyên nghiệp.
            Chúng tôi mang đến trải nghiệm sạch sẽ, tiện lợi và an tâm cho mọi gia đình và doanh nghiệp.
          </p>
          <ul>
            <li>Dịch vụ dọn dẹp tại TPHCM, Đà Nẵng, Hà Nội</li>
            <li>Dịch vụ vệ sinh văn phòng và công ty</li>
          </ul>
          <button className="btn-book">Đặt dịch vụ ngay</button>
        </div>
        <div className="intro-image">
          <img src="/images/cleaning.png" alt="Cleaner" />
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="about-services">
        <h2>Hãy thử những dịch vụ thịnh hành của chúng tôi</h2>
        <p>
          Chúng tôi luôn nỗ lực nâng cao chất lượng dịch vụ, đảm bảo sự hài lòng và tiện nghi cho khách hàng trong từng lần trải nghiệm.
        </p>
        <div className="service-cards">
          <div className="service-card active">
            <h4>Dọn dẹp văn phòng</h4>
            <p>Dịch vụ dọn dẹp, vệ sinh văn phòng chuyên nghiệp với quy trình đặc biệt.</p>
          </div>
          <div className="service-card">
            <h4>Dọn dẹp nhà vệ sinh</h4>
            <p>Kiểm tra các thiết bị rò rỉ, hư hỏng. Chà rửa bồn rửa mặt, bồn tắm, bồn cầu...</p>
          </div>
          <div className="service-card">
            <h4>Giặt ủi quần áo</h4>
            <p>Dịch vụ giặt ủi tiện lợi, là ủi, đóng gói phù hợp cho mọi nhu cầu sinh hoạt.</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial">
        <p>
          “Dịch vụ dọn dẹp của MyMaid mang đến trải nghiệm tuyệt vời, giúp tôi tiết kiệm thời gian mà vẫn giữ nhà cửa sạch sẽ.
          Nhân viên thân thiện, làm việc nhanh và rất chuyên nghiệp. Tôi hoàn toàn yên tâm khi sử dụng dịch vụ!”
        </p>
        <div className="testimonial-info">
          <img src="/images/avatar.png" alt="Avatar" />
          <div>
            <strong>Alexa Bliss</strong>
            <div className="stars">★★★★★</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
