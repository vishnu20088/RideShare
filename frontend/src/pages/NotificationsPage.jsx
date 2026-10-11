import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { notificationApi } from '../services/api';
import { formatDateTime } from '../utils/formatters';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '6px' }}>
            Notifications & Alerts
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Real-time booking statuses, driver updates, and platform notices.
          </p>
        </div>

        {notifications.some((n) => !n.readStatus) && (
          <button
            id="mark-all-read-btn"
            onClick={handleMarkAllRead}
            className="btn btn-outline btn-sm"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                backgroundColor: n.readStatus ? '#ffffff' : '#f0fdf4',
                borderColor: n.readStatus ? '#e2e8f0' : '#bbf7d0',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem' }}>{n.readStatus ? '📫' : '🔔'}</span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#0a1128', marginBottom: '4px' }}>
                    {n.title}
                  </h4>
                  <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: '1.5', marginBottom: '8px' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.readStatus && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="btn btn-outline btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔔</div>
          <p style={{ color: '#64748b' }}>You have no notifications at this time.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
