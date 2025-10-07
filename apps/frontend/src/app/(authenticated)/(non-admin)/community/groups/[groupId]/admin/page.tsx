import type { Metadata } from "next"

import { GroupAdminClient } from "./client"

export const metadata: Metadata = {
  title: "Group Admin - Accountability Buddy",
  description: "Administer your group settings and manage members.",
}

export default async function GroupAdminPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  return <GroupAdminClient groupId={groupId} />
}
