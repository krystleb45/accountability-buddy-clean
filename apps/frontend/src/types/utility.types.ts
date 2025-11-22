// Envelope used by our Express APIs
export interface Envelope<T extends undefined | object | object[]> {
  success: boolean
  message: string
  data: T
}
