import React, { useState, useEffect } from 'react';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmationModal from '../components/common/ConfirmationModal';
import FormField from '../components/common/FormField';
import { bookingApi, reviewApi } from '../services/api';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL');

  // Cancel Modal state
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Review Modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);

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

  const handleCancelConfirm = async () => {
    if (!cancellingBookingId) return;
    try {
      await bookingApi.cancelBooking(cancellingBookingId);
      setCancellingBookingId(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      await reviewApi.createReview({
        rideId: reviewBooking.rideId,
        reviewedUserId: reviewBooking.driverId,
        rating: Number(rating),
        comment: comment.trim() || null,
      });
      setReviewSuccess('Review submitted successfully!');
      setTimeout(() => {
        setReviewBooking(null);
        setReviewSuccess(null);
        setComment('');
        fetchBookings();
      }, 1200);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'ALL') return true;
    return b.status === filterTab;
  });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          My Bookings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Track and manage your requested and confirmed seats across all trips.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px',
      }}>
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            id={`tab-booking-${tab.toLowerCase()}`}
            onClick={() => setFilterTab(tab)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: filterTab === tab ? '#059669' : '#64748b',
              borderBottom: filterTab === tab ? '2px solid #059669' : '2px solid transparent',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message="Loading your bookings..." />
      ) : filteredBookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={(id) => setCancellingBookingId(id)}
              onReview={(booking) => setReviewBooking(booking)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: '#64748b' }}>No bookings found in this status.</p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancellingBookingId}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? The driver will be notified and your reserved seats will be released back to the ride."
        confirmText="Yes, Cancel Booking"
        isDangerous
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancellingBookingId(null)}
      />

      {/* Review Modal */}
      {reviewBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 17, 40, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#0a1128' }}>
              Rate Your Trip with {reviewBooking.driverName || 'Driver'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' }}>
              Your rating helps maintain a dependable, safe carpooling community.
            </p>

            {reviewSuccess && (
              <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
                {reviewSuccess}
              </div>
            )}
            {reviewError && <ErrorMessage message={reviewError} />}

            <form onSubmit={handleReviewSubmit}>
              <FormField label="Rating" id="review-rating" required>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        color: star <= rating ? '#f59e0b' : '#cbd5e1',
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ alignSelf: 'center', marginLeft: '8px', fontWeight: 700, color: '#0f172a' }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </FormField>

              <FormField label="Comment / Feedback" id="review-comment">
                <textarea
                  id="review-comment"
                  rows="3"
                  placeholder="Share details about punctuality, driving comfort, or conversation..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-textarea"
                />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  id="submit-review-modal-btn"
                  type="submit"
                  disabled={reviewLoading}
                  className="btn btn-primary"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
