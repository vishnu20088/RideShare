import React, { useState } from 'react';
import FormField from '../components/common/FormField';
import ErrorMessage from '../components/common/ErrorMessage';
import useAuth from '../hooks/useAuth';
import { adminApi } from '../services/api';

export const ContactPage = () => {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState('Inquiry');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        await adminApi.createReport({ reason, description });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }} className="fade-in">
      <div className="container" style={{ maxWidth: '860px' }}>
        <h1 style={{ fontSize: '2.4rem', color: '#0a1128', marginBottom: '14px' }}>
          Contact & Safety Support
        </h1>
        <p style={{ fontSize: '1.0625rem', color: '#64748b', lineHeight: 1.6, marginBottom: '40px' }}>
          Have questions or need assistance? Reach out to our dedicated operations and trust & safety team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 1fr)', gap: '36px', alignItems: 'flex-start' }}>
          {/* Contact / Report Form */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#0a1128' }}>
              Send an Inquiry or Safety Report
            </h3>

            {submitted ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📬</div>
                <h4 style={{ color: '#166534', marginBottom: '6px' }}>Message Received</h4>
                <p style={{ color: '#166534', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                  Thank you for reaching out. Our support team will review your report and respond promptly.
                </p>
                <button onClick={() => { setSubmitted(false); setDescription(''); }} className="btn btn-outline btn-sm" style={{ marginTop: '16px' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} id="contact-form">
                {error && <ErrorMessage message={error} />}

                <FormField label="Topic / Reason" id="contact-reason" required>
                  <select
                    id="contact-reason"
                    className="form-select"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="General Inquiry">General Question / Inquiry</option>
                    <option value="Driver Verification Help">Driver Profile Verification</option>
                    <option value="Booking Issue">Booking or Seat Allocation Issue</option>
                    <option value="Safety or Conduct Report">Safety or Conduct Concern</option>
                  </select>
                </FormField>

                <FormField label="Details & Description" id="contact-desc" required helpText="Please be as specific as possible.">
                  <textarea
                    id="contact-desc"
                    required
                    rows="5"
                    placeholder="Describe your issue or question..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                  />
                </FormField>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  {loading ? 'Submitting...' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>

          {/* FAQ & Support Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#0a1128', marginBottom: '10px' }}>
                How do driver payouts work?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                RideHub facilitates cost sharing between drivers and passengers. All payments and seat costs are mutually confirmed upon booking.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#0a1128', marginBottom: '10px' }}>
                How do I cancel a seat?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                You can cancel a booking directly from your <strong>My Bookings</strong> dashboard at any time prior to departure. Released seats are restored automatically.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <h4 style={{ fontSize: '1rem', color: '#166534', marginBottom: '8px' }}>
                Emergency Contacts
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
                For on-road emergencies, always call your local emergency services (such as 911 / 112) first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
