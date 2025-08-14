import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { VerificationComponent } from "./verification-component"

async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4">
        <AlertTriangle size={64} className="text-chart-3" />
        <p className="text-xl">No token provided</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft />
            Go back to dashboard
          </Link>
        </Button>
      </div>
    )
  }

  return <VerificationComponent token={token} />
}

export default VerifyEmailPage
