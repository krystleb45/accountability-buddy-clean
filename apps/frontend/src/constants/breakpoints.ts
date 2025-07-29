// src/constants/breakpoints.ts
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
} as const;
export type Breakpoint = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS];
