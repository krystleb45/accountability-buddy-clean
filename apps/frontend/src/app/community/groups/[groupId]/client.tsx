// src/app/community/groups/[groupId]/client.tsx - CLEAN VERSION
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaUsers,
  FaComments,
  FaPaperPlane,
  FaCrown,
  FaCalendarAlt,
  FaLock,
  FaGlobe,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { http } from '@/utils';

interface Group {
  _id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  memberCount: number;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Member {
  _id: string;
  username: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function GroupDetailClient() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !groupId) {
      setLoading(false);
      return;
    }

    loadGroupData();
  }, [status, groupId]);

  // Auto-hide messages
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicitly return undefined when no cleanup needed
  }, [successMessage, error]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 [CLIENT] Loading group data for:', groupId);
      console.log('🔍 [CLIENT] Session data:', {
        user: session?.user?.email,
        hasAccessToken: !!(session?.user as any)?.accessToken,
        tokenPreview: (session?.user as any)?.accessToken?.substring(0, 20) + '...'
      });

      // Load all data in parallel
      const [groupResponse, membersResponse, messagesResponse] = await Promise.all([
        http.get(`/groups/${groupId}`).catch(err => {
          console.error(`❌ [CLIENT] Failed to load group data:`, err);
          throw new Error(`Failed to load group data: ${err.message}`);
        }),
        http.get(`/groups/${groupId}/members`).catch(err => {
          console.error(`❌ [CLIENT] Failed to load members data:`, err);
          return null;
        }),
        http.get(`/groups/${groupId}/messages`).catch(err => {
          console.error(`❌ [CLIENT] Failed to load messages data:`, err);
          return null;
        }),
      ]);


      // Handle group details
      const groupData = groupResponse.data;
      console.log('✅ [CLIENT] Group data loaded:', groupData);

      // Try different response formats
      const group = groupData.data || groupData.group || groupData;
      console.log('🔍 [CLIENT] Extracted group:', group);
      setGroup(group);


      // Handle members
      if (membersResponse) {
        const membersData = membersResponse.data;
        console.log('✅ [CLIENT] Members data loaded:', membersData);

        // Try different response formats
        const members = membersData.data || membersData.members || membersData || [];
        console.log('🔍 [CLIENT] Extracted members:', members);
        setMembers(Array.isArray(members) ? members : []);
      }


      if (messagesResponse) {
        // Handle messages
        const messagesData = messagesResponse.data;
        console.log('✅ [CLIENT] Messages data loaded:', messagesData);

        // Try different response formats
        const messages = messagesData.data || messagesData.messages || messagesData || [];
        console.log('🔍 [CLIENT] Extracted messages:', messages);
        setMessages(Array.isArray(messages) ? messages : []);
      }

    } catch (err: any) {
      console.error('💥 [CLIENT] Error loading group data:', err);
      setError(err.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sendingMessage) {
      return;
    }

    try {
      setSendingMessage(true);
      console.log('🚀 [CLIENT] Sending message:', newMessage);

      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim()
        }),
      });

      console.log('📥 [CLIENT] Send message response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to send message: ${response.status}`);
      }

      const messageData = await response.json();
      console.log('✅ [CLIENT] Message sent successfully:', messageData);

      // Add new message to the list
      const newMessageObj = messageData.data || messageData;
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');
      setSuccessMessage('Message sent! 📨');

    } catch (err: any) {
      console.error('💥 [CLIENT] Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to view group details.</p>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-lg">
          <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-4">Failed to load group details</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadGroupData}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/community/groups')}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/community/groups')}
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Groups
          </button>

          {group && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
                  <p className="text-gray-300 mb-4">{group.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <FaUsers className="mr-1" />
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      {group.privacy === 'private' ? <FaLock className="mr-1" /> : <FaGlobe className="mr-1" />}
                      {group.privacy}
                    </span>
                    <span className="flex items-center">
                      <FaCrown className="mr-1" />
                      {group.createdBy?.username || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages Section */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700 h-96 flex flex-col">
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-green-400 flex items-center">
                  <FaComments className="mr-2" />
                  Messages ({messages.length})
                </h2>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {message.sender?.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-white">{message.sender?.username || 'Unknown User'}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-200">{message.content}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition flex items-center"
                  >
                    <FaPaperPlane className={sendingMessage ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                <FaUsers className="mr-2" />
                Members ({members.length})
              </h2>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {members.length > 0 ? (
                  members.map((member) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 bg-gray-700 rounded"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {member.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{member.username || 'Unknown User'}</p>
                        <p className="text-xs text-gray-400">{member.role || 'Member'}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No members found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
