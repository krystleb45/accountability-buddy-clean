import { HomeIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-5xl font-bold text-destructive">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">Page Not Found</p>

      <Button asChild>
        <Link href="/">
          <HomeIcon />
          Go to Homepage
        </Link>
      </Button>
    </div>
  )
}
