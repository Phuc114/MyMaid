// PageBanner.jsx
import React from 'react';
import './PageBanner.css';

const PageBanner = ({ title }) => {
  return (
    <div
      className="page-banner"
      style={{ backgroundImage: "url('/images/about-banner.png')" }}
    >
      <div className="page-banner-content">
        <h1>{title}</h1>
        <p>Trang chủ &gt; {title}</p>
      </div>
    </div>
  );
};

export default PageBanner;
