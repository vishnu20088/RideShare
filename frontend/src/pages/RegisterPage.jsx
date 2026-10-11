import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FormField from '../components/common/FormField';
import ErrorMessage from '../components/common/ErrorMessage';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [registerAsDriver, setRegisterAsDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await register({
        fullName,
        email,
        password,
        phone,
        registerAsDriver,
      });
      if (user.roles?.includes('ROLE_DRIVER')) {
        navigate('/driver/dashboard');
      } else {
        navigate('/passenger/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
    }} className="fade-in">
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
            Create Your Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Join thousands of smart travelers sharing routes and saving fuel.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} id="register-form">
          <FormField label="Full Name" id="reg-name" required>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="e.g. Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
            />
          </FormField>

          <FormField label="Email Address" id="reg-email" required>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </FormField>

          <FormField label="Password" id="reg-password" required helpText="At least 6 characters">
            <input
              id="reg-password"
              type="password"
              required
              minLength="6"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </FormField>

          <FormField label="Phone Number" id="reg-phone">
            <input
              id="reg-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
            />
          </FormField>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '14px',
            margin: '18px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <input
              id="reg-driver-checkbox"
              type="checkbox"
              checked={registerAsDriver}
              onChange={(e) => setRegisterAsDriver(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
            />
            <label htmlFor="reg-driver-checkbox" style={{ fontSize: '0.875rem', color: '#166534', cursor: 'pointer', fontWeight: 500 }}>
              I want to offer rides and share travel costs as a Driver
            </label>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '6px' }}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" id="register-to-login-link" style={{ color: '#059669', fontWeight: 600 }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
