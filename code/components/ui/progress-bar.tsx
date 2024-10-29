import React from 'react';

interface ProgressBarProps {
  value: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  return (
    <div className="progress-bar" style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
      <div
        className="progress-bar-fill"
        style={{
          width: `${value}%`,
          backgroundColor: value >= 70 ? '#A2C765' : value >= 40 ? '#F9A825' : '#F44336', // Color depending on the strength
          height: '10px',
          borderRadius: '5px',
          transition: 'width 0.4s ease-in-out',
        }}
      />
    </div>
  );
};
