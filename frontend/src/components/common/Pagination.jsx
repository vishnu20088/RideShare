import React from 'react';

export const Pagination = ({ page, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      marginTop: '20px',
      borderTop: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
        Showing page <strong style={{ color: '#0f172a' }}>{page + 1}</strong> of <strong style={{ color: '#0f172a' }}>{totalPages}</strong> ({totalElements} total results)
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="btn btn-outline btn-sm"
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="btn btn-outline btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
