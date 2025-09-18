"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"

// Mock data for buzzword trends - replace with real data from your database
const buzzwordData = [
  {
    date: "Mon",
    um: 45,
    like: 32,
    "you know": 28,
    basically: 15,
    actually: 22,
  },
  {
    date: "Tue",
    um: 52,
    like: 28,
    "you know": 35,
    basically: 18,
    actually: 25,
  },
  {
    date: "Wed",
    um: 38,
    like: 41,
    "you know": 22,
    basically: 12,
    actually: 19,
  },
  {
    date: "Thu",
    um: 61,
    like: 35,
    "you know": 31,
    basically: 21,
    actually: 28,
  },
  {
    date: "Fri",
    um: 49,
    like: 29,
    "you know": 26,
    basically: 16,
    actually: 23,
  },
  {
    date: "Sat",
    um: 33,
    like: 24,
    "you know": 18,
    basically: 9,
    actually: 15,
  },
  {
    date: "Sun",
    um: 27,
    like: 19,
    "you know": 14,
    basically: 7,
    actually: 12,
  },
]

const chartConfig = {
  um: {
    label: "Um",
    color: "hsl(var(--chart-1))",
  },
  like: {
    label: "Like",
    color: "hsl(var(--chart-2))",
  },
  "you know": {
    label: "You Know",
    color: "hsl(var(--chart-3))",
  },
  basically: {
    label: "Basically",
    color: "hsl(var(--chart-4))",
  },
  actually: {
    label: "Actually",
    color: "hsl(var(--chart-5))",
  },
}

export function BuzzwordTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Buzzword Trends</CardTitle>
        <CardDescription>
          Track the most common filler words and phrases used in presentations this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={buzzwordData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="um" fill="var(--color-um)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="like" fill="var(--color-like)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="you know" fill="var(--color-you-know)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="basically" fill="var(--color-basically)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="actually" fill="var(--color-actually)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
