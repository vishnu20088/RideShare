import React from 'react';

export const RideFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="card" style={{ padding: '20px', height: 'fit-content' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '1rem', color: '#0a1128' }}>Filters & Sorting</h4>
        <button
          onClick={onReset}
          className="btn btn-sm"
          style={{ background: 'none', border: 'none', color: '#059669', padding: '0', fontSize: '0.8125rem' }}
        >
          Reset All
        </button>
      </div>

      {/* Sort By */}
      <div className="form-group">
        <label htmlFor="filter-sort-by" className="form-label" style={{ fontSize: '0.8125rem' }}>
          Sort By
        </label>
        <select
          id="filter-sort-by"
          className="form-select"
          value={filters.sortBy || 'departureTime'}
          onChange={(e) => onChange('sortBy', e.target.value)}
        >
          <option value="departureTime">Earliest Departure</option>
          <option value="price">Price: Low to High</option>
        </select>
      </div>

      {/* Max Price */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label htmlFor="filter-max-price" className="form-label" style={{ fontSize: '0.8125rem', marginBottom: 0 }}>
            Max Price per Seat
          </label>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669' }}>
            {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
          </span>
        </div>
        <input
          id="filter-max-price"
          type="range"
          min="5"
          max="200"
          step="5"
          value={filters.maxPrice || 200}
          onChange={(e) => onChange('maxPrice', e.target.value)}
          style={{ width: '100%', accentColor: '#059669' }}
        />
      </div>

      {/* Min Seats */}
      <div className="form-group">
        <label htmlFor="filter-min-seats" className="form-label" style={{ fontSize: '0.8125rem' }}>
          Available Seats Needed
        </label>
        <select
          id="filter-min-seats"
          className="form-select"
          value={filters.seats || 1}
          onChange={(e) => onChange('seats', Number(e.target.value))}
        >
          <option value="1">1 Seat or more</option>
          <option value="2">2 Seats or more</option>
          <option value="3">3 Seats or more</option>
          <option value="4">4 Seats or more</option>
        </select>
      </div>
    </div>
  );
};

export default RideFilters;
