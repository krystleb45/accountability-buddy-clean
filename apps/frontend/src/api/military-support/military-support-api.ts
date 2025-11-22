import type { Envelope } from "@/types"

import {
  DEFAULT_DISCLAIMER,
  DEFAULT_MILITARY_RESOURCES,
} from "@/data/default-military-resources"
import { http } from "@/lib/http"

export interface SupportResource {
  _id: string
  title: string
  url: string
  description: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Disclaimer {
  disclaimer: string
}

/** GET /api/military-support/resources */
export async function fetchResources(): Promise<SupportResource[]> {
  try {
    const resp = await http.get<Envelope<{ resources: SupportResource[] }>>(
      `/military-support/resources`,
    )

    return resp.data.data.resources
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (err) {
    return DEFAULT_MILITARY_RESOURCES
  }
}

/** GET /api/military-support/disclaimer */
export async function fetchDisclaimer() {
  try {
    // ✅ FIXED: Remove extra /api/ since NEXT_PUBLIC_API_URL already includes it
    const resp = await http.get<Envelope<Disclaimer>>(
      `/military-support/disclaimer`,
    )
    return resp.data.data.disclaimer
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (err) {
    return DEFAULT_DISCLAIMER
  }
}
