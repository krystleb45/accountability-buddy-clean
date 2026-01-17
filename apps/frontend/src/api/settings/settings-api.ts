import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

interface SettingsResponse {
  settings: User["settings"]
  phoneNumber?: string
}

/** GET /settings */
export async function fetchSettings(): Promise<SettingsResponse> {
  try {
    const resp = await http.get<Envelope<SettingsResponse>>("/settings")
    return resp.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

interface SaveSettingsPayload {
  notifications?: Partial<User["settings"]["notifications"]>
  privacy?: Partial<User["settings"]["privacy"]>
  phoneNumber?: string
}

/** PUT /settings/update */
export async function saveSettings(settings: SaveSettingsPayload) {
  try {
    const resp = await http.put("/settings/update", settings)
    return resp.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** PUT /settings/password */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  try {
    await http.put<Envelope<undefined>>("/settings/password", {
      currentPassword,
      newPassword,
    })
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** DELETE /settings/account */
export async function deleteAccount() {
  try {
    await http.delete("/settings/account")
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
