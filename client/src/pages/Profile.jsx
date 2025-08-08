// Profile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import { useProfile } from '../context/ProfileContext';

const Profile = () => {
  const { profile, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    ngay_sinh: '',
  });
  const [initialData, setInitialData] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (profile) {
      const formatted = {
        ...profile,
        ngay_sinh: profile.ngay_sinh ? profile.ngay_sinh.split('T')[0] : '',
      };
      setFormData(formatted);
      setInitialData(formatted);
    }
  }, [profile]);

  const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setEmailError(validateEmail(value) ? '' : 'Email không hợp lệ');
    }
  };

  const isModified = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleUpdate = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError('Email không hợp lệ');
      return;
    }

    const updatedData = {
      ...formData,
      oldEmail: initialData.email,
    };

    const result = await updateProfile(updatedData);
    if (result.success) {
      setNotification({
        type: 'success',
        title: 'Cập nhật thành công!',
        message: 'Thông tin của bạn đã được lưu.',
      });
      setInitialData(updatedData);
    } else {
      setNotification({
        type: 'error',
        title: 'Cập nhật thất bại!',
        message: 'Vui lòng thử lại sau.',
      });
    }

    setTimeout(() => setNotification(null), 1200);
  };

  return (
    <>
      <Header />
      <PageBanner title="Hồ sơ cá nhân" />

      <div className="profile-page">
        <div className="profile-left">
          <h2>Thông tin cá nhân của bạn</h2>
          <p className="subtitle">
            Hãy đảm bảo thông tin của bạn luôn chính xác để MyMaid phục vụ tốt hơn và bảo mật tài khoản hiệu quả hơn.
          </p>

          <div className="form-group">
            <label>Họ và tên</label>
            <input name="ho_ten" value={formData.ho_ten} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} />
            {emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input type="date" name="ngay_sinh" value={formData.ngay_sinh || ''} onChange={handleChange} />
          </div>

          <div className="btn-group">
            <button className="update-btn" onClick={handleUpdate}>Cập nhật</button>
          </div>
        </div>

        <div className="profile-right">
          <h3>Thông tin liên hệ</h3>
          <p>785 Đường 15, Văn phòng 4.8<br />Quận Tân Bình, TP.HCM</p>
          <p>support@mymaid.vn</p>
          <p><strong>+84 912 345 765</strong></p>

          <div className="social-icons blue">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-google"></i>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`popup-notification ${notification.type}`}>
          <div className="popup-icon">
            <img
              src={notification.type === 'success' ? '/images/check.png' : '/images/delete.png'}
              alt={notification.type}
              className="popup-img"
            />
          </div>

          <div className="popup-content">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
          <div className="popup-close" onClick={() => setNotification(null)}>×</div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Profile;
