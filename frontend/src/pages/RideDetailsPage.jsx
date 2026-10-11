import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { rideApi, bookingApi } from '../services/api';
import useAuth from '../hooks/useAuth';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const RideDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await rideApi.getRideById(id);
        if (res.data) {
          setRide(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    setBookingError(null);
    try {
      await bookingApi.createBooking(id, { seatsRequested: bookingSeats });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.message || 'Failed to request booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading ride details..." />;
  if (error) return <div className="container" style={{ padding: '40px 0' }}><ErrorMessage message={error} /></div>;
  if (!ride) return null;

  const isDriver = user?.id === ride.driverId;
  const totalPrice = Number(ride.pricePerSeat) * bookingSeats;

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }} className="fade-in">
      <div className="container">
        {/* Back Link */}
        <Link to="/rides" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9375rem', marginBottom: '24px' }}>
          ← Back to Search Results
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '36px', alignItems: 'flex-start' }}>
          {/* Main Details Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Card */}
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Ride #{ride.id}</span>
                <StatusBadge status={ride.status} />
              </div>

              {/* Origin -> Destination Route */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', marginBottom: '28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#059669', border: '3px solid #a7f3d0' }} />
                  <div style={{ width: '2px', flex: 1, backgroundColor: '#cbd5e1', margin: '4px 0' }} />
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ef4444', border: '3px solid #fecaca' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px', flex: 1 }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Origin</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0a1128' }}>{ride.origin}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                      Departure: {formatDateTime(ride.departureTime)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Drop-off Destination</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0a1128' }}>{ride.destination}</div>
                    {ride.estimatedArrivalTime && (
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                        Est. Arrival: {formatDateTime(ride.estimatedArrivalTime)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ride Notes */}
              {ride.description && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', borderLeft: '3px solid #059669' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Ride Description & Pickup Notes
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    {ride.description}
                  </p>
                </div>
              )}
            </div>

            {/* Driver Profile Card */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', color: '#0a1128' }}>Driver Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#0a1128',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}>
                  {ride.driverName ? ride.driverName.charAt(0) : 'D'}
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{ride.driverName || 'Verified Driver'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                    <span>⭐ {ride.driverRating && Number(ride.driverRating) > 0 ? Number(ride.driverRating).toFixed(1) + ' / 5.0' : 'New Driver'}</span>
                    <span>•</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>Verified Account</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Action Sidebar */}
          <div className="card" style={{ padding: '30px', position: 'sticky', top: '96px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                  {formatCurrency(ride.pricePerSeat)}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}> / seat</span>
              </div>
              <span style={{
                backgroundColor: ride.availableSeats > 0 ? '#ecfdf5' : '#fef2f2',
                color: ride.availableSeats > 0 ? '#065f46' : '#991b1b',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 700
              }}>
                {ride.availableSeats} of {ride.totalSeats} seats open
              </span>
            </div>

            {bookingSuccess ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                <h4 style={{ color: '#166534', fontSize: '1.125rem', marginBottom: '6px' }}>Request Submitted!</h4>
                <p style={{ color: '#166534', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '16px' }}>
                  Your request for {bookingSeats} seat(s) has been forwarded to the driver. You will be notified as soon as they confirm.
                </p>
                <Link to="/my-bookings" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  View in My Bookings
                </Link>
              </div>
            ) : isDriver ? (
              <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '10px', textAlign: 'center', color: '#1e40af' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '8px' }}>This is your published ride</p>
                <Link to="/my-rides" className="btn btn-outline btn-sm" style={{ width: '100%', borderColor: '#93c5fd' }}>
                  Manage Ride in Driver Hub
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                {bookingError && <ErrorMessage message={bookingError} />}

                <div className="form-group">
                  <label htmlFor="booking-seats-select" className="form-label">Number of Seats to Reserve</label>
                  <select
                    id="booking-seats-select"
                    className="form-select"
                    value={bookingSeats}
                    disabled={ride.availableSeats <= 0}
                    onChange={(e) => setBookingSeats(Number(e.target.value))}
                  >
                    {Array.from({ length: Math.min(ride.availableSeats, 10) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Seat' : 'Seats'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '20px 0', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.875rem', marginBottom: '6px' }}>
                    <span>{formatCurrency(ride.pricePerSeat)} × {bookingSeats} seat(s)</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', color: '#0a1128' }}>
                    <span>Total Amount</span>
                    <span style={{ color: '#059669' }}>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <button
                  id="book-ride-submit-btn"
                  type="submit"
                  disabled={ride.availableSeats <= 0 || bookingLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                  {bookingLoading ? 'Submitting Request...' : (
                    ride.availableSeats > 0 ? 'Request Seat Reservation' : 'Ride Fully Booked'
                  )}
                </button>

                {!isAuthenticated && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '12px' }}>
                    You will be prompted to log in before confirming your reservation.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideDetailsPage;
