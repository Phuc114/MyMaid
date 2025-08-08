import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './HeaderFooter.css';
import { useLogin } from '../context/LoginContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useLogin();
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
      <div className="top-info-bar">
        <span>Hotline: 1900 1234</span>
        <span>Email: cskh@mymaid.vn</span>
        <span>Địa chỉ: 123 Trần Hưng Đạo, Quận 1, TP.HCM</span>
      </div>

      <nav className="navbar new-layout">
        <div className="navbar-left">
          <div className="logo">
            <img src="/images/logo.png" alt="MyMaid Logo" />
            <span>MyMaid</span>
          </div>
        </div>

        <div className="navbar-center">
          <ul className="nav-links">
            <li><NavLink to="/" end>Trang chủ</NavLink></li>
            <li><NavLink to="/service">Dịch vụ</NavLink></li>
            <li><NavLink to="/about">Giới thiệu</NavLink></li>
            <li><NavLink to="/tuyen-dung">Tuyển dụng</NavLink></li>
            <li><NavLink to="/contact">Liên hệ</NavLink></li>
          </ul>
        </div>

        <div className="navbar-right">
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
            <div className="auth-buttons-custom">
              <button className="login-button" onClick={() => navigate('/login')}>Đăng nhập</button>
              <button className="signup-button" onClick={() => navigate('/register')}>Đăng ký</button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
