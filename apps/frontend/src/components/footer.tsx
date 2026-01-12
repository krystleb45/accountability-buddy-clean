import Image from "next/image"
import Link from "next/link"

// Placeholder sponsors - replace with real data when you have sponsors
const sponsors: { name: string; logo: string; url: string }[] = [
  // Example:
  // { name: "Sponsor Name", logo: "/sponsors/sponsor-logo.png", url: "https://sponsor.com" },
]

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

export function Footer() {
  return (
    <footer className="w-full border-t bg-popover">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Sponsors Section - Only show if there are sponsors */}
        {sponsors.length > 0 && (
          <div className="mb-8 text-center">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Supported By
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  title={sponsor.name}
                >
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Links Section */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Accountability Buddy. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
