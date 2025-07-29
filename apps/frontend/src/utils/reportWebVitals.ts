// src/utils/reportWebVitals.ts
import { Metric, onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Called by Next.js (or manually) to report a single metric.
 * You can send this to your analytics endpoint instead of console.log.
 */
export function reportWebVitals(metric: Metric): void {
  try {
    // Example: sendToAnalytics(metric);
    console.log('[Web Vitals]', metric);
  } catch (err: unknown) {
    console.error('[Web Vitals] error reporting metric:', err);
  }
}

/**
 * Install listeners for all the key web-vitals and forward them
 * to `reportWebVitals`. Call this once on your top‐level (e.g. in _app.tsx).
 */
export function initWebVitals(): void {
  onCLS(reportWebVitals); // Cumulative Layout Shift
  onINP(reportWebVitals); // Interaction to Next Paint (replacement for FID)
  onFCP(reportWebVitals); // First Contentful Paint
  onLCP(reportWebVitals); // Largest Contentful Paint
  onTTFB(reportWebVitals); // Time to First Byte
}
