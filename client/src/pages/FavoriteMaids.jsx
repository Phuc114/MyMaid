import React from 'react';
import './FavoriteMaids.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FavoriteMaids = () => {
  const maids = [
    {
      id: 1,
      name: "Dogmatika Ecclesia",
      avatar: "/images/maid1.png",
      rating: 4,
      note: "I eat a lot ☆",
      lastBooking: "25/07/2025"
    },
    {
      id: 2,
      name: "Sky Striker Ace Raye",
      avatar: "/images/maid2.png",
      rating: 5,
      note: "ENGAGE!",
      lastBooking: "07/07/2025"
    }
  ];

  return (
    <div className="fav-maid-page">
      <Header />

      <div className="breadcrumb">Tôi &gt; Maid yêu thích</div>

      <h1>Maid yêu thích</h1>

      <div className="maid-list">
        {maids.map(maid => (
          <div className="maid-card" key={maid.id}>
            <div className="maid-info">
              <img src={maid.avatar} alt={maid.name} className="maid-avatar" />
              <div>
                <h3>{maid.name}</h3>
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < maid.rating ? "filled" : ""}>★</span>
                  ))}
                </div>
                <p className="maid-note">Chú thích: <em>{maid.note}</em></p>
                <p className="maid-date">Lần đặt gần nhất: {maid.lastBooking}</p>
              </div>
            </div>
            <button className="chat-btn">Chat với Maid</button>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default FavoriteMaids;
