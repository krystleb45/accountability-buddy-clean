import type { ReactNode } from "react"

function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center">{children}</main>
  )
}

export default Layout
