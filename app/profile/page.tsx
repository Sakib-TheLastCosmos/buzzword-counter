import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface ProfilePageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await getCurrentUser()
  const params = await searchParams

  if (!user) {
    redirect("/auth/login")
  }

  const showApprovalMessage = params.message === "approval-required"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        {showApprovalMessage && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Your account is pending approval. You'll be able to create sessions and submissions once an admin approves
              your account.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photo_url || ""} alt={user.name || ""} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{user.name || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge variant={user.role === "admin" ? "secondary" : "outline"}>
                    {user.role === "admin" ? "Administrator" : "User"}
                  </Badge>
                </div>
              </div>
              <div>
                {user.role !== "admin" && (
                  <>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant={user.approved ? "default" : "outline"}>
                        {user.approved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </div>
                  </>
                )}

              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="mt-1">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {!user.approved && user.role !== "admin" && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Your account is awaiting admin approval. Once approved, you'll be able to:
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Create new sessions</li>
                    <li>Submit buzzword counts during live sessions</li>
                    <li>View your submission history</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
