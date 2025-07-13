import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import RedemptionModal from '../../components/PointShop/RedemptionModal';

// Extract the props type for RedemptionModal
type Props = React.ComponentProps<typeof RedemptionModal>;
type RewardType = Props['reward'];
type RedeemArgs = Parameters<Props['onRedeem']>;

describe('RedemptionModal', () => {
  it('renders without crashing', () => {
    // Cast an empty object to RewardType to satisfy the required prop
    const dummyReward = {} as RewardType;

    render(
      <RedemptionModal
        reward={dummyReward}
        isOpen={false}
        onClose={() => {}}
        onRedeem={(_rewardId: RedeemArgs[0], _pointsRequired: RedeemArgs[1]) => {}}
      />,
    );
  });
});
