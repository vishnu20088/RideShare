import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchForm = ({ initialValues = {}, onSearch, compact = false }) => {
  const [origin, setOrigin] = useState(initialValues.origin || '');
  const [destination, setDestination] = useState(initialValues.destination || '');
  const [travelDate, setTravelDate] = useState(initialValues.travelDate || '');
  const [seats, setSeats] = useState(initialValues.seats || 1);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (origin.trim()) queryParams.set('origin', origin.trim());
    if (destination.trim()) queryParams.set('destination', destination.trim());
    if (travelDate) queryParams.set('date', travelDate);
    if (seats > 1) queryParams.set('seats', seats);

    if (onSearch) {
      onSearch({ origin, destination, travelDate, seats });
    } else {
      navigate(`/rides?${queryParams.toString()}`);
    }
  };

  return (
    <form
      id="ride-search-form"
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: compact ? '14px' : '20px',
        padding: compact ? '16px' : '24px 28px',
        boxShadow: compact ? '0 4px 6px -1px rgba(0,0,0,0.06)' : '0 20px 30px -10px rgba(0,0,0,0.18)',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(180px, 1fr)) 120px' : 'repeat(auto-fit, minmax(200px, 1fr)) 160px',
        gap: '16px',
        alignItems: 'end',
      }}
    >
      <div>
        <label htmlFor="search-origin" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
          Leaving from
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="search-origin"
            type="text"
            placeholder="e.g. San Francisco, CA"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#10b981' }}>🟢</span>
        </div>
      </div>

      <div>
        <label htmlFor="search-destination" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
          Going to
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="search-destination"
            type="text"
            placeholder="e.g. San Jose, CA"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#ef4444' }}>🔴</span>
        </div>
      </div>

      <div>
        <label htmlFor="search-date" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
          Date
        </label>
        <input
          id="search-date"
          type="date"
          value={travelDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setTravelDate(e.target.value)}
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="search-seats" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
          Seats
        </label>
        <select
          id="search-seats"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="form-select"
        >
          <option value="1">1 Seat</option>
          <option value="2">2 Seats</option>
          <option value="3">3 Seats</option>
          <option value="4">4+ Seats</option>
        </select>
      </div>

      <button
        id="search-submit-btn"
        type="submit"
        className="btn btn-primary"
        style={{ height: '46px', width: '100%', fontSize: '1rem', fontWeight: 700 }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;
