import type { LucideIcon } from "lucide-react"

import {
  ChevronDown,
  CircleQuestionMark,
  CreditCard,
  Info,
  LogOut,
  Mail,
  MessageCircleMore,
  Settings,
  ShieldUser,
  User,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

type NavbarDropdownItem = {
  id: string // Unique identifier for each item
  label: string
  icon?: LucideIcon // Added for icons
  className?: string // Added for custom styling
} & (
  | {
      path: string
      onClick?: never // If path is provided, onClick should not be used
    }
  | {
      path?: never // If onClick is provided, path should not be used
      onClick: () => void
    }
  | {
      path?: never // If neither is provided, this item can be a divider
      onClick?: never
      label: "divider" // Special case for divider items
    }
)

// Consolidated Account dropdown items
const accountItems: NavbarDropdownItem[] = [
  // User Actions
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },

  // Subscription Management - ADD THIS
  {
    id: "subscription",
    label: "Subscription",
    path: "/subscription",
    icon: CreditCard,
  },

  // Divider (handled specially in dropdown)
  {
    id: "divider",
    label: "divider" as const,
  },

  // Help & Support
  {
    id: "faq",
    label: "FAQ",
    path: "/faq",
    icon: CircleQuestionMark,
  },
  {
    id: "about-us",
    label: "About Us",
    path: "/about-us",
    icon: Info,
  },
  {
    id: "contact-support",
    label: "Contact Support",
    path: "/contact-support",
    icon: Mail,
  },
  {
    id: "feedback",
    label: "Feedback",
    path: "/feedback",
    icon: MessageCircleMore,
  },
  {
    id: "privacy-policy",
    label: "Privacy Policy",
    path: "/privacy-policy",
    icon: ShieldUser,
  },

  // Another divider
  {
    id: "divider-2",
    label: "divider" as const,
  },

  // Logout
  {
    id: "logout",
    label: "Logout",
    onClick: (): void => {
      signOut()
    },
    icon: LogOut,
  },
]

export function NavbarDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Account <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {accountItems.map((item) =>
          item.label === "divider" ? (
            <DropdownMenuSeparator key={item.id} />
          ) : (
            <DropdownMenuItem
              key={item.id}
              className={item.className}
              variant={item.id === "logout" ? "destructive" : "default"}
              asChild={!!item.path}
            >
              {item.path ? (
                <Link href={item.path}>
                  {item.icon && (
                    <span>
                      <item.icon className="text-current" />
                    </span>
                  )}
                  {item.label}
                </Link>
              ) : (
                <>
                  {item.icon && (
                    <span>
                      <item.icon className="text-current" />
                    </span>
                  )}
                  {item.label}
                </>
              )}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
