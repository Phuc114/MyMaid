// components/Notification.jsx
import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ type, title, message, onClose }) => {
  // Tự động đóng sau 2 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <div className="icon">
        {type === 'success' ? '✔️' : '❌'}
      </div>
      <div className="text">
        <h4>{title}</h4>
        <p>{message}</p>
      </div>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default Notification;
