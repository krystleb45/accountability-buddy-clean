import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProfileSettings from '../../components/Profile/ProfileSettings';

// Derive prop types from the component
type Props = React.ComponentProps<typeof ProfileSettings>;
type UserType = Props['user'];
type UpdateArg = Parameters<Props['onUpdate']>[0];

describe('ProfileSettings', () => {
  it('renders without crashing', () => {
    // Cast an empty object to satisfy the required `user` prop
    const dummyUser = {} as UserType;

    render(
      <ProfileSettings
        user={dummyUser}
        onUpdate={(_updatedData: UpdateArg) => Promise.resolve()}
      />,
    );
  });
});
