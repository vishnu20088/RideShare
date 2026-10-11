import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const RideCard = ({ ride }) => {
  return (
    <div
      className="card card-hover"
      id={`ride-card-${ride.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header: Date and Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
          <span>📅</span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatDateTime(ride.departureTime)}</span>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      {/* Route display */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669', border: '2px solid #a7f3d0' }} />
          <div style={{ width: '2px', flex: 1, backgroundColor: '#cbd5e1', margin: '4px 0' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #fecaca' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', flex: 1 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Origin</div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0a1128' }}>{ride.origin}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Destination</div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0a1128' }}>{ride.destination}</div>
          </div>
        </div>
      </div>

      {/* Description if present */}
      {ride.description && (
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          backgroundColor: '#f8fafc',
          padding: '8px 12px',
          borderRadius: '8px',
          lineHeight: '1.4'
        }}>
          "{ride.description}"
        </p>
      )}

      {/* Footer: Driver, Seats, Price, Action */}
      <div style={{
        borderTop: '1px solid #f1f5f9',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Driver info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#0a1128',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}>
            {ride.driverName ? ride.driverName.charAt(0) : 'D'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{ride.driverName || 'Driver'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⭐ {ride.driverRating && Number(ride.driverRating) > 0 ? Number(ride.driverRating).toFixed(1) : 'New'}</span>
              <span>•</span>
              <span style={{ color: ride.availableSeats > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                {ride.availableSeats} / {ride.totalSeats} seats left
              </span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
              {formatCurrency(ride.pricePerSeat)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>per seat</div>
          </div>

          <Link
            to={`/rides/${ride.id}`}
            id={`view-ride-btn-${ride.id}`}
            className="btn btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RideCard;
