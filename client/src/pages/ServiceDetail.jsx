// src/pages/ServiceDetail.jsx
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Service.css';
import { useServices } from '../context/ServiceContext';

const slugify = (s='') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

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

      <div className="service-main-content" style={{maxWidth: 900, margin: '0 auto', padding: 20}}>
        <div style={{textAlign:'center', marginBottom: 20}}>
          <h3 className="category-title" style={{marginBottom: 6}}>
            {serviceItem ? serviceItem.ten_danh_muc : 'Không tìm thấy dịch vụ'}
          </h3>
          {serviceItem && (
            <p className="category-subtitle">{serviceItem.mo_ta || 'Mô tả đang cập nhật.'}</p>
          )}
        </div>

        {serviceItem && (
          <div className="service-card" style={{cursor:'default'}}>
            {serviceItem.anh_minh_hoa && (
              <img src={serviceItem.anh_minh_hoa} alt={serviceItem.ten_danh_muc} />
            )}
            <h4>Thông tin dịch vụ</h4>
            <ul>
              <li>Mã danh mục: {serviceItem.id_danh_muc}</li>
              <li>Thuộc phân loại: {categoryName}</li>
            </ul>

            <Link to="/checkout" className="see-more-button" style={{display:'inline-block', marginTop:16}}>
              Đặt lịch ngay
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
