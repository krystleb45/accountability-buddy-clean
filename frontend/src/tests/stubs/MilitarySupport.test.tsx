// src/tests/stubs/MilitarySupport.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Bring in your ChatProvider so useChat() has a context
import { ChatProvider } from '../../context/ChatContext';

// 2) Import the component under test
import MilitarySupport from '../../components/MilitarySupport/MilitarySupport';

describe('MilitarySupport', () => {
  it('renders without crashing', () => {
    render(
      <ChatProvider>
        <MilitarySupport />
      </ChatProvider>
    );
  });
});
