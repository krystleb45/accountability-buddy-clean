import "./global.css"

import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Geist_Mono, Inter } from "next/font/google"

import { LayoutComponent } from "@/components/layout"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Accountability Buddy",
  description: "Your goal-tracking accountability partner.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
    ],
  },
  appleWebApp: {
    title: "Accountability Buddy",
    statusBarStyle: "default",
  },
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
      <body className={cn(inter.variable, geistMono.variable)}>
        <Providers>
          <LayoutComponent>{children}</LayoutComponent>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
