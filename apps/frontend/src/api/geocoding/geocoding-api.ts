import type { Envelope } from "@/types"

import { getApiErrorMessage, http } from "@/utils"

export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number,
) {
  try {
    const response = await http.get<
      Envelope<{
        city: string | null
        state: string | null
        country: string | null
      }>
    >("/geocoding/address", {
      params: { latitude, longitude },
    })
    return response.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}
