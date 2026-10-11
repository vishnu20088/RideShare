import React from 'react';

export const FormField = ({
  label,
  id,
  error,
  required = false,
  helpText,
  children,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <span style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
          {helpText}
        </span>
      )}
      {error && (
        <span className="form-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
