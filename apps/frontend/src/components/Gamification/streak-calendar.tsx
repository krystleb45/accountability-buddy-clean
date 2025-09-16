"use client"

import type { ReactCalendarHeatmapValue } from "react-calendar-heatmap"

import { addDays, format, isSameDay, subDays } from "date-fns"
import { Check } from "lucide-react"
import React from "react"
import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface StreakCalendarProps {
  completionDates: string[]
}

const DAYS_TO_SHOW_BEFORE = 180
const DAYS_TO_SHOW_AFTER = 7

export function StreakCalendar({ completionDates }: StreakCalendarProps) {
  const today = new Date()
  const startDate = subDays(today, DAYS_TO_SHOW_BEFORE - 1)
  const endDate = addDays(today, DAYS_TO_SHOW_AFTER)

  const values: ReactCalendarHeatmapValue<string>[] = Array.from(
    { length: DAYS_TO_SHOW_BEFORE },
    (_, i) => {
      const dateKey = format(
        subDays(today, DAYS_TO_SHOW_BEFORE - 1 - i),
        "yyyy-MM-dd",
      )
      return {
        date: dateKey,
        count: completionDates.some((d) => isSameDay(d, dateKey)) ? 1 : 0,
      }
    },
  ).concat(
    ...Array.from({ length: DAYS_TO_SHOW_AFTER }, (_, i) => {
      const dateKey = format(addDays(today, i), "yyyy-MM-dd")
      return {
        date: dateKey,
        count: completionDates.some((d) => isSameDay(d, dateKey)) ? 1 : 0,
      }
    }),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Streak Calendar{" "}
          <small className="text-muted-foreground">(Last 180 days)</small>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`
          [&_.react-calendar-heatmap_rect:hover]:!stroke-accent
          [&_.react-calendar-heatmap-month-label]:!fill-muted-foreground
          [&_.react-calendar-heatmap-month-label]:!text-[0.5rem]
          [&_.react-calendar-heatmap-weekday-label]:!fill-muted-foreground
          [&_.react-calendar-heatmap-weekday-label]:!text-[0.5rem]
        `}
      >
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          classForValue={(value): string => {
            const filled = "fill-primary"
            const empty = "fill-muted"
            return value && value.count > 0 ? filled : empty
          }}
          showWeekdayLabels
          gutterSize={2}
          transformDayElement={(element, value, index) => {
            const tooltipContent = value?.date ? (
              <div>
                <p>{format(new Date(value.date), "MMM d, yyyy")}</p>
                <span className="mt-1 flex items-center gap-1 font-bold">
                  {value.count ? (
                    <>
                      <Check className="size-4 text-primary" /> Checked in
                    </>
                  ) : (
                    "No activity"
                  )}
                </span>
              </div>
            ) : (
              ""
            )
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* @ts-expect-error -- element is SVGElement */}
                    {element}
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className={`
                      z-50 rounded bg-popover px-2 py-1 text-xs
                      text-popover-foreground shadow
                    `}
                  >
                    {tooltipContent}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }}
        />
      </CardContent>
    </Card>
  )
}
