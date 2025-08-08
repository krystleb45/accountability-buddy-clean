"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { NavbarDropdown } from "./navbar-dropdown"

export function Navbar() {
  const { data: session, status: authStatus } = useSession()

  return (
    <nav
      className={`
        sticky top-0 z-50 flex items-center justify-between border-b
        bg-gradient-to-br from-secondary/50 to-background/50 px-8 py-4 shadow
        backdrop-blur-2xl
      `}
      data-testid="navbar"
    >
      {/* Brand always shown first */}
      <div className="shrink-0">
        <Link
          href={authStatus === "authenticated" ? "/dashboard" : "/"}
          className={`
            flex items-center gap-2 transition-all
            hover:brightness-110
          `}
        >
          <Image
            src="/logo.png"
            alt="Accountability Buddy Logo"
            width={40}
            height={40}
          />
          <span className="text-xl leading-none font-bold text-foreground">
            Accountability
            <br />
            <span className="text-primary">Buddy</span>
          </span>
        </Link>
      </div>

      {/* Welcome message - positioned absolutely in center */}
      {session?.user && (
        <span
          className={`
            hidden text-center text-lg
            md:block
          `}
        >
          Welcome, {session.user.name || session.user.email?.split("@")[0]}!
        </span>
      )}

      {/* User / Auth section */}
      <div>
        {authStatus === "loading" ? (
          <Skeleton
            className="h-8 w-20 rounded-lg"
            data-testid="navbar-skeleton"
          />
        ) : session?.user ? (
          <NavbarDropdown />
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
