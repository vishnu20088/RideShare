import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export const Navbar = () => {
  const { user, isAuthenticated, isDriver, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={{
      backgroundColor: '#0a1128',
      color: '#ffffff',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo */}
        <Link to="/" id="nav-brand-logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          fontSize: '1.45rem',
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '-0.02em',
          color: '#ffffff'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(5, 150, 105, 0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <span>RIDE<span style={{ color: '#10b981' }}>HUB</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/rides" id="nav-browse-rides" style={{ color: '#e2e8f0', fontSize: '0.9375rem', fontWeight: 500, transition: 'color 0.2s' }}>
            Find a Ride
          </Link>
          <Link to="/publish-ride" id="nav-publish-ride" style={{ color: '#e2e8f0', fontSize: '0.9375rem', fontWeight: 500, transition: 'color 0.2s' }}>
            Publish a Ride
          </Link>
          <Link to="/about" id="nav-about" style={{ color: '#94a3b8', fontSize: '0.9375rem', fontWeight: 500 }}>
            How it Works
          </Link>
        </nav>

        {/* Auth CTA or User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Link to="/notifications" id="nav-notifications-link" style={{
                position: 'relative',
                color: '#e2e8f0',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </Link>

              {isAdmin && (
                <Link to="/admin" id="nav-admin-dashboard" className="btn btn-outline btn-sm" style={{ borderColor: '#f59e0b', color: '#fbbf24' }}>
                  Admin Portal
                </Link>
              )}

              {isDriver ? (
                <Link to="/driver/dashboard" id="nav-driver-dashboard" className="btn btn-outline btn-sm" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  Driver Hub
                </Link>
              ) : (
                <Link to="/passenger/dashboard" id="nav-passenger-dashboard" className="btn btn-outline btn-sm" style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.4)' }}>
                  Dashboard
                </Link>
              )}

              <Link to="/profile" id="nav-profile-btn" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '6px 14px',
                borderRadius: '9999px',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span>{user?.fullName?.split(' ')[0]}</span>
              </Link>

              <button
                id="nav-logout-btn"
                onClick={handleLogout}
                className="btn btn-sm"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" id="nav-login-btn" className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                Log In
              </Link>
              <Link to="/register" id="nav-register-btn" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
