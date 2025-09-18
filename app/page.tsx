import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Users, TrendingUp, BarChart3 } from "lucide-react"
import { BuzzwordTrendsChart } from "@/components/charts/buzzword-trends-chart"

export default async function HomePage() {
  const supabase = await createClient()

  // Get featured teachers
  const { data: teachers } = await supabase.from("teachers").select("*").limit(3)
  console.log(teachers)
  // Get recent approved sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      teacher:teachers(*)
    `)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6)

  // Get stats
  const { count: teacherCount } = await supabase.from("teachers").select("*", { count: "exact", head: true })

  const { count: sessionCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center mb-6">
            <BarChart3 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Track Buzzwords in Real-Time</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Analyze presentation patterns, track buzzword usage, and gain insights into communication trends during
            lectures and presentations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/teachers">Explore Teachers</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sessions">View Sessions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherCount || 0}</div>
              <p className="text-xs text-muted-foreground">Active educators on platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionCount || 0}</div>
              <p className="text-xs text-muted-foreground">Sessions available for tracking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Insights</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Real-time</div>
              <p className="text-xs text-muted-foreground">Live buzzword tracking</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Buzzword Trends Chart Section */}
      <section className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Buzzword Analytics</h2>
            <p className="text-muted-foreground">Real-time insights into presentation patterns and speech habits</p>
          </div>
          <BuzzwordTrendsChart />
        </div>
      </section>

      {/* Featured Teachers */}
      {teachers && teachers.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Featured Teachers</h2>
              <p className="text-muted-foreground">Discover educators and their unique presentation styles</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={teacher.avatar_url || ""} alt={teacher.name} />
                      <AvatarFallback className="text-lg">{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">{teacher.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-3">
                      {teacher.bio || "Educator and presenter"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button asChild className="w-full">
                      <Link href={`/teachers/${teacher.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/teachers">View All Teachers</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recent Sessions */}
      {sessions && sessions.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Recent Sessions</h2>
              <p className="text-muted-foreground">Latest approved sessions ready for buzzword tracking</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.teacher?.avatar_url || ""} alt={session.teacher?.name || ""} />
                        <AvatarFallback>{session.teacher?.name?.charAt(0).toUpperCase() || "T"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{session.teacher?.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          Approved
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : "Date TBD"}
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
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href="/sessions">View All Sessions</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
