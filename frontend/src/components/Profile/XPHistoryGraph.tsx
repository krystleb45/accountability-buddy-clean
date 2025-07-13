// src/components/Profile/XPHistoryGraph.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import GamificationService from '@/services/gamificationService';

interface RawXPRecord {
  date: string;
  xp: number;
}

interface XPEntry {
  date: string;
  points: number;
}

const XPHistoryGraph: React.FC = (): JSX.Element => {
  const [xpHistory, setXpHistory] = useState<XPEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchXPHistory = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('User not authenticated.');
          setXpHistory([]);
          return;
        }

        // Expect fetchXPHistory to return RawXPRecord[]
        const data: RawXPRecord[] = await GamificationService.fetchXPHistory(userId);

        const formatted: XPEntry[] = data.map(({ date, xp }) => ({
          date: new Date(date).toLocaleDateString(),
          points: xp,
        }));

        setXpHistory(formatted);
      } catch (err) {
        console.error('❌ Failed to fetch XP history:', err);
        setError('Failed to load XP history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchXPHistory();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400">Loading XP history...</p>;
  }
  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }
  if (xpHistory.length === 0) {
    return <p className="text-center text-gray-500">No XP history available.</p>;
  }

  return (
    <div className="h-72 w-full rounded-xl bg-gray-900 p-4 shadow-lg">
      <h2 className="mb-2 text-xl font-semibold text-green-400">XP Progress Over Time</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={xpHistory} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip
            contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
            labelStyle={{ color: '#0f0' }}
          />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#4ade80"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default XPHistoryGraph;
