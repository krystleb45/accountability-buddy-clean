import { format } from "date-fns";
import fs from "node:fs";
import path from "node:path";

// Define log levels
type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

// Set log file paths
const LOG_DIRECTORY = path.resolve(__dirname, "../../logs");
const LOG_FILE = path.join(
  LOG_DIRECTORY,
  `${format(new Date(), "yyyy-MM-dd")}.log`,
);

// Ensure the log directory exists
if (!fs.existsSync(LOG_DIRECTORY)) {
  fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
}

/**
 * Writes a log message to the log file and console.
 * @param level - The log level (INFO, WARN, ERROR, DEBUG)
 * @param message - The log message
 * @param meta - Additional metadata to log (optional)
 */
function log (level: LogLevel,  message: string,  meta?: Record<string, any>): void {
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const logEntry = `${timestamp} [${level}] ${message} ${
    meta ? JSON.stringify(meta) : ""
  }\n`;

  // Write log to file
  fs.appendFileSync(LOG_FILE, logEntry);

  // Log to console
  switch (level) {
    case "INFO":
    
      break;
    case "WARN":
    
      break;
    case "ERROR":
    
      break;
    case "DEBUG":
    
      break;
  }
}

/**
 * Logs an info-level message.
 * @param message - The log message
 * @param meta - Additional metadata to log (optional)
 */
function info (message: string, meta?: Record<string, any>): void {
  log("INFO", message, meta);
}

/**
 * Logs a warning-level message.
 * @param message - The log message
 * @param meta - Additional metadata to log (optional)
 */
function warn (message: string, meta?: Record<string, any>): void {
  log("WARN", message, meta);
}

/**
 * Logs an error-level message.
 * @param message - The log message
 * @param meta - Additional metadata to log (optional)
 */
function error (message: string, meta?: Record<string, any>): void {
  log("ERROR", message, meta);
}

/**
 * Logs a debug-level message.
 * @param message - The log message
 * @param meta - Additional metadata to log (optional)
 */
function debug (message: string, meta?: Record<string, any>): void {
  log("DEBUG", message, meta);
}

export { debug, error, info, warn };
