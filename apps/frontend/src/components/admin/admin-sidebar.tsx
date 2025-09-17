"use client"

import { Activity, Badge, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Activities",
    url: "/admin/activities",
    icon: Activity,
  },
  {
    title: "Badges",
    url: "/admin/badges",
    icon: Badge,
    checkIsActive: (path: string) => path.startsWith("/admin/badges"),
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="icon" className="top-20 h-auto">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.checkIsActive
                        ? item.checkIsActive(pathname)
                        : pathname === item.url
                    }
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
