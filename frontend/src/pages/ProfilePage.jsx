import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import FormField from '../components/common/FormField';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { userApi, driverApi } from '../services/api';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const [licenseNumber, setLicenseNumber] = useState('');
  const [driverSaving, setDriverSaving] = useState(false);
  const [driverSuccess, setDriverSuccess] = useState(null);
  const [driverError, setDriverError] = useState(null);

  const fetchProfileData = async () => {
    try {
      const [userRes, driverRes] = await Promise.all([
        userApi.getProfile(),
        driverApi.getProfile().catch(() => ({ data: null })),
      ]);

      if (userRes.data) {
        setProfile(userRes.data);
        setFullName(userRes.data.fullName);
        setPhone(userRes.data.phone || '');
      }
      if (driverRes.data) {
        setDriverProfile(driverRes.data);
        setLicenseNumber(driverRes.data.licenseNumber);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const res = await userApi.updateProfile({ fullName, phone });
      updateUser(res.data);
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDriverProfile = async (e) => {
    e.preventDefault();
    setDriverSaving(true);
    setDriverSuccess(null);
    setDriverError(null);
    try {
      const res = await driverApi.createOrUpdateProfile({ licenseNumber });
      setDriverProfile(res.data);
      setDriverSuccess('Driver license verified and driver status updated!');
      // Refresh current user roles
      const meRes = await userApi.getProfile();
      updateUser(meRes.data);
      setTimeout(() => setDriverSuccess(null), 3000);
    } catch (err) {
      setDriverError(err.message || 'Failed to update driver license');
    } finally {
      setDriverSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Profile & Account Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Manage your personal details, verified credentials, and account settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
        {/* Personal Details */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0a1128', marginBottom: '20px' }}>
            Personal Details
          </h3>

          {saveSuccess && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
              {saveSuccess}
            </div>
          )}
          {saveError && <ErrorMessage message={saveError} />}

          <form onSubmit={handleUpdateProfile} id="profile-edit-form">
            <FormField label="Full Name" id="profile-name" required>
              <input
                id="profile-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Email Address" id="profile-email">
              <input
                id="profile-email"
                type="email"
                disabled
                value={profile?.email || ''}
                className="form-input"
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Email cannot be modified directly.
              </span>
            </FormField>

            <FormField label="Phone Number" id="profile-phone">
              <input
                id="profile-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </FormField>

            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '6px' }}>
                Account Status: <strong style={{ color: '#059669' }}>{profile?.accountStatus}</strong>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Active Roles: {profile?.roles?.map((r) => r.replace('ROLE_', '')).join(', ')}
              </div>
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Driver Verification */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.5rem' }}>🪪</span>
            <h3 style={{ fontSize: '1.25rem', color: '#0a1128' }}>
              Driver License Verification
            </h3>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
            To offer rides and publish carpool trips, drivers must maintain a verified driver license reference.
          </p>

          {driverSuccess && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
              {driverSuccess}
            </div>
          )}
          {driverError && <ErrorMessage message={driverError} />}

          <form onSubmit={handleDriverProfile} id="driver-license-form">
            <FormField label="Driver License Number" id="license-number" required helpText="State or official driver license reference">
              <input
                id="license-number"
                type="text"
                required
                placeholder="e.g. DL-12345678"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="form-input"
              />
            </FormField>

            {driverProfile && (
              <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '10px', margin: '16px 0' }}>
                <span style={{ fontSize: '0.8125rem', color: '#065f46', fontWeight: 600 }}>
                  ✓ Status: {driverProfile.verificationStatus}
                </span>
              </div>
            )}

            <button
              id="save-license-btn"
              type="submit"
              disabled={driverSaving}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {driverSaving ? 'Updating...' : (driverProfile ? 'Update License Reference' : 'Verify Driver Profile')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
