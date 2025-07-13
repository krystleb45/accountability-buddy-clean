// MESSAGING SYSTEM - All features included
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Enhanced message interface - FIXED for exactOptionalPropertyTypes
interface AdvancedMessage {
  _id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  updatedAt?: string | undefined;
  isEdited?: boolean | undefined;
  readBy?: Array<{
    userId: string;
    readAt: string;
  }> | undefined;
  reactions?: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }> | undefined;
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name: string;
    size: number;
  }> | undefined;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  } | undefined;
}

interface ConversationThread {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
  }>;
  group?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: AdvancedMessage;
  unreadCount: number;
  messageType: 'private' | 'group';
  createdAt: string;
  updatedAt: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    _id: string;
    name: string;
    role: 'admin' | 'member';
  }>;
  avatar?: string;
}

export default function AdvancedMessagesClient(): JSX.Element {
  console.log('🚀 MESSAGES COMPONENT RENDERING');

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const friendId = searchParams.get('friendId');
  const groupId = searchParams.get('groupId');

  // Enhanced state
  const [messages, setMessages] = useState<AdvancedMessage[]>([]);
  const [conversationThreads, setConversationThreads] = useState<ConversationThread[]>([]);
  const [showingThreads, setShowingThreads] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [friendName, setFriendName] = useState('Friend');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<AdvancedMessage[]>([]);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState<AdvancedMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [typingUsers] = useState<string[]>([]); // Removed setTypingUsers since it's not used

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common emojis for reactions
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];

  // Load initial data
  useEffect(() => {
    if (friendId) {
      loadFriendName();
      setShowingThreads(false);
    } else if (groupId) {
      loadGroupInfo();
      setShowingThreads(false);
    } else {
      setShowingThreads(true);
    }
    loadMessages();
  }, [friendId, groupId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  }, [searchQuery, messages]);

  const loadFriendName = async () => {
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        const friends = data?.data?.friends || data?.friends || data || [];
        const friend = friends.find((f: any) => f._id === friendId);
        if (friend) {
          setFriendName(friend.username || friend.name || 'Friend');
        }
      }
    } catch (error) {
      console.error('Failed to load friend name:', error);
    }
  };

  const loadGroupInfo = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentGroup(data.data || data);
      }
    } catch (error) {
      console.error('Failed to load group info:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // Build endpoint with parameters
      let endpoint = '/api/messages';
      const params = new URLSearchParams();

      if (friendId && friendId !== 'null') {
        params.append('recipientId', friendId);
        setShowingThreads(false);
      }

      if (groupId && groupId !== 'null') {
        params.append('groupId', groupId);
        setShowingThreads(false);
      }

      // Add query string if there are parameters
      if (params.toString()) {
        endpoint += '?' + params.toString();
      } else {
        setShowingThreads(true);
      }

      console.log('📨 Loading messages from:', endpoint);

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();

        // Check if we got threads (no specific chat selected) or messages
        if (data?.data?.threads) {
          // We got conversation threads
          console.log('📨 Got conversation threads:', data.data.threads);
          setConversationThreads(data.data.threads);
          setMessages([]);
          setShowingThreads(true);
        } else {
          // We got actual messages
          const msgs = data?.data?.messages || data?.messages || data || [];
          setMessages(msgs);
          setConversationThreads([]);
          setShowingThreads(false);
        }
      } else {
        console.error('Failed to load messages:', response.status, response.statusText);
        setMessages([]);
        setConversationThreads([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
      setConversationThreads([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!messageInput.trim() && !selectedFiles) || sendingMessage) return;

    setSendingMessage(true);

    try {
      const formData = new FormData();
      formData.append('content', messageInput.trim());
      formData.append('messageType', (groupId && groupId !== 'null') ? 'group' : 'private');

      // Fix: Only append if values exist and aren't 'null' string
      if (friendId && friendId !== 'null') {
        formData.append('recipientId', friendId);
      }

      if (groupId && groupId !== 'null') {
        formData.append('groupId', groupId);
      }

      if (replyingTo) {
        formData.append('replyTo', JSON.stringify({
          messageId: replyingTo._id,
          content: replyingTo.content.substring(0, 50) + '...',
          senderName: replyingTo.senderName
        }));
      }

      // Add files - Check if file exists before appending
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          if (file) {
            formData.append('files', file);
          }
        }
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newMessage = result.data || result;

        // Create proper attachments array or undefined
        const attachments = selectedFiles ? Array.from(selectedFiles)
          .filter(file => file)
          .map(file => ({
            type: file.type.startsWith('image/') ? 'image' as const :
                  file.type.startsWith('video/') ? 'video' as const : 'file' as const,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size
          })) : undefined;

        // Add message to display
        const displayMessage: AdvancedMessage = {
          _id: newMessage._id || Date.now().toString(),
          content: messageInput.trim(),
          senderId: session?.user?.id || 'me',
          senderName: session?.user?.name || 'You',
          createdAt: new Date().toISOString(),
          attachments,
          replyTo: replyingTo ? {
            messageId: replyingTo._id,
            content: replyingTo.content.substring(0, 50) + '...',
            senderName: replyingTo.senderName
          } : undefined
        };

        setMessages(prev => [...prev, displayMessage]);
        setMessageInput('');
        setSelectedFiles(null);
        setReplyingTo(null);

        // Mark as read for sender
        markAsRead(displayMessage._id);

      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId
            ? { ...msg, content: newContent, isEdited: true, updatedAt: new Date().toISOString() }
            : msg
        ));
        setEditingMessage(null);
        setEditText('');
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? updatedMessage.data : msg
        ));
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setShowEmojiPicker(null);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDisplayName = () => {
    if (showingThreads) return 'Conversations';
    if (currentGroup) return currentGroup.name;
    return friendName;
  };

  const getSubtitle = () => {
    if (showingThreads) {
      const totalUnread = conversationThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);
      return `${conversationThreads.length} conversations • ${totalUnread} unread`;
    }
    if (currentGroup) {
      return `${currentGroup.members.length} members`;
    }
    return `Private message • ${messages.length} messages`;
  };

  const getTotalUnreadCount = () => {
    return conversationThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Enhanced Sidebar */}
        <div className="w-1/3 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <Link href="/community" className="inline-flex items-center text-green-400 hover:text-green-300 mb-4">
              ← Back to Community
            </Link>
            <h1 className="text-2xl font-bold text-green-400">💬 Messages</h1>
            <p className="text-sm text-gray-400 mt-2">
              💬 {showingThreads ? 'All Conversations' : `Chatting with ${getDisplayName()}`}
            </p>

            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              🔍 Search Messages
            </button>
          </div>

          {/* Search Panel */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-700 p-4"
              >
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
                />

                {filteredMessages.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <p className="text-xs text-gray-400 mb-2">Found {filteredMessages.length} messages:</p>
                    {filteredMessages.map(msg => (
                      <div key={msg._id} className="text-xs p-2 bg-gray-800 rounded mb-1">
                        <span className="text-green-400">{msg.senderName}:</span> {msg.content.substring(0, 50)}...
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 p-4">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-4">💬</div>
              <p>Chat Features</p>
              <p className="text-xs mt-2">
                {showingThreads ?
                  `Conversations: ${conversationThreads.length} • Unread: ${getTotalUnreadCount()}` :
                  `Messages: ${messages.length}`
                }
              </p>
              {currentGroup && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-green-400">Group Members:</p>
                  {currentGroup.members.map(member => (
                    <div key={member._id} className="text-xs mt-1">
                      {member.name} {member.role === 'admin' && '👑'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Feature Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 text-center font-bold">
            💬 Edit • Delete • React • Search • Files • Groups 📎
          </div>

          {/* Enhanced Chat Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {getDisplayName()[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h2 className="font-bold text-white">{getDisplayName()}</h2>
                  <p className="text-sm text-gray-400">{getSubtitle()}</p>
                  {typingUsers.length > 0 && (
                    <p className="text-xs text-green-400">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex space-x-2">
                {!showingThreads && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    📎 Files
                  </button>
                )}
                {currentGroup && (
                  <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm">
                    👥 Members
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Messages Area */}
          <div
            className={`flex-1 bg-gray-800 p-4 overflow-y-auto ${isDragging ? 'bg-gray-700 border-2 border-dashed border-green-400' : ''}`}
            style={{ height: 'calc(100vh - 240px)' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="text-center text-green-400 mb-4">
                <div className="text-4xl mb-2">📁</div>
                <p>Drop files here to upload</p>
              </div>
            )}

            {/* Show conversation threads when no specific chat is selected */}
            {showingThreads ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-green-400 mb-4">💬 Your Conversations</h3>

                {conversationThreads.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-xl font-bold mb-2 text-green-400">No conversations yet</h3>
                    <p>Start a conversation by visiting your friends or groups</p>
                    <div className="space-y-2 mt-4">
                      <Link
                        href="/community"
                        className="inline-block bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition mr-2"
                      >
                        Browse Community
                      </Link>
                      <Link
                        href="/friends"
                        className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
                      >
                        View Friends
                      </Link>
                    </div>
                  </div>
                ) : (
                  conversationThreads.map((thread, index) => (
                    <motion.div
                      key={thread._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer"
                      onClick={() => {
                        // Navigate to specific conversation
                        if (thread.messageType === 'private' && thread.participants.length > 0) {
                          const recipientId = thread.participants[0]?._id;
                          if (recipientId) {
                            router.push(`/messages?friendId=${recipientId}`);
                          }
                        } else if (thread.messageType === 'group' && thread.group) {
                          router.push(`/messages?groupId=${thread.group._id}`);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {thread.messageType === 'group' ?
                              (thread.group?.name || 'G')[0]?.toUpperCase() || 'G' :
                              (thread.participants[0]?.name || 'U')[0]?.toUpperCase() || 'U'
                            }
                          </div>

                          {/* Conversation info */}
                          <div className="flex-1">
                            <h4 className="font-bold text-white">
                              {thread.messageType === 'group' ?
                                thread.group?.name || 'Group Chat' :
                                thread.participants[0]?.name || 'Unknown User'
                              }
                            </h4>

                            {/* Last message preview */}
                            {thread.lastMessage && (
                              <p className="text-sm text-gray-400 truncate">
                                {thread.lastMessage.content || 'No message content'}
                              </p>
                            )}

                            {/* Timestamp */}
                            {thread.lastMessage && (
                              <p className="text-xs text-gray-500">
                                {new Date(thread.lastMessage.createdAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Unread count */}
                        {thread.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {thread.unreadCount}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              /* Regular messages display when a specific chat is selected */
              <>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-xl font-bold mb-2 text-green-400">Start your conversation!</h3>
                    <p>Send a message to {getDisplayName()}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${message._id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                          message.senderId === session?.user?.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className="bg-gray-600 p-2 rounded mb-2 text-xs">
                              <p className="text-gray-300">Replying to {message.replyTo.senderName}:</p>
                              <p className="text-gray-200">{message.replyTo.content}</p>
                            </div>
                          )}

                          {/* Message Content */}
                          {editingMessage === message._id ? (
                            <div>
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="bg-gray-800 text-white p-1 rounded w-full"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditMessage(message._id, editText);
                                  }
                                }}
                                autoFocus
                              />
                              <div className="mt-1 space-x-2">
                                <button
                                  onClick={() => handleEditMessage(message._id, editText)}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingMessage(null)}
                                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{message.content}</p>

                              {/* Attachments */}
                              {message.attachments && message.attachments.map((attachment, i) => (
                                <div key={i} className="mt-2">
                                  {attachment.type === 'image' ? (
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="max-w-full h-auto rounded cursor-pointer"
                                      onClick={() => window.open(attachment.url, '_blank')}
                                    />
                                  ) : (
                                    <div className="bg-gray-600 p-2 rounded flex items-center space-x-2">
                                      <span>📎</span>
                                      <div className="flex-1">
                                        <p className="text-sm">{attachment.name}</p>
                                        <p className="text-xs text-gray-300">{formatFileSize(attachment.size)}</p>
                                      </div>
                                      <button
                                        onClick={() => window.open(attachment.url, '_blank')}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          )}

                          {/* Message Footer */}
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {message.isEdited && ' (edited)'}
                            </p>

                            {/* Read Receipts */}
                            {message.readBy && message.readBy.length > 0 && (
                              <div className="text-xs opacity-70">
                                ✓✓ {message.readBy.length}
                              </div>
                            )}
                          </div>

                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex space-x-1 mt-2">
                              {message.reactions.map((reaction, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleReaction(message._id, reaction.emoji)}
                                  className="text-xs bg-gray-600 hover:bg-gray-500 px-1 py-0.5 rounded"
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Message Actions (hover) */}
                          {message.senderId === session?.user?.id && (
                            <div className="absolute -top-8 right-0 hidden group-hover:flex space-x-1 bg-gray-800 rounded p-1">
                              <button
                                onClick={() => {
                                  setEditingMessage(message._id);
                                  setEditText(message.content);
                                }}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-400"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-400"
                              >
                                🗑️
                              </button>
                            </div>
                          )}

                          {/* Universal Actions */}
                          <div className="absolute -top-8 left-0 hidden group-hover:flex space-x-1 bg-gray-800 rounded p-1">
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-500"
                            >
                              ↩️
                            </button>
                            <button
                              onClick={() => setShowEmojiPicker(message._id)}
                              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-500"
                            >
                              😀
                            </button>
                          </div>

                          {/* Emoji Picker */}
                          {showEmojiPicker === message._id && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded p-2 flex space-x-1 z-10">
                              {commonEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message._id, emoji)}
                                  className="hover:bg-gray-700 p-1 rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Enhanced Message Input - Only show when not viewing threads */}
          {!showingThreads && (
            <div className="bg-gray-900 border-t border-gray-700 p-4">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-2 bg-gray-800 p-2 rounded flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-gray-400">Replying to {replyingTo.senderName}:</p>
                    <p className="text-white">{replyingTo.content.substring(0, 50)}...</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* File Preview */}
              {selectedFiles && (
                <div className="mb-2 bg-gray-800 p-2 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Selected files:</span>
                    <button
                      onClick={() => setSelectedFiles(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  {Array.from(selectedFiles).map((file, i) => (
                    <div key={i} className="text-xs text-gray-300 mb-1">
                      📎 {file.name} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`💬 Message ${getDisplayName()}...`}
                  disabled={sendingMessage}
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border-2 border-green-400 focus:border-green-300 focus:outline-none disabled:opacity-50"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg transition"
                >
                  📎
                </button>

                <button
                  type="submit"
                  disabled={(!messageInput.trim() && !selectedFiles) || sendingMessage}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition font-bold"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </form>

              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-2">
                Session: {session?.user?.name || 'Loading...'} |
                {friendId ? ` Friend: ${friendId}` : ` Group: ${groupId}`} |
                Messages: {messages.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
