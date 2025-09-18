"use client"

import { useMemo } from "react"
import type { SessionAggregate, Buzzword } from "@/lib/types"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface TimelineChartProps {
  aggregates: SessionAggregate
  buzzwords: Buzzword[]
}

export function TimelineChart({ aggregates, buzzwords }: TimelineChartProps) {
  const chartData = useMemo(() => {
    if (!aggregates.time_series || !Array.isArray(aggregates.time_series)) return []

    // Convert time series data to chart format
    const sortedSeries = [...aggregates.time_series].sort(
      (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    return sortedSeries.map((entry: any) => {
      const dataPoint: any = { time: Math.floor(new Date(entry.timestamp).getTime() / 60000) } // minutes

      buzzwords.forEach((buzzword) => {
        dataPoint[buzzword.label] = entry.counts?.[buzzword.label] || 0
      })

      return dataPoint
    })
  }, [aggregates, buzzwords])

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No timeline data available</div>
  }

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            label={{ value: "Time (minutes)", position: "insideBottom", offset: -5 }}
          />
          <YAxis tick={{ fontSize: 12 }} label={{ value: "Count", angle: -90, position: "insideLeft" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            labelFormatter={(value) => `Time: ${value} minutes`}
          />
          <Legend />
          {buzzwords.slice(0, 5).map((buzzword, index) => (
            <Line
              key={buzzword.id}
              type="monotone"
              dataKey={buzzword.label}
              stroke={colors[index]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
