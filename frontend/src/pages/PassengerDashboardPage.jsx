import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { bookingApi } from '../services/api';

export const PassengerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await bookingApi.getMyBookings();
      if (res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    try {
      await bookingApi.cancelBooking(cancellingBookingId);
      setCancellingBookingId(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '6px' }}>
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Manage your upcoming travel plans and check seat booking statuses.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Active Reservations
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {activeBookings.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Completed Trips
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#2563eb', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {completedBookings.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Link to="/rides" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            🔍 Search New Rides
          </Link>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0a1128' }}>Upcoming & Active Bookings</h2>
          <Link to="/my-bookings" style={{ color: '#059669', fontSize: '0.875rem', fontWeight: 600 }}>
            View Full History →
          </Link>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <LoadingSpinner message="Loading your bookings..." />
        ) : activeBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={(id) => setCancellingBookingId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎫</div>
            <h3 style={{ fontSize: '1.125rem', color: '#0a1128', marginBottom: '6px' }}>No Active Bookings</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px' }}>
              You don't have any pending or confirmed bookings at the moment.
            </p>
            <Link to="/rides" className="btn btn-outline btn-sm">
              Explore Available Rides
            </Link>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!cancellingBookingId}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? The driver will be notified and your reserved seats will be released back to the ride."
        confirmText="Yes, Cancel Booking"
        isDangerous
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingBookingId(null)}
      />
    </div>
  );
};

export default PassengerDashboardPage;
