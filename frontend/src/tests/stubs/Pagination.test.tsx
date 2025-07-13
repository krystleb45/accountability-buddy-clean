import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Pagination from '../../components/UtilityComponents/Pagination';

describe('Pagination', () => {
  it('renders without crashing', () => {
    render(
      <Pagination
        currentPage={0}
        totalPages={0}
        onPageChange={function (_page: number): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
