import React from 'react';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="container">
        <h1>Welcome to Starcast Technologies</h1>
        <p>Your trusted ISP delivering lightning-fast fibre and LTE internet solutions nationwide, with professional technical support and installations across the Garden Route.</p>
        <div style={{ marginTop: '2rem' }}>
          <button className="btn btn-primary" style={{ marginRight: '1rem' }}>
            Fibre Packages
          </button>
          <button className="btn btn-secondary">
            LTE Packages
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 