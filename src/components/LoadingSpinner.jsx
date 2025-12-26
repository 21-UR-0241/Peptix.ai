import React from 'react';
import AnimatedLogo from './AnimatedLogo';

function LoadingSpinner({ message = 'Analyzing image...' }) {
  return (
    <div className="loading-container fade-in">
      <AnimatedLogo size={80} />
      <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '1.1rem' }}>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;