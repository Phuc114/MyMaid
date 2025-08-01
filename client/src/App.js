// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Service from './pages/Service'; // ✅ thêm dòng này

import './pages/Service.css'; // ✅ import CSS mới

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} /> {/* ✅ Thêm route mới */}
    </Routes>
  );
}

export default App;
