import React from 'react';
import './PageBanner.css';

const PageBanner = ({ title, page, backgroundImage }) => {
  return (
    <div
      className="page-banner"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="overlay" />
      <div className="page-banner-content">
        <h1>{title}</h1>
        <p><i className="fas fa-home"></i> Trang chủ › {page}</p>
      </div>
    </div>
  );
};

export default PageBanner;
