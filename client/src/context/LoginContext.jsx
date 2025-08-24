// context/LoginContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedRole && storedToken) {
      setUser(storedUser);
      setRole(storedRole);
      setToken(storedToken);
    }
  }, []);

  // Hàm xử lý login 
  const login = async (email, matKhau) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mat_khau: matKhau }),
    });

    if (!res.ok) {
      throw new Error('Email hoặc mật khẩu không đúng!');
    }

    const data = await res.json();
    const { user, role, token } = data;

    setUser(user);
    setRole(role);
    setToken(token);

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', role);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <LoginContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);
