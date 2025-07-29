// src/components/UtilityComponents/Disclaimer.tsx
import React from 'react';
import './Disclaimer.css';

/**
 * A self‐contained legal / informational disclaimer.
 * Renders as an aside landmark, labelled by its heading.
 */
const Disclaimer: React.FC = () => {
  return (
    <aside className="disclaimer" aria-labelledby="disclaimer-title">
      <h2 id="disclaimer-title">Disclaimer</h2>
      <p>
        This platform is intended for informational and peer-to-peer support purposes only and does
        not constitute professional advice, diagnosis, or treatment. The information provided here
        should not be relied upon as a substitute for professional medical, mental health, legal, or
        financial advice.
      </p>
      <p>
        Participation on this platform is voluntary, and we cannot guarantee the accuracy, validity,
        or reliability of any information shared by users. By using this platform, you agree that
        you are solely responsible for your actions and decisions.
      </p>
      <p>
        If you are experiencing a crisis or emergency, please seek immediate assistance by
        contacting 911 or a licensed professional crisis hotline. Some available resources include:
      </p>
      <ul>
        <li>
          <strong>National Suicide Prevention Lifeline (U.S.):</strong> <a href="tel:988">988</a>
        </li>
        <li>
          <strong>International Crisis Helplines:</strong>{' '}
          <a
            href="https://www.opencounseling.com/suicide-hotlines"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here
          </a>
        </li>
      </ul>
      <p>
        By using this platform, you acknowledge and agree that the platform owners, developers, and
        administrators are not liable for any outcomes resulting from your use of this platform or
        any external resources linked here. Use at your own discretion and responsibility.
      </p>
    </aside>
  );
};

export default Disclaimer;
