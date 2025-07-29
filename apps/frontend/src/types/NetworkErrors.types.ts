/**
 * Represents an error caused by a network issue.
 */
export interface NetworkError {
  /** The error message describing the network issue. */
  message: string;

  /** The status code returned by the server (if available). */
  statusCode?: number;

  /** The URL of the failed network request. */
  url?: string;

  /** Additional details about the network error (optional). */
  details?: string;

  /** The HTTP method used in the failed request (optional). */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /** The time when the error occurred (ISO format). */
  timestamp?: string | Date;
}

/**
 * Represents a timeout error for network requests.
 */
export interface TimeoutError extends NetworkError {
  /** The duration (in milliseconds) after which the request timed out. */
  timeoutDuration: number;
}

/**
 * Represents a DNS resolution failure error.
 */
export interface DnsResolutionError extends NetworkError {
  /** Indicates if the DNS lookup failed. */
  dnsLookupFailed: boolean;
}
