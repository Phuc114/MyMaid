// src/context/OrderHistoryContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
  } from 'react';
  
  // Base URL giống ProfileContext để tránh gọi nhầm sang FE
  const BASE_URL = 'http://localhost:5000';
  
  const STATUS_MAP = {
    pending:     { label: 'Đang chờ',    className: 'pending' },
    confirmed:   { label: 'Đã xác nhận', className: 'pending' },
    in_progress: { label: 'Đang làm',    className: 'pending' },
    completed:   { label: 'Hoàn thành',  className: 'completed' },
    cancelled:   { label: 'Đã hủy',      className: 'cancelled' },
  };
  
  const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
  const formatDateVN = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    const wd = d.toLocaleDateString('vi-VN', { weekday: 'long' });
    return `${wd}, ${d.toLocaleDateString('vi-VN')}`;
  };
  
  const OrderHistoryContext = createContext(null);
  export const useOrderHistory = () => useContext(OrderHistoryContext);
  
  export function OrderHistoryProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
  
    // Lấy token giống các phần khác (đăng nhập xong lưu vào localStorage)
    const token = (() => {
      try {
        return localStorage.getItem('token') || '';
      } catch { return ''; }
    })();
  
    const load = useCallback(
      async (p, ps) => {
        if (!token) {
          setOrders([]);
          setError('Thiếu token. Vui lòng đăng nhập.');
          return;
        }
        setLoading(true);
        setError('');
        try {
          const res = await fetch(
            `${BASE_URL}/api/orders/history?page=${p}&pageSize=${ps}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          // Bắt lỗi trả về HTML để không bị "Unexpected token '<'"
          const ct = res.headers.get('content-type') || '';
          if (!ct.includes('application/json')) {
            const body = await res.text();
            throw new Error(
              `Response không phải JSON (HTTP ${res.status}). Kiểm tra BASE_URL/route.\n${body.slice(0, 80)}`
            );
          }
  
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.message || `HTTP ${res.status}`);
          }
  
          const json = await res.json();
          const mapped = (json.data || []).map((o) => {
            const m = STATUS_MAP[o.status] || STATUS_MAP.pending;
            const start = hhmm(o.startTime);
            const end = hhmm(o.endTime);
            const hours =
              o.hours != null ? Number(o.hours) : null;
            const hoursLabel =
              hours != null
                ? `${hours.toString().replace('.5', ',5')} tiếng`
                : '';
  
            return {
              id: o.id,
              title: o.serviceName, // JOIN từ dich_vu
              date: `${formatDateVN(o.date)}${start ? ` - ${start}` : ''}`,
              time:
                start && end
                  ? `${hoursLabel ? `${hoursLabel}, ` : ''}${start} - ${end}`
                  : hoursLabel || start || '',
              address: o.address, // dia_chi_da_luu.dia_chi_day_du
              status: m.label,
              statusClass: m.className,
            };
          });
  
          setOrders(mapped);
          setTotal(json.total ?? mapped.length);
          setPage(json.page ?? p);
          setPageSize(json.pageSize ?? ps);
        } catch (e) {
          console.error('[orders/history] error:', e);
          setError(e.message || 'Không tải được lịch sử đơn hàng');
        } finally {
          setLoading(false);
        }
      },
      [token]
    );
  
    // Load lần đầu
    useEffect(() => {
      if (token) load(1, pageSize);
    }, [token, pageSize, load]);
  
    const value = useMemo(
      () => ({
        orders,
        loading,
        error,
        page,
        pageSize,
        total,
        setPage,
        setPageSize,
        refresh: () => load(page, pageSize),
        load,
      }),
      [orders, loading, error, page, pageSize, total, load]
    );
  
    return (
      <OrderHistoryContext.Provider value={value}>
        {children}
      </OrderHistoryContext.Provider>
    );
  }
  