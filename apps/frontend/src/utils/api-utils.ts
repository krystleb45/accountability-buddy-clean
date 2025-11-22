import axios from "axios"

export function getApiErrorMessage(err: Error): string {
  return axios.isAxiosError(err) && err.response
    ? err.response.data.message
    : err.message
}
