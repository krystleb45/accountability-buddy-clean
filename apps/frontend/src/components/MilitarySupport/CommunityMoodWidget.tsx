// src/components/MilitarySupport/CommunityMoodWidget.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { moodCheckInApi, type CommunityMoodData, type MoodTrend } from '@/api/military-support/moodCheckInApi';

interface Props {
  className?: string;
}

export default function CommunityMoodWidget({ className = '' }: Props) {
  const [moodData, setMoodData] = useState<CommunityMoodData | null>(null);
  const [trends, setTrends] = useState<MoodTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadMoodData();

    // Refresh data every 5 minutes
    const interval = setInterval(loadMoodData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadMoodData = async () => {
    try {
      setError(null);

      const [communityData, trendsData] = await Promise.all([
        moodCheckInApi.getCommunityMoodData(),
        moodCheckInApi.getMoodTrends(7)
      ]);

      setMoodData(communityData);
      setTrends(trendsData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load mood data:', err);
      setError('Unable to load community mood data');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (averageMood: number): string => {
    if (averageMood >= 4.5) return '😄';
    if (averageMood >= 3.5) return '😊';
    if (averageMood >= 2.5) return '😐';
    if (averageMood >= 1.5) return '😕';
    return '😞';
  };

  const getMoodColor = (averageMood: number): string => {
    if (averageMood >= 4.5) return 'text-emerald-600';
    if (averageMood >= 3.5) return 'text-green-600';
    if (averageMood >= 2.5) return 'text-yellow-600';
    if (averageMood >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBackgroundColor = (averageMood: number): string => {
    if (averageMood >= 4.5) return 'bg-emerald-50 border-emerald-200';
    if (averageMood >= 3.5) return 'bg-green-50 border-green-200';
    if (averageMood >= 2.5) return 'bg-yellow-50 border-yellow-200';
    if (averageMood >= 1.5) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-5 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="h-12 w-24 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !moodData) {
    return (
      <div className={`bg-gray-50 rounded-lg border-2 border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 mb-3">{error || 'No mood data available'}</p>
          <button
            onClick={loadMoodData}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const averageMood = moodData.averageMood;
  const recentTrend = trends.length >= 2
    ? (trends[trends.length - 1]?.averageMood || 0) - (trends[trends.length - 2]?.averageMood || 0)
    : 0;

  return (
    <div className={`bg-white rounded-lg border-2 ${getBackgroundColor(averageMood)} ${className}`}>
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Community Pulse</h3>
          </div>

          <button
            onClick={loadMoodData}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Mood Display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-4xl">{getMoodEmoji(averageMood)}</span>
            <div className="text-left">
              <div className={`text-2xl font-bold ${getMoodColor(averageMood)}`}>
                {averageMood.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-600">
                {recentTrend > 0 && (
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Improving
                  </span>
                )}
                {recentTrend < 0 && (
                  <span className="text-orange-600">Trending down</span>
                )}
                {recentTrend === 0 && (
                  <span className="text-gray-500">Stable</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 font-medium mb-1">
            {moodData.encouragementMessage}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Check-ins</span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {moodData.totalCheckIns}
            </div>
            <div className="text-xs text-gray-500">today</div>
          </div>

          <div className="text-center p-3 bg-white bg-opacity-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Most common</div>
            <div className="text-xl font-bold text-gray-800">
              {(() => {
                const maxCount = Math.max(
                  moodData.moodDistribution.mood1,
                  moodData.moodDistribution.mood2,
                  moodData.moodDistribution.mood3,
                  moodData.moodDistribution.mood4,
                  moodData.moodDistribution.mood5
                );

                if (maxCount === moodData.moodDistribution.mood5) return '😄';
                if (maxCount === moodData.moodDistribution.mood4) return '😊';
                if (maxCount === moodData.moodDistribution.mood3) return '😐';
                if (maxCount === moodData.moodDistribution.mood2) return '😕';
                return '😞';
              })()}
            </div>
            <div className="text-xs text-gray-500">mood</div>
          </div>
        </div>

        {/* Mood Distribution Bar */}
        {moodData.totalCheckIns > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-2">Mood distribution</div>
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
              {Object.entries(moodData.moodDistribution).map(([moodKey, count], index) => {
                const percentage = (count / moodData.totalCheckIns) * 100;
                const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-400'];

                return percentage > 0 ? (
                  <div
                    key={moodKey}
                    className={`${colors[index]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                    title={`${count} people feeling ${['struggling', 'tough day', 'getting by', 'doing well', 'great'][index]}`}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Updated {lastRefresh.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}
