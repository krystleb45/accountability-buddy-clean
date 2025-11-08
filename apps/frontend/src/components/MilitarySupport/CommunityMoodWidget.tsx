"use client"

import { Heart, RefreshCw, TrendingUp, Users } from "lucide-react"
import React, { useEffect, useState } from "react"

import type {
  CommunityMoodData,
  MoodTrend,
} from "@/api/military-support/moodCheckInApi"

import { moodCheckInApi } from "@/api/military-support/moodCheckInApi"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

interface Props {
  className?: string
}

/**
 * Determines the most common mood emoji based on mood distribution data
 */
function getMostCommonMoodEmoji(moodDistribution: {
  mood1: number
  mood2: number
  mood3: number
  mood4: number
  mood5: number
}): string {
  const maxCount = Math.max(
    moodDistribution.mood1,
    moodDistribution.mood2,
    moodDistribution.mood3,
    moodDistribution.mood4,
    moodDistribution.mood5,
  )

  if (maxCount === moodDistribution.mood5) return "😄"
  if (maxCount === moodDistribution.mood4) return "😊"
  if (maxCount === moodDistribution.mood3) return "😐"
  if (maxCount === moodDistribution.mood2) return "😕"
  return "😞"
}

function getMoodEmoji(averageMood: number): string {
  if (averageMood >= 4.5) return "😄"
  if (averageMood >= 3.5) return "😊"
  if (averageMood >= 2.5) return "😐"
  if (averageMood >= 1.5) return "😕"
  return "😞"
}

function getMoodColor(averageMood: number): string {
  if (averageMood >= 4.5) {
    return "text-primary"
  }
  if (averageMood >= 3.5) {
    return "text-accent"
  }
  if (averageMood >= 2.5) {
    return "text-chart-3"
  }
  if (averageMood >= 1.5) {
    return "text-orange-600"
  }
  return "text-destructive"
}

function getBackgroundColor(averageMood: number): string {
  if (averageMood >= 4.5) {
    return "bg-primary/10 border-primary"
  }
  if (averageMood >= 3.5) {
    return "bg-accent/10 border-accent"
  }
  if (averageMood >= 2.5) {
    return "bg-chart-3/10 border-chart-3"
  }
  if (averageMood >= 1.5) {
    return "bg-orange-25 border-orange-200"
  }
  return "bg-destructive/10 border-destructive"
}
export default function CommunityMoodWidget({ className = "" }: Props) {
  const [moodData, setMoodData] = useState<CommunityMoodData | null>(null)
  const [trends, setTrends] = useState<MoodTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(() => new Date())

  const loadMoodData = async () => {
    try {
      setError(null)

      const [communityData, trendsData] = await Promise.all([
        moodCheckInApi.getCommunityMoodData(),
        moodCheckInApi.getMoodTrends(7),
      ])

      setMoodData(communityData)
      setTrends(trendsData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("Failed to load mood data:", err)
      setError("Unable to load community mood data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMoodData()

    // Refresh data every 5 minutes
    const interval = setInterval(loadMoodData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div
        className={`
          rounded-lg border-2 border-gray-200 bg-white p-6
          ${className}
        `}
      >
        <div className="animate-pulse">
          <div className="mb-4 flex items-center space-x-3">
            <div className="size-6 rounded bg-gray-300"></div>
            <div className="h-5 w-32 rounded bg-gray-300"></div>
          </div>
          <div className="mb-2 h-12 w-24 rounded bg-gray-300"></div>
          <div className="h-4 w-full rounded bg-gray-300"></div>
        </div>
      </div>
    )
  }

  if (error || !moodData) {
    return (
      <div
        className={`
          rounded-lg border-2 border-gray-200 bg-gray-50 p-6
          ${className}
        `}
      >
        <div className="text-center">
          <p className="mb-3 text-gray-500">
            {error || "No mood data available"}
          </p>
          <Button
            onClick={loadMoodData}
            className={`
              mx-auto flex items-center space-x-1 text-sm text-blue-600
              hover:text-blue-700
            `}
          >
            <RefreshCw className="size-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    )
  }

  const averageMood = moodData.averageMood
  const recentTrend =
    trends.length >= 2
      ? (trends[trends.length - 1]?.averageMood || 0) -
        (trends[trends.length - 2]?.averageMood || 0)
      : 0

  return (
    <Card
      className={`
        ${getBackgroundColor(averageMood)}
        ${className}
      `}
    >
      {/* Header */}
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Heart className={cn("size-6", getMoodColor(averageMood))} />
          <CardTitle>Community Pulse</CardTitle>
        </div>

        <CardAction>
          <Button
            onClick={loadMoodData}
            variant="outline"
            title="Refresh data"
            size="sm"
          >
            <RefreshCw className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      {/* Main Mood Display */}
      <CardContent className="flex flex-col gap-6 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-4xl">{getMoodEmoji(averageMood)}</span>
          <div className="text-left">
            <div
              className={`
                text-xl font-bold
                ${getMoodColor(averageMood)}
              `}
            >
              {averageMood.toFixed(1)} / 5
            </div>
            <div className="text-sm">
              {recentTrend > 0 && (
                <span className="flex items-center text-primary">
                  <TrendingUp className="mr-1 size-3" />
                  Improving
                </span>
              )}
              {recentTrend < 0 && (
                <span className="text-destructive">Trending down</span>
              )}
              {recentTrend === 0 && <span>Stable</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <Card
            className={cn(
              "gap-2",
              getBackgroundColor(averageMood),
              `border-foreground/25`,
            )}
          >
            <CardHeader>
              <CardTitle className="flex flex-row items-center gap-2">
                <Users className="size-4" strokeWidth={3} />
                <span className="text-sm">Check-ins</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {moodData.totalCheckIns}{" "}
              <span className="text-sm font-normal">today</span>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "gap-2",
              getBackgroundColor(averageMood),
              `border-foreground/25`,
            )}
          >
            <CardHeader>
              <CardTitle className="text-sm">Most Common Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {getMostCommonMoodEmoji(moodData.moodDistribution)}
            </CardContent>
          </Card>
        </div>

        {/* Mood Distribution Bar */}
        {moodData.totalCheckIns > 0 && (
          <div className="mb-4">
            <div className="mb-2 text-xs text-gray-600">Mood distribution</div>
            <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
              {Object.entries(moodData.moodDistribution).map(
                ([moodKey, count], index) => {
                  const percentage = (count / moodData.totalCheckIns) * 100
                  const colors = [
                    "bg-red-400",
                    "bg-orange-400",
                    "bg-yellow-400",
                    "bg-green-400",
                    "bg-emerald-400",
                  ]

                  return percentage > 0 ? (
                    <div
                      key={moodKey}
                      className={`
                        ${colors[index]}
                        transition-all duration-500
                      `}
                      style={{ width: `${percentage}%` }}
                      title={`${count} people feeling ${["struggling", "tough day", "getting by", "doing well", "great"][index]}`}
                    />
                  ) : null
                },
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Last Updated */}
      <CardFooter className="text-xs text-muted-foreground">
        Updated{" "}
        {lastRefresh.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </CardFooter>
    </Card>
  )
}
