// src/components/Navbar/NavbarItems.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import styles from "./NavbarItems.module.css"

export interface NavbarItem {
  label: string
  to: string
  exact?: boolean
  icon?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

interface NavbarItemsProps {
  items: NavbarItem[]
}

const NavbarItems: React.FC<NavbarItemsProps> = ({ items }) => {
  const pathname = usePathname()

  return (
    <ul className={styles.list} role="menubar">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.to
          : pathname.startsWith(item.to)

        return (
          <li key={item.to} className={styles.item} role="none">
            <Link
              href={item.to}
              className={`${styles.link}${isActive ? ` ${styles.active}` : ""}`}
              role="menuitem"
              aria-label={item.label}
              {...(item.onClick && { onClick: item.onClick })}
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              <span className={styles.label}>{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NavbarItems
