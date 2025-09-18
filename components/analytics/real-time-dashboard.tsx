"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLiveData } from "@/lib/hooks/use-live-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"

interface RealTimeDashboardProps {
  sessionId: string
}

export function RealTimeDashboard({ sessionId }: RealTimeDashboardProps) {
  const { data, loading, error } = useLiveData(sessionId)

  if (loading) {
    return <div className="text-center py-8">Loading live data...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Error: {error}</div>
  }

  if (!data) {
    return <div className="text-center py-8">No data available</div>
  }

  const buzzwordChartData = Object.entries(data.buzzwordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.liveStats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.liveStats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.liveStats.approvedSubmissions}</div>
            <p className="text-xs text-muted-foreground">Approved data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.liveStats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Buzzword Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Live Buzzword Frequency</CardTitle>
          <CardDescription>Real-time buzzword usage from approved submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={buzzwordChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="word" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest submissions from participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{submission.user?.name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(submission.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant={submission.status === "approved" ? "default" : "secondary"}>{submission.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
