//src/app/community/client.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchCommunityStats, fetchRecentMessages, fetchOnlineFriends, type CommunityStats, type RecentMessage, type OnlineFriend } from '../../api/community/communityApi';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  count?: number;
  color: string;
}

export default function CommunityClient() {
  const { status } = useSession();
  const [stats, setStats] = useState<CommunityStats>({
    totalFriends: 0,
    activeGroups: 0,
    unreadMessages: 0,
    onlineFriends: 0,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load community data
  useEffect(() => {
    async function loadCommunityData() {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        console.log('🔄 Loading community data...');

        // Load all data in parallel
        const [statsData, messagesData, friendsData] = await Promise.allSettled([
          fetchCommunityStats(),
          fetchRecentMessages(5),
          fetchOnlineFriends(5)
        ]);

        // Process stats
        if (statsData.status === 'fulfilled') {
          setStats(statsData.value);
        } else {
          console.error('Failed to load stats:', statsData.reason);
        }

        // Process recent messages
        if (messagesData.status === 'fulfilled') {
          setRecentMessages(messagesData.value);
        } else {
          console.error('Failed to load recent messages:', messagesData.reason);
        }

        // Process online friends
        if (friendsData.status === 'fulfilled') {
          setOnlineFriends(friendsData.value);
        } else {
          console.error('Failed to load online friends:', friendsData.reason);
        }

        console.log('✅ Community data loaded successfully');

      } catch (error) {
        console.error('❌ Failed to load community data:', error);
        setError('Failed to load community data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData();
  }, [status]);

  const quickActions: QuickAction[] = [
    {
      title: 'Friends',
      description: 'Connect with accountability partners',
      icon: '👥',
      href: '/friends',
      count: stats.totalFriends,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Groups',
      description: 'Join goal-focused communities',
      icon: '🎯',
      href: '/community/groups',
      count: stats.activeGroups,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Messages',
      description: 'Chat with friends and groups',
      icon: '💬',
      href: '/messages',
      count: stats.unreadMessages,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'Find People',
      description: 'Discover new accountability buddies',
      icon: '🔍',
      href: '/community/discover',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="mx-auto max-w-6xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access the community.</p>
          <Link
            href="/login"
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            🤝 Community Hub
          </h1>
          <p className="text-xl text-gray-300">
            Connect, collaborate, and stay accountable together
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-red-200 hover:text-white underline"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.totalFriends}</div>
            <div className="text-sm text-gray-400">Friends</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.activeGroups}</div>
            <div className="text-sm text-gray-400">Active Groups</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.unreadMessages}</div>
            <div className="text-sm text-gray-400">Unread Messages</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.onlineFriends}</div>
            <div className="text-sm text-gray-400">Online Now</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={action.href}>
                <div className={`${action.color} rounded-lg p-6 text-center shadow-lg transition-all duration-200 hover:shadow-xl`}>
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90 mb-3">{action.description}</p>
                  {action.count !== undefined && (
                    <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-medium">
                      {action.count} {action.count === 1 ? action.title.slice(0, -1) : action.title}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              💬 Recent Messages
              {stats.unreadMessages > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.unreadMessages}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {message.senderAvatar ? (
                        <img src={message.senderAvatar} alt={message.senderName} className="w-8 h-8 rounded-full" />
                      ) : (
                        (message.senderName || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {message.isGroup ? message.groupName : message.senderName}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {message.content}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No recent messages</p>
                  <p className="text-sm">Start chatting with friends!</p>
                </div>
              )}
            </div>
            <Link
              href="/messages"
              className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm"
            >
              View All Messages →
            </Link>
          </motion.div>

          {/* Online Friends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              🟢 Online Friends
            </h3>
            <div className="space-y-3">
              {onlineFriends.length > 0 ? (
                onlineFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="relative">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.name || 'Friend'} className="w-8 h-8 rounded-full" />
                        ) : (
                          (friend.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-700"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{friend.name || 'Unknown User'}</div>
                      <div className="text-xs text-gray-400">{friend.status || 'Online'}</div>
                    </div>
                    <button className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full">
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No friends online</p>
                  <p className="text-sm">Invite friends to join!</p>
                </div>
              )}
            </div>
            <Link
              href="/friends"
              className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm"
            >
              View All Friends →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
