"use client"

import { useMemo } from "react"
import type { SessionAggregate, Buzzword } from "@/lib/types"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface BuzzwordChartProps {
  aggregates: SessionAggregate
  buzzwords: Buzzword[]
}

export function BuzzwordChart({ aggregates, buzzwords }: BuzzwordChartProps) {
  const chartData = useMemo(() => {
    if (!aggregates.counts_sum || !aggregates.counts_avg) return []

    return buzzwords.map((buzzword) => ({
      name: buzzword.label,
      total: aggregates.counts_sum?.[buzzword.id] || 0,
      average: Number((aggregates.counts_avg?.[buzzword.id] || 0).toFixed(1)),
    }))
  }, [aggregates, buzzwords])

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">No data available for chart</div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} interval={0} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend />
          <Bar dataKey="total" fill="hsl(var(--chart-1))" name="Total Count" />
          <Bar dataKey="average" fill="hsl(var(--chart-2))" name="Average" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
