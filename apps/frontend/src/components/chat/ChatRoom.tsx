"use client"
import React, { useEffect, useRef, useState } from "react"
import { FaPause, FaPlay } from "react-icons/fa"

import ChatBubble from "@/components/chat/ChatBubble"
import { useChat } from "@/context/ChatContext"
import socket from "@/utils/socket"

import ChatBox from "./ChatBox"

interface ChatRoomProps {
  chatId: string
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatId }) => {
  const { user, messages, send } = useChat()
  const [currentMessage, setCurrentMessage] = useState("")
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Join/leave room
  useEffect(() => {
    if (chatId) socket.emit("joinRoom", chatId)
    return () => {
      if (chatId) socket.emit("leaveRoom", chatId)
    }
  }, [chatId])

  const detectMentions = (text: string): string[] =>
    Array.from(text.matchAll(/@(\w+)/g), (m) => m[1] || "")

  const highlightMentions = (text: string): React.ReactNode[] => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, idx) =>
      part.startsWith("@") ? (
        <span key={idx} className="font-bold text-blue-400">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      ),
    )
  }

  const handleSend = (): void => {
    const text = currentMessage.trim()
    if (!text) return
    const mentioned = detectMentions(text)
    send(chatId, text)
    if (mentioned.length)
      socket.emit("mentionNotification", { chatId, mentionedUsers: mentioned })
    setCurrentMessage("")
  }

  const toggleAudio = (src: string): void => {
    if (playingAudio === src) {
      audioRef.current?.pause()
      setPlayingAudio(null)
    } else {
      audioRef.current?.pause()
      const newAudio = new Audio(src)
      audioRef.current = newAudio
      setPlayingAudio(src)
      newAudio.play()
      newAudio.onended = () => setPlayingAudio(null)
    }
  }

  const renderFile = (url: string): React.ReactNode => {
    if (/\.(?:jpe?g|png|gif)$/i.test(url)) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt="file" className="size-32 rounded-lg" />
    }
    if (/\.(?:mp4|webm)$/i.test(url)) {
      return (
        <video controls className="w-32 rounded-lg">
          <source src={url} type="video/mp4" />
          <track kind="captions" src="" default />
          Your browser does not support the video tag.
        </video>
      )
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline"
      >
        Download File
      </a>
    )
  }

  const chatMessages = messages[chatId] || []

  return (
    <div className="flex h-full flex-col rounded-2xl bg-black p-4 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-[#4CBB17]">Chat Room</h2>

      <div className="mb-3 flex-1 overflow-y-auto rounded-lg bg-gray-900 p-2">
        {chatMessages.length > 0 ? (
          chatMessages.map((msg) => {
            const content = String(msg.content)
            const isAudio = content.endsWith(".webm")
            const isFile = /^https?:\/\//.test(content)
            return (
              <ChatBubble
                key={msg.id}
                message={
                  isAudio ? (
                    <button
                      onClick={() => toggleAudio(content)}
                      className={`
                        rounded-full p-2
                        ${
                          playingAudio === content
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }
                        text-white
                      `}
                    >
                      {playingAudio === content ? <FaPause /> : <FaPlay />}
                    </button>
                  ) : isFile ? (
                    renderFile(content)
                  ) : (
                    highlightMentions(content)
                  )
                }
                isSender={msg.senderId === user?.id}
                avatarUrl={msg.avatarUrl || "/default-avatar.png"}
                timestamp={new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            )
          })
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
      </div>

      <ChatBox
        chatId={chatId}
        onSendMessage={handleSend}
        placeholder="Type your message..."
      />
    </div>
  )
}

export default ChatRoom
