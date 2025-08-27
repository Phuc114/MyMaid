// src/pages/Service.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import './Service.css';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Chuyển tiếng Việt -> slug URL
const slugify = (s = '') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '');

const Service = () => {
  const navigate = useNavigate();
  const { grouped, categories, categoryMeta, loading, error } = useServices();

  // === SEARCH BAR (NEW) ===
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]); // danh sách dịch vụ tìm được
  const debounceRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    // Hủy request cũ nếu còn
    if (cancelRef.current) {
      cancelRef.current.cancel('cancel previous');
      cancelRef.current = null;
    }

    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    // debounce 300ms
    debounceRef.current && clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const source = axios.CancelToken.source();
        cancelRef.current = source;
        const res = await axios.get(`${API_BASE}/api/services/search`, {
          params: { q: query },
          cancelToken: source.token
        });
        setResults(res.data || []);
      } catch (e) {
        if (!axios.isCancel(e)) console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      debounceRef.current && clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="service-page">
      <Header />

      <main className="service-main-content">
        <PageBanner title="Dịch vụ" breadcrumb="Trang chủ > Dịch vụ" />

        {/* Intro */}
        <section className="service-intro">
          <h2>Dịch vụ dọn dẹp chuyên nghiệp cho mọi nhu cầu của bạn</h2>
          <p>Chọn phân loại để xem danh mục cụ thể và đặt lịch.</p>

          {/* === SEARCH BAR (NEW) === */}
          <div className="service-search-wrap">
            <input
              type="text"
              placeholder="Tìm dịch vụ theo tên (ví dụ: 'giặt nệm', 'tổng vệ sinh'...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="service-search-input"
            />
            {query && (
              <button className="service-search-clear" onClick={() => setQuery('')}>
                ✕
              </button>
            )}
          </div>

          {/* Kết quả tìm kiếm */}
          {query && (
            <div className="service-search-result">
              {searching && <div className="search-hint">Đang tìm…</div>}
              {!searching && results.length === 0 && (
                <div className="search-hint">Không tìm thấy dịch vụ phù hợp.</div>
              )}
              {!searching && results.length > 0 && (
                <div className="search-grid">
                  {results.map((it) => (
                    <div key={it.id_dich_vu} className="service-item-card">
                      <div className="svc-title">{it.ten_dich_vu}</div>
                      <div className="svc-meta">
                        <span className="badge">{it.ten_phan_loai}</span>
                        <span className="dot">•</span>
                        <span className="cat">{it.ten_danh_muc}</span>
                      </div>
                      <div className="svc-price">{it.gia_co_ban}</div>
                      {/* Tùy luồng của bạn: điều hướng tới danh mục hoặc checkout */}
                      <button
                        className="svc-book-btn"
                        onClick={() => {
                          // Ví dụ: chuyển sang trang danh mục chứa dịch vụ
                          navigate(`/service/${slugify(it.ten_danh_muc)}`);
                        }}
                      >
                        Xem & đặt lịch
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

                // FALLBACK từ mục con đầu tiên
                const firstChildWithImg = items.find(it => !!it.anh_minh_hoa);
                const img = catImgFromMeta || firstChildWithImg?.anh_minh_hoa || null;
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
                    <p className="desc-line">{desc || 'Xem các dịch vụ trong phân loại này'}</p>
                    <span className="view-more">Xem danh mục</span>
                  </div>
                );
              })}
            </section>

            {/* FAQ chỉ hiển thị ở trang phân loại */}
            <section className="faq-section">
              <h2>Câu hỏi thường gặp</h2>
              <div className="faq-list">
                {/* ... giữ nguyên phần FAQ của bạn ... */}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Service;
