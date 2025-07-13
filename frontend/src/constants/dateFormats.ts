// src/constants/dataFormats.ts

// Standardized date-format tokens for date-fns (v2+)
export enum DATE_FORMATS {
  FULL_TIMESTAMP = 'yyyy-MM-dd HH:mm:ss',
  ISO_8601 = "yyyy-MM-dd'T'HH:mm:ssXXX",
  FRIENDLY = 'MMMM do yyyy, h:mm a',
  SHORT_DATE = 'MM/dd/yyyy',
  LONG_DATE = 'EEEE, MMMM do yyyy',
  TIME_ONLY = 'HH:mm:ss',
  DATE_ONLY = 'yyyy-MM-dd',
  LOG_TIMESTAMP = 'yyyy-MM-dd_HH-mm-ss',
}

// A frozen list of IANA time-zones for Intl.DateTimeFormat or date-fns-tz
export const TIME_ZONES = [
  'UTC',
  'America/New_York', // Eastern
  'America/Chicago', // Central
  'America/Denver', // Mountain
  'America/Los_Angeles', // Pacific
  'Europe/London', // GMT
  'Europe/Paris', // CET
  'Asia/Kolkata', // IST
  'Asia/Tokyo', // JST
] as const;
