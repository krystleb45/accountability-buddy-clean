import React from 'react';
('use client');

import { FaCog, FaUsers } from 'react-icons/fa';

interface ChatRoomHeaderProps {
  title?: string;
  participantCount?: number;
  onSettingsClick?: () => void;
}

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({
  title = 'Chat Room',
  participantCount,
  onSettingsClick,
}) => (
  <header className="flex items-center justify-between rounded-t-2xl bg-gray-900 px-4 py-3 text-white shadow-md">
    {/* Title & Count */}
    <div className="flex items-center space-x-2">
      <h1 className="text-xl font-bold text-[#4CBB17]">{title}</h1>
      {participantCount != null && (
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <FaUsers />
          <span>
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>

    {/* Settings Button */}
    {onSettingsClick && (
      <button
        onClick={onSettingsClick}
        className="p-2 text-gray-400 transition hover:text-[#4CBB17]"
        aria-label="Chat Settings"
      >
        <FaCog size={20} />
      </button>
    )}
  </header>
);

export default ChatRoomHeader;
