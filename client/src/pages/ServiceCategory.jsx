// src/pages/ServiceCategory.jsx
import React, { useMemo } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Service.css';
import { useServices } from '../context/ServiceContext';

const slugify = (s='') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

const ServiceCategory = () => {
  const { grouped, categories, loading, error } = useServices();
  const { category } = useParams();
  const navigate = useNavigate();

  const categoryName = useMemo(() => {
    for (const c of categories) if (slugify(c) === category) return c;
    return null;
  }, [categories, category]);

  const items = categoryName ? (grouped[categoryName] || []) : [];

  return (
    <div className="service-page">
      <Header />
      <PageBanner title="Dịch vụ" path="Trang chủ > Dịch vụ" />

      <div className="service-main-content">
        <div className="category-header" style={{ textAlign: 'center', margin: '20px auto 30px' }}>
          {!loading && !error && <h3 className="category-title">{categoryName || 'Không tìm thấy phân loại'}</h3>}
          {categoryName && <p className="category-subtitle">Chọn danh mục để xem chi tiết & đặt lịch.</p>}
        </div>

        {loading && <div className="loading">Đang tải…</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && categoryName && (
          <section className="service-grid">
            {items.map(item => (
              <div
                key={item.id_danh_muc}
                className="service-card"
                onClick={() => navigate(`/service/${category}/${slugify(item.ten_danh_muc)}`)}
              >
                {item.anh_minh_hoa && (
                  <img src={item.anh_minh_hoa} alt={item.ten_danh_muc} />
                )}
                <h4>{item.ten_danh_muc}</h4>
                <p>{item.mo_ta || 'Mô tả đang cập nhật.'}</p>
              </div>
            ))}
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceCategory;
