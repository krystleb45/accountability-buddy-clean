import type { Metadata } from "next"

import GoalClient from "./page.client"

export const metadata: Metadata = {
  title: "Goal Overview • Accountability Buddy",
  description: "Manage your goals effectively and stay on track.",
}

export default async function GoalsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <GoalClient id={id} />
}
