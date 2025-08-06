import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(storedUser);
  const [role, setRole] = useState(localStorage.getItem('role'));

  const login = (userData, role, token) => {
    setUser(userData);
    setRole(role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', role);
    localStorage.setItem('token', token); // ✅ Thêm dòng này
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token'); // ✅ Xoá token khi logout
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
