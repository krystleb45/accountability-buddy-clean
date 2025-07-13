import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChatRoomHeader from '../../components/chat/ChatRoomHeader';

describe('ChatRoomHeader', () => {
  it('renders without crashing', () => {
    render(<ChatRoomHeader />);
  });
});
