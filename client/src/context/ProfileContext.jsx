// context/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();
export const useProfile = () => useContext(ProfileContext);

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  // Load user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.email && parsed?.ho_ten) setProfile(parsed);
      } catch (e) {
        console.error('Lỗi parse localStorage:', e);
      }
    }
  }, []);

  // Lấy URL avatar (public hoặc signed) theo email
  const fetchAvatarUrl = async (email) => {
    try {
      if (!email) return '';
      const res = await fetch(`${API_BASE}/api/profile/avatar?email=${encodeURIComponent(email)}`);
      if (!res.ok) return '';
      const data = await res.json();
      return data?.url || '';
    } catch {
      return '';
    }
  };

  // Cập nhật profile (có/không có avatar)
  const saveProfile = async (formData, avatarFile) => {
    try {
      let ok = false;
      let newEmail = formData.email;

      if (avatarFile) {
        // multipart: update-with-avatar
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        fd.append('email', formData.email);
        fd.append('ho_ten', formData.ho_ten);
        fd.append('so_dien_thoai', formData.so_dien_thoai);
        fd.append('ngay_sinh', formData.ngay_sinh || '');
        fd.append('oldEmail', formData.oldEmail || formData.email); // fallback

        const res = await fetch(`${API_BASE}/api/profile/update-with-avatar`, {
          method: 'PUT',
          body: fd,
        });
        ok = res.ok;

        // Server có thể trả object mới — lấy lại email nếu đổi
        try {
          const payload = await res.json();
          if (payload?.email) newEmail = payload.email;
        } catch {}
      } else {
        // JSON: update thông tin
        const res = await fetch(`${API_BASE}/api/profile/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ho_ten: formData.ho_ten,
            email: formData.email,
            so_dien_thoai: formData.so_dien_thoai,
            ngay_sinh: formData.ngay_sinh,
            oldEmail: formData.oldEmail,
          }),
        });
        ok = res.ok;
      }

      if (!ok) throw new Error('Cập nhật thất bại');

      // Cập nhật state + localStorage
      const updatedUser = {
        ho_ten: formData.ho_ten,
        email: newEmail,
        so_dien_thoai: formData.so_dien_thoai,
        ngay_sinh: formData.ngay_sinh,
      };
      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Lấy avatarUrl mới (nếu có upload)
      const avatarUrl = await fetchAvatarUrl(newEmail);

      return { success: true, avatarUrl };
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      return { success: false, message: error.message };
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        saveProfile,       // dùng để cập nhật (có/không avatar)
        fetchAvatarUrl,    // dùng để load ảnh khi vào trang
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
