"use client"

import { useMemo } from "react"
import type { Session, SessionAggregate, Submission, Buzzword } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BuzzwordChart } from "./buzzword-chart"
import { TimelineChart } from "./timeline-chart"
import { SubmissionTable } from "./submission-table"
import { TrendingUp, Users, BarChart3 } from "lucide-react"

interface SessionAnalyticsProps {
  session: any
  aggregates: SessionAggregate
  submissions: (Submission & { creator: any })[]
  buzzwords: Buzzword[]
}

export function SessionAnalytics({ session, aggregates, submissions, buzzwords }: SessionAnalyticsProps) {
  const stats = useMemo(() => {
    const totalSubmissions = submissions.length
    const totalBuzzwords = aggregates.counts_sum
      ? Object.values(aggregates.counts_sum).reduce((sum: number, count: any) => sum + (count || 0), 0)
      : 0

    const avgBuzzwordsPerSubmission = totalSubmissions > 0 ? Math.round(totalBuzzwords / totalSubmissions) : 0

    // Calculate most popular buzzword
    const mostPopular = aggregates.counts_sum
      ? Object.entries(aggregates.counts_sum).reduce(
          (max, [id, count]) => {
            const buzzword = buzzwords.find((b) => b.id === id)
            if (buzzword && (count as number) > max.count) {
              return { id, label: buzzword.label, count: count as number }
            }
            return max
          },
          { id: "", label: "", count: 0 },
        )
      : null

    return {
      totalSubmissions,
      totalBuzzwords,
      avgBuzzwordsPerSubmission,
      mostPopular,
    }
  }, [aggregates, submissions, buzzwords])

  return (
    <div className="space-y-8">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Approved submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buzzwords</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuzzwords}</div>
            <p className="text-xs text-muted-foreground">Across all submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgBuzzwordsPerSubmission}</div>
            <p className="text-xs text-muted-foreground">Buzzwords per submission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostPopular?.count || 0}</div>
            <p className="text-xs text-muted-foreground truncate">{stats.mostPopular?.label || "No data"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Buzzword Distribution</CardTitle>
            <CardDescription>Total counts for each buzzword across all submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <BuzzwordChart aggregates={aggregates} buzzwords={buzzwords} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Timeline</CardTitle>
            <CardDescription>Buzzword usage patterns over time during the session</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart aggregates={aggregates} buzzwords={buzzwords} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
          <CardDescription>Comprehensive breakdown of buzzword usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Buzzword</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">Average</th>
                  <th className="text-right py-2">Std Dev</th>
                  <th className="text-right py-2">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {buzzwords.map((buzzword) => {
                  const total = aggregates.counts_sum?.[buzzword.id] || 0
                  const avg = aggregates.counts_avg?.[buzzword.id] || 0
                  const stddev = aggregates.counts_stddev?.[buzzword.id] || 0
                  const popularity = stats.totalBuzzwords > 0 ? ((total / stats.totalBuzzwords) * 100).toFixed(1) : "0"

                  return (
                    <tr key={buzzword.id} className="border-b">
                      <td className="py-2 font-medium">{buzzword.label}</td>
                      <td className="text-right py-2">{total}</td>
                      <td className="text-right py-2">{avg.toFixed(1)}</td>
                      <td className="text-right py-2">{stddev.toFixed(1)}</td>
                      <td className="text-right py-2">{popularity}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Submissions</CardTitle>
          <CardDescription>Detailed view of each approved submission</CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionTable submissions={submissions} buzzwords={buzzwords} />
        </CardContent>
      </Card>

      {/* Data Quality */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
          <CardDescription>Information about the aggregated data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Sample Size</div>
              <div className="text-lg font-semibold">{aggregates.sample_size || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg font-semibold">
                {aggregates.last_updated_at ? new Date(aggregates.last_updated_at).toLocaleDateString() : "Never"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data Status</div>
              <Badge variant="default">Current</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
