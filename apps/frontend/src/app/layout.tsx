import "./global.css"

import type { Metadata } from "next"
import type { ReactNode } from "react"

import { LayoutComponent } from "@/components/layout"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Accountability Buddy",
  description: "Your goal-tracking accountability partner.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="apple-mobile-web-app-title"
          content="Accountability Buddy"
        />
      </head>
      <body>
        <Providers>
          <LayoutComponent>{children}</LayoutComponent>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
