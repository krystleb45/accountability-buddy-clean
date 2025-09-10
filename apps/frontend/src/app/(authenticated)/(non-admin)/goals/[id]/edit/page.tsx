import React from "react"

import { GoalEditClient } from "./page.client"

async function GoalEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <GoalEditClient id={id} />
}

export default GoalEditPage
