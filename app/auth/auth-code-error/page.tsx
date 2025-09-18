import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">There was an error signing you in. This could be due to:</p>
              <ul className="text-sm text-muted-foreground text-left space-y-1">
                <li>• The authentication code expired</li>
                <li>• The request was cancelled</li>
                <li>• A network error occurred</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
