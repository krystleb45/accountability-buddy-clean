"use client"

import type {
  ReactCalendarHeatmapValue,
  TooltipDataAttrs,
} from "react-calendar-heatmap"

import { format, subDays } from "date-fns"
import React from "react"
import "react-calendar-heatmap/dist/styles.css"
import CalendarHeatmap from "react-calendar-heatmap"

import styles from "./StreakCalendar.module.css"

interface StreakCalendarProps {
  completionDates?: string[]
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  completionDates = [],
}) => {
  const daysToShow = 180
  const endDate = new Date()
  const startDate = subDays(endDate, daysToShow - 1)
  const datesSet = new Set(completionDates)

  const values: ReactCalendarHeatmapValue<string>[] = Array.from(
    { length: daysToShow },
    (_, i) => {
      const dateKey = format(subDays(endDate, daysToShow - 1 - i), "yyyy-MM-dd")
      return {
        date: dateKey,
        count: datesSet.has(dateKey) ? 1 : 0,
      }
    },
  )

  return (
    <section className={styles.container} aria-label="Streak Calendar">
      <h3 className="mb-2 text-lg font-semibold">🔥 Streak Calendar</h3>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(value): string => {
          // non-null assert so TS knows this is always a string
          const filled = styles.colorFilled!
          const empty = styles.colorEmpty!
          return value && value.count > 0 ? filled : empty
        }}
        tooltipDataAttrs={(value) => {
          const content = value?.date
            ? `${format(new Date(value.date), "MMM d, yyyy")} – ${
                value.count ? "✅ Completed" : "No activity"
              }`
            : ""
          return { "data-tip": content } as TooltipDataAttrs
        }}
        showWeekdayLabels
      />
    </section>
  )
}

export default StreakCalendar
