// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Service from './pages/Service';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import FavoriteMaids from './pages/FavoriteMaids';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from "./pages/CompleteProfile";

// NEW: pages for forgot-password flow
import ForgotVerifyOtp from './pages/ForgotVerifyOtp';
import ResetPassword from './pages/ResetPassword';

import './pages/Service.css';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />

      {/* Forgot password flow */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-verify-otp" element={<ForgotVerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* App features */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/favorite-maids" element={<FavoriteMaids />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Lịch sử đơn: giữ cả 2 đường dẫn để không phá vỡ liên kết cũ */}
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/orderhistory" element={<OrderHistory />} />
    </Routes>
  );
}

export default App;
