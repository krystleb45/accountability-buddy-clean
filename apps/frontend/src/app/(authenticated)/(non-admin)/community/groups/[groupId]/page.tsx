import type { Metadata } from "next"

import GroupDetailClient from "./client"

export const metadata: Metadata = {
  title: "Group Details - Accountability Buddy",
  description: "View details and discussions in the group",
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  return <GroupDetailClient groupId={groupId} />
}
