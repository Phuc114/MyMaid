import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const HomeContext = createContext(null);

// helper: luôn trả mảng
const asList = (x) => {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray(x.data)) return x.data;
  return [];
};

export function HomeProvider({ children }) {
  const [services, setServices] = useState([]);
  const [maids, setMaids] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [categories, setCategories] = useState([]); // dùng cho picker ở form
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);

        // Lấy dữ liệu trang chủ
        const [svRes, mdRes, tsRes] = await Promise.all([
          fetch(`${API_BASE}/api/home/services?limit=3`, { credentials: "include" }),
          fetch(`${API_BASE}/api/home/maids?limit=4`, { credentials: "include" }),
          fetch(`${API_BASE}/api/home/testimonials?limit=6`, { credentials: "include" }),
        ]);

        const [sv, md, ts] = await Promise.all([svRes.json(), mdRes.json(), tsRes.json()]);

        // Lấy danh mục dịch vụ (tuỳ backend: /api/services hoặc /api/services/categories)
        let cats = [];
        try {
          const cats1 = await fetch(`${API_BASE}/api/services`, { credentials: "include" })
            .then((r) => r.json());
          cats = asList(cats1);
          if (!cats.length) {
            const cats2 = await fetch(`${API_BASE}/api/services/categories`, { credentials: "include" })
              .then((r) => r.json());
            cats = asList(cats2);
          }
        } catch {
          cats = [];
        }

        if (!alive) return;

        setServices(asList(sv));
        setMaids(asList(md));
        setTestimonials(asList(ts));

        // Chuẩn hoá category
        let normalized = cats.map((c) => ({
          id: c.id ?? c.id_danh_muc ?? c.category_id,
          name: c.name ?? c.ten_danh_muc ?? c.title,
          icon: c.icon ?? c.anh_minh_hoa ?? null,
          mo_ta: c.mo_ta ?? c.desc ?? "",
        }));

        // Nếu backend trả grouped object
        if (!normalized.length && cats && typeof cats === "object") {
          const flat = Object.values(cats).flat();
          normalized = flat.map((c) => ({
            id: c.id ?? c.id_danh_muc ?? c.category_id,
            name: c.name ?? c.ten_danh_muc ?? c.title,
            icon: c.icon ?? c.anh_minh_hoa ?? null,
            mo_ta: c.mo_ta ?? c.desc ?? "",
          }));
        }

        setCategories(normalized);
        setError("");
      } catch (e) {
        console.error("HomeProvider load error:", e);
        if (!alive) return;
        setError("Không tải được dữ liệu trang chủ");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  /** --------------- API dùng chung: gửi tin nhắn liên hệ --------------- */
  async function sendMessage({ ho_ten, email, loai_dich_vu, ghi_chu }) {
    try {
      const payload = {
        ho_ten: (ho_ten || "").trim(),
        email: (email || "").trim(),
        loai_dich_vu: (loai_dich_vu || "").trim(),
        ghi_chu: (ghi_chu || "").trim() || null,
      };

      // validate nhanh phía client
      if (!payload.ho_ten || !payload.email || !payload.loai_dich_vu) {
        return { ok: false, message: "Vui lòng nhập họ tên, email và chọn loại dịch vụ." };
      }

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gửi thất bại, vui lòng thử lại.");

      return { ok: true, message: data?.message || "Đã gửi tin nhắn thành công!" };
    } catch (err) {
      return { ok: false, message: err.message || "Có lỗi xảy ra. Vui lòng thử lại." };
    }
  }

  const value = useMemo(() => ({
    services,
    maids,
    testimonials,
    categories,
    loading,
    error,
    sendMessage, // 👈 expose để Home/Contact dùng chung
  }), [services, maids, testimonials, categories, loading, error]);

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHome() phải được dùng trong <HomeProvider>");
  return ctx;
}