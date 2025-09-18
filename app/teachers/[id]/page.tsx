import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { TeacherAnalytics } from "@/components/analytics/teacher-analytics"
import { notFound } from "next/navigation"
import { Calendar, Plus, Tag } from "lucide-react"

interface TeacherPageProps {
  params: { id: string }
}

export default async function TeacherPage({ params }: TeacherPageProps) {
  const { id } = params
  const supabase = await createClient()
  const user = await getCurrentUser()

  // Get teacher details
  const { data: teacherData } = await supabase.from("teachers").select("*").eq("id", id).single()
  if (!teacherData) notFound()

  // Get teacher's buzzwords
  const { data: buzzwordsData } = await supabase.from("buzzwords").select("*").eq("teacher_id", id).order("label")

  // Get teacher's sessions
  const { data: sessionsData } = await supabase
    .from("sessions")
    .select("*")
    .eq("teacher_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const canCreateSession = user && (user.approved || user.role === "admin")

  // Serialize Supabase data to plain objects
  const teacher = JSON.parse(JSON.stringify(teacherData))
  const buzzwords = JSON.parse(JSON.stringify(buzzwordsData || []))
  const sessions = JSON.parse(JSON.stringify(sessionsData || []))

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Teacher Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={teacher.avatar_url || ""} alt={teacher.name} />
              <AvatarFallback className="text-3xl">{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <CardTitle className="text-3xl text-balance">{teacher.name}</CardTitle>
                <CardDescription className="text-lg mt-2 text-balance">
                  {teacher.bio || "Educator and presenter"}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {canCreateSession && (
                  <Button asChild>
                    <Link href={`/teachers/${teacher.id}/create-session`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Session
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/sessions">View All Sessions</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            View Analytics
          </CardTitle>
          <CardDescription>
            Analytics of all sessions by {teacher.name} over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherAnalytics teacherId={teacher.id} />
        </CardContent>
      </Card>

      {/* Buzzwords Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Buzzwords
          </CardTitle>
          <CardDescription>Common terms and phrases tracked during {teacher.name}'s presentations</CardDescription>
        </CardHeader>
        <CardContent>
          {buzzwords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {buzzwords.map((buzzword:any) => (
                <Badge key={buzzword.id} variant="secondary" className="text-sm">
                  {buzzword.label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No buzzwords defined for this teacher yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Sessions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sessions
          </CardTitle>
          <CardDescription>Approved sessions by {teacher.name} available for buzzword tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session:any) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {session.scheduled_at
                        ? new Date(session.scheduled_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Date TBD"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={`/sessions/${session.id}`}>View Session</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No approved sessions found for this teacher.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
