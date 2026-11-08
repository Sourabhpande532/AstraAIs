import React from 'react';

interface LoadingSpinnerProps {
  minHeight?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ minHeight = 'calc(100vh - 150px)' }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center w-100"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <div
        className="spinner-border"
        style={{ width: '2.75rem', height: '2.75rem', color: '#10b981', opacity: 0.85 }}
      />
      <span className="text-secondary small mt-3">Loading workspace...</span>
    </div>
  );
};

export default LoadingSpinner;
