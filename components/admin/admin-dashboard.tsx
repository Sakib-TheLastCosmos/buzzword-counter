import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { UserApprovalTable } from "./user-approval-table"
import { SessionApprovalTable } from "./session-approval-table"
import { SubmissionApprovalTable } from "./submission-approval-table"
import { TeacherManagement } from "./teacher-management"
import { Users, Calendar, FileText, GraduationCap } from "lucide-react"

export async function AdminDashboard() {
  const supabase = await createClient()

  // Get pending counts
  const { count: pendingUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("approved", false)
    .neq("role", "admin")

  const { count: pendingSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: pendingSubmissions } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Get total counts
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: totalSessions } = await supabase.from("sessions").select("*", { count: "exact", head: true })

  const { count: totalSubmissions } = await supabase.from("submissions").select("*", { count: "exact", head: true })

  const { count: totalTeachers } = await supabase.from("teachers").select("*", { count: "exact", head: true })

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, sessions, submissions, and platform content</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers || 0}</div>
            <p className="text-xs text-muted-foreground">of {totalUsers || 0} total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSessions || 0}</div>
            <p className="text-xs text-muted-foreground">of {totalSessions || 0} total sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">of {totalSubmissions || 0} total submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers || 0}</div>
            <p className="text-xs text-muted-foreground">Active educators</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
            {pendingUsers ? pendingUsers > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingUsers}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
            {pendingSessions ? pendingSessions > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingSessions}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submissions
            {pendingSubmissions ? pendingSubmissions > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingSubmissions}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Approve or reject user accounts and manage user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <UserApprovalTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Review and approve session requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionApprovalTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Submission Management</CardTitle>
              <CardDescription>Review and approve buzzword tracking submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionApprovalTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Management</CardTitle>
              <CardDescription>Manage teachers, their profiles, and associated buzzwords</CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
