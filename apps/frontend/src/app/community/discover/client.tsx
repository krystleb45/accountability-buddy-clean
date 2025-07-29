// src/app/community/discover/client.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUserPlus, FaSearch, FaUsers, FaTimes, FaCheck } from 'react-icons/fa';
import type { FollowUser } from '../../../api/friends/friendApi';
import {
  fetchFriendSuggestions,
  sendFriendRequest,
} from '../../../api/friends/friendApi';

interface EnhancedFollowUser extends Omit<FollowUser, 'username' | '_id'> {
  username: string;
  _id: any; // Keep this as any since it could be ObjectId or string
  category?: string;
  interests?: string[];
  mutualFriends?: number;
  bio?: string;
}

type CategoryType = 'all' | 'fitness' | 'study' | 'career';

const DiscoverClient: React.FC = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string;

  const [suggestions, setSuggestions] = useState<EnhancedFollowUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Replace the fetchSuggestions useEffect in your client.tsx
  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      setLoading(false);
      return undefined; // Explicitly return undefined
    }

    const fetchSuggestions = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching friend suggestions for user:', userId);

        // Call your existing friendApi function
        const suggestionsData = await fetchFriendSuggestions(userId);

        console.log('📊 Raw suggestions data:', suggestionsData);
        console.log('📊 Data type:', typeof suggestionsData);
        console.log('📊 Is array:', Array.isArray(suggestionsData));
        console.log('📊 Data length:', suggestionsData?.length);

        // Transform the data to ensure we have the right structure
        const transformedSuggestions: EnhancedFollowUser[] = (suggestionsData || []).map((user: any, index: number) => {
          console.log(`🔄 Transforming user ${index}:`, user);

          const transformed = {
            ...user,
            username: String(user.username || user.name || 'user'),
            _id: user._id || user.id,
            id: user.id || user._id,
            // Add default values for enhanced properties
            category: user.category || 'general',
            interests: user.interests || [],
            mutualFriends: user.mutualFriends || 0,
            bio: user.bio || `Hello! I'm ${user.name || user.username || 'a user'} looking to connect with others.`,
          };

          console.log(`✅ Transformed user ${index}:`, transformed);
          return transformed;
        });

        console.log('✅ Final transformed suggestions:', transformedSuggestions);
        console.log('✅ Setting suggestions with count:', transformedSuggestions.length);

        setSuggestions(transformedSuggestions);

        if (!transformedSuggestions || transformedSuggestions.length === 0) {
          console.log('ℹ️ No friend suggestions returned from API');
          setError('No friend suggestions available at the moment.');
        }
      } catch (err) {
        console.error('❌ Failed to fetch friend suggestions:', err);
        setError('Failed to load friend suggestions. Please try again later.');
        setSuggestions([]); // Clear suggestions on error
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    return undefined; // Explicitly return undefined
  }, [status, userId]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicitly return undefined when no cleanup needed
  }, [successMessage]);

  const handleSendRequest = async (recipientId: string) => {
    if (!userId || sendingRequests.has(recipientId)) return;

    const person = suggestions.find(p => p.id === recipientId);
    console.log('📤 Sending friend request with data:', {
      userId,
      recipientId,
      userIdType: typeof userId,
      recipientIdType: typeof recipientId
    });

    setSendingRequests(prev => new Set(prev).add(recipientId));
    setError(null); // Clear any previous errors

    try {
      const success = await sendFriendRequest(userId, recipientId);
      console.log('📤 Friend request result:', success);

      if (success) {
        // Remove from suggestions after successful request
        setSuggestions(prev => prev.filter(s => s.id !== recipientId));
        setSuccessMessage(`Friend request sent to ${person?.name || 'user'}! 🎉`);
        console.log('✅ Friend request sent successfully');
      } else {
        console.log('❌ Friend request failed');
        setError('Failed to send friend request. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error sending friend request:', err);
      setError('Failed to send friend request. Please check your connection and try again.');
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipientId);
        return newSet;
      });
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: '🔍', count: suggestions.length },
    { id: 'fitness', label: 'Fitness', icon: '⚡', count: suggestions.filter(s => s.category === 'fitness').length },
    { id: 'study', label: 'Study', icon: '📚', count: suggestions.filter(s => s.category === 'study').length },
    { id: 'career', label: 'Career', icon: '💼', count: suggestions.filter(s => s.category === 'career').length },
  ];

  // Apply filters
  const filteredSuggestions = suggestions.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.interests?.some(interest =>
                           interest.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Finding awesome people for you...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to discover new friends.</p>
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
            href="/friends"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Friends
          </Link>

          <h1 className="text-4xl font-bold text-white flex items-center mb-2">
            <FaSearch className="mr-3 text-green-400" />
            Discover New Friends
          </h1>
          <p className="text-xl text-gray-300">
            Find accountability partners who share your goals and interests
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-600 text-white p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center">
                <FaCheck className="mr-2" />
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-200 hover:text-white"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for people, interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id as CategoryType)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCategory === category.id
                  ? 'bg-green-600 border-green-400 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-400'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-semibold mb-1">{category.label}</h3>
              <p className="text-sm opacity-80">{category.count} people</p>
            </motion.button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* People Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-6">
            {selectedCategory === 'all' ? 'All Suggestions' : categories.find(c => c.id === selectedCategory)?.label + ' Enthusiasts'} ({filteredSuggestions.length})
          </h2>

          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-6xl text-gray-600 mb-4" />
              <p className="text-xl text-gray-400 mb-2">
                {suggestions.length === 0 ?
                  (error ? "Unable to load suggestions" : "No suggestions available") :
                  "No people match your search"
                }
              </p>
              <p className="text-gray-500">
                {suggestions.length === 0
                  ? (error ? "Please check your connection and try refreshing the page." : "Check back later for new suggestions!")
                  : "Try a different search term or category"
                }
              </p>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition"
                >
                  Refresh Page
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuggestions.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredUser(person.id)}
                  onHoverEnd={() => setHoveredUser(null)}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-400 transition-all duration-200 relative"
                >
                  <div className="text-center">
                    <img
                      src={person.profilePicture || '/default-avatar.png'}
                      alt={person.name}
                      className="h-16 w-16 rounded-full object-cover mx-auto mb-4 border-2 border-gray-600"
                    />
                    <h3 className="font-semibold text-white mb-1">{person.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">@{person.username}</p>

                    {/* Mutual Friends */}
                    {person.mutualFriends !== undefined && person.mutualFriends > 0 && (
                      <p className="text-xs text-blue-400 mb-3">
                        {person.mutualFriends} mutual friend{person.mutualFriends !== 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Interest Tags */}
                    {person.interests && person.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3 justify-center">
                        {person.interests.slice(0, 2).map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-600 text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {person.interests.length > 2 && (
                          <span className="px-2 py-1 bg-gray-600 text-xs rounded-full">
                            +{person.interests.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleSendRequest(person.id)}
                      disabled={sendingRequests.has(person.id)}
                      className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition ${
                        sendingRequests.has(person.id)
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500'
                      }`}
                    >
                      <FaUserPlus className="mr-2" />
                      {sendingRequests.has(person.id) ? 'Sending...' : 'Add Friend'}
                    </button>
                  </div>

                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredUser === person.id && person.bio && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 border border-gray-600 rounded-lg p-3 max-w-xs z-10 shadow-xl"
                      >
                        <div className="text-sm text-gray-300">{person.bio}</div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-green-400 mb-4">Tips for Building Your Network</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">✨ Be Active</h4>
              <p>Regularly update your goals and progress to attract like-minded people.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🎯 Share Goals</h4>
              <p>Make some of your goals public to connect with people who share similar interests.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">💬 Engage</h4>
              <p>Join group conversations and support others in their journeys.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">🤝 Be Supportive</h4>
              <p>Offer encouragement and celebrate others' achievements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverClient;
