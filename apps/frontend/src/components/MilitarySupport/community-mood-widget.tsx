"use client"

import { useQuery } from "@tanstack/react-query"
import { Heart, RefreshCw, TrendingUp, Users } from "lucide-react"

import * as moodCheckInApi from "@/api/military-support/mood-check-in-api"
import { cn } from "@/lib/utils"

import { LoadingSpinner } from "../loading-spinner"
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

  if (maxCount === moodDistribution.mood5) {
    return "😄"
  }
  if (maxCount === moodDistribution.mood4) {
    return "😊"
  }
  if (maxCount === moodDistribution.mood3) {
    return "😐"
  }
  if (maxCount === moodDistribution.mood2) {
    return "😕"
  }
  return "😞"
}

function getMoodEmoji(averageMood: number): string {
  if (averageMood >= 4.5) {
    return "😄"
  }
  if (averageMood >= 3.5) {
    return "😊"
  }
  if (averageMood >= 2.5) {
    return "😐"
  }
  if (averageMood >= 1.5) {
    return "😕"
  }
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
    return "bg-primary/10"
  }
  if (averageMood >= 3.5) {
    return "bg-accent/10"
  }
  if (averageMood >= 2.5) {
    return "bg-chart-3/10"
  }
  if (averageMood >= 1.5) {
    return "bg-orange-500/10"
  }
  return "bg-destructive/10"
}

function getBorderColor(averageMood: number): string {
  if (averageMood >= 4.5) {
    return "border-primary"
  }
  if (averageMood >= 3.5) {
    return "border-accent"
  }
  if (averageMood >= 2.5) {
    return "border-chart-3"
  }
  if (averageMood >= 1.5) {
    return "border-orange-500"
  }
  return "border-destructive"
}

export function CommunityMoodWidget({ className = "" }: Props) {
  const {
    data: moodData,
    isPending: isMoodDataPending,
    error: moodDataError,
    isFetching: isMoodDataFetching,
    refetch: refetchMoodData,
    dataUpdatedAt: moodDataLastUpdated,
  } = useQuery({
    queryKey: ["military-support", "community-mood"],
    queryFn: moodCheckInApi.getCommunityMoodData,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  const {
    data: trends,
    isPending: isTrendsPending,
    isFetching: isTrendsFetching,
    refetch: refetchTrends,
    dataUpdatedAt: trendsLastUpdated,
  } = useQuery({
    queryKey: ["military-support", "mood-trends"],
    queryFn: () => moodCheckInApi.getMoodTrends(7),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  const loadMoodData = () => {
    refetchMoodData()
    refetchTrends()
  }

  const lastRefresh = new Date(
    Math.max(moodDataLastUpdated || 0, trendsLastUpdated || 0),
  )

  const loading = isMoodDataPending || isTrendsPending
  const fetching = isMoodDataFetching || isTrendsFetching

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="grid flex-1 place-items-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (moodDataError || !moodData) {
    return (
      <Card className={cn("justify-center", className)}>
        <CardContent className="text-center">
          <p className="mb-3 text-muted-foreground">
            {moodDataError.message || "No mood data available"}
          </p>
          <Button onClick={loadMoodData}>
            <RefreshCw />
            <span>Try Again</span>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const averageMood = moodData.averageMood
  const recentTrend =
    trends && trends.length >= 2
      ? (trends[trends.length - 1]?.averageMood || 0) -
        (trends[trends.length - 2]?.averageMood || 0)
      : 0

  return (
    <Card
      className={`
        ${getBackgroundColor(averageMood)}
        ${getBorderColor(averageMood)}
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
            disabled={fetching}
          >
            <RefreshCw
              className={cn({
                "animate-spin": fetching,
              })}
            />
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
            <div className="mb-2 text-xs text-muted-foreground">
              Mood distribution
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              {Object.entries(moodData.moodDistribution).map(
                ([moodKey, count], index) => {
                  const percentage = (count / moodData.totalCheckIns) * 100
                  const colors = [
                    "bg-destructive",
                    "bg-orange-500",
                    "bg-chart-3",
                    "bg-accent",
                    "bg-primary",
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
