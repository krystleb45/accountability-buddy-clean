export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}
