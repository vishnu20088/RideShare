import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { reviewApi, userApi } from '../services/api';
import { formatDateTime } from '../utils/formatters';

export const ReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [publicProfile, setPublicProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewsData = async () => {
      if (!user) return;
      try {
        const [reviewsRes, profileRes] = await Promise.all([
          reviewApi.getUserReviews(user.id),
          userApi.getPublicProfile(user.id),
        ]);
        if (reviewsRes.data) setReviews(reviewsRes.data);
        if (profileRes.data) setPublicProfile(profileRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviewsData();
  }, [user]);

  if (loading) return <LoadingSpinner message="Loading your community reviews..." />;

  const avgRating = publicProfile?.averageRating ? Number(publicProfile.averageRating).toFixed(1) : '5.0';

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          My Reviews & Reputation
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Feedback and ratings received from verified trip participants.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Summary Score Card */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: '120px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0a1128', fontFamily: 'Outfit, sans-serif' }}>
            {avgRating}
          </div>
          <div style={{ color: '#f59e0b', fontSize: '1.25rem', letterSpacing: '2px' }}>
            {'★'.repeat(Math.round(Number(avgRating)) || 5)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Overall Rating
          </div>
        </div>

        <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '28px' }}>
          <h3 style={{ fontSize: '1.125rem', color: '#0a1128', marginBottom: '6px' }}>
            Community Standing: Excellent
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5' }}>
            You have received <strong>{reviews.length}</strong> review(s) from your trips as a driver or passenger. High ratings foster community trust and speed up booking confirmations.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#0a1128', marginBottom: '16px' }}>
          Received Reviews ({reviews.length})
        </h2>

        {reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                    }}>
                      {r.reviewerName ? r.reviewerName.charAt(0) : 'U'}
                    </div>
                    <strong style={{ color: '#0f172a' }}>{r.reviewerName || 'Participant'}</strong>
                  </div>

                  <div style={{ color: '#f59e0b', fontWeight: 700 }}>
                    {'★'.repeat(r.rating)} <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>({r.rating}/5)</span>
                  </div>
                </div>

                {r.comment && (
                  <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.5, marginBottom: '8px' }}>
                    "{r.comment}"
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {formatDateTime(r.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⭐</div>
            <p style={{ color: '#64748b' }}>No reviews received yet. Reviews are unlocked once trips are marked as completed!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
