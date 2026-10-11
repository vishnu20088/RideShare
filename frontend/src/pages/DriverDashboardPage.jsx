import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { rideApi, bookingApi, driverApi } from '../services/api';

export const DriverDashboardPage = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDriverData = async () => {
    try {
      const [ridesRes, vehiclesRes] = await Promise.all([
        rideApi.getMyRides(),
        driverApi.getMyVehicles().catch(() => ({ data: [] })),
      ]);

      const myRides = ridesRes.data || [];
      setRides(myRides);
      setVehicles(vehiclesRes.data || []);

      // Fetch pending bookings across driver's active rides
      const activeRideIds = myRides.filter((r) => r.status === 'OPEN' || r.status === 'FULL').map((r) => r.id);
      if (activeRideIds.length > 0) {
        const bookingsPromises = activeRideIds.map((id) => bookingApi.getRideBookings(id).catch(() => ({ data: [] })));
        const bookingsResponses = await Promise.all(bookingsPromises);
        const allBookings = bookingsResponses.flatMap((res) => res.data || []);
        setPendingBookings(allBookings.filter((b) => b.status === 'PENDING'));
      } else {
        setPendingBookings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load driver dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleConfirm = async (bookingId) => {
    try {
      await bookingApi.confirmBooking(bookingId);
      fetchDriverData();
    } catch (err) {
      alert(err.message || 'Failed to confirm booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await bookingApi.rejectBooking(bookingId);
      fetchDriverData();
    } catch (err) {
      alert(err.message || 'Failed to reject booking');
    }
  };

  const openRides = rides.filter((r) => r.status === 'OPEN');

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '6px' }}>
            Driver Hub — {user?.fullName?.split(' ')[0]} 🚗
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage your published rides, vehicle capacity, and pending passenger requests.
          </p>
        </div>
        <Link to="/publish-ride" id="driver-publish-ride-cta" className="btn btn-primary">
          ➕ Publish New Ride
        </Link>
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
            Active Open Rides
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {openRides.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Pending Passenger Requests
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: pendingBookings.length > 0 ? '#d97706' : '#64748b', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {pendingBookings.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Registered Vehicles
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#2563eb', fontFamily: 'Outfit, sans-serif', marginTop: '6px' }}>
            {vehicles.length}
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Pending Booking Requests Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0a1128', marginBottom: '16px' }}>
          Pending Passenger Requests ({pendingBookings.length})
        </h2>

        {loading ? (
          <LoadingSpinner message="Checking passenger requests..." />
        ) : pendingBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                isDriverView
                onConfirm={handleConfirm}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
              No pending booking requests. When passengers request seats on your rides, they will appear here for your confirmation.
            </p>
          </div>
        )}
      </div>

      {/* Recent Published Rides */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0a1128' }}>My Published Rides</h2>
          <Link to="/my-rides" style={{ color: '#059669', fontSize: '0.875rem', fontWeight: 600 }}>
            Manage All Rides →
          </Link>
        </div>

        {rides.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {rides.slice(0, 3).map((r) => (
              <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', padding: '18px 24px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0a1128' }}>
                    {r.origin} ➔ {r.destination}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                    {r.availableSeats} of {r.totalSeats} seats available • Status: {r.status}
                  </div>
                </div>
                <Link to={`/rides/${r.id}`} className="btn btn-outline btn-sm">
                  View Public Page
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', marginBottom: '14px' }}>You haven't published any rides yet.</p>
            <Link to="/publish-ride" className="btn btn-primary btn-sm">
              Create Your First Ride
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboardPage;
