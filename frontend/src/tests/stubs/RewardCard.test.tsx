import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import RewardCard from '../../components/PointShop/RewardCard';

// Derive the prop types directly from the component
type Props = React.ComponentProps<typeof RewardCard>;
type RewardType = Props['reward'];

describe('RewardCard', () => {
  it('renders without crashing', () => {
    // Cast an empty object to the required Reward type
    const dummyReward = {} as RewardType;

    render(<RewardCard reward={dummyReward} onRedeem={() => {}} disabled={false} />);
  });
});
