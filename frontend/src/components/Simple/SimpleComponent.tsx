// ✅ SimpleComponent.tsx
import React from 'react';

// 👇 Export the props interface so it can be imported elsewhere (like Storybook)
export interface SimpleComponentProps {
  message?: string;
  className?: string; // Optional className for styling
  id?: string; // Optional ID for DOM targeting
}

const SimpleComponent: React.FC<SimpleComponentProps> = ({
  message = 'Simple Component',
  className = '',
  id = 'simple-component',
}) => {
  return (
    <p id={id} className={className} role="contentinfo" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
};

export default SimpleComponent;
