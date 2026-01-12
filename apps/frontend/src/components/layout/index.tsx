import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

import { NewsletterPopup } from "./newsletter-popup"

interface LayoutComponentProps {
  children: ReactNode
}

export function LayoutComponent({
  children,
}: LayoutComponentProps): React.ReactElement {
  return (
    <>
      <Navbar />

      {/* Main content */}
      <main>{children}</main>

      {/* Global footer */}
      <Footer />

      <NewsletterPopup showAfterSeconds={45} />
    </>
  )
}
