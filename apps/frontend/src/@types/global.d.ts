/**
 * Global TypeScript declarations for extending Window properties
 */
declare global {
  interface Window {
    fetch: typeof fetch
    MutationObserver: typeof MutationObserver
    IntersectionObserver: typeof IntersectionObserver
  }
}
export {}
