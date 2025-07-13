// src/app/community/groups/page.client.tsx - CLEAN VERSION
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaUsers,
  FaSearch,
  FaPlus,
  FaCrown,
  FaCalendarAlt,
  FaComments,
  FaUserCheck,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isPublic: boolean;
  isJoined: boolean;
  lastActivity: string;
  avatar?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

type CategoryType = 'all' | 'fitness' | 'study' | 'career' | 'lifestyle' | 'creative' | 'tech';

const GroupsClient: React.FC = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id as string;

  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<Set<string>>(new Set());

  // Load groups and my groups
  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      setLoading(false);
      return;
    }

    const fetchAllData = async (): Promise<void> => {
      setLoading(true);
      try {
        console.log('🚀 [CLIENT] Fetching all groups and my groups...');

        // Fetch all groups
        const [groupsResponse, myGroupsResponse] = await Promise.all([
          fetch('/api/groups', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('/api/groups/my-groups', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })
        ]);

        console.log('📥 [CLIENT] Groups API response status:', groupsResponse.status);
        console.log('📥 [CLIENT] My Groups API response status:', myGroupsResponse.status);

        // Handle all groups response
        let allGroupsData: Group[] = [];
        if (groupsResponse.ok) {
          const groupsResult = await groupsResponse.json();
          console.log('✅ [CLIENT] All groups API result:', groupsResult);
          allGroupsData = groupsResult.data || groupsResult || [];
        } else {
          console.warn('⚠️ [CLIENT] Failed to fetch all groups:', groupsResponse.status);
        }

        // Handle my groups response
        let myGroupsData: Group[] = [];
        if (myGroupsResponse.ok) {
          const myGroupsResult = await myGroupsResponse.json();
          console.log('✅ [CLIENT] My groups API result:', myGroupsResult);
          myGroupsData = myGroupsResult.data || myGroupsResult || [];
        } else {
          console.warn('⚠️ [CLIENT] Failed to fetch my groups:', myGroupsResponse.status);
        }

        // Mark which groups are joined
        const myGroupIds = new Set(myGroupsData.map(g => g.id));
        const enrichedGroups = allGroupsData.map(group => ({
          ...group,
          isJoined: myGroupIds.has(group.id)
        }));

        setGroups(enrichedGroups);
        setMyGroups(myGroupsData);

        console.log('📊 [CLIENT] Set groups state with', enrichedGroups.length, 'total groups');
        console.log('📊 [CLIENT] Set my groups state with', myGroupsData.length, 'joined groups');

      } catch (err) {
        console.error('💥 [CLIENT] Failed to fetch groups:', err);
        setError('Failed to load groups. Please try again.');
        setGroups([]);
        setMyGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [status, userId]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicitly return undefined when no cleanup needed
  }, [successMessage]);

  const handleJoinGroup = async (groupId: string) => {
    if (joinRequests.has(groupId)) return;

    const group = groups.find(g => g.id === groupId);
    setJoinRequests(prev => new Set(prev).add(groupId));

    try {
      console.log('🚀 [CLIENT] Joining group:', groupId);

      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 [CLIENT] Join response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to join group: ${response.status}`);
      }

      // Update both groups and myGroups state
      const updatedGroup = { ...group!, isJoined: true, memberCount: group!.memberCount + 1 };

      setGroups(prev => prev.map(g =>
        g.id === groupId ? updatedGroup : g
      ));

      setMyGroups(prev => [...prev, updatedGroup]);

      setSuccessMessage(`Successfully joined ${group?.name}! 🎉`);
      console.log('✅ [CLIENT] Successfully joined group');

    } catch (err: any) {
      console.error('💥 [CLIENT] Failed to join group:', err);
      setError(err.message || 'Failed to join group. Please try again.');
    } finally {
      setJoinRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);

    try {
      console.log('🚀 [CLIENT] Leaving group:', groupId);

      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 [CLIENT] Leave response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to leave group: ${response.status}`);
      }

      // Update both groups and myGroups state
      setGroups(prev => prev.map(g =>
        g.id === groupId
          ? { ...g, isJoined: false, memberCount: Math.max(g.memberCount - 1, 0) }
          : g
      ));

      setMyGroups(prev => prev.filter(g => g.id !== groupId));

      setSuccessMessage(`Left ${group?.name} successfully.`);
      console.log('✅ [CLIENT] Successfully left group');

    } catch (err: any) {
      console.error('💥 [CLIENT] Failed to leave group:', err);
      setError(err.message || 'Failed to leave group. Please try again.');
    }
  };

  // Map backend categories to frontend filter categories
  const mapCategoryForFilter = (backendCategory: string): CategoryType => {
    const categoryMap: { [key: string]: CategoryType } = {
      'Fitness & Health': 'fitness',
      'Learning & Education': 'study',
      'Career & Business': 'career',
      'Lifestyle & Hobbies': 'lifestyle',
      'Creative & Arts': 'creative',
      'Technology': 'tech'
    };
    return categoryMap[backendCategory] || 'all';
  };

  const categories = [
    { id: 'all', label: 'All Groups', icon: '🌟', count: groups.length },
    { id: 'fitness', label: 'Fitness', icon: '💪', count: groups.filter(g => mapCategoryForFilter(g.category) === 'fitness').length },
    { id: 'study', label: 'Learning', icon: '📚', count: groups.filter(g => mapCategoryForFilter(g.category) === 'study').length },
    { id: 'career', label: 'Career', icon: '💼', count: groups.filter(g => mapCategoryForFilter(g.category) === 'career').length },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🌱', count: groups.filter(g => mapCategoryForFilter(g.category) === 'lifestyle').length },
    { id: 'creative', label: 'Creative', icon: '🎨', count: groups.filter(g => mapCategoryForFilter(g.category) === 'creative').length },
    { id: 'tech', label: 'Technology', icon: '💻', count: groups.filter(g => mapCategoryForFilter(g.category) === 'tech').length },
  ];

  // Apply filters
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const groupFilterCategory = mapCategoryForFilter(group.category);
    const matchesCategory = selectedCategory === 'all' || groupFilterCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/friends"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Friends
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center mb-2">
                <FaUsers className="mr-3 text-green-400" />
                Groups
              </h1>
              <p className="text-xl text-gray-300">
                Join communities and connect with like-minded people
              </p>
            </div>

            <Link
              href="/community/groups/create"
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg flex items-center transition"
            >
              <FaPlus className="mr-2" />
              Create Group
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
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
              <button onClick={() => setSuccessMessage(null)} className="text-green-200 hover:text-white">
                <FaTimes />
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-600 text-white p-4 rounded-lg flex items-center justify-between"
            >
              {error}
              <button onClick={() => setError(null)} className="text-red-200 hover:text-white">
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Groups Section */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              My Groups ({myGroups.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{group.name}</h3>
                    <FaUserCheck className="text-green-400" />
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{group.memberCount} members</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/community/groups/${group.id}`}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-3 rounded text-center text-sm transition"
                    >
                      <FaComments className="inline mr-1" />
                      Chat
                    </Link>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded text-sm transition"
                    >
                      Leave
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups, interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-7 gap-4">
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
              <h3 className="font-semibold mb-1 text-sm">{category.label}</h3>
              <p className="text-xs opacity-80">{category.count} groups</p>
            </motion.button>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-6">
            {selectedCategory === 'all' ? 'All Groups' : categories.find(c => c.id === selectedCategory)?.label + ' Groups'} ({filteredGroups.length})
          </h2>

          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-6xl text-gray-600 mb-4" />
              <p className="text-xl text-gray-400 mb-2">
                {groups.length === 0 ? "No groups available" : "No groups match your search"}
              </p>
              <p className="text-gray-500">
                {groups.length === 0
                  ? "Be the first to create a group!"
                  : "Try a different search term or category"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-400 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        <FaUsers className="inline mr-1" />
                        {group.memberCount} members
                      </p>
                    </div>
                    {group.isJoined && <FaUserCheck className="text-green-400 mt-1" />}
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">{group.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Activity */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>
                      <FaCalendarAlt className="inline mr-1" />
                      Last active {group.lastActivity}
                    </span>
                    <span>
                      <FaCrown className="inline mr-1" />
                      {group.createdBy || 'Unknown'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {group.isJoined ? (
                      <>
                        <Link
                          href={`/community/groups/${group.id}`}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded text-center transition"
                        >
                          <FaComments className="inline mr-1" />
                          Open Chat
                        </Link>
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition"
                        >
                          Leave
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={joinRequests.has(group.id)}
                        className={`w-full py-2 px-4 rounded transition ${
                          joinRequests.has(group.id)
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500'
                        } text-white`}
                      >
                        {joinRequests.has(group.id) ? 'Joining...' : 'Join Group'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsClient;
