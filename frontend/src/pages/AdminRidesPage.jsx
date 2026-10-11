import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { adminApi, rideApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const AdminRidesPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRides({ page, size: 10 });
      if (res.data) {
        setRides(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [page]);

  const handleCancelRide = async (rideId) => {
    if (!window.confirm(`Are you sure you want to cancel Ride #${rideId}?`)) return;
    try {
      await rideApi.cancelRide(rideId);
      fetchRides();
    } catch (err) {
      alert(err.message || 'Failed to cancel ride');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Platform Rides Monitoring
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Monitor published carpool trips, verify seat counts, and manage cancellations.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Loading rides..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Ride ID</th>
                    <th style={{ padding: '14px 20px' }}>Driver</th>
                    <th style={{ padding: '14px 20px' }}>Route</th>
                    <th style={{ padding: '14px 20px' }}>Departure</th>
                    <th style={{ padding: '14px 20px' }}>Seats</th>
                    <th style={{ padding: '14px 20px' }}>Price</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700 }}>#{r.id}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div>{r.driverName || 'Driver'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{r.driverId}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: '#0a1128' }}>
                        {r.origin} ➔ {r.destination}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#475569' }}>
                        {formatDateTime(r.departureTime)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {r.availableSeats} / {r.totalSeats}
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#059669' }}>
                        {formatCurrency(r.pricePerSeat)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={r.status} />
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {r.status === 'OPEN' && (
                          <button
                            onClick={() => handleCancelRide(r.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '0 20px' }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRidesPage;
