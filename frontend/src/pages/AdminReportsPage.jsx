import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { adminApi } from '../services/api';
import { formatDateTime } from '../utils/formatters';

export const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports({ page, size: 10 });
      if (res.data) {
        setReports(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await adminApi.updateReportStatus(reportId, { status: newStatus });
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to update report status');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Safety & Conduct Reports
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Investigate user inquiries, vehicle complaints, and safety incidents.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Loading safety reports..." />
        ) : reports.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>ID</th>
                    <th style={{ padding: '14px 20px' }}>Reporter</th>
                    <th style={{ padding: '14px 20px' }}>Topic & Description</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px' }}>Created</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr key={rep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700 }}>#{rep.id}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div>{rep.reporterName || 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{rep.reporterId}</div>
                      </td>
                      <td style={{ padding: '16px 20px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, color: '#0a1128', marginBottom: '2px' }}>{rep.reason}</div>
                        <p style={{ color: '#475569', fontSize: '0.8125rem', lineHeight: '1.4' }}>
                          {rep.description}
                        </p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={rep.status} />
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.8125rem' }}>
                        {formatDateTime(rep.createdAt)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <select
                          value={rep.status}
                          onChange={(e) => handleUpdateStatus(rep.id, e.target.value)}
                          className="form-select"
                          style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="INVESTIGATING">INVESTIGATING</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="DISMISSED">DISMISSED</option>
                        </select>
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
        ) : (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛡️</div>
            <p style={{ color: '#64748b' }}>No pending safety reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
