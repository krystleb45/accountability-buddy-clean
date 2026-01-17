"use client"

import type { ReactCalendarHeatmapValue } from "react-calendar-heatmap"

import { addDays, format, isSameDay, isToday, subDays } from "date-fns"
import { Check, Flame } from "lucide-react"
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak Calendar
          <span className="text-sm font-normal text-muted-foreground">
            (Last 180 days)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            [&_.react-calendar-heatmap]:overflow-x-auto
            [&_.react-calendar-heatmap_rect]:rounded-sm
            [&_.react-calendar-heatmap_rect]:transition-all
            [&_.react-calendar-heatmap_rect]:duration-150
            [&_.react-calendar-heatmap_rect:hover]:!stroke-foreground
            [&_.react-calendar-heatmap_rect:hover]:!stroke-[1.5px]
            [&_.react-calendar-heatmap-month-label]:!fill-muted-foreground
            [&_.react-calendar-heatmap-month-label]:!text-[0.6rem]
            [&_.react-calendar-heatmap-month-label]:!font-medium
            [&_.react-calendar-heatmap-weekday-label]:!fill-muted-foreground
            [&_.react-calendar-heatmap-weekday-label]:!text-[0.55rem]
          `}
        >
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={values}
            classForValue={(value): string => {
              // Check if this is today
              if (value?.date && isToday(new Date(value.date))) {
                return value.count > 0 
                  ? "fill-emerald-500 stroke-emerald-300 stroke-2" 
                  : "fill-muted stroke-primary stroke-2"
              }
              
              // Regular days
              if (value && value.count > 0) {
                return "fill-emerald-500/90 hover:fill-emerald-400"
              }
              return "fill-muted/50 hover:fill-muted"
            }}
            showWeekdayLabels
            gutterSize={3}
            transformDayElement={(element, value, index) => {
              const dateObj = value?.date ? new Date(value.date) : null
              const isTodayDate = dateObj ? isToday(dateObj) : false
              
              const tooltipContent = value?.date ? (
                <div className="text-center">
                  <p className="font-medium">
                    {format(new Date(value.date), "EEEE, MMM d, yyyy")}
                  </p>
                  <div className="mt-1.5 flex items-center justify-center gap-1.5">
                    {value.count ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Checked in!</span>
                      </>
                    ) : isTodayDate ? (
                      <span className="text-muted-foreground">Today - not checked in yet</span>
                    ) : (
                      <span className="text-muted-foreground">No activity</span>
                    )}
                  </div>
                </div>
              ) : null

              return (
                <TooltipProvider key={index}>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      {/* @ts-expect-error -- element is SVGElement */}
                      {element}
                    </TooltipTrigger>
                    {tooltipContent && (
                      <TooltipContent
                        sideOffset={5}
                        className="rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg border"
                      >
                        {tooltipContent}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )
            }}
          />
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-muted/50" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500/30" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500/60" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500/90" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
