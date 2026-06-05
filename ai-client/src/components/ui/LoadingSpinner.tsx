import React from 'react';

interface LoadingSpinnerProps {
  minHeight?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ minHeight = '60vh' }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight }}>
      <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem', opacity: 0.5 }} />
    </div>
  );
};

export default LoadingSpinner;
