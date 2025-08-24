import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <Header />
      <PageBanner title="Liên hệ" />
      {/* Form + Info */}
      <section className="contact-content">
        <div className="contact-left">
          <h2>Chúng tôi luôn sẵn sàng hỗ trợ bạn</h2>
          <p>
            Gửi cho chúng tôi tin nhắn nếu bạn có bất kỳ câu hỏi hay cần tư vấn về dịch vụ. MyMaid sẽ phản hồi bạn trong thời gian sớm nhất!
          </p>

          <form className="contact-form">
            <div className="form-row">
              <input type="text" placeholder="Nhập tên của bạn" required />
              <input type="email" placeholder="Nhập địa chỉ email của bạn" required />
            </div>
            <div className="form-row">
              <select required>
                <option value="">Chọn loại dịch vụ cần hỗ trợ</option>
                <option>Dọn nhà</option>
                <option>Vệ sinh văn phòng</option>
                <option>Giặt ủi</option>
              </select>
            </div>
            <textarea placeholder="Chỉ rõ nhu cầu hoặc thắc mắc của bạn" rows="4" required />
            <button type="submit">Gửi tin nhắn</button>
          </form>
        </div>

        <div className="contact-right">
          <h3>Thông tin liên hệ</h3>
          <p>123 Trần Hưng Đạo<br />Quận 1, TP.HCM</p>
          <p>support@mymaid.vn</p>
          <p><strong>+84 912 345 765</strong></p>
          <div className="social-icons">
            <i className="fab fa-facebook-f" />
            <i className="fab fa-twitter" />
            <i className="fab fa-google" />
            <i className="fab fa-instagram" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
