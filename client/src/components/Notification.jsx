// components/Notification.jsx
import React from 'react';
import './Notification.css';

const Notification = ({ type, title, message, onClose }) => {
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
