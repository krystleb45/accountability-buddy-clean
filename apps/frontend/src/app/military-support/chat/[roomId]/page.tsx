import type { Metadata } from "next"

import { ROOM_DETAILS, VALID_ROOMS } from "@ab/shared/military-chat-rooms"
import { notFound } from "next/navigation"

import MilitaryChatRoom from "../../../../components/MilitarySupport/MilitaryChatRoom"

interface PageProps {
  params: Promise<{
    roomId: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { roomId } = await params
  const room = ROOM_DETAILS[roomId as keyof typeof ROOM_DETAILS]

  if (!room) {
    return { title: "Room Not Found" }
  }

  return {
    title: `${room.name} Chat | Military Support`,
    description: `Anonymous chat room: ${room.description}`,
  }
}

export default async function ChatRoomPage({ params }: PageProps) {
  const { roomId } = await params
  if (!VALID_ROOMS.includes(roomId as (typeof VALID_ROOMS)[number])) {
    notFound()
  }

  const room = ROOM_DETAILS[roomId as keyof typeof ROOM_DETAILS]

  return <MilitaryChatRoom roomId={roomId} roomDetails={room} />
}
