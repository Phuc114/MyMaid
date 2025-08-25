import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import AdminHeader from '../components/HeaderAdmin';
import './CategoryManager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CategoryServiceList = () => {
    const { categoryId } = useParams();
    const location = useLocation(); // ✅ Lấy thông tin location
    const categoryName = location.state?.categoryName || 'Danh mục'; // ✅ Lấy tên danh mục từ state
    
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}/services`);
                if (!response.ok) throw new Error('Không thể tải dịch vụ');
                const data = await response.json();
                setServices(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [categoryId]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div className="category-manager-page">
            <AdminHeader />
            <main className="category-main-content">
                {/* ✅ BREADCRUMB ĐÃ ĐƯỢC THÊM VÀO ĐÂY */}
                <div className="breadcrumbs">
                    <Link to="/admin">Trang chủ</Link>
                    <span>&gt;</span>
                    <Link to="/admin/categories">Danh mục</Link>
                    <span>&gt;</span>
                    <p>{categoryName}</p>
                </div>

                <div className="page-header">
                    <h1 className="page-title">Dịch vụ trong "{categoryName}"</h1>
                </div>
                <div className="service-list-grid">
                     {services.map((service) => (
                        <Link to={`/admin/services/${service.id_dich_vu}`} key={service.id_dich_vu} className="category-card-link">
                            <div className="service-card">
                                <img src={service.anh_minh_hoa || 'https://placehold.co/100x100/e2e8f0/e2e8f0'} alt={service.ten_dich_vu} />
                                <h3>{service.ten_dich_vu}</h3>
                                <p className="price">{service.gia_co_ban}</p>
                                <span className={`status ${service.trang_thai}`}>{service.trang_thai}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CategoryServiceList;
