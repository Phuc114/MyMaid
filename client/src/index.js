import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { AuthProvider } from './context/AuthContext';        // 💡 Context đăng nhập
import { ProfileProvider } from './context/ProfileContext';  // ✅ Context hồ sơ mới thêm

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>       {/* 💙 Bọc App bằng ProfileProvider giống AuthProvider */}
          <App />
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
