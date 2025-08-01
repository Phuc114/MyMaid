import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeaderFooter.css';


const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      <div className="top-info-bar">
        <span>Hotline: 1900 1234</span>
        <span>Email: cskh@mymaid.vn</span>
        <span>Địa chỉ: 123 Trần Hưng Đạo, Quận 1, TP.HCM</span>
      </div>

      <nav className="navbar">
        <div className="logo">
          <img src="/images/logo.png" alt="MyMaid Logo" />
          <span>MyMaid</span>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Trang chủ</Link></li>
          <li className="dropdown">
            <Link to="/service">Dịch vụ</Link>
            <ul className="dropdown-menu">
              <li><a href="#">Dọn dẹp nhà</a></li>
              <li><a href="#">Dọn dẹp văn phòng</a></li>
              <li><a href="#">Vệ sinh sofa, rèm nệm</a></li>
              <li><a href="#">Giặt ủi</a></li>
            </ul>
          </li>
          <li><a href="#">Pages</a></li>
          <li><Link to="/about">Giới thiệu</Link></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
        <div className="nav-icons">
          <span>🔍</span>
          <span>|</span>
          {isLoggedIn ? (
            <span>👤</span>
          ) : (
            <>
              <a className="nav-auth" href="#" onClick={handleLoginClick}>Đăng nhập</a>
              <span>|</span>
              <a className="nav-auth" href="#">Đăng ký</a>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Header;
