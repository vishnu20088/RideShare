import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormField from '../components/common/FormField';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { rideApi } from '../services/api';

export const EditRidePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [totalSeats, setTotalSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState('20.00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await rideApi.getRideById(id);
        const r = res.data;
        setOrigin(r.origin);
        setDestination(r.destination);
        if (r.departureTime) {
          setDepartureTime(new Date(r.departureTime).toISOString().slice(0, 16));
        }
        setTotalSeats(r.totalSeats);
        setPricePerSeat(r.pricePerSeat);
        setDescription(r.description || '');
      } catch (err) {
        setError(err.message || 'Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const depIso = new Date(departureTime).toISOString();
      await rideApi.updateRide(id, {
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime: depIso,
        totalSeats: Number(totalSeats),
        pricePerSeat: Number(pricePerSeat),
        description: description.trim() || null,
      });

      navigate(`/rides/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update ride');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading ride details..." />;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Edit Ride #{id}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Update departure details, seats, or trip descriptions.
        </p>
      </div>

      <div className="card" style={{ padding: '36px' }}>
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} id="edit-ride-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <FormField label="Pickup Origin" id="edit-origin" required>
              <input
                id="edit-origin"
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Drop-off Destination" id="edit-dest" required>
              <input
                id="edit-dest"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="form-input"
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <FormField label="Departure Date & Time" id="edit-dep-time" required>
              <input
                id="edit-dep-time"
                type="datetime-local"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Total Seats" id="edit-seats" required>
              <input
                id="edit-seats"
                type="number"
                required
                min="1"
                max="20"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Price per Seat ($)" id="edit-price" required>
              <input
                id="edit-price"
                type="number"
                required
                min="0.00"
                step="0.50"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                className="form-input"
              />
            </FormField>
          </div>

          <FormField label="Description & Notes" id="edit-desc">
            <textarea
              id="edit-desc"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              id="edit-ride-submit-btn"
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRidePage;
