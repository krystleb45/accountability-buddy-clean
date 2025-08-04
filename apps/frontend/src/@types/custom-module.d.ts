/**
 * TypeScript type definitions for "custom-module".
 * These definitions provide type safety when working with the module.
 */

declare module "custom-module" {
  // Define interfaces and types exposed by the module

  /**
   * Represents the response object returned by the module.
   */
  export interface CustomModuleResponse {
    id: string
    name: string
    createdAt: Date
    metadata?: Record<string, unknown> // Optional metadata as key-value pairs
  }

  /**
   * Configuration options for module functions.
   */
  export interface CustomModuleOptions {
    verbose?: boolean // Enable verbose logging
    retries?: number // Number of retry attempts
    timeout?: number // Request timeout in milliseconds
  }

  /**
   * Executes a specific action asynchronously.
   * @param data - Data required for the action
   * @param options - Optional configuration for the action
   * @returns A promise resolving to `CustomModuleResponse`
   */
  export function performAction(
    data: Record<string, unknown>,
    options?: CustomModuleOptions,
  ): Promise<CustomModuleResponse>

  /**
   * Transforms the provided input string synchronously.
   * @param input - The input string to process
   * @returns A transformed string
   */
  export function transformInput(input: string): string

  /**
   * Fetches module settings asynchronously.
   * @returns A promise resolving to a settings object
   */
  export function fetchSettings(): Promise<Record<string, unknown>>
}

// ————————————————————————————————————————————————————————————————————————
// Stubs for modules without built-in types:

/** Lucide React icons (all exports are `any`) */
declare module "lucide-react"

/**
 * next-auth React hooks & components
 * (so you can mock useSession() and SessionProvider without TS errors)
 */
declare module "next-auth/react" {
  import type { FC, ReactNode } from "react"

  /** a very loose Session shape */
  export interface Session {
    [key: string]: any
  }

  /** next-auth status */
  export type SessionStatus = "authenticated" | "loading" | "unauthenticated"

  /** mockable hook */
  export function useSession(): { data: Session | null; status: SessionStatus }

  /** mockable provider */
  export const SessionProvider: FC<{ children: ReactNode }>
}
