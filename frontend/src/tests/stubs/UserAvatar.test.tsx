import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import UserAvatar from '../../components/Profile/UserAvatar';

// Pull the props type directly from the component
type Props = React.ComponentProps<typeof UserAvatar>;
type UserType = Props['user'];

describe('UserAvatar', () => {
  it('renders without crashing', () => {
    // Cast a bare object to the expected UserProfile type
    const dummyUser = {} as UserType;

    render(<UserAvatar user={dummyUser} />);
  });
});
