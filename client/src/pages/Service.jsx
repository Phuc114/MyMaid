// src/pages/Service.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Service.css';

const Service = () => {
  const [services, setServices] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const descriptions = {
    'Tổng vệ sinh': 'Làm sạch toàn bộ không gian sống - từ trần đến sàn, từ phòng khách đến phòng ngủ.',
    'Vệ sinh nhà cửa': 'Giữ gìn ngôi nhà bạn luôn gọn gàng và sạch sẽ với các gói định kỳ.',
    'Giặt sofa': 'Khôi phục vẻ đẹp và sự sạch sẽ cho bộ sofa yêu quý của bạn.',
    'Vệ sinh ghế văn phòng': 'Ghế văn phòng được vệ sinh kỹ lưỡng - đảm bảo thẩm mỹ và sức khỏe.',
    'Giặt nệm': 'Loại bỏ bụi bẩn, vi khuẩn và mùi hôi từ nệm của bạn.',
    'Vệ sinh thảm': 'Thảm sạch đẹp như mới với công nghệ giặt thảm chuyên sâu.',
    'Vệ sinh thiết bị': 'Vệ sinh máy lạnh, quạt, tủ lạnh, máy giặt… đảm bảo hiệu năng và tuổi thọ.',
    'Vệ sinh cửa kính': 'Kính sáng bóng, không vết bẩn, giúp không gian luôn tràn ngập ánh sáng.',
    'Khử trùng': 'Diệt khuẩn toàn diện cho môi trường sống an toàn.',
    'Giúp việc nhà': 'Hỗ trợ các công việc nội trợ hàng ngày như nấu ăn, giặt đồ, rửa chén…'
  };

  const images = [
    '/images/tongvesinh.png',
    '/images/vesinhnhacua.png',
    '/images/giatsofa.png',
    '/images/vesinhghevanphong.png',
    '/images/giatnem.png',
    '/images/vesinhtham.png',
    '/images/vesinhthietbi.png',
    '/images/vesinhcuakinh.png',
    '/images/khutrung.png',
    '/images/giupviecnha.png'
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy dịch vụ:', error);
      }
    };

    fetchServices();
  }, []);

  const faqs = [
    {
      question: 'Tôi có thể đặt lịch dọn ở đâu?',
      answer: 'Bạn có thể đặt lịch trực tiếp trên trang web hoặc gọi đến tổng đài MyMaid để được hỗ trợ.'
    },
    {
      question: 'MyMaid có làm việc vào cuối tuần không?',
      answer: 'Có. Chúng tôi làm việc tất cả các ngày trong tuần, bao gồm cả cuối tuần và ngày lễ.'
    },
    {
      question: 'Tôi có thể huỷ lịch đã đặt không?',
      answer: 'Hoàn toàn có thể, chỉ cần huỷ trước 2 giờ trước khi bắt đầu dịch vụ.'
    },
    {
      question: 'Nhân viên đến nhà có được kiểm tra lý lịch không?',
      answer: 'Tất cả nhân viên của MyMaid đều đã được kiểm tra lý lịch và đào tạo bài bản.'
    },
    {
      question: 'Tôi muốn đặt lịch cố định mỗi tuần, có được không?',
      answer: 'Có, bạn có thể chọn dịch vụ định kỳ theo tuần hoặc theo tháng.'
    },
    {
      question: 'Có thể chọn nhân viên quen thuộc cho lần dọn tiếp theo không?',
      answer: 'Chúng tôi hỗ trợ bạn chọn lại nhân viên từng phục vụ nếu lịch làm việc của họ phù hợp.'
    }
  ];

  return (
    <div className="service-page">
      <Header />
      <PageBanner title="Dịch vụ" path="Trang chủ > Dịch vụ" />

      <div className="service-main-content">
        {/* Giới thiệu */}
        <section className="service-intro">
          <h2>Dịch vụ dọn dẹp chuyên nghiệp cho mọi nhu cầu của bạn</h2>
          <p>
            Hãy khám phá các gói dịch vụ nổi bật từ MyMaid – nền tảng kết nối đội ngũ dọn dẹp chuyên nghiệp đến tận nhà bạn!
          </p>
        </section>

        {/* Danh sách dịch vụ */}
        <section className="service-grid">
          {(showAll ? services : services.slice(0, 6)).map((item, index) => (
            <div key={index} className="service-card">
              <img src={images[index % images.length]} alt={item.ten_danh_muc} />
              <h4>{item.ten_danh_muc}</h4>
              <p>{descriptions[item.ten_danh_muc.trim()] || 'Mô tả đang được cập nhật.'}</p>
            </div>
          ))}
        </section>

        {/* Nút xem thêm */}
        <div className="see-more-container">
          <button className="see-more-button" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Rút gọn' : 'Xem thêm'}
          </button>
        </div>

        {/* FAQ */}
        <section className="faq-section">
          <h2>Câu hỏi thường gặp từ khách hàng</h2>
          <div className="faq-list">
            {faqs.map((item, index) => (
              <details key={index} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Service;
