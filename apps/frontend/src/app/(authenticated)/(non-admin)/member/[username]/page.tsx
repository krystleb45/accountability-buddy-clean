import type { Metadata } from "next"

import { MemberPageClient } from "./page.client"

export const metadata: Metadata = {
  title: "Member Profile | Accountability Buddy",
  description: "View and interact with member profiles on Accountability Buddy",
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const username = await params.then((p) => p.username)

  return <MemberPageClient username={username} />
}
