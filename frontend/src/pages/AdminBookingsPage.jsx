import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { adminApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({ page, size: 10 });
      if (res.data) {
        setBookings(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Platform Bookings Ledger
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Audit all passenger seat reservations, transactional statuses, and ride associations.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Loading bookings..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Ref #</th>
                    <th style={{ padding: '14px 20px' }}>Passenger</th>
                    <th style={{ padding: '14px 20px' }}>Trip Route</th>
                    <th style={{ padding: '14px 20px' }}>Seats</th>
                    <th style={{ padding: '14px 20px' }}>Total Price</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px' }}>Requested At</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700 }}>#{b.id}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div>{b.passengerName || 'Passenger'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{b.passengerId}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0a1128' }}>{b.origin} ➔ {b.destination}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ride #{b.rideId}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{b.seatsRequested}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: '#059669' }}>
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatDateTime(b.requestedAt)}
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

export default AdminBookingsPage;
