import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Post from '../../components/Activities/Post';

describe('Post', () => {
  it('renders without crashing', () => {
    render(<Post id={''} title={''} content={''} author={''} timestamp={''} />);
  });
});
