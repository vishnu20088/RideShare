import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { rideApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const MyRidesPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancellingRideId, setCancellingRideId] = useState(null);
  const [completingRideId, setCompletingRideId] = useState(null);

  const fetchRides = async () => {
    try {
      const res = await rideApi.getMyRides();
      if (res.data) {
        setRides(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancellingRideId) return;
    try {
      await rideApi.cancelRide(cancellingRideId);
      setCancellingRideId(null);
      fetchRides();
    } catch (err) {
      alert(err.message || 'Failed to cancel ride');
    }
  };

  const handleCompleteConfirm = async () => {
    if (!completingRideId) return;
    try {
      await rideApi.completeRide(completingRideId);
      setCompletingRideId(null);
      fetchRides();
    } catch (err) {
      alert(err.message || 'Failed to mark ride completed');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
            My Published Rides
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Manage the trips you are offering as a driver.
          </p>
        </div>
        <Link to="/publish-ride" className="btn btn-primary">
          ➕ Publish New Ride
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message="Loading your rides..." />
      ) : rides.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {rides.map((r) => (
            <div key={r.id} className="card" id={`my-ride-card-${r.id}`} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Ride ID: #{r.id}</span>
                <StatusBadge status={r.status} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0a1128', marginBottom: '4px' }}>
                    {r.origin} ➔ {r.destination}
                  </h3>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    📅 {formatDateTime(r.departureTime)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                    {formatCurrency(r.pricePerSeat)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {r.availableSeats} of {r.totalSeats} seats available
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <Link to={`/rides/${r.id}`} className="btn btn-outline btn-sm">
                  View Public Page
                </Link>

                {r.status === 'OPEN' && (
                  <Link to={`/edit-ride/${r.id}`} className="btn btn-outline btn-sm">
                    ✏️ Edit Trip
                  </Link>
                )}

                {(r.status === 'OPEN' || r.status === 'FULL') && (
                  <>
                    <button
                      id={`complete-ride-btn-${r.id}`}
                      onClick={() => setCompletingRideId(r.id)}
                      className="btn btn-primary btn-sm"
                    >
                      ✓ Mark Completed
                    </button>

                    <button
                      id={`cancel-ride-btn-${r.id}`}
                      onClick={() => setCancellingRideId(r.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#ef4444' }}
                    >
                      Cancel Ride
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛣️</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#0a1128' }}>No Rides Published</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            You haven't posted any rides yet. Offer available seats to passengers along your commute!
          </p>
          <Link to="/publish-ride" className="btn btn-primary">
            Publish a Ride Now
          </Link>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmationModal
        isOpen={!!cancellingRideId}
        title="Cancel Ride"
        message="Are you sure you want to cancel this entire ride? All passengers with pending or confirmed bookings will be automatically notified."
        confirmText="Yes, Cancel Ride"
        isDangerous
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancellingRideId(null)}
      />

      {/* Complete Confirmation */}
      <ConfirmationModal
        isOpen={!!completingRideId}
        title="Complete Ride"
        message="Mark this ride as completed? All confirmed passenger bookings will be updated to Completed and passengers will be invited to leave a review."
        confirmText="Mark Completed"
        onConfirm={handleCompleteConfirm}
        onCancel={() => setCompletingRideId(null)}
      />
    </div>
  );
};

export default MyRidesPage;
