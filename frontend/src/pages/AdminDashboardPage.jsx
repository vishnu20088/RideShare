import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { adminApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        if (res.data) setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load administrator statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading platform analytics..." />;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d97706', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
          <span>🛡️</span> Administrator Control Panel
        </div>
        <h1 style={{ fontSize: '1.875rem', color: '#0a1128', marginBottom: '8px' }}>
          Platform Overview & Metrics
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Real-time metrics, user accounts, trip monitoring, and safety reports across RideHub.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        {/* Total Users */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Registered Users
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0a1128', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {stats?.totalUsers ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
            {stats?.totalDrivers ?? 0} verified drivers
          </div>
        </div>

        {/* Total Rides */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Published Rides
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#034078', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {stats?.totalRides ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {stats?.totalCompletedRides ?? 0} trips completed
          </div>
        </div>

        {/* Total Bookings */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Seat Bookings
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {stats?.totalBookings ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
            Est. Value: {formatCurrency(stats?.totalEstimatedBookingValue ?? 0)}
          </div>
        </div>

        {/* Safety Reports */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Pending Safety Reports
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: stats?.totalPendingReports > 0 ? '#dc2626' : '#64748b', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {stats?.totalPendingReports ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Requires admin action
          </div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.125rem', color: '#0a1128', marginBottom: '16px' }}>
          Administrative Modules
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Link to="/admin/users" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
            <span>👥</span> Manage Users
          </Link>
          <Link to="/admin/rides" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
            <span>🚗</span> Monitor Rides
          </Link>
          <Link to="/admin/bookings" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
            <span>📋</span> View Bookings
          </Link>
          <Link to="/admin/reports" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '16px' }}>
            <span>🛡️</span> Safety Reports ({stats?.totalPendingReports ?? 0})
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
