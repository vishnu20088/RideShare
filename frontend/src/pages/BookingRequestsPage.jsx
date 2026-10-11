import React, { useState, useEffect } from 'react';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { rideApi, bookingApi } from '../services/api';

export const BookingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING');

  const fetchRequests = async () => {
    try {
      const ridesRes = await rideApi.getMyRides();
      const myRides = ridesRes.data || [];

      if (myRides.length > 0) {
        const bookingsPromises = myRides.map((r) => bookingApi.getRideBookings(r.id).catch(() => ({ data: [] })));
        const responses = await Promise.all(bookingsPromises);
        const all = responses.flatMap((res) => res.data || []);
        setRequests(all);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirm = async (bookingId) => {
    try {
      await bookingApi.confirmBooking(bookingId);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to confirm booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await bookingApi.rejectBooking(bookingId);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to decline booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const filtered = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Passenger Booking Requests
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Review and approve passenger seat requests on your published rides.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px',
      }}>
        {['PENDING', 'CONFIRMED', 'REJECTED', 'ALL'].map((tab) => (
          <button
            key={tab}
            id={`tab-requests-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: activeTab === tab ? '#059669' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #059669' : '2px solid transparent',
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message="Loading passenger requests..." />
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              isDriverView
              onConfirm={handleConfirm}
              onReject={handleReject}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: '#64748b' }}>No {activeTab.toLowerCase()} requests found.</p>
        </div>
      )}
    </div>
  );
};

export default BookingRequestsPage;
