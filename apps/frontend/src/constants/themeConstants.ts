// src/constants/themeConstants.ts

/** Color palette for one theme */
export interface ThemePalette {
  PRIMARY_COLOR: string;
  SECONDARY_COLOR: string;
  BACKGROUND_COLOR: string;
  TEXT_COLOR: string;
  PAPER_COLOR: string;
}

/** Font families */
export interface FontFamilies {
  DEFAULT: string;
  MONOSPACE: string;
}

/** Font sizes */
export interface FontSizes {
  SMALL: string;
  MEDIUM: string;
  LARGE: string;
  XLARGE: string;
}

/** Border-radius sizes */
export interface BorderRadii {
  SMALL: string;
  MEDIUM: string;
  LARGE: string;
}

/** The full theme constants object */
export const THEME_CONSTANTS = {
  LIGHT_MODE: {
    PRIMARY_COLOR: '#1976d2',
    SECONDARY_COLOR: '#dc004e',
    BACKGROUND_COLOR: '#f4f6f8',
    TEXT_COLOR: '#000000',
    PAPER_COLOR: '#ffffff',
  },
  DARK_MODE: {
    PRIMARY_COLOR: '#90caf9',
    SECONDARY_COLOR: '#f48fb1',
    BACKGROUND_COLOR: '#121212',
    TEXT_COLOR: '#ffffff',
    PAPER_COLOR: '#1d1d1d',
  },
  HIGH_CONTRAST_MODE: {
    PRIMARY_COLOR: '#ffcc00',
    SECONDARY_COLOR: '#ff3300',
    BACKGROUND_COLOR: '#000000',
    TEXT_COLOR: '#ffffff',
    PAPER_COLOR: '#000000',
  },
  FONT_FAMILIES: {
    DEFAULT: 'Roboto, Arial, sans-serif',
    MONOSPACE: 'Courier New, monospace',
  },
  FONT_SIZES: {
    SMALL: '0.875rem',
    MEDIUM: '1rem',
    LARGE: '1.25rem',
    XLARGE: '1.5rem',
  },
  BORDER_RADII: {
    SMALL: '4px',
    MEDIUM: '8px',
    LARGE: '16px',
  },
} as const;

/** Union of theme-mode keys: 'LIGHT_MODE' | 'DARK_MODE' | 'HIGH_CONTRAST_MODE' */
export type ThemeMode = keyof Pick<
  typeof THEME_CONSTANTS,
  'LIGHT_MODE' | 'DARK_MODE' | 'HIGH_CONTRAST_MODE'
>;

/** Palette type for a given mode */
export type Palette = (typeof THEME_CONSTANTS)[ThemeMode];

/** Shorthand types */
export type Fonts = typeof THEME_CONSTANTS.FONT_FAMILIES;
export type Sizes = typeof THEME_CONSTANTS.FONT_SIZES;
export type Radii = typeof THEME_CONSTANTS.BORDER_RADII;

/**
 * Runtime guard: checks if a value is a valid ThemeMode.
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === 'string' && ['LIGHT_MODE', 'DARK_MODE', 'HIGH_CONTRAST_MODE'].includes(value)
  );
}
