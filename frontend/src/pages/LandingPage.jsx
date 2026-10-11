import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchForm from '../components/rides/SearchForm';
import RideCard from '../components/rides/RideCard';
import { rideApi } from '../services/api';

export const LandingPage = () => {
  const [featuredRides, setFeaturedRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingRides = async () => {
      try {
        const res = await rideApi.searchRides({ page: 0, size: 3 });
        if (res.data?.content) {
          setFeaturedRides(res.data.content);
        }
      } catch (err) {
        // Fallback or empty state
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingRides();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1128 0%, #0f1c3f 50%, #034078 100%)',
        color: '#ffffff',
        padding: '80px 0 100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow effect */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto 48px auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <span>🌱</span> Sustainable & Affordable Travel Across Cities
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              color: '#ffffff',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '20px'
            }}>
              Smart Ride Sharing for <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Every Journey</span>
            </h1>

            <p style={{
              fontSize: '1.1875rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '650px',
              margin: '0 auto'
            }}>
              Connect with vetted drivers traveling your way. Save travel expenses, reduce highway congestion, and enjoy reliable carpooling.
            </p>
          </div>

          {/* Search Form Widget */}
          <div style={{ maxWidth: '1020px', margin: '0 auto' }}>
            <SearchForm />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '90px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 60px auto' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '14px', color: '#0a1128' }}>
              How RideHub Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.0625rem' }}>
              Whether offering spare seats in your car or reserving a ride as a passenger, getting started takes just minutes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '36px 24px', backgroundColor: '#f8fafc' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 20px auto'
              }}>
                🔍
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>1. Find or Publish</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Passengers search for routes and departure times. Drivers publish upcoming trips with available seats and price.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '36px 24px', backgroundColor: '#f8fafc' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 20px auto'
              }}>
                🤝
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>2. Request & Confirm</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Passengers request their desired seats. The driver approves the request, locking in atomic seat allocations safely.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '36px 24px', backgroundColor: '#f8fafc' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 20px auto'
              }}>
                ⭐
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>3. Travel & Review</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Meet at the agreed pickup point, travel safely, share travel costs, and rate each other to strengthen community trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rides Section (If data exists) */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#0a1128' }}>
                Featured Upcoming Rides
              </h2>
              <p style={{ color: '#64748b' }}>
                Popular commuter and intercity routes with open seats available right now.
              </p>
            </div>
            <Link to="/rides" id="home-view-all-rides" className="btn btn-outline">
              Browse All Rides →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading available rides...</div>
          ) : featuredRides.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px'
            }}>
              {featuredRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚗</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#0a1128' }}>No Upcoming Rides Published Yet</h3>
              <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 20px auto' }}>
                Be the first to share your journey! Drivers can publish empty seats in their car and share travel costs.
              </p>
              <Link to="/publish-ride" className="btn btn-primary">
                Publish the First Ride
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Benefits for Drivers & Passengers */}
      <section style={{ padding: '90px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px'
          }}>
            {/* Passenger Benefits */}
            <div className="card" style={{ padding: '36px', borderLeft: '4px solid #059669' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '16px' }}>
                FOR PASSENGERS
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '16px', color: '#0a1128' }}>
                Affordable, Comfortable Commuting
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', color: '#475569', fontSize: '0.9375rem' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Save up to 70%</strong> compared to traditional taxis or solo car ownership.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Direct routes:</strong> Travel between convenient origin and destination points.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Verified drivers:</strong> Inspect driver licenses and community rating profiles.</span>
                </li>
              </ul>
              <div style={{ marginTop: '28px' }}>
                <Link to="/rides" className="btn btn-outline btn-sm">Find Seats Now</Link>
              </div>
            </div>

            {/* Driver Benefits */}
            <div className="card" style={{ padding: '36px', borderLeft: '4px solid #034078' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '16px' }}>
                FOR DRIVERS
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '16px', color: '#0a1128' }}>
                Offset Travel & Fuel Expenses
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', color: '#475569', fontSize: '0.9375rem' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#034078', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Cover fuel & tolls:</strong> Turn empty car seats into shared travel contributions.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#034078', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Total schedule control:</strong> Set your own departure time, route, and seat limits.</span>
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#034078', fontWeight: 'bold' }}>✓</span>
                  <span><strong>Review passenger requests:</strong> Approve or decline booking requests at will.</span>
                </li>
              </ul>
              <div style={{ marginTop: '28px' }}>
                <Link to="/publish-ride" className="btn btn-primary btn-sm">Publish a Ride</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#0a1128', color: '#ffffff' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '16px' }}>
            Safety & Community Integrity First
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '36px' }}>
            RideHub enforces verified profiles, strict double-sided passenger and driver ratings, and transactional seat controls. We never compromise on passenger and driver peace of mind.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" id="home-cta-register" className="btn btn-primary btn-lg">
              Join RideHub Today
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
