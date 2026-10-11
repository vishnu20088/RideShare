import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';

export const Footer = () => {
  const swaggerUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/swagger-ui/index.html';
  return (
    <footer style={{
      backgroundColor: '#0a1128',
      color: '#94a3b8',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '60px',
      paddingBottom: '30px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 800,
              fontSize: '1.35rem',
              fontFamily: 'Outfit, sans-serif',
              color: '#ffffff',
              marginBottom: '14px'
            }}>
              <span>RIDE<span style={{ color: '#10b981' }}>HUB</span></span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#94a3b8', maxWidth: '280px' }}>
              Smart ride-sharing and carpooling platform connecting verified drivers and passengers traveling along similar routes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/rides" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Find Available Rides</Link></li>
              <li><Link to="/publish-ride" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Offer Seats as Driver</Link></li>
              <li><Link to="/about" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>How RideHub Works</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Create an Account</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Trust & Safety
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><span style={{ color: '#94a3b8' }}>Verified Driver Licenses</span></li>
              <li><span style={{ color: '#94a3b8' }}>Two-Way Participant Ratings</span></li>
              <li><span style={{ color: '#94a3b8' }}>Transactional Seat Allocation</span></li>
              <li><span style={{ color: '#94a3b8' }}>Direct In-App Status Updates</span></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Help & Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li><Link to="/contact" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Help & Contact Us</Link></li>
              <li><a href={swaggerUrl} target="_blank" rel="noreferrer" style={{ color: '#10b981' }}>API Documentation (Swagger)</a></li>
              <li><span style={{ color: '#64748b' }}>PostgreSQL Powered by Neon</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8125rem',
          color: '#64748b'
        }}>
          <p>© {new Date().getFullYear()} RideHub Inc. All rights reserved.</p>
          <p>Java 21 • Spring Boot 3 • React.js • Neon PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
