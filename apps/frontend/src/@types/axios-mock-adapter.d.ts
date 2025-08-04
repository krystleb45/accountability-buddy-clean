/**
 * TypeScript type definitions for axios-mock-adapter
 */
declare module "axios-mock-adapter" {
  import type { AxiosInstance } from "axios"

  class MockAdapter {
    constructor(
      axiosInstance: AxiosInstance,
      options?: { delayResponse?: number },
    )
    onGet(url: string, config?: unknown): this
    onPost(url: string, config?: unknown): this
    onPut(url: string, config?: unknown): this
    onDelete(url: string, config?: unknown): this
    reply(status: number, data?: unknown, headers?: unknown): this
    reset(): void
    restore(): void
  }

  export default MockAdapter
}
