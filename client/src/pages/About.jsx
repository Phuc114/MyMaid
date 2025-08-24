// About.jsx
import React from 'react';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';

const About = () => {
  return (
    <>
      <Header />
      <PageBanner title="Giới thiệu" />

      <div className="about-section">
        <div className="about-intro">
          <div className="about-left">
            <h2>Chúng tôi cung cấp dịch vụ dọn dẹp chất lượng hàng đầu</h2>
            <p className="desc">
              MyMaid là nền tảng kết nối giữa khách hàng và đội ngũ nhân viên vệ sinh chuyên nghiệp. 
              Chúng tôi mang đến trải nghiệm sạch sẽ, tiện lợi và an tâm cho mọi gia đình và doanh nghiệp.
            </p>
            <ul className="features">
              <li>Dịch vụ dọn dẹp nhà ở tại TP.HCM, Đà Nẵng, Hà Nội</li>
              <li>Dịch vụ vệ sinh văn phòng và công ty</li>
            </ul>
            <button className="about-button">Đặt lịch ngay</button>
          </div>

          <div className="about-right">
            <img src="/images/cleaning.png" alt="cleaning" className="main-img" />
            <div className="stat-box top-left">
              <span>16+</span>
              <p>Văn phòng đang được chăm sóc định kỳ</p>
            </div>
            <div className="stat-box bottom-right">
              <span>100+</span>
              <p>Khách hàng đã sử dụng</p>
            </div>
          </div>
        </div>

        <div className="service-intro">
          <h3>Hãy thử những dịch vụ thịnh hành của chúng tôi</h3>
          <p className="sub-desc">
            Chúng tôi luôn nỗ lực nâng cao chất lượng dịch vụ, đảm bảo sự hài lòng và tiện nghi cho khách hàng trong từng lần trải nghiệm.
          </p>
          <div className="service-grid">
            <div className="service-box">
              <img src="/images/banchai.png" alt="Dọn văn phòng" />
              <h3>Dọn dẹp văn phòng</h3>
              <p>Dịch vụ dọn dẹp, vệ sinh văn phòng chuyên nghiệp với quy trình đặc biệt.</p>
            </div>

            <div className="service-box">
              <img src="/images/launha.png" alt="Dọn nhà vệ sinh" />
              <h3>Dọn dẹp nhà vệ sinh</h3>
              <p>
                Kiểm tra thiết bị rò rỉ, hư hỏng. Chà rửa bồn rửa, phòng tắm, bồn cầu. Thay thế các đồ dùng nhà tắm.
              </p>
            </div>

            <div className="service-box">
              <img src="/images/maygiat.png" alt="Giặt ủi" />
              <h3>Giặt ủi quần áo</h3>
              <p>
                Giặt ủi tiện lợi, đáng tin cậy, chất lượng cao phù hợp cho nhu cầu thường, giặt hấp cao cấp.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default About;
