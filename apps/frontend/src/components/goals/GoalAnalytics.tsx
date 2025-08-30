// src/components/Goals/GoalAnalytics.tsx
"use client"

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import React, { useEffect, useState } from "react"
import { Bar, Line } from "react-chartjs-2"

import goalService from "@/services/goalService"

import { LoadingSpinner } from "../loading-spinner"
import styles from "./GoalAnalytics.module.css"

// Register Chart.js components
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
)

/**
 * Shape of the analytics data for charting
 */
interface AnalyticsData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    fill?: boolean
  }[]
}

const GoalAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [noData, setNoData] = useState<boolean>(false)
  const [dateRange, setDateRange] = useState<"all" | "lastMonth" | "lastWeek">(
    "all",
  )
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  useEffect(() => {
    async function load(): Promise<void> {
      setLoading(true)
      setError("")
      setNoData(false)

      try {
        const response = await goalService.getGoalAnalytics({ dateRange })

        const invalidOrEmpty =
          !response ||
          !Array.isArray(response.labels) ||
          !Array.isArray(response.datasets) ||
          response.labels.length === 0 ||
          response.datasets.every((ds) => ds.data.length === 0)

        if (invalidOrEmpty) {
          setAnalytics(null)
          setNoData(true)
        } else {
          setAnalytics({
            labels: response.labels as string[],
            datasets: response.datasets as AnalyticsData["datasets"],
          })
        }
      } catch (err: unknown) {
        console.error(err)
        setError(
          err instanceof Error ? err.message : "Failed to load analytics data.",
        )
        setAnalytics(null)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [dateRange])

  // Fallback chart when we do have data but it's been nulled
  const defaultData: AnalyticsData = {
    labels: ["No Data"],
    datasets: [{ label: "Goals Completed", data: [0], fill: true }],
  }
  const chartData = analytics ?? defaultData

  return (
    <section className={styles.container} aria-labelledby="analytics-header">
      <h2 id="analytics-header" className={styles.header}>
        📊 Goal Analytics
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : noData ? (
        <p className={styles.noData}>
          You haven’t completed any goals in this range yet. Start tracking
          progress to see your analytics!
        </p>
      ) : (
        <>
          <div className={styles.controls}>
            <div className={styles.field}>
              <label htmlFor="dateRange" className={styles.label}>
                Date Range:
              </label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) =>
                  setDateRange(
                    e.target.value as "all" | "lastMonth" | "lastWeek",
                  )
                }
                className={styles.select}
              >
                <option value="all">All Time</option>
                <option value="lastMonth">Last Month</option>
                <option value="lastWeek">Last Week</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="chartType" className={styles.label}>
                Chart Type:
              </label>
              <select
                id="chartType"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as "line" | "bar")}
                className={styles.select}
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
              </select>
            </div>
          </div>

          <div className={styles.chart}>
            {chartType === "line" ? (
              <Line data={chartData} options={{ responsive: true }} />
            ) : (
              <Bar data={chartData} options={{ responsive: true }} />
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default GoalAnalytics
