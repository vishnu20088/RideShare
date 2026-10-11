import React, { useState, useEffect } from 'react';
import FormField from '../components/common/FormField';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { driverApi } from '../services/api';

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [regNo, setRegNo] = useState('');
  const [color, setColor] = useState('');
  const [seatCapacity, setSeatCapacity] = useState(4);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  const fetchVehicles = async () => {
    try {
      const res = await driverApi.getMyVehicles();
      if (res.data) {
        setVehicles(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      await driverApi.createVehicle({
        make: make.trim(),
        model: model.trim(),
        registrationNumber: regNo.trim().toUpperCase(),
        color: color.trim(),
        seatCapacity: Number(seatCapacity),
      });

      setFormSuccess('Vehicle added successfully!');
      setMake('');
      setModel('');
      setRegNo('');
      setColor('');
      setSeatCapacity(4);
      fetchVehicles();
    } catch (err) {
      setFormError(err.message || 'Failed to add vehicle');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0a1128', marginBottom: '8px' }}>
          Vehicle Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Register and configure your vehicles for publishing rides.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 1fr)', gap: '30px', alignItems: 'flex-start' }}>
        {/* Vehicles List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#0a1128', marginBottom: '16px' }}>
            Registered Vehicles ({vehicles.length})
          </h2>

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <LoadingSpinner message="Loading your vehicles..." />
          ) : vehicles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vehicles.map((v) => (
                <div key={v.id} className="card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        🚘
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', color: '#0a1128' }}>
                          {v.make} {v.model}
                        </h4>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                          Color: {v.color} • Max Seats: {v.seatCapacity}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f1f5f9',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '0.875rem'
                    }}>
                      {v.registrationNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>No vehicles registered yet. Add your vehicle details on the right.</p>
            </div>
          )}
        </div>

        {/* Add Vehicle Form */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0a1128', marginBottom: '16px' }}>
            Register New Vehicle
          </h3>

          {formSuccess && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
              {formSuccess}
            </div>
          )}
          {formError && <ErrorMessage message={formError} />}

          <form onSubmit={handleAddVehicle} id="add-vehicle-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <FormField label="Make" id="veh-make" required>
                <input
                  id="veh-make"
                  type="text"
                  required
                  placeholder="e.g. Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="form-input"
                />
              </FormField>

              <FormField label="Model" id="veh-model" required>
                <input
                  id="veh-model"
                  type="text"
                  required
                  placeholder="e.g. Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="form-input"
                />
              </FormField>
            </div>

            <FormField label="Registration Plate #" id="veh-reg" required helpText="Official license plate">
              <input
                id="veh-reg"
                type="text"
                required
                placeholder="e.g. 7XYZ123"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="form-input"
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <FormField label="Color" id="veh-color" required>
                <input
                  id="veh-color"
                  type="text"
                  required
                  placeholder="e.g. Silver"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="form-input"
                />
              </FormField>

              <FormField label="Seat Capacity" id="veh-capacity" required>
                <input
                  id="veh-capacity"
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={seatCapacity}
                  onChange={(e) => setSeatCapacity(e.target.value)}
                  className="form-input"
                />
              </FormField>
            </div>

            <button
              id="add-vehicle-submit-btn"
              type="submit"
              disabled={formLoading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {formLoading ? 'Adding Vehicle...' : 'Register Vehicle'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;
