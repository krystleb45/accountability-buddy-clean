// src/app/point-shop/page.tsx
import type { Metadata } from "next"

import PointShopClient from "./page.client"

export const metadata: Metadata = {
  title: "Point Shop – Accountability Buddy",
  description: "Browse rewards you can redeem with your points.",
  openGraph: {
    title: "Point Shop – Accountability Buddy",
    description: "Browse rewards you can redeem with your points.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/point-shop`,
  },
}

export default function PointShopPage() {
  return <PointShopClient />
}
