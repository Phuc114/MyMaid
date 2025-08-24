import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AdminHeader from '../../components/HeaderAdmin';
import './AdminServiceDetail.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// --- Component Modal ---
const ServiceModal = ({ service, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ten_dich_vu: '', mo_ta: '', gia_co_ban: '',
        id_danh_muc: '', anh_minh_hoa: '',
    });
    const [categories, setCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/categories`);
                if (!response.ok) throw new Error('Không thể tải danh mục');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (service) {
            const initialData = {
                ten_dich_vu: service.ten_dich_vu || '',
                mo_ta: service.mo_ta || '',
                gia_co_ban: service.gia_co_ban || '',
                id_danh_muc: service.id_danh_muc || '',
                anh_minh_hoa: service.anh_minh_hoa || '',
            };
            setFormData(initialData);
            setPreviewUrl(initialData.anh_minh_hoa);
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, selectedFile, service ? service.id_dich_vu : null);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Chỉnh sửa chi tiết dịch vụ</h2>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Tên dịch vụ</label>
                        <input type="text" name="ten_dich_vu" value={formData.ten_dich_vu} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Mô tả</label>
                        <textarea name="mo_ta" value={formData.mo_ta} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Giá</label>
                        <input type="text" name="gia_co_ban" value={formData.gia_co_ban} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Danh mục</label>
                        <select name="id_danh_muc" value={formData.id_danh_muc} onChange={handleChange} required>
                            <option value="" disabled>-- Chọn một danh mục --</option>
                            {categories.map(category => (
                                <option key={category.id_danh_muc} value={category.id_danh_muc}>
                                    {category.ten_danh_muc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ảnh minh họa</label>
                        {previewUrl && <img src={previewUrl} alt="Xem trước" className="image-preview" />}
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                        <button type="submit" className="btn-save">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Component Trang Chi Tiết ---
const AdminServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const categoryName = location.state?.categoryName;

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchServiceDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/services/${id}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không tìm thấy dịch vụ');
            }
            const data = await response.json();
            setService(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceDetail();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/services/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Xóa thất bại');
                }
                alert('Xóa dịch vụ thành công!');
                // Điều hướng về trang danh sách dịch vụ của danh mục đó
                navigate(`/admin/categories/${service.id_danh_muc}/services`);
            } catch (err) {
                alert(`Lỗi: ${err.message}`);
            }
        }
    };

    const handleSave = async (formData, file, serviceId) => {
        let updatedFormData = { ...formData };

        if (file) {
            try {
                const uploadData = new FormData();
                uploadData.append('serviceImage', file);
                const uploadRes = await fetch(`${API_BASE_URL}/api/admin/services/upload`, {
                    method: 'POST',
                    body: uploadData,
                });
                if (!uploadRes.ok) throw new Error('Tải ảnh lên thất bại');
                const { imageUrl } = await uploadRes.json();
                updatedFormData.anh_minh_hoa = imageUrl;
            } catch (err) {
                alert(`Lỗi tải ảnh: ${err.message}`);
                return;
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/services/${serviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Cập nhật thất bại');
            }
            alert('Cập nhật thành công!');
            setIsModalOpen(false);
            fetchServiceDetail();
        } catch (err) {
            alert(`Lỗi cập nhật dịch vụ: ${err.message}`);
        }
    };

    if (loading) return <div className="loading-state">Đang tải...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <>
            <div className="admin-service-detail-page">
                <AdminHeader />
                <main className="detail-main-content">
                    {service && (
                        <>
                            <div className="detail-header">
                                {/* --- SỬA LẠI BREADCRUMBS TẠI ĐÂY --- */}
                                <div className="breadcrumbs">
                                    <Link to="/admin/dashboard">Trang chủ</Link>
                                    <span>&gt;</span>
                                    <Link to="/admin/categories">Danh mục dịch vụ</Link>
                                    <span>&gt;</span>
                                    <Link to={`/admin/categories/${service.id_danh_muc}/services`} state={{ categoryName: categoryName || service.ten_danh_muc }}>
                                        {categoryName || service.ten_danh_muc || 'Dịch vụ'}
                                    </Link>
                                    <span>&gt;</span>
                                    <p>{service.ten_dich_vu}</p>
                                </div>
                                <div className="action-buttons-detail">
                                    <button className="edit-button-detail" onClick={() => setIsModalOpen(true)}>
                                        <i className="fas fa-pencil-alt"></i> Chỉnh sửa
                                    </button>
                                    <button className="delete-button-detail" onClick={handleDelete}>
                                        <i className="fas fa-trash-alt"></i> Xóa
                                    </button>
                                </div>
                            </div>

                            <div className="detail-content-area">
                                <div className="service-info-card">
                                    <img 
                                        src={service.anh_minh_hoa || 'https://placehold.co/300x200/e2e8f0/e2e8f0'} 
                                        alt={service.ten_dich_vu} 
                                        className="service-detail-image"
                                    />
                                    <h2>{service.ten_dich_vu}</h2>
                                    <p className="service-price">Giá: {service.gia_co_ban}</p>
                                    <div className="service-links">
                                        <div className="link-item">
                                            <i className="fas fa-folder-open"></i>
                                            <div>
                                                <p>Danh mục</p>
                                                <span>{categoryName || service.ten_danh_muc || 'Chưa phân loại'}</span>
                                            </div>
                                        </div>
                                        <div className="link-item">
                                            <i className="fas fa-toggle-on"></i>
                                            <div>
                                                <p>Trạng thái</p>
                                                <span className={`status-badge-detail ${service.trang_thai === 'active' ? 'active' : 'inactive'}`}>
                                                    {service.trang_thai === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="service-description-card">
                                    <h3>Mô tả chi tiết</h3>
                                    <p>{service.mo_ta || 'Chưa có mô tả cho dịch vụ này.'}</p>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
            {isModalOpen && (
                <ServiceModal 
                    service={service} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                />
            )}
        </>
    );
};

export default AdminServiceDetail;
