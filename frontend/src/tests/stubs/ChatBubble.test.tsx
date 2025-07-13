import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatBubble from '../../components/chat/ChatBubble';

describe('ChatBubble', () => {
  it('renders without crashing', () => {
    render(<ChatBubble message={undefined} />);
  });
});
