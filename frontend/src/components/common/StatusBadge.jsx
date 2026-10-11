import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStyle = (s) => {
    switch (s.toUpperCase()) {
      case 'OPEN':
      case 'ACTIVE':
        return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', label: 'Open' };
      case 'PENDING':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Pending' };
      case 'CONFIRMED':
        return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7', label: 'Confirmed' };
      case 'COMPLETED':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe', label: 'Completed' };
      case 'CANCELLED':
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Cancelled' };
      case 'REJECTED':
      case 'SUSPENDED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', label: status };
      case 'FULL':
        return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5', label: 'Fully Booked' };
      default:
        return { bg: '#f1f5f9', text: '#334155', border: '#e2e8f0', label: status };
    }
  };

  const style = getStyle(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      backgroundColor: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
    }}>
      {style.label}
    </span>
  );
};

export default StatusBadge;
