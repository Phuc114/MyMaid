// src/pages/Service.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Service.css';

const Service = () => {
  return (
    <div className="service-page">
      <Header />
      <div className="service-main-content">
      {/* Banner */}
      <section
        className="service-banner"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/service-banner.png')"
        }}
      >
        <h1>Dịch vụ</h1>
        <p>Trang chủ &gt; Dịch vụ</p>
      </section>

      {/* Giới thiệu dịch vụ */}
      <section className="service-intro">
        <h2>Dịch vụ dọn dẹp chuyên nghiệp cho mọi nhu cầu của bạn</h2>
        <p>
          Hãy khám phá các gói dịch vụ nổi bật từ MyMaid – nền tảng kết nối đội ngũ dọn dẹp chuyên nghiệp đến tận nhà bạn!
        </p>
      </section>

      {/* Các dịch vụ */}
      <section className="service-grid">
      <div className="service-card">
          <img src="/images/banchai.png" alt="Dọn nhà" />
          <h4>Dọn dẹp nhà cửa</h4>
          <p>Giữ cho ngôi nhà của bạn luôn sạch sẽ với các gói theo ca hoặc định kỳ linh hoạt.</p>
        </div>
        <div className="service-card">
          <img src="/images/launha.png" alt="Tổng vệ sinh" />
          <h4>Tổng vệ sinh chuyên sâu</h4>
          <p>Làm sạch sâu toàn bộ nhà – lý tưởng cho trước/sau khi dọn nhà hoặc tết.</p>
        </div>
        <div className="service-card">
          <img src="/images/maygiat.png" alt="Tiện ích" />
          <h4>Dịch vụ tiện ích nâng cao</h4>
          <p>Hỗ trợ giặt nệm, sofa, rèm và khử khuẩn – tiết kiệm thời gian và công sức cho bạn.</p>
        </div>
        <div className="service-card">
          <img src="/images/banchai.png" alt="Nội thất" />
          <h4>Vệ sinh nội thất & thiết bị</h4>
          <p>Chăm sóc toàn bộ nội thất và thiết bị gia đình – từ sofa đến máy lạnh, tủ lạnh.</p>
        </div>
        <div className="service-card">
          <img src="/images/launha.png" alt="Doanh nghiệp" />
          <h4>Dịch vụ cho doanh nghiệp</h4>
          <p>Giải pháp vệ sinh hiệu quả cho văn phòng, cửa hàng, showroom theo định kỳ hoặc giờ.</p>
        </div>
        <div className="service-card">
          <img src="/images/maygiat.png" alt="Gia đình" />
          <h4>Dịch vụ hỗ trợ gia đình</h4>
          <p>Hỗ trợ chăm sóc người thân, trông trẻ, hoặc dọn dẹp sau khi sinh con một cách chuyên nghiệp.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2>Câu hỏi thường gặp từ khách hàng</h2>

        <div className="faq">
          <details open>
            <summary>Tôi có thể đặt lịch dọn ở đâu?</summary>
            <p>Bạn có thể đặt lịch trực tiếp trên trang web hoặc gọi đến tổng đài MyMaid để được hỗ trợ.</p>
          </details>
          <details>
            <summary>MyMaid có làm việc vào cuối tuần không?</summary>
            <p>Có. Chúng tôi làm việc tất cả các ngày trong tuần, bao gồm cả cuối tuần và ngày lễ.</p>
          </details>
          <details>
            <summary>Tôi có thể huỷ lịch đã đặt không?</summary>
            <p>Hoàn toàn có thể, chỉ cần huỷ trước 2 giờ trước khi bắt đầu dịch vụ.</p>
          </details>
          <details>
            <summary>Nhân viên đến nhà có được kiểm tra lý lịch không?</summary>
            <p>Tất cả nhân viên của MyMaid đều đã được kiểm tra lý lịch và đào tạo bài bản.</p>
          </details>
          <details>
            <summary>Tôi muốn đặt lịch cố định mỗi tuần, có được không?</summary>
            <p>Có, bạn có thể chọn dịch vụ định kỳ theo tuần hoặc theo tháng.</p>
          </details>
          <details>
            <summary>Có thể chọn nhân viên quen thuộc cho lần dọn tiếp theo không?</summary>
            <p>Chúng tôi hỗ trợ bạn chọn lại nhân viên từng phục vụ nếu lịch làm việc của họ phù hợp.</p>
          </details>
        </div>
      </section>
    </div>
      <Footer />
    </div>
  );
};

export default Service;
