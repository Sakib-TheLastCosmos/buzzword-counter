"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, RefreshCw } from "lucide-react"

export function UserApprovalTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleApproval = async (userId: string, approved: boolean) => {
    setActionLoading(userId)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("users").update({ approved }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, approved } : user)))
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Failed to update user status")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId: string, role: "user" | "admin") => {
    setActionLoading(userId)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("users").update({ role }).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)))
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading users...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {users.filter((u) => !u.approved && u.role !== "admin").length} pending approvals
        </p>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photo_url || ""} alt={user.name || ""} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name || "Unnamed User"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant={user.role === "admin" ? "secondary" : "outline"}>{user.role}</Badge>
                    {user.role === "user" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRoleChange(user.id, "admin")}
                        disabled={actionLoading === user.id}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.approved ? "default" : "outline"}>
                    {user.approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.role !== "admin" && (
                    <div className="flex gap-2">
                      {!user.approved ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproval(user.id, true)}
                            disabled={actionLoading === user.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(user.id, false)}
                            disabled={actionLoading === user.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproval(user.id, false)}
                          disabled={actionLoading === user.id}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
