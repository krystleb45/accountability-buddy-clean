// src/app/military-support/chat/[roomId]/page.tsx

import type { Metadata } from "next"

import { notFound } from "next/navigation"

import MilitaryChatRoom from "../../../../components/MilitarySupport/MilitaryChatRoom"

const VALID_ROOMS = ["veterans-support", "active-duty", "family-members"]

const ROOM_DETAILS = {
  "veterans-support": {
    name: "Veterans Support",
    description: "Connect with fellow veterans",
    icon: "🎖️",
  },
  "active-duty": {
    name: "Active Duty",
    description: "Support for currently serving personnel",
    icon: "⚡",
  },
  "family-members": {
    name: "Family Members",
    description: "Support for military families",
    icon: "👥",
  },
}

interface PageProps {
  params: {
    roomId: string
  }
}

export function generateMetadata({ params }: PageProps): Metadata {
  const room = ROOM_DETAILS[params.roomId as keyof typeof ROOM_DETAILS]

  if (!room) {
    return { title: "Room Not Found" }
  }

  return {
    title: `${room.name} Chat | Military Support`,
    description: `Anonymous chat room: ${room.description}`,
  }
}

export default function ChatRoomPage({ params }: PageProps) {
  if (!VALID_ROOMS.includes(params.roomId)) {
    notFound()
  }

  const room = ROOM_DETAILS[params.roomId as keyof typeof ROOM_DETAILS]

  return <MilitaryChatRoom roomId={params.roomId} roomDetails={room} />
}
