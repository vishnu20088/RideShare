import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { adminApi } from '../services/api';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, size: 10 });
      if (res.data) {
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change status of ${user.fullName} to ${newStatus}?`)) return;

    try {
      await adminApi.updateUserStatus(user.id, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          User Accounts Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          View registered passengers, drivers, administrators, and manage account statuses.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Loading user accounts..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>User</th>
                    <th style={{ padding: '14px 20px' }}>Contact</th>
                    <th style={{ padding: '14px 20px' }}>Roles</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #f1f5f9' }}>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #{u.id}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div>{u.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.phone || 'No phone'}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {u.roles?.map((r) => (
                            <span key={r} style={{
                              backgroundColor: r === 'ROLE_ADMIN' ? '#fef3c7' : r === 'ROLE_DRIVER' ? '#eff6ff' : '#f1f5f9',
                              color: r === 'ROLE_ADMIN' ? '#b45309' : r === 'ROLE_DRIVER' ? '#1d4ed8' : '#334155',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}>
                              {r.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={u.accountStatus} />
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn btn-outline btn-sm"
                          style={{
                            color: u.accountStatus === 'ACTIVE' ? '#ef4444' : '#059669',
                            borderColor: u.accountStatus === 'ACTIVE' ? '#fca5a5' : '#a7f3d0'
                          }}
                        >
                          {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
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

export default AdminUsersPage;
