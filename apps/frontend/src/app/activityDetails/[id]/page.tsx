// src/app/activity/[id]/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import type { Activity as APIActivity } from "@/api/activity/activity-api"

import { fetchActivityById } from "@/api/activity/activity-api"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface Props {
  params: { id: string }
}

// 1) metadata still runs on server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params
  let activity: APIActivity | null = null
  try {
    activity = await fetchActivityById(id)
  } catch {}
  if (!activity) {
    return {
      title: "Activity Not Found • Accountability Buddy",
      description: "The activity you’re looking for could not be found.",
    }
  }
  const desc =
    activity.description ?? "Check out this activity on Accountability Buddy."
  return {
    title: `${activity.title} • Accountability Buddy`,
    description: desc,
    openGraph: {
      title: activity.title,
      description: desc,
      url: `https://your-domain.com/activity/${activity._id}`,
      type: "article",
      images: [{ url: "https://your-domain.com/og-default-activity.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: activity.title,
      description: desc,
      images: ["https://your-domain.com/twitter-default-activity.png"],
    },
  }
}

// 2) dynamically import the client component
const ClientActivityDetail = dynamic(() => import("./client"))

// 3) server component to guard auth & render client
export default async function ServerActivityDetail({
  params,
}: Props): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <ClientActivityDetail id={params.id} />
}
