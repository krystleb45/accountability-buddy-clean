import classNames from "classnames"
import React from "react"

export interface ChatBubbleProps {
  message: React.ReactNode
  isSender?: boolean
  avatarUrl?: string
  timestamp?: string
  showAvatar?: boolean
  className?: string
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSender = false,
  avatarUrl,
  timestamp,
  showAvatar = true,
  className,
}) => (
  <div
    className={classNames(
      "mb-4 flex items-end space-x-2",
      { "flex-row-reverse justify-end": isSender },
      className,
    )}
  >
    {showAvatar && avatarUrl && (
      <img
        src={avatarUrl}
        alt="avatar"
        className="size-8 rounded-full border-2 border-[#4CBB17] object-cover"
      />
    )}
    <div
      className={classNames(
        "relative max-w-xs rounded-2xl px-4 py-2 text-base",
        {
          "rounded-br-none bg-[#4CBB17] text-black": isSender,
          "rounded-bl-none bg-gray-800 text-white": !isSender,
        },
      )}
    >
      {message}
      {timestamp && (
        <span
          className={`
            absolute right-2 bottom-0 text-xs text-gray-300 opacity-75
          `}
        >
          {timestamp}
        </span>
      )}
    </div>
  </div>
)

export default ChatBubble
