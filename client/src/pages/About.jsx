// About.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import { useHome } from '../context/HomeContext';

const placeholder = (src) => (src && String(src).trim() ? src : '/images/placeholder.png');

export default function About() {
  const navigate = useNavigate();
  const { services } = useHome(); // tái dùng data như Home

  // ánh xạ tiêu đề -> đường dẫn chi tiết giống Home
  const routeForService = (title = '') => {
    const t = title.toLowerCase();

    if (t.includes('tổng vệ sinh')) {
      // http://localhost:3000/service/ve-sinh-tong-quat/tong-ve-sinh
      return '/service/ve-sinh-tong-quat/tong-ve-sinh';
    }
    if (t.includes('vệ sinh nhà cửa') || t.includes('vệ sinh nha cua')) {
      // http://localhost:3000/service/ve-sinh-tong-quat/ve-sinh-nha-cua
      return '/service/ve-sinh-tong-quat/ve-sinh-nha-cua';
    }
    if (t.includes('giặt sofa') || t.includes('giat sofa')) {
      // http://localhost:3000/service/ve-sinh-noi-that/giat-sofa
      return '/service/ve-sinh-noi-that/giat-sofa';
    }

    // fallback: mở trang danh sách dịch vụ
    return '/service';
  };

  return (
    <>
      <Header />
      <PageBanner title="Giới thiệu" />

      <div className="about-section">
        {/* Giới thiệu ngắn */}
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
            <button className="about-button" onClick={() => navigate('/service')}>Đặt lịch ngay</button>
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

        {/* Dịch vụ thịnh hành — giống Home */}
        <div className="service-intro">
          <h3>Hãy thử những dịch vụ thịnh hành của chúng tôi</h3>
          <p className="sub-desc">
            Chúng tôi luôn nỗ lực nâng cao chất lượng dịch vụ, đảm bảo sự hài lòng và tiện nghi cho khách hàng trong từng lần trải nghiệm.
          </p>

          <div className="service-grid">
            {(services || []).slice(0, 3).map((s) => (
              <article
                key={s.id || s.service_id || s.title}
                className="service-box service-box--clickable"
                onClick={() => navigate(routeForService(s.title))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(routeForService(s.title))}
              >
                <img src={placeholder(s.icon)} alt={s.title} />
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
