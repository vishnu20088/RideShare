import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FormField from '../components/common/FormField';
import ErrorMessage from '../components/common/ErrorMessage';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/passenger/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (user.roles?.includes('ROLE_DRIVER')) {
        navigate('/driver/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
    }} className="fade-in">
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Log in to manage your rides, bookings, and profile.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} id="login-form">
          <FormField label="Email Address" id="login-email" required>
            <input
              id="login-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </FormField>

          <FormField label="Password" id="login-password" required>
            <input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </FormField>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Testing Autofill Helpers */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quick Demo Accounts
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => autofill('admin@ridehub.com', 'Admin@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              id="demo-driver-btn"
              onClick={() => autofill('driver@ridehub.com', 'Driver@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              🚗 Driver
            </button>
            <button
              type="button"
              id="demo-passenger-btn"
              onClick={() => autofill('passenger@ridehub.com', 'Passenger@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              🎒 Passenger
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <Link to="/register" id="login-to-register-link" style={{ color: '#059669', fontWeight: 600 }}>
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
