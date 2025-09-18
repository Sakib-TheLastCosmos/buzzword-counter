import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users } from "lucide-react"

export default async function TeachersPage() {
  try {
  const supabase = await createClient()

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select(`*`)
    .order("name")

    console.log("hello teachers")

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-balance">Teachers</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Discover educators and their presentation styles. Each teacher has unique buzzwords that reflect their
          teaching approach.
        </p>
      </div>

      {teachers && teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={teacher.avatar_url || ""} alt={teacher.name} />
                  <AvatarFallback className="text-xl">{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl text-balance">{teacher.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-3 text-balance">
                  {teacher.bio || "Educator and presenter"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Badge variant="outline">{teacher.sessions?.[0]?.count || 0} Sessions</Badge>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/teachers/${teacher.id}`}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Teachers Found</h3>
            <p className="text-muted-foreground">Teachers will appear here once they are added to the platform.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  } catch (error) {
    console.error("Error loading teachers:", error)
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Failed to load teachers</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
