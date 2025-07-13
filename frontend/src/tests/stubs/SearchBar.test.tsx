import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SearchBar from '../../components/UtilityComponents/SearchBar';

describe('SearchBar', () => {
  it('renders without crashing', () => {
    render(
      <SearchBar
        onSearch={function (_query: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
