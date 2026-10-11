import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const BookingCard = ({
  booking,
  isDriverView = false,
  onConfirm,
  onReject,
  onCancel,
  onReview,
}) => {
  return (
    <div
      className="card"
      id={`booking-card-${booking.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Booking Ref: <strong style={{ color: '#0f172a' }}>#{booking.id}</strong>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Route & Timing */}
      <div>
        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0a1128', marginBottom: '6px' }}>
          {booking.origin} ➔ {booking.destination}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📅</span>
          <span>{formatDateTime(booking.departureTime)}</span>
        </div>
      </div>

      {/* Details Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        backgroundColor: '#f8fafc',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '0.875rem'
      }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Seats</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{booking.seatsRequested} seat(s)</div>
        </div>

        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Price</div>
          <div style={{ fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
            {formatCurrency(booking.totalPrice)}
          </div>
        </div>

        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            {isDriverView ? 'Passenger' : 'Driver'}
          </div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            {isDriverView ? (booking.passengerName || 'Passenger') : (booking.driverName || 'Driver')}
          </div>
        </div>

        {(isDriverView ? booking.passengerPhone : booking.driverPhone) && (
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone</div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>
              {isDriverView ? booking.passengerPhone : booking.driverPhone}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        {/* Driver Pending Actions */}
        {isDriverView && booking.status === 'PENDING' && (
          <>
            <button
              id={`reject-booking-btn-${booking.id}`}
              onClick={() => onReject(booking.id)}
              className="btn btn-outline btn-sm"
              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
            >
              Decline Request
            </button>
            <button
              id={`confirm-booking-btn-${booking.id}`}
              onClick={() => onConfirm(booking.id)}
              className="btn btn-primary btn-sm"
            >
              Accept & Confirm
            </button>
          </>
        )}

        {/* Cancellation (Passenger or Driver) */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <button
            id={`cancel-booking-btn-${booking.id}`}
            onClick={() => onCancel(booking.id)}
            className="btn btn-outline btn-sm"
            style={{ color: '#ef4444' }}
          >
            Cancel Booking
          </button>
        )}

        {/* Review if completed and not driver view */}
        {!isDriverView && booking.status === 'COMPLETED' && onReview && (
          <button
            id={`review-booking-btn-${booking.id}`}
            onClick={() => onReview(booking)}
            className="btn btn-primary btn-sm"
          >
            ⭐ Rate Driver
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
