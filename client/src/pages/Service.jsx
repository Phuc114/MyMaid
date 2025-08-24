// src/pages/Service.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Service.css';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';

// Chuyển tiếng Việt -> slug URL
const slugify = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '');

const Service = () => {
  // NEW: lấy categoryMeta từ context (nếu ServiceContext đã cung cấp)
  // categoryMeta: { [ten_phan_loai]: { anh_minh_hoa: string|null, mo_ta: string|null } }
  const { grouped, categories, loading, error, categoryMeta } = useServices();
  const navigate = useNavigate();

  return (
    <div className="service-page">
      <Header />
      <PageBanner title="Dịch vụ" path="Trang chủ > Dịch vụ" />

      <div className="service-main-content">
        {/* Intro chỉ xuất hiện ở trang phân loại */}
        <section className="service-intro">
          <h2>Dịch vụ dọn dẹp chuyên nghiệp cho mọi nhu cầu của bạn</h2>
          <p>Chọn phân loại để xem danh mục cụ thể và đặt lịch.</p>
        </section>

        {loading && <div className="loading">Đang tải danh mục…</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <>
            {/* 4 phân loại – 1 hàng 4 card, dữ liệu lấy từ DB */}
            <section className="service-grid categories">
              {categories.map((cat) => {
                const items = grouped[cat] || [];

                // ƯU TIÊN ảnh/mô tả từ bảng phan_loai_dich_vu (categoryMeta)
                const catImgFromMeta = categoryMeta?.[cat]?.anh_minh_hoa || null;
                const catDescFromMeta = categoryMeta?.[cat]?.mo_ta || null;

                // FALLBACK: dùng ảnh/mô tả của danh mục con đầu tiên (nếu meta chưa có)
                const firstChildWithImg = items.find(it => !!it.anh_minh_hoa);
                const img = catImgFromMeta || firstChildWithImg?.anh_minh_hoa || null;

                // nếu meta mo_ta rỗng, dùng mo_ta của mục con đầu
                const firstChildDesc = items[0]?.mo_ta || null;
                const desc = (catDescFromMeta && catDescFromMeta.trim()) ? catDescFromMeta : (firstChildDesc || '');

                return (
                  <div
                    key={cat}
                    className="service-card category-card"
                    onClick={() => navigate(`/service/${slugify(cat)}`)}
                  >
                    {img && <img src={img} alt={cat} />}
                    <h4>{cat}</h4>
                    {/* Chỉ hiển thị <p> khi có mô tả từ DB */}
                    {desc ? <p>{desc}</p> : <p style={{opacity: .7}}>Mô tả đang cập nhật.</p>}
                  </div>
                );
              })}
            </section>

            {/* FAQ chỉ hiển thị ở trang phân loại */}
            <section className="faq-section">
              <h2>Câu hỏi thường gặp</h2>
              <div className="faq-list">
                {[
                  { q: 'Tôi có thể đặt lịch dọn ở đâu?', a: 'Bạn có thể đặt lịch trực tiếp trên trang web hoặc gọi đến tổng đài MyMaid để được hỗ trợ.' },
                  { q: 'MyMaid có làm việc vào cuối tuần không?', a: 'Có. Chúng tôi làm việc tất cả các ngày trong tuần, bao gồm cả cuối tuần và ngày lễ.' },
                  { q: 'Tôi có thể huỷ lịch đã đặt không?', a: 'Hoàn toàn có thể, chỉ cần huỷ trước 2 giờ trước khi bắt đầu dịch vụ.' },
                  { q: 'Nhân viên đến nhà có được kiểm tra lý lịch không?', a: 'Tất cả nhân viên của MyMaid đều đã được kiểm tra lý lịch và đào tạo bài bản.' },
                  { q: 'Tôi muốn đặt lịch cố định mỗi tuần, có được không?', a: 'Có, bạn có thể chọn dịch vụ định kỳ theo tuần hoặc theo tháng.' },
                  { q: 'Có thể chọn nhân viên quen thuộc cho lần dọn tiếp theo không?', a: 'Chúng tôi hỗ trợ bạn chọn lại nhân viên từng phục vụ nếu lịch làm việc của họ phù hợp.' },
                ].map((f, i) => (
                  <details key={i} className="faq-item">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Service;
