"use client"

import { format } from "date-fns"
import { FolderOpen, TrendingUpDown } from "lucide-react"
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import type { AdvancedAnalyticsData } from "@/api/analytics/analytics-api"
import type { ChartConfig } from "@/components/ui/chart"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuth } from "@/context/auth/auth-context"

const trendsChartConfig = {
  count: {
    label: "Completed Goals",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AdvancedAnalytics({
  goalTrends,
  categoryBreakdown,
}: AdvancedAnalyticsData) {
  const { user } = useAuth()

  const categoryChartConfig = Object.keys(
    categoryBreakdown,
  ).reduce<ChartConfig>((acc, category, i) => {
    acc[category] = {
      label: category,
      color: `var(--chart-${(i % 5) + 1})`,
    }
    return acc
  }, {})
  const categoryBreakdownArray = Object.entries(categoryBreakdown).map(
    ([name, value]) => ({
      category: name,
      count: value,
      fill: `var(--color-${name})`,
    }),
  )
  const totalCategories = categoryBreakdownArray.length

  const goalTrendsArray = Object.entries({
    ...goalTrends,
    [format(user!.createdAt!, "yyyy-MM-dd")]: 0, // Ensure at least one entry on the date of account creation
  }).map(([date, count]) => ({
    date: new Date(date).getTime(),
    count,
  }))

  // Sort the array by date to ensure correct order in the line chart
  goalTrendsArray.sort((a, b) => a.date - b.date)

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Category Breakdown - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="text-primary" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={categoryChartConfig}
            className="mx-auto max-h-80"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={categoryBreakdownArray}
                dataKey="count"
                nameKey="category"
                innerRadius="60%"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalCategories}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {totalCategories === 1 ? "Category" : "Categories"}
                          </tspan>
                        </text>
                      )
                    }

                    return null
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className={`
                  gap-2
                  *:basis-1/4 *:justify-center
                `}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpDown className="text-primary" />
            Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-10">
          <ChartContainer config={trendsChartConfig}>
            <LineChart
              accessibilityLayer
              data={goalTrendsArray}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                type="number"
                scale="time"
                domain={["auto", "auto"]}
                tickFormatter={(date) => format(date, "yyyy-MM-dd")}
              />
              <YAxis allowDecimals={false} domain={[0, "dataMax"]} hide />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="count"
                    labelFormatter={(_, payload) => {
                      const data = payload?.[0]?.payload.date
                      if (!data) {
                        return ""
                      }
                      return format(data, "PP")
                    }}
                  />
                }
              />
              <Line
                dataKey="count"
                type="monotoneX"
                stroke="var(--color-count)"
                strokeWidth={2}
                dot={
                  goalTrendsArray.length <= 10
                    ? { fill: "var(--color-count)" }
                    : false
                }
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
