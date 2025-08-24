"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export interface DashboardStatCardProps {
  title: string
  value: string | number
  /** Optional icon as React node (e.g., Lucide, emoji or SVG) */
  icon?: React.ReactNode
}

/**
 * DashboardStatCard displays a key metric with an optional icon.
 */
const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="mt-auto">
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={`
              shrink-0 text-primary
              [&_svg:not([class*='size-'])]:size-8
            `}
          >
            {icon}
          </div>
        )}
        <p className="text-4xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
)

export default DashboardStatCard
