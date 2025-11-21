import type { Metadata } from "next"

import { AnonymousChatSelector } from "@/components/MilitarySupport/anonymous-chat-selector"

export const metadata: Metadata = {
  title: "Anonymous Military Chat Rooms | Military Support",
  description:
    "Connect anonymously with fellow service members in peer support chat rooms.",
}

export default function MilitaryChatPage() {
  return <AnonymousChatSelector />
}
