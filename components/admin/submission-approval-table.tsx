"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Submission } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X, RefreshCw, Eye } from "lucide-react"
import { processSessionAggregates } from "@/lib/session-aggregates"

interface SubmissionWithDetails extends Submission {
  session: any
  creator: any
}

export function SubmissionApprovalTable() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSubmissions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("submissions")
      .select(`
        *,
        session:sessions(*),
        creator:users!submissions_created_by_fkey(*)
      `)
      .order("created_at", { ascending: false })

    setSubmissions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleStatusChange = async (submissionId: string, status: "approved" | "pending" | "rejected") => {
    setActionLoading(submissionId)
    const supabase = createClient()

    try {
      const updateData: any = { status }
      if (status === "approved") {
        updateData.approved_at = new Date().toISOString()
      }

      console.log(submissions.find((s) => s.id === submissionId)?.session.id || "")

      const { error } = await supabase.from("submissions").update(updateData).eq("id", submissionId)

      if (error) throw error

      if (status === "approved") {
        await processSessionAggregates(
          submissions.find((s) => s.id === submissionId)?.session.id || "",
          supabase,
        )
      }



      // Update local state
      setSubmissions(
        submissions.map((submission) =>
          submission.id === submissionId ? { ...submission, status, approved_at: updateData.approved_at } : submission,
        ),
      )
    } catch (error) {
      console.error("Error updating submission:", error)
      alert("Failed to update submission status")
    } finally {
      setActionLoading(null)
    }
  }

  const getTotalBuzzwords = (counts: Record<string, number>) => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0)
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading submissions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {submissions.filter((s) => s.status === "pending").length} pending approvals
        </p>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Buzzwords</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium line-clamp-1">{submission.session?.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {submission.session?.teacher?.name || "Unknown Teacher"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={submission.creator?.photo_url || ""} alt={submission.creator?.name || ""} />
                      <AvatarFallback>{submission.creator?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{submission.creator?.name || "Unknown"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{getTotalBuzzwords(submission.counts)}</div>
                    <div className="text-xs text-muted-foreground">total</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      submission.status === "approved"
                        ? "default"
                        : submission.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(submission.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Submission Details</DialogTitle>
                          <DialogDescription>
                            Review the buzzword counts and timeline for this submission
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Session</h4>
                            <p>{submission.session?.title}</p>
                            <p className="text-sm text-muted-foreground">by {submission.session?.teacher?.name}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Buzzword Counts</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(submission.counts).map(([buzzwordId, count]) => (
                                <div key={buzzwordId} className="flex justify-between">
                                  <span>Buzzword {buzzwordId.slice(-4)}:</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Timeline</h4>
                            <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
                              {submission.timeline.slice(0, 10).map((entry, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{entry.buzzword}</span>
                                  <span className="text-muted-foreground">{Math.floor(entry.timestamp / 1000)}s</span>
                                </div>
                              ))}
                              {submission.timeline.length > 10 && (
                                <p className="text-muted-foreground">
                                  ... and {submission.timeline.length - 10} more entries
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {submission.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(submission.id, "approved")}
                          disabled={actionLoading === submission.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(submission.id, "rejected")}
                          disabled={actionLoading === submission.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {submission.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(submission.id, "pending")}
                        disabled={actionLoading === submission.id}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
