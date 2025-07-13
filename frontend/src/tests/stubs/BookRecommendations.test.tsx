import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BookRecommendations from '../../components/Recommendations/BookRecommendations';

describe('BookRecommendations', () => {
  it('renders without crashing', () => {
    render(<BookRecommendations />);
  });
});
