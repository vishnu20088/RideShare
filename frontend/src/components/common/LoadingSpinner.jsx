import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const pixelSize = size === 'sm' ? '22px' : size === 'lg' ? '48px' : '32px';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '14px',
      color: '#64748b',
    }}>
      <div style={{
        width: pixelSize,
        height: pixelSize,
        border: '3px solid #e2e8f0',
        borderTopColor: '#059669',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
