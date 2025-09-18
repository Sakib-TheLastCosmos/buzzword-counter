"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { processSessionAggregates } from "@/lib/session-aggregates"
import type { Session } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"

interface SessionWithDetails extends Session {
  teacher: any
  creator: any
}

export function SessionApprovalTable() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSessions = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        teacher:teachers(*),
        creator:users!sessions_created_by_fkey(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching sessions:", error)
      setLoading(false)
      return
    }

    setSessions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleStatusChange = async (sessionId: string, status: "approved" | "rejected" | "pending") => {
    setActionLoading(sessionId)
    const supabase = createClient()

    try {
      // Update session status
      const { error: updateError } = await supabase
        .from("sessions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", sessionId)

      if (updateError) throw updateError

      // If approved, process session aggregates

      // Update local state
      setSessions(
        sessions.map((session) => (session.id === sessionId ? { ...session, status } : session))
      )
    } catch (error) {
      console.error("Error updating session:", error)
      alert("Failed to update session status or aggregates")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading sessions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {sessions.filter((s) => s.status === "pending").length} pending approvals
        </p>
        <Button variant="outline" size="sm" onClick={fetchSessions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium line-clamp-2">{session.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.teacher?.avatar_url || ""} alt={session.teacher?.name || ""} />
                      <AvatarFallback>{session.teacher?.name?.charAt(0)?.toUpperCase() || "T"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{session.teacher?.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.creator?.photo_url || ""} alt={session.creator?.name || ""} />
                      <AvatarFallback className="text-xs">
                        {session.creator?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{session.creator?.name || "Unknown"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      session.status === "approved"
                        ? "default"
                        : session.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : "TBD"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/sessions/${session.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {session.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(session.id, "approved")}
                          disabled={actionLoading === session.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(session.id, "rejected")}
                          disabled={actionLoading === session.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {session.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(session.id, "pending")}
                        disabled={actionLoading === session.id}
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