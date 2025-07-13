// src/utils/env.ts

/**
 * Helper to read a `NEXT_PUBLIC_…` env var and trim it.
 * Returns `undefined` if not set or empty.
 */
function getOptionalEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Safely fetch any NEXT_PUBLIC_… var by name.
 * Returns `null` if not set.
 */
export function getPublicEnvVar(key: string): string | null {
  return getOptionalEnv(key) ?? null;
}

/**
 * The base URL for your API.  …
 */
export const API_URL: string = getOptionalEnv('NEXT_PUBLIC_API_URL') || 'http://localhost:5050/api';

/**
 * The root URL of your site…
 */
export const BASE_URL: string = getOptionalEnv('NEXT_PUBLIC_BASE_URL') || 'http://localhost:5050';

/**
 * The URL where Swagger/OpenAPI docs live…
 */
export const SWAGGER_URL: string =
  getOptionalEnv('NEXT_PUBLIC_SWAGGER_URL') || 'http://localhost:5050/api-docs';

/**
 * Feature‐flag helper…
 */
export function isFeatureEnabled(flag: string): boolean {
  return getOptionalEnv(`NEXT_PUBLIC_${flag.toUpperCase()}`) === 'true';
}
