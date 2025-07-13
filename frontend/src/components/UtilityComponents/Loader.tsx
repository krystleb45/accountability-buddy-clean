import React from 'react';
import './Loader.css'; // CSS for styling the loader

interface LoaderProps {
  size?: 'small' | 'medium' | 'large'; // Optional size of the loader
  color?: string; // Optional custom color for the loader
  message?: string; // Optional message to display with the loader
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', color = '#007bff', message }) => {
  return (
    <div className={`loader-container loader-${size}`} role="status" aria-live="polite">
      <div
        className="spinner"
        style={{
          borderColor: `${color} transparent ${color} transparent`,
        }}
      ></div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;
