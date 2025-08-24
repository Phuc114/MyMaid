import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/HeaderAdmin';
import './CategoryManager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/categories`);
            if (!response.ok) throw new Error('Không thể tải danh mục');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div className="category-manager-page">
            <AdminHeader />
            <main className="category-main-content">
                <div className="breadcrumbs">
                    <Link to="/admin">Trang chủ</Link>
                    <span>&gt;</span>
                    <p>Danh mục</p>
                </div>

                <div className="page-header">
                    <h1 className="page-title">Quản lý Danh mục Dịch vụ</h1>
                </div>
                <div className="category-grid">
                    {/* Danh sách các danh mục */}
                    {categories.map(category => (
                        <Link 
                            to={`/admin/categories/${category.id_danh_muc}/services`} 
                            key={category.id_danh_muc} 
                            className="category-card-link"
                            state={{ categoryName: category.ten_danh_muc }}
                        >
                            <div className="category-card">
                                <img src={category.anh_minh_hoa || 'https://placehold.co/100x100/e2e8f0/e2e8f0'} alt={category.ten_danh_muc} />
                                <h3>{category.ten_danh_muc}</h3>
                                <p>{category.so_luong_dich_vu} dịch vụ</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CategoryManager;
