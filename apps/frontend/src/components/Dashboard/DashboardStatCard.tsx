"use client"

import React from "react"

export interface DashboardStatCardProps {
  title: string
  value: string | number
  /** Optional icon as React node (e.g., emoji or SVG) */
  icon?: React.ReactNode
  /** Background color for the icon container */
  color?: string
}

/**
 * DashboardStatCard displays a key metric with an optional icon.
 */
const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon,
  color = "#3b82f6", // Default to blue-500
}) => (
  <dl className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
    {icon && (
      <dt>
        <div
          role="img"
          aria-label={`${title} icon`}
          className="flex size-12 items-center justify-center rounded-lg text-xl text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </dt>
    )}
    <div>
      <dt className="text-sm font-medium text-gray-500">{title}</dt>
      <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
    </div>
  </dl>
)

export default DashboardStatCard
