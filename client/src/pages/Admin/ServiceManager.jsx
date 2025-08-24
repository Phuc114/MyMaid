import React, { useState, useEffect } from 'react';
import AdminHeader from '../../components/HeaderAdmin';
import './ServiceManager.css';
import { Link } from 'react-router-dom'; // ✅ 1. Thêm import ở đầu file

// URL cơ sở của backend, đọc từ biến môi trường hoặc mặc định
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Component cho Modal (Form Thêm/Sửa)
const ServiceModal = ({ service, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ten_dich_vu: '',
        mo_ta: '',
        gia_co_ban: '',
        id_danh_muc: '',
        anh_minh_hoa: '',
    });

    useEffect(() => {
        if (service) {
            // Nếu là chỉnh sửa, điền thông tin có sẵn
            setFormData({
                ten_dich_vu: service.name || '',
                mo_ta: service.description || '',
                gia_co_ban: service.price || '',
                id_danh_muc: service.id_danh_muc || '',
                anh_minh_hoa: service.image || '',
            });
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, service ? service.id : null);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="ten_dich_vu" value={formData.ten_dich_vu} onChange={handleChange} placeholder="Tên dịch vụ" required />
                    <textarea name="mo_ta" value={formData.mo_ta} onChange={handleChange} placeholder="Mô tả"></textarea>
                    <input type="text" name="gia_co_ban" value={formData.gia_co_ban} onChange={handleChange} placeholder="Giá" required />
                    <input type="number" name="id_danh_muc" value={formData.id_danh_muc} onChange={handleChange} placeholder="ID Danh mục" required />
                    <input type="text" name="anh_minh_hoa" value={formData.anh_minh_hoa} onChange={handleChange} placeholder="URL Ảnh minh họa" />
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
                        <button type="submit" className="btn-save">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ServiceManager = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null); // State để quản lý menu đang mở

    // Hàm lấy dữ liệu từ backend
    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/services`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tải dữ liệu');
            }
            const data = await response.json();
            const formattedServices = data.map(service => ({
                id: service.id_dich_vu,
                name: service.ten_dich_vu,
                description: service.mo_ta,
                price: service.gia_co_ban,
                status: service.trang_thai === 'active',
                image: service.anh_minh_hoa || `https://placehold.co/60x60/a7c957/white?text=DV`,
                id_danh_muc: service.id_danh_muc,
            }));
            setServices(formattedServices);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        
        // Thêm sự kiện để đóng menu khi click ra ngoài
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu')) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleMenu = (serviceId) => {
        setActiveMenuId(prevId => (prevId === serviceId ? null : serviceId));
    };

    const handleOpenModal = (service = null) => {
        setEditingService(service);
        setIsModalOpen(true);
        setActiveMenuId(null); // Đóng menu sau khi mở modal
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSaveService = async (formData, serviceId) => {
        const url = serviceId ? `${API_BASE_URL}/api/admin/services/${serviceId}` : `${API_BASE_URL}/api/admin/services`;
        const method = serviceId ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Thao tác thất bại');
            }
            handleCloseModal();
            fetchServices();
        } catch (err) {
            alert(`Lỗi: ${err.message}`);
        }
    };

    const handleDeleteService = async (serviceId) => {
        setActiveMenuId(null); // Đóng menu trước
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/services/${serviceId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Xóa thất bại');
                }
                fetchServices();
            } catch (err) {
                alert(`Lỗi: ${err.message}`);
            }
        }
    };
    
    const handleStatusToggle = async (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;
        const newStatus = !service.status;
        setServices(services.map(s => s.id === serviceId ? { ...s, status: newStatus } : s));
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/services/${serviceId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus ? 'active' : 'inactive' }),
            });
            if (!response.ok) throw new Error('Cập nhật thất bại');
        } catch (err) {
            alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
            setServices(services.map(s => s.id === serviceId ? { ...s, status: !newStatus } : s));
        }
    };

    if (loading) return (
        <div className="service-manager-page"><AdminHeader /><main className="service-manager-main"><div className="loading-message">Đang tải...</div></main></div>
    );

    if (error) return (
        <div className="service-manager-page"><AdminHeader /><main className="service-manager-main"><div className="error-message">Lỗi: {error}</div></main></div>
    );

    return (
        <div className="service-manager-page">
            <AdminHeader />
            <main className="service-manager-main">
                <div className="page-header">
                    <h1 className="page-title">Quản lý dịch vụ</h1>
                    <button className="add-service-btn" onClick={() => handleOpenModal()}>
                        <i className="fas fa-plus"></i>
                        <span>Thêm dịch vụ</span>
                    </button>
                </div>

                <div className="service-list-card">
                    <table className="service-table">
                        <thead>
                            <tr>
                                <th>Tên dịch vụ</th>
                                <th>Mô tả</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td>
                                        <div className="service-info">
                                            <img src={service.image} alt={service.name} className="service-image" />
                                            {/* ✅ 2. Bọc tên dịch vụ trong thẻ Link */}
                                            <Link to={`/admin/services/${service.id}`} className="service-link">
                                                {service.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="service-description">{service.description}</td>
                                    <td>{service.price}</td>
                                    <td>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={service.status} onChange={() => handleStatusToggle(service.id)} />
                                            <span className="slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div className="action-menu">
                                            <button className="action-dots" onClick={() => handleToggleMenu(service.id)}>
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            {activeMenuId === service.id && (
                                                <div className="dropdown">
                                                    <button className="edit-btn" onClick={() => handleOpenModal(service)}>✏️ Chỉnh sửa</button>
                                                    <button className="delete-btn" onClick={() => handleDeleteService(service.id)}>🗑️ Xoá</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
            {isModalOpen && <ServiceModal service={editingService} onClose={handleCloseModal} onSave={handleSaveService} />}
        </div>
    );
};

export default ServiceManager;
