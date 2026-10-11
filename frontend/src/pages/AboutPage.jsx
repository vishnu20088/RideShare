import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }} className="fade-in">
      <div className="container" style={{ maxWidth: '860px' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#0a1128', marginBottom: '16px' }}>
          About RideHub
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', lineHeight: 1.6, marginBottom: '40px' }}>
          RideHub is an enterprise-grade Java full-stack ride-sharing and carpooling platform designed to make daily commuting and intercity travel more affordable, dependable, and environmentally responsible.
        </p>

        <div className="card" style={{ padding: '36px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#0a1128' }}>Our Mission</h2>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.9375rem', marginBottom: '16px' }}>
            Millions of vehicles travel between cities and suburbs every day with multiple empty seats. RideHub bridges the gap between drivers and travelers heading along the same corridors, turning empty space into shared savings and reducing the collective carbon footprint.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            By bringing transparency, atomic booking management, and verified community profiles together, we provide a carpooling experience that drivers and passengers can trust.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🌱</div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Environmental Impact</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Carpooling cuts emissions per passenger kilometer, helping reduce highway congestion and urban smog.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Safety & Integrity</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Driver license verification and bidirectional ratings ensure a respectful, high-quality community.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>⚡</div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Instant Transparency</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Direct in-app booking status notifications with zero hidden fees or misleading estimates.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link to="/rides" className="btn btn-primary btn-lg">
            Find Your First Ride
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
