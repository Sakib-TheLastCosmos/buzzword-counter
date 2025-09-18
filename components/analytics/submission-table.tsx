"use client"

import type { Submission, Buzzword } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SubmissionTableProps {
  submissions: (Submission & { creator: any })[]
  buzzwords: Buzzword[]
}

export function SubmissionTable({ submissions, buzzwords }: SubmissionTableProps) {
  const getTotalBuzzwords = (counts: Record<string, number>) => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0)
  }

  const getTopBuzzwords = (counts: Record<string, number>) => {
    const sorted = Object.entries(counts)
      .map(([id, count]) => ({
        id,
        count,
        label: buzzwords.find((b) => b.id === id)?.label || "Unknown",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    return sorted
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted By</TableHead>
            <TableHead>Total Buzzwords</TableHead>
            <TableHead>Top Buzzwords</TableHead>
            <TableHead>Timeline Entries</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const topBuzzwords = getTopBuzzwords(submission.counts)
            return (
              <TableRow key={submission.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={submission.creator?.photo_url || ""} alt={submission.creator?.name || ""} />
                      <AvatarFallback>{submission.creator?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{submission.creator?.name || "Unknown User"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{getTotalBuzzwords(submission.counts)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {topBuzzwords.map((buzzword) => (
                      <Badge key={buzzword.id} variant="outline" className="text-xs">
                        {buzzword.label}: {buzzword.count}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{submission.timeline.length}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(submission.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
