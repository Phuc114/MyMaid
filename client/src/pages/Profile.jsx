// Profile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './Profile.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import { useProfile } from '../context/ProfileContext';

const Profile = () => {
  const { profile, saveProfile, fetchAvatarUrl } = useProfile();

  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    ngay_sinh: '',
  });
  const [initialData, setInitialData] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [notification, setNotification] = useState(null);

  // Avatar UI state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(''); // preview & hiển thị

  // Đổ dữ liệu profile có sẵn
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

  // Load avatar theo email từ context (backend)
  useEffect(() => {
    const load = async () => {
      if (!formData.email) return;
      const url = await fetchAvatarUrl(formData.email);
      setAvatarUrl(url || '');
    };
    load();
  }, [formData.email, fetchAvatarUrl]);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailError(validateEmail(value) ? '' : 'Email không hợp lệ');
  };

  const isModified = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData) || !!avatarFile;
  }, [formData, initialData, avatarFile]);

  // Chọn ảnh (preview tạm)
  const onChooseAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarUrl(URL.createObjectURL(f));
  };

  // Bấm cập nhật → giao cho context xử lý toàn bộ
  const handleUpdate = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError('Email không hợp lệ');
      return;
    }

    // thêm oldEmail để server biết record cũ
    const payload = { ...formData, oldEmail: initialData?.email };

    const result = await saveProfile(payload, avatarFile);
    if (result.success) {
      if (result.avatarUrl) setAvatarUrl(result.avatarUrl);
      setAvatarFile(null);
      setInitialData({ ...payload });
      setNotification({
        type: 'success',
        title: 'Cập nhật thành công!',
        message: 'Thông tin của bạn đã được lưu.',
      });
    } else {
      setNotification({
        type: 'error',
        title: 'Cập nhật thất bại!',
        message: result.message || 'Vui lòng thử lại sau.',
      });
    }
    setTimeout(() => setNotification(null), 1200);
  };

  return (
    <>
      <Header />
      <PageBanner title="Hồ sơ cá nhân" />

      <div className="profile-page grid-2cols">
        {/* LEFT: Form thông tin */}
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
            <button className="update-btn" onClick={handleUpdate} disabled={!isModified()}>
              Cập nhật
            </button>
          </div>
        </div>

        {/* RIGHT: Avatar + Upload + Contact */}
        <div className="profile-right">
          {/* Avatar block */}
          <div className="avatar-card">
            <img className="avatar-lg" src={avatarUrl || '/default-avatar.png'} alt="avatar" />

            {/* Hidden input + nút “Tải ảnh” */}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={onChooseAvatar}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="update-btn outline"
              onClick={() => document.getElementById('avatar-input').click()}
            >
              Tải ảnh
            </button>

            <p className="upload-note">
              Dung lượng tối đa <strong>2MB</strong>.<br />
              Định dạng hỗ trợ: <strong>JPG, PNG, WEBP</strong>.
            </p>
          </div>

          {/* Contact block */}
          <div className="contact-card">
            <h3>Thông tin liên hệ</h3>
            <p>
              785 Đường 15, Văn phòng 4.8
              <br />
              Quận Tân Bình, TP.HCM
            </p>
            <p>support@mymaid.vn</p>
            <p>
              <strong>+84 912 345 765</strong>
            </p>

            <div className="social-icons blue">
              <i className="fab fa-facebook" />
              <i className="fab fa-twitter" />
              <i className="fab fa-instagram" />
              <i className="fab fa-google" />
            </div>
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
          <div className="popup-close" onClick={() => setNotification(null)}>
            ×
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Profile;
