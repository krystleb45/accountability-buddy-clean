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
import Link from "next/link"

import { logout } from "@/api/auth/auth-api"

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
  showForAdmin?: boolean // If true, only show for admin users
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
    showForAdmin: true,
  },
  {
    id: "about-us",
    label: "About Us",
    path: "/about-us",
    icon: Info,
    showForAdmin: true,
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
    showForAdmin: true,
  },

  // Another divider
  {
    id: "divider-2",
    label: "divider" as const,
    showForAdmin: true,
  },

  // Logout
  {
    id: "logout",
    label: "Logout",
    onClick: (): void => {
      logout()
    },
    icon: LogOut,
    showForAdmin: true,
  },
]

interface NavbarDropdownProps {
  isAdmin: boolean
}

export function NavbarDropdown({ isAdmin }: NavbarDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Account <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {accountItems.map((item) =>
          (isAdmin && item.showForAdmin) || !isAdmin ? (
            item.label === "divider" ? (
              <DropdownMenuSeparator key={item.id} />
            ) : (
              <DropdownMenuItem
                key={item.id}
                className={item.className}
                variant={item.id === "logout" ? "destructive" : "default"}
                asChild={!!item.path}
                onClick={item.onClick}
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
            )
          ) : null,
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
