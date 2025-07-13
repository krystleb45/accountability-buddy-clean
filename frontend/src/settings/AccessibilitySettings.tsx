import React, { useState, useEffect } from 'react';
import styles from './AccessibilitySettings.module.css';

const AccessibilitySettings: React.FC = () => {
  const [highContrast, setHighContrast] = useState<boolean>(
    JSON.parse(localStorage.getItem('highContrast') || 'false'),
  );
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    JSON.parse(localStorage.getItem('reduceMotion') || 'false'),
  );
  const [textToSpeech, setTextToSpeech] = useState<boolean>(
    JSON.parse(localStorage.getItem('textToSpeech') || 'false'),
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(highContrast));
    localStorage.setItem('highContrast', JSON.stringify(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduce-motion', String(reduceMotion));
    localStorage.setItem('reduceMotion', JSON.stringify(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem('textToSpeech', JSON.stringify(textToSpeech));
  }, [textToSpeech]);

  return (
    <div className={styles.container}>
      <h2>Accessibility Settings</h2>

      <div className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => setHighContrast((f) => !f)}
          />
          High Contrast Mode
        </label>
      </div>

      <div className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={() => setReduceMotion((f) => !f)}
          />
          Reduce Motion
        </label>
      </div>

      <div className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={textToSpeech}
            onChange={() => setTextToSpeech((f) => !f)}
          />
          Text-to-Speech
        </label>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
