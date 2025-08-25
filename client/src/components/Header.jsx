// components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./HeaderFooter.css";
import { useLogin } from "../context/LoginContext";
import { useUser } from "../context/UserContext";
import Notification from "./Notification";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useLogin();
  const { user, setUser } = useUser(); // 👈 lấy setUser để xoá state ngay

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [flash, setFlash] = useState(null);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) closeMenu();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    // Đọc flash message (nếu VerifyEmailContext đã set khi auto-abandon)
    try {
      const raw = sessionStorage.getItem("flash");
      if (raw) {
        setFlash(JSON.parse(raw));
        sessionStorage.removeItem("flash");
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    try {
      // 1) Xoá session phía client
      logout?.(); // nếu LoginContext đã xóa token/cookie thì ok
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("reg_token");
      localStorage.removeItem("reg_in_progress");
      localStorage.removeItem("reg_email");
      localStorage.removeItem("verify_email");

      // 2) Phát tín hiệu đồng bộ đa tab (tuỳ chọn)
      try {
        localStorage.setItem("logout_at", String(Date.now()));
      } catch {}
    } finally {
      // 3) QUAN TRỌNG: xoá state user để Header đổi ngay
      setUser(null);
      closeMenu();
      navigate("/", { replace: true });
    }
  };

  // Nếu đang trong luồng đăng ký dở dang => coi như chưa login
  const regInProgress =
    typeof window !== "undefined" &&
    localStorage.getItem("reg_in_progress") === "1";
  const isLoggedIn = !!user && !regInProgress;

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
    <>
      <nav className="navbar new-layout">
        {/* LEFT */}
        <div className="navbar-left">
          <div className="logo" onClick={() => navigate("/")}>
            <img src="/images/maid.png" alt="MyMaid" />
            <span>MyMaid</span>
          </div>
        </div>

        {/* CENTER */}
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
                  <div
                    onClick={() => {
                      navigate("/profile");
                      closeMenu();
                    }}
                  >
                    Chỉnh sửa hồ sơ
                  </div>
                  <div
                    onClick={() => {
                      navigate("/change-password");
                      closeMenu();
                    }}
                  >
                    Đổi mật khẩu
                  </div>
                  <div
                    onClick={() => {
                      navigate("/become-maid");
                      closeMenu();
                    }}
                  >
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

      {flash && (
        <Notification
          type={flash.type || "info"}
          title={flash.title || "Thông báo"}
          message={flash.message || ""}
          onClose={() => setFlash(null)}
        />
      )}
    </>
  );
};

export default Header;
