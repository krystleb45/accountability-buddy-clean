"use client"

import { Goal } from "lucide-react"

import { GoalForm } from "@/components/goals/goal-form"

export default function GoalCreationClient() {
  return (
    <main>
      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <Goal className="text-primary" size={28} /> Add New Goal
      </h1>

      <GoalForm />
    </main>
  )
}
