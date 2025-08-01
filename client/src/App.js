// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Service from './pages/Service'; // ✅ thêm dòng này
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import FavoriteMaids from './pages/FavoriteMaids';

import './pages/Service.css'; // ✅ import CSS mới

function App() {
  return (
    <Routes>
      <Route path="/" element={<FavoriteMaids />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} /> {/* ✅ Thêm route mới */}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/favorite-maids" element={<FavoriteMaids />} />
    </Routes>
  );
}

export default App;
