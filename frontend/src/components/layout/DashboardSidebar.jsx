import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export const DashboardSidebar = ({ role = 'passenger' }) => {
  const { isDriver, isAdmin } = useAuth();

  const activeStyle = {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    fontWeight: 600,
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '10px',
    color: '#475569',
    fontSize: '0.9375rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '20px 14px',
      height: 'fit-content',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Passenger Navigation */}
      {role === 'passenger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px' }}>
            Passenger Portal
          </div>
          <NavLink to="/passenger/dashboard" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-passenger-overview">
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/my-bookings" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-my-bookings">
            <span>🎫</span> My Bookings
          </NavLink>
          <NavLink to="/rides" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-find-rides">
            <span>🔍</span> Find a Ride
          </NavLink>
          <NavLink to="/notifications" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-passenger-notifications">
            <span>🔔</span> Notifications
          </NavLink>
          <NavLink to="/profile" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-passenger-profile">
            <span>👤</span> Profile Settings
          </NavLink>

          <div style={{ borderTop: '1px solid #f1f5f9', margin: '14px 0 6px 0', paddingTop: '14px' }}>
            <NavLink to="/driver/dashboard" style={{ ...linkStyle, color: '#059669', backgroundColor: '#f0fdf4' }} id="sidebar-switch-to-driver">
              <span>🚗</span> Switch to Driver Hub
            </NavLink>
          </div>
        </div>
      )}

      {/* Driver Navigation */}
      {role === 'driver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px' }}>
            Driver Hub
          </div>
          <NavLink to="/driver/dashboard" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-driver-overview">
            <span>📊</span> Driver Dashboard
          </NavLink>
          <NavLink to="/publish-ride" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-publish-ride">
            <span>➕</span> Publish New Ride
          </NavLink>
          <NavLink to="/my-rides" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-my-rides">
            <span>🛣️</span> My Published Rides
          </NavLink>
          <NavLink to="/booking-requests" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-booking-requests">
            <span>📩</span> Booking Requests
          </NavLink>
          <NavLink to="/vehicles" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-vehicles">
            <span>🚘</span> Vehicles
          </NavLink>
          <NavLink to="/notifications" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-driver-notifications">
            <span>🔔</span> Notifications
          </NavLink>
          <NavLink to="/profile" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-driver-profile">
            <span>👤</span> Profile Settings
          </NavLink>

          <div style={{ borderTop: '1px solid #f1f5f9', margin: '14px 0 6px 0', paddingTop: '14px' }}>
            <NavLink to="/passenger/dashboard" style={{ ...linkStyle, color: '#2563eb', backgroundColor: '#eff6ff' }} id="sidebar-switch-to-passenger">
              <span>🎒</span> Switch to Passenger
            </NavLink>
          </div>
        </div>
      )}

      {/* Admin Navigation */}
      {role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px' }}>
            Admin Portal
          </div>
          <NavLink to="/admin" end style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-admin-overview">
            <span>📈</span> Overview & Stats
          </NavLink>
          <NavLink to="/admin/users" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-admin-users">
            <span>👥</span> Users Management
          </NavLink>
          <NavLink to="/admin/rides" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-admin-rides">
            <span>🚗</span> Rides Management
          </NavLink>
          <NavLink to="/admin/bookings" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-admin-bookings">
            <span>📋</span> Bookings Management
          </NavLink>
          <NavLink to="/admin/reports" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)} id="sidebar-admin-reports">
            <span>🛡️</span> Safety Reports
          </NavLink>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
