import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import RelatedActivities from '../../components/Activities/RelatedActivities';

describe('RelatedActivities', () => {
  it('renders without crashing', () => {
    render(<RelatedActivities userId={''} />);
  });
});
