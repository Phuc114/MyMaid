// client/src/pages/ServiceDetail.jsx
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Service.css';
import { useServices } from '../context/ServiceContext';

const slugify = (s='') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g,'-')
   .replace(/^-+|-+$/g,'');

const ServiceDetail = () => {
  const { category: catSlug, service: svcSlug } = useParams();
  const { grouped, categories } = useServices();

  const categoryName = useMemo(() => {
    for (const c of categories) if (slugify(c) === catSlug) return c;
    return null;
  }, [categories, catSlug]);

  const serviceItem = useMemo(() => {
    if (!categoryName) return null;
    const list = grouped[categoryName] || [];
    for (const it of list) if (slugify(it.ten_danh_muc) === svcSlug) return it;
    return null;
  }, [grouped, categoryName, svcSlug]);

  return (
    <div className="service-page">
      <Header />
      <PageBanner title="Dịch vụ" path="Trang chủ > Dịch vụ" />

      <div className="service-main-content">
        {serviceItem ? (
          <div className="service-detail-card">
            {serviceItem.anh_minh_hoa && (
              <img src={serviceItem.anh_minh_hoa} alt={serviceItem.ten_danh_muc} />
            )}
            <h2>{serviceItem.ten_danh_muc}</h2>
            <p>{serviceItem.mo_ta || 'Mô tả đang cập nhật.'}</p>

            {/* Truyền id_danh_muc sang Checkout qua state; đồng thời lưu sessionStorage đề phòng refresh */}
            <Link
              to="/checkout"
              state={{ danhMucId: serviceItem.id_danh_muc }}
              onClick={() => {
                sessionStorage.setItem('danhMucId', String(serviceItem.id_danh_muc));
              }}
              className="see-more-button"
              style={{ display: 'inline-block', marginTop: 16 }}
            >
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          <div className="loading">Không tìm thấy dịch vụ.</div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
