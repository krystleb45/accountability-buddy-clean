import React, { useState, useEffect, useRef, useCallback } from 'react';
('use client');

import { useChat } from '@/context/ChatContext';
import ChatBubble from '@/components/chat/ChatBubble';

interface ChatComponentProps {
  chatId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ chatId }) => {
  const { messages, send } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Retrieve messages for this chatId
  const chatMessages = messages[chatId] || [];

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = useCallback(() => {
    const text = newMessage.trim();
    if (!text) return;
    send(chatId, text);
    setNewMessage('');
  }, [chatId, newMessage, send]);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-black p-4 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-[#4CBB17]">Chat</h2>

      {/* Message List */}
      <div className="mb-4 flex-1 overflow-y-auto rounded-lg bg-gray-900 p-3">
        {chatMessages.length > 0 ? (
          chatMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isSender={msg.senderName === 'You'}
              avatarUrl={msg.avatarUrl ?? '/default-avatar.png'}
              timestamp={new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="rounded-lg bg-[#4CBB17] p-2 text-black transition hover:bg-green-400 disabled:opacity-50"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
