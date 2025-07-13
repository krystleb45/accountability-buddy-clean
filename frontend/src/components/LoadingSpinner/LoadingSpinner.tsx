'use client';

import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  /** Diameter of spinner in pixels */
  size?: number;
  /** CSS color of the spinner border */
  color?: string;
  /** Controls visibility */
  loading?: boolean;
  /** If true, render full-screen overlay */
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 50,
  color = '#007bff',
  loading = true,
  overlay = false,
}) => {
  if (!loading) return null;

  const spinnerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth: size / 10,
    borderColor: `${color} transparent transparent transparent`,
  };

  const containerClass = overlay ? `${styles.container} ${styles.overlay}` : styles.container;

  return (
    <div
      className={containerClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="loading-spinner"
    >
      <div className={styles.spinner} style={spinnerStyle} />
      <span className={styles.srOnly}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
