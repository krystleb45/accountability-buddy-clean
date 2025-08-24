"use client"

import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface UserStatisticsChartProps {
  totalGoals: number
  completedGoals: number
  collaborations: number
  goalTrends: { date: string; progress: number }[]
  categoryBreakdown: { category: string; value: number }[]
  currentStreak: number
  longestStreak: number
}

// Theme colors: black background, kelly green accent
const COLORS = ["#4CBB17", "#28a745", "#ffcc00", "#ff5733"]

const UserStatisticsChart: React.FC<UserStatisticsChartProps> = ({
  totalGoals,
  completedGoals,
  collaborations,
  goalTrends,
  categoryBreakdown,
  currentStreak,
  longestStreak,
}) => {
  const barChartData = [
    { name: "Total Goals", value: totalGoals },
    { name: "Completed Goals", value: completedGoals },
    { name: "Collaborations", value: collaborations },
  ]

  const pieChartData = [
    { name: "Completed", value: completedGoals },
    { name: "In Progress", value: totalGoals - completedGoals },
  ]

  return (
    <div className="rounded-2xl bg-black p-6 shadow-lg">
      <h2 className="mb-6 text-center text-2xl font-bold text-[#4CBB17]">
        📋 User Statistics
      </h2>

      {/* Overall Progress - Bar Chart */}
      <section className="mb-8">
        <h3 className="mb-4 text-center text-lg font-semibold text-[#4CBB17]">
          📊 Overall Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={barChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", border: "none" }}
            />
            <Legend wrapperStyle={{ color: "#fff" }} />
            <Bar dataKey="value" fill="#4CBB17" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Category Breakdown - Pie Chart */}
      <section className="mb-8">
        <h3 className="mb-4 text-center text-lg font-semibold text-[#4CBB17]">
          📂 Category Breakdown
        </h3>
        {categoryBreakdown.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              // Fix for the label function in the Pie chart
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${percent ? (percent * 100).toFixed(0) : "0"}%`
                }
              >
                {categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none" }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No category data yet.</p>
        )}
      </section>

      {/* Streak Tracker */}
      <section className="mb-8">
        <h3 className="mb-4 text-center text-lg font-semibold text-[#ffcc00]">
          🔥 Streak Tracker
        </h3>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-4 bg-[#4CBB17]"
            style={{
              width: `${
                longestStreak > 0 ? (currentStreak / longestStreak) * 100 : 0
              }%`,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <p className="mt-2 text-center text-white">
          Current Streak:{" "}
          <span className="font-bold text-[#4CBB17]">{currentStreak}</span> days
          | Longest Streak:{" "}
          <span className="font-bold text-white">{longestStreak}</span> days
        </p>
      </section>

      {/* Goal Completion */}
      <section className="mb-8">
        <h3 className="mb-4 text-center text-lg font-semibold text-[#ff5733]">
          🎯 Goal Completion
        </h3>
        {totalGoals > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label
              >
                {pieChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none" }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No goals tracked yet.</p>
        )}
      </section>

      {/* Progress Over Time */}
      <section>
        <h3 className="mb-4 text-center text-lg font-semibold text-[#1E90FF]">
          📈 Progress Over Time
        </h3>
        {goalTrends.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={goalTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none" }}
              />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#4CBB17"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">
            No progress data available yet.
          </p>
        )}
      </section>
    </div>
  )
}

export default UserStatisticsChart
