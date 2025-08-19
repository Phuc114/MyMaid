// client/src/context/ServiceContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const ServiceCtx = createContext();
export const useServices = () => useContext(ServiceCtx);

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const ServiceProvider = ({ children }) => {
  const [grouped, setGrouped] = useState({});      // { "Vệ sinh tổng quát": [ {id_danh_muc, ten_danh_muc, anh_minh_hoa, mo_ta}, ... ], ... }
  const [categoryMeta, setCategoryMeta] = useState({}); // { "Vệ sinh tổng quát": { anh_minh_hoa, mo_ta }, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi song song: grouped + flat (để lấy meta phân loại)
        const [grpRes, flatRes] = await Promise.all([
          axios.get(`${API_BASE}/api/services/grouped`),
          axios.get(`${API_BASE}/api/services`)
        ]);

        const groupedData = grpRes.data || {};
        setGrouped(groupedData);

        // Dựng categoryMeta từ response phẳng (đã JOIN phan_loai_dich_vu)
        // Mỗi row có: ten_phan_loai, anh_phan_loai, mo_ta_phan_loai
        const metaMap = {};
        for (const row of (flatRes.data || [])) {
          const cat = row.ten_phan_loai;
          if (!cat) continue;
          if (!metaMap[cat]) {
            metaMap[cat] = {
              anh_minh_hoa: row.anh_phan_loai || null,
              mo_ta: row.mo_ta_phan_loai || ''
            };
          }
        }
        setCategoryMeta(metaMap);

      } catch (e) {
        console.error(e);
        const msg = e?.response?.data?.error || e.message || 'Không thể tải danh mục dịch vụ.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => Object.keys(grouped), [grouped]);

  const value = { grouped, categories, categoryMeta, loading, error };
  return <ServiceCtx.Provider value={value}>{children}</ServiceCtx.Provider>;
};
