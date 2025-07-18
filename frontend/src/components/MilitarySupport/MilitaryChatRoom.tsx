// src/components/MilitarySupport/MilitaryChatRoom.tsx - FIXED: Safe message mapping

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Users, AlertTriangle, Flag, Loader2, Wifi, WifiOff } from 'lucide-react';
import { anonymousMilitaryChatApi, type AnonymousMessage, type AnonymousUser } from '@/api/military-support/anonymousMilitaryChatApi';
import { io, Socket } from 'socket.io-client';

interface RoomDetails {
  name: string;
  description: string;
  icon: string;
}

interface Props {
  roomId: string;
  roomDetails: RoomDetails;
}

export default function MilitaryChatRoom({ roomId, roomDetails }: Props) {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [crisisResources, setCrisisResources] = useState<any | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        console.log('Disconnecting socket on unmount');
        socket.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsConnecting(true);

      console.log('Initializing chat for room:', roomId);

      // Generate anonymous user
      const user = anonymousMilitaryChatApi.generateAnonymousUser();
      console.log('Generated anonymous user:', user);
      setAnonymousUser(user);

      // Try to load existing messages (non-blocking)
      try {
        const existingMessages = await anonymousMilitaryChatApi.getAnonymousMessages(roomId);
        console.log('Loaded existing messages:', existingMessages.length);
        // Ensure we have an array
        setMessages(Array.isArray(existingMessages) ? existingMessages : []);
      } catch (msgError) {
        console.warn('Could not load existing messages:', msgError);
        // Continue without existing messages
        setMessages([]);
      }

      // Try to join room (non-blocking)
      try {
        const joinResult = await anonymousMilitaryChatApi.joinAnonymousRoom(roomId, user);
        if (joinResult) {
          console.log('Joined room, member count:', joinResult.memberCount);
          setMemberCount(joinResult.memberCount);
        }
      } catch (joinError) {
        console.warn('Could not join room via API:', joinError);
        // Continue to WebSocket connection
      }

      // Setup WebSocket connection
      await setupWebSocket(user);

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to connect to chat. Please try again.');
      setIsConnecting(false);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = async (user: AnonymousUser) => {
    try {
      // Determine backend URL
      const getBackendUrl = () => {
        if (process.env.NODE_ENV === 'production') {
          return process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin.replace(':3000', ':5050');
        }
        return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      };

      const backendUrl = getBackendUrl();
      console.log('Connecting to WebSocket at:', backendUrl);

      const newSocket = io(`${backendUrl}/anonymous-military-chat`, {
        auth: {
          sessionId: user.sessionId,
          displayName: user.displayName
        },
        timeout: 10000,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 2000,
      });

      // Debug connection
      console.log('🔍 Attempting to connect to:', `${backendUrl}/anonymous-military-chat`);
      console.log('🔍 With auth:', { sessionId: user.sessionId, displayName: user.displayName });

      // Connection events
      newSocket.on('connect', () => {
        console.log('✅ Connected to anonymous military chat');
        console.log('✅ Socket ID:', newSocket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        setReconnectAttempts(0);

        // Join the specific room
        newSocket.emit('join-room', {
          room: roomId,
          sessionId: user.sessionId,
          displayName: user.displayName
        });

        // Only add welcome message if we don't have existing messages to prevent duplicates
        setMessages(prev => {
          // Ensure prev is an array
          const prevMessages = Array.isArray(prev) ? prev : [];

          // Check if we already have a welcome message (safely handle undefined ids)
          const hasWelcome = prevMessages.some(msg => msg.id && msg.id.toString().startsWith('welcome-'));
          if (hasWelcome) {
            return prevMessages; // Don't add another welcome
          }

          const welcomeMessage: AnonymousMessage = {
            id: 'welcome-' + Date.now(),
            displayName: 'System',
            message: `Welcome to ${roomDetails.name}! You're chatting as "${user.displayName}". Remember, this is peer support - for crisis help, call 988.`,
            timestamp: new Date()
          };
          return [...prevMessages, welcomeMessage];
        });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from anonymous military chat:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          setIsConnecting(true);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        console.error('🔥 Full error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setReconnectAttempts(prev => prev + 1);

        if (reconnectAttempts >= maxReconnectAttempts) {
          setError('Unable to connect to chat server. Please check your connection and try again.');
        } else {
          setError(`Connection failed. Retrying... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        }
      });

      // Message events
      newSocket.on('new-message', (message: any) => {
        console.log('📨 New message received:', message);
        setMessages(prev => {
          const prevMessages = Array.isArray(prev) ? prev : [];
          return [...prevMessages, {
            id: message.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            displayName: message.displayName,
            message: message.message,
            timestamp: new Date(message.timestamp),
            isFlagged: message.isFlagged || false
          }];
        });
      });

      // Debounce member count updates to prevent rapid UI changes
      let memberCountTimeout: NodeJS.Timeout;

      newSocket.on('member-count-updated', (data: { memberCount: number }) => {
        console.log('👥 Member count updated:', data.memberCount);

        // Clear previous timeout
        if (memberCountTimeout) {
          clearTimeout(memberCountTimeout);
        }

        // Debounce the update by 500ms
        memberCountTimeout = setTimeout(() => {
          setMemberCount(data.memberCount);
        }, 500);
      });

      newSocket.on('user-left', (data: { message: string, memberCount: number }) => {
        console.log('👋 User left:', data);
        setMemberCount(data.memberCount);
      });

      newSocket.on('crisis-resources', (data: any) => {
        console.log('🚨 Crisis resources triggered:', data);
        setCrisisResources(data);
        setTimeout(() => setCrisisResources(null), 15000); // Show for 15 seconds
      });

      newSocket.on('joined-successfully', (data: { memberCount: number }) => {
        console.log('✅ Successfully joined room:', data);
        setMemberCount(data.memberCount);
      });

      newSocket.on('error', (error: any) => {
        console.error('❌ Socket error:', error);
        setError(error.message || 'Connection error occurred');
        setTimeout(() => setError(null), 5000);
      });

      setSocket(newSocket);

    } catch (err) {
      console.error('Failed to setup WebSocket:', err);
      setError('Failed to establish real-time connection');
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !anonymousUser || !isConnected) {
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasUser: !!anonymousUser,
        isConnected
      });
      return;
    }

    const messageText = newMessage.trim();

    try {
      setNewMessage(''); // Clear immediately for better UX

      console.log('Sending message:', messageText);

      // Send via API - Socket.IO will handle adding to UI via 'new-message' event
      const result = await anonymousMilitaryChatApi.sendAnonymousMessage(roomId, messageText, anonymousUser);
      console.log('Message sent via API:', result);

      // No need to add message locally - Socket.IO broadcast will handle it

    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(messageText); // Restore message on error
      setError('Failed to send message. Please try again.');

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const leaveRoom = async () => {
    console.log('Leaving room...');

    if (anonymousUser) {
      try {
        await anonymousMilitaryChatApi.leaveAnonymousRoom(roomId, anonymousUser);
        console.log('Left room via API');
      } catch (err) {
        console.error('Failed to leave room properly:', err);
      }
    }

    if (socket) {
      socket.disconnect();
      console.log('Disconnected socket');
    }
  };

  const retryConnection = () => {
    setReconnectAttempts(0);
    setError(null);
    initializeChat();
  };

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveRoom();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      leaveRoom();
    };
  }, [anonymousUser, socket]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Connecting to {roomDetails.name}...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Error state (only if completely failed to connect)
  if (error && !socket && !isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-4">Connection Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={retryConnection}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/military-support/chat"
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back to Rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b-2 border-green-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/military-support/chat"
                onClick={leaveRoom}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="flex items-center space-x-3">
                <span className="text-2xl">{roomDetails.icon}</span>
                <div>
                  <h1 className="text-xl font-bold text-green-400">{roomDetails.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {memberCount} online
                    </div>
                    <div className="flex items-center">
                      {isConnected ? (
                        <>
                          <Wifi className="w-4 h-4 mr-1 text-green-400" />
                          <span className="text-green-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-4 h-4 mr-1 text-red-400" />
                          <span className="text-red-400">
                            {isConnecting ? 'Connecting...' : 'Disconnected'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection retry button */}
            {!isConnected && !isConnecting && (
              <button
                onClick={retryConnection}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600 text-white p-3 text-center text-sm">
          <div className="flex items-center justify-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Crisis Resources Alert */}
      {crisisResources && (
        <div className="bg-red-800 border-2 border-red-600 p-4 text-center">
          <p className="text-red-200">{crisisResources.message}</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6">
        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Loading state */}
            {loading && (
              <div className="text-center text-gray-500 py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p>Loading messages...</p>
              </div>
            )}

            {/* No messages state */}
            {!loading && safeMessages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}

            {/* Messages list - FIXED with safe array handling */}
            {!loading && safeMessages.length > 0 && safeMessages.map((message) => (
              <div
                key={message.id || `msg-${message.timestamp?.getTime() || Date.now()}-${Math.random()}`}
                className={`flex ${
                  message.displayName === anonymousUser?.displayName ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.displayName === 'System'
                    ? 'bg-blue-700 text-blue-100 mx-auto text-center'
                    : message.displayName === anonymousUser?.displayName
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-white'
                } ${message.isFlagged ? 'border-2 border-red-500' : ''}`}>
                  {message.displayName !== 'System' && (
                    <div className="text-xs opacity-75 mb-1">
                      {message.displayName}
                    </div>
                  )}
                  <div className="text-sm">{message.message}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {message.timestamp ? message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Now'}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t-2 border-gray-700 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                maxLength={500}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2 flex justify-between">
              <span>You're chatting as <strong>{anonymousUser?.displayName}</strong> • Press Enter to send</span>
              <button className="flex items-center hover:text-red-400 transition-colors">
                <Flag className="w-3 h-3 mr-1" />
                Report
              </button>
            </div>
          </div>
        </div>

        {/* Safety Reminder */}
        <div className="mt-6 bg-yellow-900 border-2 border-yellow-600 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-300 font-semibold mb-2">Remember:</p>
              <p className="text-yellow-100 leading-relaxed">
                This is peer support, not professional counseling. For crisis situations or thoughts of self-harm,
                please contact the Veterans Crisis Line at <strong>988 (Press 1)</strong> or emergency services at <strong>911</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
