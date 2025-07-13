import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import EmojiPicker from '../../components/chat/EmojiPicker';

describe('EmojiPicker', () => {
  it('renders without crashing', () => {
    render(
      <EmojiPicker
        onSelect={function (_emoji: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
