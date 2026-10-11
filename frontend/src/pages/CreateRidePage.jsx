import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/common/FormField';
import ErrorMessage from '../components/common/ErrorMessage';
import { rideApi } from '../services/api';

export const CreateRidePage = () => {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState('');
  const [totalSeats, setTotalSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState('20.00');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Convert to ISO 8601 string
      const depIso = new Date(departureTime).toISOString();
      const arrIso = estimatedArrivalTime ? new Date(estimatedArrivalTime).toISOString() : null;

      const res = await rideApi.createRide({
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime: depIso,
        estimatedArrivalTime: arrIso,
        totalSeats: Number(totalSeats),
        pricePerSeat: Number(pricePerSeat),
        description: description.trim() || null,
      });

      navigate(`/rides/${res.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  // Min datetime for HTML datetime-local input
  const nowIso = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }} className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Publish a New Ride
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Enter your trip details to offer spare seats in your vehicle and share fuel costs.
        </p>
      </div>

      <div className="card" style={{ padding: '36px' }}>
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} id="create-ride-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <FormField label="Pickup Origin" id="ride-origin" required helpText="City, station, or landmark">
              <input
                id="ride-origin"
                type="text"
                required
                placeholder="e.g. San Francisco Financial District"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Drop-off Destination" id="ride-dest" required helpText="City or arrival landmark">
              <input
                id="ride-dest"
                type="text"
                required
                placeholder="e.g. San Jose Downtown"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="form-input"
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <FormField label="Departure Date & Time" id="ride-dep-time" required>
              <input
                id="ride-dep-time"
                type="datetime-local"
                required
                min={nowIso}
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Estimated Arrival Time" id="ride-arr-time" helpText="Optional estimate">
              <input
                id="ride-arr-time"
                type="datetime-local"
                min={departureTime || nowIso}
                value={estimatedArrivalTime}
                onChange={(e) => setEstimatedArrivalTime(e.target.value)}
                className="form-input"
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <FormField label="Total Available Seats" id="ride-total-seats" required helpText="Between 1 and 20">
              <input
                id="ride-total-seats"
                type="number"
                required
                min="1"
                max="20"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="form-input"
              />
            </FormField>

            <FormField label="Price per Seat ($ USD)" id="ride-price" required helpText="Suggested fuel cost share">
              <input
                id="ride-price"
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

          <FormField label="Trip Description & Pickup Details" id="ride-description" helpText="e.g. Pickup near the North Exit; trunk space available for medium luggage.">
            <textarea
              id="ride-description"
              rows="3"
              placeholder="Add instructions or preferences (luggage, music, pets)..."
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
              id="create-ride-submit-btn"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Publishing Ride...' : 'Publish Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRidePage;
