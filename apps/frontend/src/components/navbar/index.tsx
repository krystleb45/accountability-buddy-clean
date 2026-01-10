"use client"

import { Menu, X } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Button } from "../ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { Skeleton } from "../ui/skeleton"
import { NavbarDropdown } from "./navbar-dropdown"

const publicLinks = [
  { href: "/about-us", label: "About Us" },
  { href: "/faqs", label: "FAQ" },
  { href: "/contact-support", label: "Contact Us" },
  { href: "/military-support", label: "Military Support" },
]

export function Navbar() {
  const { data: session, status: authStatus } = useSession()
  const isAdmin = session?.user?.role === "admin"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className={`
        sticky top-0 z-50 flex items-center justify-between border-b
        bg-gradient-to-br from-secondary/50 to-background/50 px-8 py-4 shadow
        backdrop-blur-2xl
        *:flex-1
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

      {/* Center section - Desktop */}
      {session?.user ? (
        <span
          className={`
            hidden text-center text-lg
            md:block
          `}
        >
          Welcome, {session.user.name || session.user.email?.split("@")[0]}!
        </span>
      ) : (
        <div className="hidden items-center justify-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* User / Auth section */}
      <div className="flex items-center justify-end gap-2">
        {authStatus === "loading" ? (
          <Skeleton
            className="h-8 w-20 rounded-lg"
            data-testid="navbar-skeleton"
          />
        ) : session?.user ? (
          <NavbarDropdown isAdmin={isAdmin} />
        ) : (
          <>
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={32}
                      height={32}
                    />
                    Accountability Buddy
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-primary px-4 py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border px-4 py-3 text-center font-medium transition-colors hover:bg-muted"
                  >
                    Sign Up
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Desktop Login Button */}
            <Button asChild className="hidden md:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}