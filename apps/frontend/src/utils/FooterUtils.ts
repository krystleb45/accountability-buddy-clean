/**
 * Represents a link to display in the site footer.
 */
export interface FooterLink {
  /** Display name of the link */
  name: string
  /** Destination URL or path */
  url: string
}

/**
 * Returns the current year as a string.
 * @returns Current year (e.g., "2025").
 */
export const getCurrentYear = (): string => new Date().getFullYear().toString()

/**
 * Generates footer navigation links.
 * You can optionally pass a custom array to override defaults.
 *
 * @param customLinks - Optional array of custom FooterLink.
 * @returns Array of FooterLink objects.
 */
export function generateFooterLinks(customLinks?: FooterLink[]): FooterLink[] {
  if (Array.isArray(customLinks) && customLinks.length > 0) {
    return customLinks
  }
  return [
    { name: "Privacy Policy", url: "/privacy" },
    { name: "Terms of Service", url: "/terms" },
    { name: "Contact Us", url: "/contact" },
  ]
}
