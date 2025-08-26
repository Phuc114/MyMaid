// client/src/pages/Favorites.jsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Favorites.css";

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const Favorites = () => {
  const [tab, setTab] = useState('services'); // 'services' | 'maids'
  const [services, setServices] = useState([]);
  const [maids, setMaids] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/favorites/services`, { headers: authHeaders() });
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaids = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/favorites/maids`, { headers: authHeaders() });
      const data = await res.json();
      setMaids(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'services') fetchServices();
    if (tab === 'maids') fetchMaids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const removeService = async (id) => {
    await fetch(`${API_BASE}/api/favorites/services/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    setServices(s => s.filter(x => x.id_dich_vu !== id));
  };

  const removeMaid = async (id) => {
    await fetch(`${API_BASE}/api/favorites/maids/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    setMaids(m => m.filter(x => x.id_maid !== id));
  };

  return (
    <div className="favorites-page">
      <Header />
      <div className="container">
        <div className="breadcrumb">Trang chủ &gt; Yêu thích</div>
        <h1>Yêu thích</h1>

        <div className="fav-tabs">
          <button
            className={tab === 'services' ? 'active' : ''}
            onClick={() => setTab('services')}
          >
            Dịch vụ yêu thích
          </button>
          <button
            className={tab === 'maids' ? 'active' : ''}
            onClick={() => setTab('maids')}
          >
            Maid yêu thích
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : tab === 'services' ? (
          <div className="fav-grid">
            {services.length === 0 ? (
              <p>Chưa có dịch vụ nào trong danh sách yêu thích.</p>
            ) : services.map(s => (
              <div className="fav-card" key={s.id_dich_vu}>
                <div className="fav-card__body">
                  <h3>{s.ten_dich_vu}</h3>
                  <div className="meta">
                    <span className="price">{s.gia_co_ban ? s.gia_co_ban : ''}</span>
                    {s.don_vi && <span className="unit">/{s.don_vi}</span>}
                  </div>
                </div>
                <div className="fav-card__actions">
                  <button className="btn-outline" onClick={() => removeService(s.id_dich_vu)}>Bỏ thích</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fav-grid">
            {maids.length === 0 ? (
              <p>Chưa có maid nào trong danh sách yêu thích.</p>
            ) : maids.map(m => (
              <div className="fav-card" key={m.id_maid}>
                <div className="fav-card__body">
                  <div className="maid-row">
                    <img className="maid-avatar" src={m.anh_dai_dien || '/images/maid1.png'} alt={m.ho_ten} />
                    <div>
                      <h3>{m.ho_ten}</h3>
                      {m.mo_ta && <p className="sub">{m.mo_ta}</p>}
                    </div>
                  </div>
                </div>
                <div className="fav-card__actions">
                  <button className="btn-outline" onClick={() => removeMaid(m.id_maid)}>Bỏ thích</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
