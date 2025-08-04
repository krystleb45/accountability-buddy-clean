// services/googleAnalytics.ts

/**
 * Typed window interface for Google Analytics (gtag).
 */
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtagInitialized?: boolean
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Google Analytics Measurement ID (e.g., "G-XXXXXXXXXX").
 * Set via NEXT_PUBLIC_GA_ID in environment variables.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""

/**
 * Initializes Google Analytics by injecting the gtag.js script.
 * Call once in your application entrypoint.
 */
export function initGoogleAnalytics(): void {
  if (!GA_MEASUREMENT_ID) {
    console.warn(
      "GA_MEASUREMENT_ID not set; skipping analytics initialization.",
    )
    return
  }

  if (typeof window === "undefined" || window.gtagInitialized) {
    return
  }

  // Load gtag.js
  const script1 = document.createElement("script")
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  const script2 = document.createElement("script")
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
  `
  document.head.appendChild(script2)

  window.gtagInitialized = true
}

/**
 * Logs a page view event to Google Analytics.
 * @param url - The page path or URL to record.
 */
export function pageview(url: string): void {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return
  }
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url })
}

/**
 * Parameters for custom analytics events.
 */
export interface GtagEventParams {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: unknown
}

/**
 * Tracks a custom event in Google Analytics.
 * @param action - The event action name.
 * @param params - Optional additional event parameters.
 */
export function trackEvent(action: string, params: GtagEventParams = {}): void {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return
  }
  window.gtag("event", action, params)
}

/**
 * Tracks a conversion event (e.g., sign-up) in Google Analytics.
 * @param label - Label for the conversion event.
 * @param value - Numeric value associated with the event.
 */
export function trackConversion(label: string, value?: number): void {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) {
    return
  }
  const params: GtagEventParams = { event_label: label }
  if (typeof value === "number") {
    params.value = value
  }
  window.gtag("event", "conversion", {
    send_to: GA_MEASUREMENT_ID,
    ...params,
  })
}
