import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, BarChart3 } from "lucide-react"

export default async function SessionsPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      teacher:teachers(*)
    `)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <BarChart3 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-balance">Sessions</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Explore approved sessions ready for buzzword tracking. Join live sessions or view historical data and
          analytics.
        </p>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={session.teacher?.avatar_url || ""} alt={session.teacher?.name || ""} />
                    <AvatarFallback>{session.teacher?.name?.charAt(0).toUpperCase() || "T"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{session.teacher?.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      Approved
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-2 text-balance">{session.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {session.scheduled_at
                    ? new Date(session.scheduled_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date TBD"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Created {new Date(session.created_at).toLocaleDateString()}
                </p>
                <Button asChild className="w-full">
                  <Link href={`/sessions/${session.id}`}>View Session</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
            <p className="text-muted-foreground mb-4">
              Approved sessions will appear here once teachers create and admins approve them.
            </p>
            <Button variant="outline" asChild>
              <Link href="/teachers">Browse Teachers</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
