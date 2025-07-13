// src/app/chats/client.tsx
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { connectSocket } from '@/utils/socket';
import sendMessage from '@/utils/socket';

// — Types —
interface Friend {
  id: number;
  name: string;
  profilePic?: string;
}
interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
}

// — Parses `?friendId=` for us —
const SearchParamsHandler: React.FC<{
  setFriendIdFromURL: (id: string | null) => void;
}> = ({ setFriendIdFromURL }) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    setFriendIdFromURL(searchParams.get('friendId'));
  }, [searchParams, setFriendIdFromURL]);
  return null;
};

export default function ClientChat(): JSX.Element {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [friendIdFromURL, setFriendIdFromURL] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1) connect socket + fetch friends + listen for incoming messages
  useEffect(() => {
    connectSocket('your_auth_token_here');

    // Try one of these event names based on your ServerToClientEvents:
    // sendMessage.on('newMessage', (data) => { ... });
    // sendMessage.on('messageReceived', (data) => { ... });
    // sendMessage.on('chatMessage', (data) => { ... });

    // Comment out the listener until we know the correct event name
    /*
    sendMessage.on('message', (data: { sender: string; text: string; timestamp: string }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: data.sender,
          text: data.text,
          timestamp: data.timestamp,
        },
      ]);
    });
    */

    (async () => {
      try {
        const res = await fetch('/api/friends');
        if (!res.ok) throw new Error('Failed to fetch friends');
        const data: Friend[] = await res.json();
        setFriends(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();

    // Cleanup socket listeners on unmount
    return () => {
      // sendMessage.off('message');
    };
  }, []);

  // 2) if `?friendId=`, auto‐select that friend
  useEffect(() => {
    if (friendIdFromURL && friends.length) {
      const f = friends.find((f) => f.id.toString() === friendIdFromURL);
      if (f) setSelectedFriend(f);
    }
  }, [friendIdFromURL, friends]);

  // 3) fetch chat history when a friend is selected
  useEffect(() => {
    if (!selectedFriend) return;
    (async () => {
      try {
        const res = await fetch(`/api/chats/${selectedFriend.id}`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        setMessages(await res.json());
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedFriend]);

  // 4) scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (): void => {
    if (!selectedFriend || !newMessage.trim()) return;

    // Send via socket using the correct structure expected by your socket types
    sendMessage.emit('sendMessage', {
      chatId: selectedFriend.id.toString(),
      content: newMessage,
      senderId: 'current_user_id' // You'll need to get the actual user ID
      // messageType is handled by the backend, not needed in socket emission
    });

    setNewMessage('');
    setMessages((ms) => [
      ...ms,
      {
        id: ms.length + 1,
        sender: 'You',
        text: newMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <Suspense fallback={<p className="text-gray-400">Loading chat…</p>}>
      <SearchParamsHandler setFriendIdFromURL={setFriendIdFromURL} />

      <div className="flex min-h-screen bg-black p-8 text-white">
        {/* Friends List */}
        <div className="w-1/4 rounded-lg bg-gray-900 p-4 shadow-lg">
          <h2 className="mb-4 text-xl text-green-400">Your Friends</h2>
          {loading ? (
            <p className="text-gray-400">Loading friends…</p>
          ) : friends && friends.length > 0 ? (
            friends.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFriend(f)}
                className={`mb-2 block w-full rounded-lg p-3 text-left ${
                  selectedFriend?.id === f.id ? 'bg-green-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {f.name}
              </button>
            ))
          ) : (
            <p className="text-gray-400">No friends found</p>
          )}
        </div>

        {/* Chat Window */}
        <div className="ml-6 flex flex-1 flex-col rounded-lg bg-gray-800 p-6 shadow-lg">
          {selectedFriend ? (
            <>
              <h2 className="mb-4 text-2xl font-bold text-green-400">
                Chat with {selectedFriend.name}
              </h2>

              <div className="mb-4 flex-1 overflow-y-auto rounded-lg border border-gray-600 p-4">
                {messages.length === 0 ? (
                  <p className="text-gray-400">No messages yet.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-3 rounded-lg p-2 ${
                        m.sender === 'You' ? 'bg-gray-700 text-right' : 'bg-gray-700 text-left'
                      }`}
                    >
                      <span className="font-semibold text-green-400">{m.sender}:</span> {m.text}
                      <div className="text-xs text-gray-500">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex space-x-3">
                <input
                  className="flex-1 rounded-lg border border-gray-600 bg-black p-3 text-white"
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-xl text-gray-400">Select a friend to start chatting</p>
          )}
        </div>
      </div>
    </Suspense>
  );
}
