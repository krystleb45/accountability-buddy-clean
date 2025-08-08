import type { ReactNode } from "react"

import { Navbar } from "@/components/navbar"

import { AuthTokenSyncer } from "./auth-token-syncer"
import { NewsletterPopup } from "./newsletter-popup"

interface LayoutComponentProps {
  children: ReactNode
}

export function LayoutComponent({
  children,
}: LayoutComponentProps): React.ReactElement {
  return (
    <>
      {/* Keeps your token in sync from NextAuth to your axios interceptor */}
      <AuthTokenSyncer />

      <Navbar />

      {/* Main content */}
      <main>{children}</main>

      {/* Global footer */}
      <footer
        className={`
          w-full bg-muted py-6 text-center text-base text-muted-foreground
          md:text-lg
        `}
      >
        <p>&copy; {new Date().getFullYear()} Accountability Buddy.</p>
      </footer>

      <NewsletterPopup showAfterSeconds={45} />
    </>
  )
}
