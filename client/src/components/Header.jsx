// components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./HeaderFooter.css";
import { useLogin } from "../context/LoginContext";
import { useUser } from "../context/UserContext";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useLogin();
  const { user } = useUser(); // lấy tên + avatar từ context

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) closeMenu();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const isLoggedIn = !!user;

  // Menu theo trạng thái đăng nhập
  const publicLinks = [
    { to: "/", label: "Trang chủ", end: true },
    { to: "/service", label: "Dịch vụ" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/contact", label: "Liên hệ" },
  ];

  const privateLinks = [
    { to: "/", label: "Trang chủ", end: true },
    { to: "/service", label: "Dịch vụ" },
    { to: "/order-history", label: "Lịch sử đơn hàng" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/contact", label: "Liên hệ" },
  ];

  const links = isLoggedIn ? privateLinks : publicLinks;

  return (
    <nav className="navbar new-layout">
      {/* LEFT: logo */}
      <div className="navbar-left">
        <div className="logo" onClick={() => navigate("/")}>
          <img src="/images/maid.png" alt="MyMaid" />
          <span>MyMaid</span>
        </div>
      </div>

      {/* CENTER: nav links */}
      <div className="navbar-center">
        <ul className="nav-links">
          {links.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {isLoggedIn ? (
          <div className="avatar-dropdown" ref={dropdownRef}>
            <div
              className="user-chip"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
            >
              <img
                className="user-avatar"
                src={user?.avatarUrl || "/images/maid.png"}
                alt="User"
              />
              <span className="user-name">{user?.name || "Tài khoản"}</span>
            </div>

            {menuOpen && (
              <div className="dropdown-menu-avatar">
                <div onClick={() => { navigate("/profile"); closeMenu(); }}>
                  Chỉnh sửa hồ sơ
                </div>
                <div onClick={() => { navigate("/change-password"); closeMenu(); }}>
                  Đổi mật khẩu
                </div>
                <div onClick={() => { navigate("/become-maid"); closeMenu(); }}>
                  Trở thành maid
                </div>
                <div onClick={handleLogout}>Đăng xuất</div>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons-custom">
            <button className="login-button" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
            <button className="signup-button" onClick={() => navigate("/register")}>
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
