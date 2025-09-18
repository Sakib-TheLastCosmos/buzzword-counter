import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, Calendar, BarChart3 } from "lucide-react"

export default async function SubmissionsPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  if (!user) {
    return null // AuthGuard will handle redirect
  }

  // Get user's submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      session:sessions(
        *,
        teacher:teachers(*)
      )
    `)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  const getTotalBuzzwords = (counts: Record<string, number>) => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">My Submissions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Track your buzzword counting submissions and their approval status
          </p>
        </div>

        {submissions && submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
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
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{submission.session?.title}</CardTitle>
                  <CardDescription>by {submission.session?.teacher?.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{getTotalBuzzwords(submission.counts)}</div>
                      <div className="text-sm text-muted-foreground">Total Buzzwords</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{submission.timeline.length}</div>
                      <div className="text-sm text-muted-foreground">Timeline Entries</div>
                    </div>
                  </div>

                  {submission.status === "approved" && (
                    <Button asChild className="w-full">
                      <Link href={`/sessions/${submission.session_id}/analytics`}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  )}

                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href={`/sessions/${submission.session_id}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Session
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any buzzword tracking data yet. Join a live session to get started!
              </p>
              <Button asChild>
                <Link href="/sessions">Browse Sessions</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}
