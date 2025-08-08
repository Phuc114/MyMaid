// context/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  // ✅ Load dữ liệu user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.email && parsed.ho_ten) {
          setProfile(parsed);
        } else {
          console.warn('Dữ liệu user trong localStorage không hợp lệ:', parsed);
        }
      } catch (e) {
        console.error('Lỗi parse localStorage:', e);
      }
    }
  }, []);

  // ✅ Cập nhật profile
  const updateProfile = async (newData) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      if (!response.ok) throw new Error('Cập nhật thất bại');

      // 👉 Đây mới là user đã cập nhật – cần update lại context và localStorage
      const updatedUser = {
        ho_ten: newData.ho_ten,
        email: newData.email,
        so_dien_thoai: newData.so_dien_thoai,
        ngay_sinh: newData.ngay_sinh,
      };

      setProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // ✅ đúng format
      return { success: true };
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      return { success: false, message: error.message };
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
