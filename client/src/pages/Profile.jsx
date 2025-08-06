import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageBanner from '../components/PageBanner';
import { useProfile } from '../context/ProfileContext';
import './Profile.css';

const Profile = () => {
  const { profile, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    ngay_sinh: '',
    dia_chi: ''
  });

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      await updateProfile(formData);
      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật.');
    }
  };

  return (
    <>
      <Header />
      <PageBanner 
        title="Hồ sơ cá nhân" 
        page="Hồ sơ cá nhân" 
        backgroundImage="/images/about-banner.png" 
      />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-form">
            <h2>Thông tin cá nhân của bạn</h2>
            <p>Cập nhật thông tin để MyMaid hỗ trợ tốt hơn.</p>
            <div className="form-grid">
              <input name="ho_ten" value={formData.ho_ten} onChange={handleChange} placeholder="Họ và tên" />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
              <input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} placeholder="Số điện thoại" />
              <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} />
              <input name="dia_chi" value={formData.dia_chi} onChange={handleChange} placeholder="Địa chỉ" />
            </div>
            <button onClick={handleSubmit}>Cập nhật</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
