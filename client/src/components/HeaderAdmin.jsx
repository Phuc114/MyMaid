import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./HeaderFooter.css";
import { useLogin } from "../context/LoginContext";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useLogin();
  const isLoggedIn = !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login"); // after logout go back to login page
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Các link hiển thị theo trạng thái đăng nhập
  const navLinks = isLoggedIn
    ? [
        { to: "/admin", label: "Trang chủ", end: true },
		{ to: "/admin/services", label: "Dịch vụ" },
		{ to: "/admin/customers", label: "Khách hàng" },
		{ to: "/admin/employees", label: "Nhân viên" },
		{ to: "/admin/orders", label: "Đơn hàng" },
		{ to: "/admin/statistics", label: "Thống kê" },
      ]
    : [
        { to: '/', label: 'Trang chủ', end: true },
        { to: '/service', label: 'Dịch vụ' },
        { to: '/about', label: 'Giới thiệu' },
        { to: '/contact', label: 'Liên hệ' },
      ];

  return (
    <nav className="navbar new-layout">
      <div className="navbar-left">
        <div
          className="logo"
          onClick={() => navigate("/admin")}
          style={{ cursor: "pointer" }}
        >
          <img src="/images/logo.png" alt="MyMaid Logo" />
          <span>MyMaid</span>
        </div>
      </div>

      {/* Center links */}
      <div className="navbar-center">
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: avatar or login */}
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="avatar-dropdown" ref={dropdownRef}>
            <img
              src="/images/maid.png"
              alt="Admin"
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
  );
};

export default AdminHeader;
