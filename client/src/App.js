// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import './pages/Service.css'; 


/* */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} />
      <Route path="/contact" element={<Contact />} /> 
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/favorite-maids" element={<FavoriteMaids />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/favorite-maids" element={<FavoriteMaids />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orderhistory" element={<OrderHistory />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
    </Routes>
  );
}

export default App;
