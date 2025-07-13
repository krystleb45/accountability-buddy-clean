// src/tests/stubs/ThemeToggle.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// import your ThemeProvider from wherever it's defined
import { ThemeProvider } from '../../context/ui/ThemeContext';
import ThemeToggle from '../../components/General/ThemeToggle';

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  });
});
