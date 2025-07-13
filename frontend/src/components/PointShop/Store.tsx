// src/components/PointShop/Store.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Reward } from '../../types/Rewards.types'; // Now uses `id`
import { fetchRewards } from '../../api/reward/rewardApi';
import RewardCard from './RewardCard';

const Store: React.FC = (): JSX.Element => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchRewards();
        // Assume API now returns objects shaped to our `Reward` type:
        // { id, title, pointsRequired, imageUrl?, description? }
        setRewards(data);
      } catch (err) {
        console.error('Error fetching rewards:', err);
        setError('Failed to load rewards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Stub redeem handler
  const handleRedeem = (rewardId: string, cost: number): void => {
    console.log(`Redeeming reward ${rewardId} for ${cost} points`);
    // TODO: call your redeem API and update UI accordingly
  };

  return (
    <section className="store-container" aria-labelledby="store-heading">
      <h2 id="store-heading">Store</h2>

      {loading ? (
        <p>Loading available rewards...</p>
      ) : error ? (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      ) : rewards.length === 0 ? (
        <p>No rewards available at the moment.</p>
      ) : (
        <div className="rewards-list grid gap-4">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onRedeem={() => handleRedeem(reward.id, reward.pointsRequired)}
              disabled={false}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Store;
