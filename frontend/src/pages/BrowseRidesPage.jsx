import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchForm from '../components/rides/SearchForm';
import RideCard from '../components/rides/RideCard';
import RideFilters from '../components/rides/RideFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { rideApi } from '../services/api';

export const BrowseRidesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    travelDate: searchParams.get('date') || '',
    seats: Number(searchParams.get('seats')) || 1,
    maxPrice: null,
    sortBy: 'departureTime',
    sortDir: 'asc',
  });

  const fetchRides = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: 9,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      };
      if (filters.origin) params.origin = filters.origin;
      if (filters.destination) params.destination = filters.destination;
      if (filters.travelDate) params.travelDate = filters.travelDate;
      if (filters.seats > 0) params.seats = filters.seats;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const res = await rideApi.searchRides(params);
      if (res.data) {
        setRides(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to search rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      origin: '',
      destination: '',
      travelDate: '',
      seats: 1,
      maxPrice: null,
      sortBy: 'departureTime',
      sortDir: 'asc',
    });
    setSearchParams({});
    setPage(0);
  };

  const handleSearchSubmit = (searchData) => {
    setFilters((prev) => ({
      ...prev,
      origin: searchData.origin,
      destination: searchData.destination,
      travelDate: searchData.travelDate,
      seats: searchData.seats,
    }));
    setPage(0);
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }} className="fade-in">
      <div className="container">
        {/* Header Search Bar */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '16px', color: '#0a1128' }}>
            Find Available Rides
          </h1>
          <SearchForm
            compact
            initialValues={{
              origin: filters.origin,
              destination: filters.destination,
              travelDate: filters.travelDate,
              seats: filters.seats,
            }}
            onSearch={handleSearchSubmit}
          />
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', alignItems: 'flex-start' }}>
          {/* Filters Sidebar */}
          <RideFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Results Area */}
          <div>
            {error && <ErrorMessage message={error} onRetry={fetchRides} />}

            {loading ? (
              <LoadingSpinner message="Searching available rides along route..." />
            ) : rides.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                    Found <strong style={{ color: '#0f172a' }}>{totalElements}</strong> rides matching your criteria
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px'
                }}>
                  {rides.map((ride) => (
                    <RideCard key={ride.id} ride={ride} />
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={(p) => setPage(p)}
                />
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚗</div>
                <h3 style={{ fontSize: '1.35rem', color: '#0a1128', marginBottom: '8px' }}>
                  No Rides Found
                </h3>
                <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
                  There are currently no open rides matching your origin, destination, or date. Try broadening your search or check another travel day.
                </p>
                <button onClick={handleResetFilters} className="btn btn-outline">
                  Reset Search Criteria
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseRidesPage;
