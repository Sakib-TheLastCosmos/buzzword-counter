import { createClient } from "@/lib/supabase/server"
import { SessionAnalytics } from "@/components/analytics/session-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BarChart3, ArrowLeft } from "lucide-react"

interface SessionAnalyticsPageProps {
  params: { id: string }
}

export default async function SessionAnalyticsPage({ params }: SessionAnalyticsPageProps) {
  try {
    const { id } = params
    const supabase = await createClient() // server-side, no await

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        id,
        title,
        status,
        scheduled_at,
        created_at,
        teacher_id,
        teacher:teachers(name)
      `)
      .eq("id", id)
      .maybeSingle() // <-- ensures teacher is a single object

    if (sessionError) {
      console.error("Session fetch error:", sessionError)
      notFound()
    }
    if (!session) notFound()

    // Extract teacher as a single object if Supabase returns array
    const teacher = Array.isArray(session.teacher) ? session.teacher[0] : session.teacher

    // Get buzzwords for teacher
    const { data: buzzwords, error: buzzError } = await supabase
      .from("buzzwords")
      .select("*")
      .eq("teacher_id", session.teacher_id)

    if (buzzError) console.error("Buzzwords fetch error:", buzzError)

    const totalSession = {
      ...session,
      teacher,
      buzzwords: buzzwords || [],
    }

    // Get session aggregates
    const { data: aggregates, error: aggError } = await supabase
      .from("session_aggregates")
      .select("*")
      .eq("session_id", id)
      .maybeSingle()

    if (aggError) console.error("Aggregates fetch error:", aggError)

    // Get approved submissions for this session
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select(`
        *,
        creator:users!submissions_created_by_fkey(name, email)
      `)
      .eq("session_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (subError) console.error("Submissions fetch error:", subError)

    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/sessions/${session.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Session
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Session Analytics
            </h1>
            <p className="text-muted-foreground">{session.title}</p>
          </div>
        </div>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{session.title}</CardTitle>
                <CardDescription>by {teacher?.name}</CardDescription>
              </div>
              <Badge variant={session.status === "approved" ? "default" : "outline"}>
                {session.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Scheduled:</span>{" "}
                {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : "TBD"}
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                {new Date(session.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="text-muted-foreground">Submissions:</span>{" "}
                {submissions?.length || 0} approved
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        {aggregates && submissions && submissions.length > 0 ? (
          <SessionAnalytics
            session={totalSession}
            aggregates={aggregates}
            submissions={submissions}
            buzzwords={totalSession.buzzwords}
          />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
              <p className="text-muted-foreground mb-4">
                Analytics will be available once submissions are approved and aggregated.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Users need to submit buzzword tracking data</p>
                <p>• Admins need to approve the submissions</p>
                <p>• Aggregation functions need to process the data</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading session analytics page:", error)
    notFound()
  }
}
