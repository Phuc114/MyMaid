import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './HeaderFooter.css';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="top-info-bar">
        <span>Hotline: 1900 1234</span>
        <span>Email: cskh@mymaid.vn</span>
        <span>Địa chỉ: 123 Trần Hưng Đạo, Quận 1, TP.HCM</span>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">
          <img src="/images/logo.png" alt="MyMaid Logo" />
          <span>MyMaid</span>
        </div>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li><NavLink to="/" end>Trang chủ</NavLink></li>
          <li className="dropdown">
            <NavLink to="/service">Dịch vụ</NavLink>
            <ul className="dropdown-menu">
              <li><a href="#">Dọn dẹp nhà</a></li>
              <li><a href="#">Dọn dẹp văn phòng</a></li>
              <li><a href="#">Vệ sinh sofa, rèm nệm</a></li>
              <li><a href="#">Giặt ủi</a></li>
            </ul>
          </li>
          <li><a href="#">Pages</a></li>
          <li><NavLink to="/about">Giới thiệu</NavLink></li>
          <li><NavLink to="/contact">Liên hệ</NavLink></li>
        </ul>

        {/* Right Icons */}
        <div className="nav-icons">
          <img src="/images/search.png" alt="Search" className="search-icon" />

          {isLoggedIn ? (
            <div className="avatar-dropdown" ref={dropdownRef}>
              <img
                src="/images/maid.png"
                alt="User"
                className="user-avatar"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu();
                }}
              />
              {menuOpen && (
                <div className="dropdown-menu-avatar">
                  <div onClick={() => { navigate('/profile'); setMenuOpen(false); }}>Chỉnh sửa hồ sơ</div>
                  <div onClick={() => { navigate('/change-password'); setMenuOpen(false); }}>Đổi mật khẩu</div>
                  <div onClick={() => { navigate('/become-maid'); setMenuOpen(false); }}>Trở thành maid</div>
                  <div onClick={handleLogout}>Đăng xuất</div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="nav-auth" onClick={() => navigate('/login')}>Đăng nhập</button>
              <span>|</span>
              <button className="nav-auth" onClick={() => navigate('/register')}>Đăng ký</button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
